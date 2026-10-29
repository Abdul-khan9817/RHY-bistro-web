import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { logger } from "./logger.js";

function createTransporter(): Transporter {
  const host = process.env["SMTP_HOST"];
  const port = parseInt(process.env["SMTP_PORT"] ?? "587", 10);
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  const secure = process.env["SMTP_SECURE"] === "true";

  if (!host || !user || !pass || host.includes("example.com")) {
    logger.warn(
      "SMTP_HOST not set or using example placeholder — email sending disabled (stream fallback active)",
    );
    // Return a no-op transporter when email is not configured
    return nodemailer.createTransport({ streamTransport: true, newline: "unix" });
  }

  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

const FROM = process.env["EMAIL_FROM"] ?? "RHY Bistro <noreply@rhybistro.ch>";
const RESTAURANT_EMAIL = process.env["RESTAURANT_EMAIL"] ?? "";

export async function sendBookingConfirmation(booking: {
  name: string;
  email: string;
  ref: string;
  date: string;
  time: string;
  guests: number;
  requests?: string;
  preOrderedItems?: Array<{
    nameEn: string;
    nameFr: string;
    price: number;
    quantity: number;
  }>;
  preOrderTotal?: number;
}): Promise<void> {
  if (!process.env["SMTP_HOST"]) return;

  const preOrderRows =
    booking.preOrderedItems && booking.preOrderedItems.length > 0
      ? `
                <tr>
                  <td style="padding:16px 0 0;">
                    <span style="color:#888;font-size:13px;">🍽️ Pre-order</span>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                      ${booking.preOrderedItems
                        .map(
                          (item) => `
                      <tr>
                        <td style="padding:4px 0;color:#555;font-size:13px;">
                          ${item.quantity}× ${item.nameEn}
                        </td>
                        <td style="padding:4px 0;color:#1a3828;font-size:13px;font-weight:600;text-align:right;">
                          CHF ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>`,
                        )
                        .join("")}
                      <tr>
                        <td style="padding:10px 0 0;border-top:1px solid #f0e8d5;color:#1a3828;font-size:14px;font-weight:700;">
                          Total
                        </td>
                        <td style="padding:10px 0 0;border-top:1px solid #f0e8d5;color:#1a3828;font-size:14px;font-weight:700;text-align:right;">
                          CHF ${(booking.preOrderTotal ?? 0).toFixed(2)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`
      : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation — RHY Bistro</title>
</head>
<body style="margin:0;padding:0;background:#f7f3ea;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f7f3ea;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a3828;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#c9a84c;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Restaurant</p>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-family:Georgia,serif;letter-spacing:1px;">RHY BISTRO</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#1a3828;font-family:Georgia,serif;font-size:22px;">Booking Confirmed ✓</h2>
              <p style="margin:0 0 24px;color:#666;font-size:15px;">Dear ${booking.name}, your table has been reserved.</p>

              <!-- Reference -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ea;border:1px solid #e8dfc8;border-radius:6px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Booking Reference</p>
                    <p style="margin:0;font-size:28px;font-family:monospace;font-weight:bold;color:#1a3828;letter-spacing:4px;">${booking.ref}</p>
                  </td>
                </tr>
              </table>

              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0e8d5;">
                    <span style="color:#888;font-size:13px;">📅 Date</span>
                    <span style="float:right;color:#1a3828;font-weight:600;font-size:14px;">${booking.date}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0e8d5;">
                    <span style="color:#888;font-size:13px;">🕐 Time</span>
                    <span style="float:right;color:#1a3828;font-weight:600;font-size:14px;">${booking.time}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f0e8d5;">
                    <span style="color:#888;font-size:13px;">👥 Guests</span>
                    <span style="float:right;color:#1a3828;font-weight:600;font-size:14px;">${booking.guests} ${booking.guests === 1 ? "person" : "people"}</span>
                  </td>
                </tr>
                ${booking.requests ? `
                <tr>
                  <td style="padding:10px 0;">
                    <span style="color:#888;font-size:13px;">📝 Special requests</span>
                    <p style="margin:4px 0 0;color:#555;font-size:13px;font-style:italic;">${booking.requests}</p>
                  </td>
                </tr>` : ""}
                ${preOrderRows}
              </table>

              <p style="margin:28px 0 0;color:#555;font-size:14px;line-height:1.7;">
                We look forward to welcoming you! If you need to change or cancel your reservation, please contact us at least 24 hours in advance.
              </p>

              <!-- Contact -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid #f0e8d5;padding-top:24px;">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0;color:#888;font-size:13px;">
                      📍 Landstrasse 53, 5275 Etzgen, Switzerland<br/>
                      📞 <a href="tel:+41794251666" style="color:#c9a84c;text-decoration:none;">+41 79 425 16 66</a> &nbsp;|&nbsp;
                      ✉️ <a href="mailto:info@rhybistro.ch" style="color:#c9a84c;text-decoration:none;">info@rhybistro.ch</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f7f3ea;padding:20px 40px;text-align:center;border-top:1px solid #e8dfc8;">
              <p style="margin:0;color:#aaa;font-size:12px;">© ${new Date().getFullYear()} RHY Bistro · All rights reserved</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await getTransporter().sendMail({
      from: FROM,
      to: booking.email,
      subject: `Booking Confirmed — ${booking.ref} · RHY Bistro`,
      html,
    });
    logger.info({ ref: booking.ref, to: booking.email }, "Booking confirmation email sent");
  } catch (err) {
    logger.error({ err, ref: booking.ref }, "Failed to send booking confirmation email");
  }
}

