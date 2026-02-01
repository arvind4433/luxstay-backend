const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        //required: true,
        unique: true
      
    },
    name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
 
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);
