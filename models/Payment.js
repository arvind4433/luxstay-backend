const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
     bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  paymentGateway: String,          // Razorpay, Stripe
  transactionId: String,

  amount: Number,
  currency: String,

  status: String,                  // success | failed | refunded

  paymentMethod: String,           // card | upi | netbanking

  paidAt: Date,
}, { timestamps: true });


module.exports = mongoose.model('Payment', PaymentSchema);