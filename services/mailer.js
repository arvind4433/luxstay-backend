const nodemailer = require("nodemailer");
const { getLocalIPInfo } = require("../utils/ipinfo");

// Create transporter with environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true, // Use pooled connections
  maxConnections: 5,
  maxMessages: 100,
  // Increase timeout for reliability
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("[SMTP Error] Connection failed:", error.message);
  } else {
    console.log("[SMTP Success] Server is ready to take our messages");
  }
});



const messageTemplate = (message) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">BookMyHotelRoom</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Hotel Booking Platform</p>
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <div style="font-size: 16px; color: #444;">
          ${message}
        </div>
      </div>
      <div style="background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
          &copy; ${new Date().getFullYear()} BookMyHotelRoom. All rights reserved.
        </p>
        <p style="font-size: 11px; color: #d1d5db; margin: 5px 0 0 0;">
          Book premium stays with confidence.
        </p>
      </div>
    </div>
  `;
};

const SendMail = async (tomail, subject, message) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'LuxStay'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: tomail,
      subject: subject,
      html: messageTemplate(message),
      headers: {
        'X-Entity-Ref-ID': Date.now().toString(),
        'X-Mailer': 'Nodemailer',
        'Priority': 'High'
      }
    });

    if (info.rejected && info.rejected.length > 0) {
      console.warn(`[Email Warning] MessageId: ${info.messageId} was rejected for recipients: ${info.rejected.join(', ')}`);
    }

    console.log(`[Email Success] Sent to ${tomail}. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email Error] Failed to send to ${tomail}. Error Details:`, error.message);
    // Add specific advice for common errors
    if (error.code === 'EAUTH') {
      console.error("[Email Advice] SMTP Authentication failed. If using Gmail, ensure you have generated an App Password. Check SMTP_USER and SMTP_PASS variables.");
    } else if (error.code === 'ESOCKET') {
      console.error("[Email Advice] Connection timeout. Check your SMTP_HOST and SMTP_PORT configuration.");
    } else if (error.responseCode && error.responseCode >= 500) {
      console.error(`[Email Advice] Provider rejected the message (Code: ${error.responseCode}). It could be a Spam block or unverified sender Domain.`);
    } else {
      console.error("[Email Advice] Check if emails are blocked by security Settings manually.");
    }
    // We log but do not throw raw error to prevent raw node crashes and 500 errors
    // Instead we return a failure object so the authentication flow can proceed without failing.
    return { success: false, error: error.code || 'EMAIL_FAILED', message: error.message };
  }
};

const sendWelcomeEmail = async (to, name) => {
  const subject = "Welcome to Our Service";
  const message = `
    Hello ${name},<br><br>
    Welcome to our service! We're glad to have you on board.<br><br>
    Best regards,<br>The Team
  `;
  await SendMail(to, subject, message);
};

const sendLoginAlertEmail = async (to, name, time, deviceInfo = 'Unknown Device/Browser') => {
  const subject = "New Login Alert - BookMyHotelRoom";
  const location = await getLocalIPInfo();

  const message = `
    Hello ${name},<br><br>
    We noticed a new login to your account on <strong>${time}</strong>.<br>
    If this was not you, please secure your account immediately by resetting your password.<br><br>
    <strong>Login Details:</strong><br>
    IP Address: ${location.ip}<br>
    Location: ${location.city}, ${location.region}, ${location.countryCode}<br>
    Device / Browser: ${deviceInfo}<br><br>
    Best regards,<br>The BookMyHotelRoom Team
  `;
  try {
    await SendMail(to, subject, message);
  } catch (err) {
    console.error("[sendLoginAlertEmail] Could not send login alert:", err.message);
  }
};

const sendPasswordResetEmail = async (to, name, resetLink) => {
  const subject = "Password Reset Request";
  const message = `
    Hello ${name},<br><br>
    We received a request to reset your password.<br>
    Please click the link below to reset it:<br>
    <a href="${resetLink}">Reset Password</a><br><br>
    If you did not request this, please ignore this email.<br><br>
    Best regards,<br>The Team
  `;
  await SendMail(to, subject, message);
};

const sendResetConfirmationEmail = async (to, name) => {
  const subject = "Password Reset Successful";
  const message = `
    Hello ${name},<br><br>
    Your password has been successfully reset.<br>
    If you did not perform this action, please contact support immediately.<br><br>
    Best regards,<br>The Team
  `;
  await SendMail(to, subject, message);
};

const sendOtpEmail = async (to, otp) => {
  console.log(`[OTP Email] Request to send OTP ${otp} to ${to}`);
  const subject = "Your Verification Code - BookMyHotelRoom";
  const message = `
    <div style="text-align: center;">
      <p style="margin-bottom: 20px; font-size: 18px;">Your OTP for verification is:</p>
      <div style="display: inline-block; background-color: #eff6ff; border: 2px dashed #3b82f6; color: #3b82f6; font-size: 36px; font-weight: bold; letter-spacing: 12px; padding: 15px 30px; border-radius: 8px; margin-bottom: 20px;">
        ${otp}
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code will expire in 5 minutes.</p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">If you did not request this code, please ignore this email or contact our support team.</p>
    </div>
  `;
  await SendMail(to, subject, message);
};

module.exports = {
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendPasswordResetEmail,
  sendResetConfirmationEmail,
  sendOtpEmail,
};
