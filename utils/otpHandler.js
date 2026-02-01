const otpModel = require("../models/otpModel");
const mailService = require("../services/mailer");

const generateOTP = async (type, email) => {
  if (!type || !email) {
    throw new Error("Type and email are required");
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expired_at = new Date(Date.now() + 5 * 60 * 1000);


  await otpModel.create({
    type,
    email,
    otp,
    expired_at,
  });

  await mailService.sendOtpEmail(email, otp);

  return {
    email,
    type,
    expired_at,
  };
};

const OTPVerify = async (type, email, otp) => {
  const record = await otpModel
    .findOne({
      type,
      email,
      used: false,
    })
    .sort({ createdAt: -1 });

  if (!record) {
    return {
      status: false,
      message: "OTP expired or already used",
    };
  }

  if (new Date() > record.expired_at) {
    record.used = true;
    await record.save();
    return {
      status: false,
      message: "OTP expired",
    };
  }

  if (String(otp) !== record.otp) {
    return {
      status: false,
      message: "OTP invalid",
    };
  }

  record.used = true;
  await record.save();

  return {
    status: true,
    message: "OTP verified",
  };
};


module.exports = {
  generateOTP,
  OTPVerify,
};
