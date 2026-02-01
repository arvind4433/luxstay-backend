const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["login", "register", "forgot"],
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expired_at: {
      type: Date,
      required: true,
    },
    used: {
  type: Boolean,
  default: false,
},
  },
  {
    timestamps: true,
  }
);

const otpModel = mongoose.model("Otp", otpSchema);

module.exports = otpModel;
