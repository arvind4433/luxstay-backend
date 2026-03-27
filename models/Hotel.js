const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  hotelCode: { type: String, unique: true, sparse: true },
  name: { type: String, required: true, trim: true },
  brand: String,
  slug: { type: String, unique: true, sparse: true },

  description: String,
  starRating: { type: Number, min: 1, max: 5, default: 3 },
  propertyType: { type: String, default: 'Hotel' }, // Hotel, Resort, Villa, Hostel

  // Owner
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  contact: {
    email: String,
    phone: String,
    whatsapp: String,
  },

  address: {
    addressLine1: String,
    addressLine2: String,
    city: { type: String, index: true },
    state: String,
    country: { type: String, default: 'India' },
    pincode: String,
    latitude: Number,
    longitude: Number,
  },

  amenities: [String], // Pool, WiFi, Spa, Gym, Parking, Restaurant, Bar, Gym

  policies: {
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '12:00' },
    cancellationPolicy: String,
    petPolicy: String,
    smokingPolicy: String,
  },

  images: [String], // Image URLs (Cloudinary)
  coverImage: String,

  documents: {
    gstNumber: String,
    licenseNumber: String,
  },

  pricing: {
    basePricePerNight: { type: Number, required: true, default: 1000 },
    currency: { type: String, default: 'INR' },
  },

  // Ratings
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended'],
    default: 'pending',
    index: true,
  },
  isFeatured: { type: Boolean, default: false, index: true },

}, { timestamps: true });

// Text search index
HotelSchema.index({ name: 'text', 'address.city': 'text', 'address.state': 'text' });

module.exports = mongoose.model('Hotel', HotelSchema);