export async function sendAdminNewBookingAlert(booking: {
  name: string;
  ref: string;
  date: string;
  time: string;
  guests: number;
  phone: string;
}): Promise<void> {
  if (!RESTAURANT_EMAIL || !process.env["SMTP_HOST"]) return;

  const html = `
<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
  <h2 style="color:#1a3828;margin:0 0 16px;">🆕 New Booking Alert</h2>
  <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:6px;">
    <tr style="background:#f7f3ea;"><td><strong>Reference</strong></td><td style="font-family:monospace;font-size:18px;font-weight:bold;">${booking.ref}</td></tr>
    <tr><td><strong>Name</strong></td><td>${booking.name}</td></tr>
    <tr style="background:#f7f3ea;"><td><strong>Date</strong></td><td>${booking.date}</td></tr>
    <tr><td><strong>Time</strong></td><td>${booking.time}</td></tr>
    <tr style="background:#f7f3ea;"><td><strong>Guests</strong></td><td>${booking.guests}</td></tr>
    <tr><td><strong>Phone</strong></td><td><a href="tel:${booking.phone}">${booking.phone}</a></td></tr>
  </table>
  <p style="margin-top:16px;color:#555;font-size:13px;">Log in to the admin dashboard to manage this reservation.</p>
</div>`;

  try {
    await getTransporter().sendMail({
      from: FROM,
      to: RESTAURANT_EMAIL,
      subject: `New Booking: ${booking.name} — ${booking.date} ${booking.time} (${booking.guests} guests)`,
      html,
    });
  } catch (err) {
    logger.error({ err }, "Failed to send admin booking alert email");
  }
}

export async function sendPasswordResetOtpEmail(params: {
  to: string;
  username: string;
  otp: string;
}): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Security Verification Code — BACCHUS Portal</title>
</head>
<body style="margin:0;padding:0;background:#0a1811;font-family:'Helvetica Neue',Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#0a1811;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0f2419;border:1px solid #c9a84c;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);">
          <!-- Header -->
          <tr>
            <td style="background:#05100a;padding:28px 36px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.3);">
              <h1 style="margin:0;color:#c9a84c;font-size:24px;letter-spacing:4px;font-weight:bold;">BACCHUS</h1>
              <p style="margin:6px 0 0;color:#ffffff;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Administrative Portal Security</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px;">
              <h2 style="margin:0 0 16px;color:#ffffff;font-size:18px;">Password Reset Verification</h2>
              <p style="margin:0 0 20px;color:#cccccc;font-size:14px;line-height:1.6;">
                Hello <strong>${params.username}</strong>,<br/>
                We received a request to reset your password for the BACCHUS Portal. Use the one-time verification code below to authorize this request:
              </p>
              
              <div style="background:#05100a;border:2px dashed #c9a84c;border-radius:8px;padding:20px;text-align:center;margin:24px 0;">
                <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:bold;letter-spacing:10px;color:#c9a84c;">
                  ${params.otp}
                </span>
                <p style="margin:8px 0 0;font-size:11px;color:#888888;text-transform:uppercase;letter-spacing:1px;">Valid for 10 minutes</p>
              </div>

              <p style="margin:20px 0 0;color:#999999;font-size:12px;line-height:1.5;">
                🔒 If you did not request this verification code, please ignore this email or notify your system administrator immediately. No changes have been made to your account.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#05100a;padding:20px 36px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);color:#666666;font-size:11px;">
              © ${new Date().getFullYear()} BACCHUS Portal • Confidential & Automated Notification
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    if (process.env["SMTP_HOST"] && !process.env["SMTP_HOST"].includes("example.com")) {
      await getTransporter().sendMail({
        from: FROM,
        to: params.to,
        subject: `[${params.otp}] Your BACCHUS Portal Verification Code`,
        html,
      });
      logger.info({ to: params.to, username: params.username }, "Password reset OTP email sent successfully");
    } else {
      logger.warn(
        { to: params.to, username: params.username, otp: params.otp },
        "[DEV/FALLBACK] SMTP not fully configured. Reset OTP code generated",
      );
    }
  } catch (err) {
    logger.error({ err, to: params.to }, "Failed to send password reset OTP email");
  }
}
