  const mongoose = require('mongoose');

  const RoomSchema = new mongoose.Schema({
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true
    },               // Reference to hotels
    roomTypeCode: String,            // DLX, STD, SUITE
    roomTypeName: String,

    description: String,
    maxAdults: Number,
    maxChildren: Number,
    bedType: String,                 // King, Queen, Twin
    roomSize: Number,                // in sq ft

    amenities: [String],             // AC, TV, Balcony

    basePrice: Number,
    extraAdultPrice: Number,
    extraChildPrice: Number,

    totalRooms: Number,
    availableRooms: Number,

    images: [String],

    status: String,  
  }, { timestamps: true });


  module.exports = mongoose.model('Room', RoomSchema);