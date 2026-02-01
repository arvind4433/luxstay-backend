const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
 hotelCode: String,              // Unique internal code
  name: String,
  brand: String,                  // If chain hotel

  description: String,
  starRating: Number,             // 1–5
  propertyType: String,           // Hotel, Resort, Villa, Hostel

  contact: {
    email: String,
    phone: String,
    whatsapp: String
  },

  address: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
    latitude: Number,
    longitude: Number
  },

  amenities: [String],            // Pool, WiFi, Spa, Gym
  policies: {
    checkInTime: String,
    checkOutTime: String,
    cancellationPolicy: String,
    petPolicy: String,
    smokingPolicy: String
  },

  images: [String],               // Image URLs
  documents: {
    gstNumber: String,
    licenseNumber: String
  },

  status: String,                 // active | inactive | suspended
  isFeatured: Boolean,
}, { timestamps: true });


module.exports = mongoose.model('Hotel', HotelSchema);