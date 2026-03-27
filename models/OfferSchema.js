const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },          // e.g. "Summer Sale"
    description: { type: String, required: true },    // Short description
    code: { type: String, required: true, unique: true }, // e.g. LUXSTAY10

    discountType: {
      type: String,
      enum: ["PERCENT", "FLAT"],                      // % or flat amount
      required: true,
    },

    discountValue: { type: Number, required: true },  // 10% or ₹500

    minBookingAmount: { type: Number, default: 0 },   // minimum cart value
    maxDiscount: { type: Number },                    // cap for % discount

    validFrom: { type: Date, required: true },
    validTill: { type: Date, required: true },

    applicableOn: {
      type: String,
      enum: ["HOTEL", "ROOM", "BOTH"],                 // full hotel / room / both
      default: "BOTH",
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", OfferSchema);