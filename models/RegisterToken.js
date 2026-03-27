const mongoose = require('mongoose');

const RegisterTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    sparse: true
  },
  phone: {
    type: String,
    required: false,
    sparse: true
  },
  data: {
    type: Object,
    required: true
  },

}, { timestamps: true });

// Add TTL index to auto-delete records after 1 hour
RegisterTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('RegisterToken', RegisterTokenSchema);
