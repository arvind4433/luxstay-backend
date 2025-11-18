const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({

    name : {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String
    },
    phone : {
        type: Number
    },
    image: {                   
        type: String        
    },

},
{
    timestamps: true
});

module.exports = mongoose.model("users",UserSchema);z