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
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    otp: {
      type: String,
      required: true,
    },
    expired_at: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add TTL index to auto-delete records after 5 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const otpModel = mongoose.model("Otp", otpSchema);

module.exports = otpModel;
