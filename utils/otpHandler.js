const otpModel = require("../models/otpModel");
const mailService = require("../services/mailer");
const { sendSMS } = require('../services/sms');

/**
 * Generate OTP
 */
const generateOTP = async (type, identifier) => {
  if (!type || !identifier) {
    throw new Error("Type and identifier are required");
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000)); // string OTP
  const expired_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

  const isEmail = identifier.includes("@");

  // Remove old OTPs for same identifier & type
  if (isEmail) {
    await otpModel.deleteMany({ email: identifier, type });
    await otpModel.create({ type, email: identifier, otp, expired_at });
    await mailService.sendOtpEmail(identifier, otp);
  } else {
    // Phone flow
    await otpModel.deleteMany({ phone: identifier, type });
    await otpModel.create({ type, phone: identifier, otp, expired_at });

    // if Twilio credentials are configured, use actual SMS service
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await sendSMS(identifier, `Your OTP code is ${otp}`);
      } catch (err) {
        console.error('SMS send failed:', err);
      }
    } else {
      // fallback to console log when credentials are missing
      console.log(`[SMS OTP] To: ${identifier}, OTP: ${otp}`);
    }
  }

  return {
    [isEmail ? "email" : "phone"]: identifier,
    type,
    expired_at,
  };
};

/**
 * Verify OTP
 */
const OTPVerify = async (type, identifier, otp) => {
  if (!type || !identifier || !otp) {
    return { status: false, message: "All fields are required" };
  }

  const isEmail = identifier.includes("@");
  const query = { type, [isEmail ? "email" : "phone"]: identifier };

  const record = await otpModel.findOne(query).sort({ createdAt: -1 });

  if (!record) {
    return { status: false, message: "OTP request not found" };
  }

  if (new Date() > record.expired_at) {
    await otpModel.deleteOne({ _id: record._id });
    return { status: false, message: "OTP expired" };
  }

  if (String(otp) !== record.otp) {
    return { status: false, message: "OTP invalid" };
  }

  // OTP is single-use
  await otpModel.deleteOne({ _id: record._id });

  return { status: true, message: "OTP verified" };
};

module.exports = {
  generateOTP,
  OTPVerify,
};
