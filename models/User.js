const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone: { type: String, unique: true, sparse: true, trim: true },

  password: {
    type: String,
    required: function () {
      return !this.googleId && !this.facebookId && !this.githubId;
    }
  },

  // Social Auth
  googleId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },

  avatar: { type: String, default: '' },

  // Role-based Access Control
  role: {
    type: String,
    enum: ['user', 'owner', 'admin'],
    default: 'user',
    index: true,
  },

  // Saved / Wishlisted Hotels
  savedHotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],

  // Profile extras
  address: {
    city: String,
    state: String,
    country: String,
  },
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other', ''] },

  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },

  lastLogin: Date,

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
