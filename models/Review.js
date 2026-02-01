const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true
    },
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

  rating: Number,                  // 1–5
  comment: String,

  isApproved: Boolean,
}, { timestamps: true });


module.exports = mongoose.model('Review', ReviewSchema);