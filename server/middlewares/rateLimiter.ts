import rateLimit from "express-rate-limit";

const isDev = process.env["NODE_ENV"] !== "production";

/** Skip rate-limiting for localhost in development only */
const devSkip = isDev
  ? (req: { ip?: string }) => req.ip === "127.0.0.1" || req.ip === "::1" || req.ip === "::ffff:127.0.0.1"
  : undefined;

/** Admin login: 5 failed attempts per 15 minutes (tightened from 10) */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  ...(devSkip ? { skip: devSkip } : {}),
  message: {
    success: false,
    error: "Too many failed login attempts. Please wait 15 minutes before trying again.",
  },
});

/** Forgot-password: 3 requests per 15 minutes (tightened from 5) */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  ...(devSkip ? { skip: devSkip } : {}),
  message: {
    success: false,
    error: "Too many password recovery requests. Please wait 15 minutes before trying again.",
  },
});

/** OTP verification: 5 attempts per 15 minutes */
export const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  ...(devSkip ? { skip: devSkip } : {}),
  message: {
    success: false,
    error: "Too many verification attempts. Please wait 15 minutes.",
  },
});

/** Public reservation creation: 10 per hour per IP (tightened from 60) */
export const publicBookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  ...(devSkip ? { skip: devSkip } : {}),
  message: {
    success: false,
    error: "Too many booking requests. Please call the restaurant directly.",
  },
});

/** Generic read/public API limiter: 120 requests per minute */
export const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  ...(devSkip ? { skip: devSkip } : {}),
  message: {
    success: false,
    error: "Too many requests. Please slow down.",
  },
});
