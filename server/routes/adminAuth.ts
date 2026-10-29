import crypto from "crypto";
import { Router, type IRouter } from "express";
import { z } from "zod";
import { AdminUser } from "../models/AdminUser.js";
import { verifyPassword, signToken, hashPassword } from "../lib/auth.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { loginLimiter, forgotPasswordLimiter, verifyOtpLimiter } from "../middlewares/rateLimiter.js";
import { sendPasswordResetOtpEmail } from "../lib/email.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const LoginSchema = z.object({
  username: z.string().min(1).toLowerCase().trim(),
  password: z.string().min(1),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const ForgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Identifier is required").trim(),
});

const VerifyResetPasswordSchema = z.object({
  identifier: z.string().min(1, "Identifier is required").trim(),
  otp: z.string().length(6, "Verification code must be 6 digits").trim(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

function maskTarget(target: string): string {
  if (target.includes("@")) {
    const [userPart, domain] = target.split("@");
    if (!userPart || !domain) return target;
    const maskedUser = userPart.length <= 2 ? `${userPart[0]}***` : `${userPart[0]}***${userPart[userPart.length - 1]}`;
    return `${maskedUser}@${domain}`;
  }
  if (target.length > 5) {
    return `${target.slice(0, 3)}••••${target.slice(-3)}`;
  }
  return target;
}

// POST /api/admin/login
router.post("/login", loginLimiter, async (req, res) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: "Invalid request body" });
    return;
  }

  const { username, password } = parse.data;
  const usernameOrEmail = username.toLowerCase().trim();

  try {
    const admin = await AdminUser.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ],
    });

    // Constant-time comparison to prevent username enumeration timing attacks
    const passwordValid = admin
      ? await verifyPassword(password, admin.passwordHash)
      : await verifyPassword(password, "$2b$12$invalidhashpadding....."); // dummy compare

    if (!admin || !passwordValid) {
      logger.warn({ username, ip: req.ip }, "Failed admin login attempt");
      res.status(401).json({ success: false, error: "Invalid username or password" });
      return;
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = signToken({
      sub: admin._id.toString(),
      username: admin.username,
      role: admin.role,
    });

    logger.info({ username: admin.username }, "Admin login successful");

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    logger.error({ err }, "Login error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/admin/me
router.get("/me", requireAdmin, async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.admin!.sub).select("-passwordHash");
    if (!admin) {
      res.status(404).json({ success: false, error: "Admin not found" });
      return;
    }
    res.json({ success: true, admin });
  } catch (err) {
    logger.error({ err }, "Get admin me error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/me/password
router.patch("/me/password", requireAdmin, async (req, res) => {
  const parse = ChangePasswordSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
    return;
  }

  const { currentPassword, newPassword } = parse.data;

  try {
    const admin = await AdminUser.findById(req.admin!.sub);
    if (!admin) {
      res.status(404).json({ success: false, error: "Admin not found" });
      return;
    }

    const valid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!valid) {
      res.status(400).json({ success: false, error: "Current password is incorrect" });
      return;
    }

    admin.passwordHash = await hashPassword(newPassword);
    await admin.save();

    logger.info({ username: admin.username }, "Admin password changed");
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    logger.error({ err }, "Change password error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/admin/forgot-password
// Requests a 6-digit OTP sent to registered email / mobile
router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  const parse = ForgotPasswordSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: "Please enter your username, email, or mobile phone" });
    return;
  }

  const { identifier } = parse.data;
  const idLower = identifier.toLowerCase().trim();

  try {
    const admin = await AdminUser.findOne({
      $or: [
        { username: idLower },
        { email: idLower },
        { phone: identifier.trim() },
      ],
    });

    if (!admin) {
      // Avoid revealing whether account exists to prevent harvesting
      logger.warn({ identifier }, "Forgot password request for non-existent admin user");
      res.json({
        success: true,
        message: "If an account matches that credential, a 6-digit verification code has been dispatched.",
        destination: maskTarget(identifier),
      });
      return;
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    admin.resetPasswordOtp = otp;
    admin.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    admin.resetPasswordAttempts = 0;
    await admin.save();

    // Send email notification
    await sendPasswordResetOtpEmail({
      to: admin.email,
      username: admin.username,
      otp,
    });

    const destination = admin.phone && identifier === admin.phone
      ? maskTarget(admin.phone)
      : maskTarget(admin.email);

    logger.info(
      { username: admin.username, email: admin.email, otp: process.env["NODE_ENV"] !== "production" ? otp : "[HIDDEN]" },
      "Password reset verification code generated",
    );

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${destination}`,
      destination,
      // Provide devOtp when not in production for seamless testing
      devOtp: process.env["NODE_ENV"] !== "production" ? otp : undefined,
    });
  } catch (err) {
    logger.error({ err }, "Forgot password processing error");
    res.status(500).json({ success: false, error: "Failed to initiate password reset" });
  }
});

// POST /api/admin/verify-reset-password
// Verifies OTP code and sets the new password
router.post("/verify-reset-password", verifyOtpLimiter, async (req, res) => {
  const parse = VerifyResetPasswordSchema.safeParse(req.body);
  if (!parse.success) {
    const firstError = parse.error.issues[0]?.message || "Invalid input";
    res.status(400).json({ success: false, error: firstError });
    return;
  }

  const { identifier, otp, newPassword } = parse.data;
  const idLower = identifier.toLowerCase().trim();

  try {
    const admin = await AdminUser.findOne({
      $or: [
        { username: idLower },
        { email: idLower },
        { phone: identifier.trim() },
      ],
    });

    if (!admin || !admin.resetPasswordOtp) {
      res.status(400).json({
        success: false,
        error: "No active password reset request found. Please request a new code.",
      });
      return;
    }

    // Lockout after 3 invalid attempts
    if ((admin.resetPasswordAttempts ?? 0) >= 3) {
      admin.resetPasswordOtp = undefined;
      admin.resetPasswordOtpExpires = undefined;
      await admin.save();
      res.status(429).json({
        success: false,
        error: "Too many failed attempts. Code invalidated for your security. Please request a new one.",
      });
      return;
    }

    // Check expiration
    if (!admin.resetPasswordOtpExpires || admin.resetPasswordOtpExpires.getTime() < Date.now()) {
      admin.resetPasswordOtp = undefined;
      admin.resetPasswordOtpExpires = undefined;
      await admin.save();
      res.status(400).json({
        success: false,
        error: "Verification code has expired. Please request a new code.",
      });
      return;
    }

    // Constant-time compare or direct match on 6-digit OTP
    if (admin.resetPasswordOtp !== otp.trim()) {
      admin.resetPasswordAttempts = (admin.resetPasswordAttempts ?? 0) + 1;
      await admin.save();
      const remaining = 3 - admin.resetPasswordAttempts;
      res.status(400).json({
        success: false,
        error: `Invalid verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : "Code locked."}`,
      });
      return;
    }

    // Code verified: update password and clear reset state
    admin.passwordHash = await hashPassword(newPassword);
    admin.resetPasswordOtp = undefined;
    admin.resetPasswordOtpExpires = undefined;
    admin.resetPasswordAttempts = 0;
    admin.lastLogin = new Date();
    await admin.save();

    logger.info({ username: admin.username }, "Password successfully reset via OTP verification");

    // Automatically sign in the administrator
    const token = signToken({
      sub: admin._id.toString(),
      username: admin.username,
      role: admin.role,
    });

    res.json({
      success: true,
      message: "Password reset successful! You are now logged in.",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    logger.error({ err }, "Verify reset password error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
