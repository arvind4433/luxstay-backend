const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: String,
  discountType: String,            // percentage | flat
  discountValue: Number,

  minBookingAmount: Number,
  maxDiscount: Number,

  validFrom: Date,
  validTo: Date,

  usageLimit: Number,
  usedCount: Number,

  status: String

}, { timestamps: true });


module.exports = mongoose.model('Coupon', CouponSchema);