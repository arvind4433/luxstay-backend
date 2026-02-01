const mongoose = require('mongoose');

const RoomInventorySchema = new mongoose.Schema({
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

  date: Date,

  totalRooms: Number,
  bookedRooms: Number,
  availableRooms: Number,

  price: Number,                   // Dynamic pricing
  isBlocked: Boolean,  
 
}, { timestamps: true });


module.exports = mongoose.model('RoomInventory', RoomInventorySchema);