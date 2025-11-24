const mongoose= require("mongoose");

const HotelSchema = new mongoose.Schema({
    name:{
        type:String,
    },
rooms:{
    type:String
},
location:{
    type:String
},
availability:{
    type:String

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

