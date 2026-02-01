const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
bookingId: String,               // Human-readable ID
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  checkInDate: Date,
  checkOutDate: Date,
  nights: Number,

  guests: {
    adults: Number,
    children: Number
  },

  price: {
    roomPrice: Number,
    taxes: Number,
    discount: Number,
    totalAmount: Number
  },

  paymentStatus: String,           // pending | paid | failed | refunded
  bookingStatus: String,           // confirmed | cancelled | checked_in | checked_out | no_show

  source: String,                  // website | admin | OTA

  cancellationReason: String,

}, { timestamps: true });


module.exports = mongoose.model('Booking', BookingSchema);