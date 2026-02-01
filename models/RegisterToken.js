const mongoose = require('mongoose');

const RegisterTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
      
    },
    data: {
    type: Object,
    required: true
  },

}, { timestamps: true });
module.exports = mongoose.model('RegisterToken', RegisterTokenSchema);
