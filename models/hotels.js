const mongoose= require("mongoose");

const HotelSchema = new mongoose.Schema({
    name:{
        type:String,
    },
description:{
    type:String
},
image: {
    type: String
},
location:{
    type:String
},
amenities:{
    type:Array

},
price:{
    type:Number
},

},
{
    timestamps : true
}

);
module.exports = mongoose.model("hotels",HotelSchema);

