



const mongoose = require("mongoose")

const OtpSchema = new mongoose.Schema({

    user_id: {
        type:String,
        ref: "users"
    },
    otp: {
        type: Number
    },
    type: {
        type: String,
        enum : ["login","register","forgot"]
    },
    expired_at : {
        type: Date
    },

},
{
    timestamps: true
});

module.exports = mongoose.model("otps",OtpSchema);