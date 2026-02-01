const nodemailer = require("nodemailer");
const { getLocalIPInfo } = require("../utils/ipinfo");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const messageTemplate = (content) => {
  return `
    <div style="font-family: Arial, sans-serif; background:#f6f7f9; padding:20px">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:6px; overflow:hidden">
        <div style="background:#0d6efd; padding:16px; color:#ffffff">
          <h2 style="margin:0">Hotel App</h2>
        </div>
        <div style="padding:20px; color:#333333; font-size:15px; line-height:1.6">
          ${content}
        </div>
        <div style="background:#f1f1f1; padding:12px; text-align:center; font-size:12px; color:#777777">
          © 2024 Hotel App. All rights reserved.
        </div>
      </div>
    </div>
  `;
};

const SendMail = async (to, subject, content) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: messageTemplate(content),
  });
  return info.messageId;
};

const sendWelcomeEmail = async (to, name) => {
  const subject = "Welcome to Hotel App";
  const content = `
    <p>Hello ${name},</p>
    <p>Welcome to Hotel App. Your account has been successfully created.</p>
    <p>We are excited to have you with us.</p>
    <p>Regards,<br/>Hotel App Team</p>
  `;
  await SendMail(to, subject, content);
};

const sendLoginAlertEmail = async (to, name, time) => {
  const location = await getLocalIPInfo();
  const subject = "New Login Alert";
  const content = `
    <p>Hello ${name},</p>
    <p>A new login was detected on your account.</p>
    <p><strong>Time:</strong> ${time}</p>
    <p><strong>Location:</strong> ${location.ip}, ${location.city}, ${location.region}, ${location.countryCode}</p>
    <p>If this was not you, please secure your account immediately.</p>
    <p>Regards,<br/>Hotel App Team</p>
  `;
  await SendMail(to, subject, content);
};

const sendPasswordResetEmail = async (to, name, resetLink) => {
  const subject = "Password Reset Request";
  const content = `
    <p>Hello ${name},</p>
    <p>We received a request to reset your password.</p>
    <p>
      <a href="${resetLink}" style="display:inline-block; padding:10px 18px; background:#0d6efd; color:#ffffff; text-decoration:none; border-radius:4px">
        Reset Password
      </a>
    </p>
    <p>If you did not request this, please ignore this email.</p>
    <p>Regards,<br/>Hotel App Team</p>
  `;
  await SendMail(to, subject, content);
};

const sendResetConfirmationEmail = async (to, name) => {
  const subject = "Password Reset Successful";
  const content = `
    <p>Hello ${name},</p>
    <p>Your password has been successfully reset.</p>
    <p>If you did not perform this action, please contact support immediately.</p>
    <p>Regards,<br/>Hotel App Team</p>
  `;
  await SendMail(to, subject, content);
};

const sendOtpEmail = async (to, otp) => {
  const subject = "Your OTP Code";
  const content = `
    <p>Hello,</p>
    <p>Use the OTP below to continue:</p>
    <h2 style="letter-spacing:3px">${otp}</h2>
    <p>This OTP is valid for 5 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
    <p>Regards,<br/>Hotel App Team</p>
  `;
  await SendMail(to, subject, content);
};

module.exports = {
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendPasswordResetEmail,
  sendResetConfirmationEmail,
  sendOtpEmail,
};
