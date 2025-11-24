const Otp = require("../models/Otp")

const generateOTP = async(type, user_id) => {

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otps = new Otp({
        user_id,
        type,
        otp
    })
    otps.save();

    return otps.otp ?? null;
    
}

const VerifyOTP = async(type,otp,user_id) => {
    const otps = await Otp.findOne({user_id,type}).sort({
        created_at : -1
    });
    
    if(otps.otp != otp){
        return {status: false, message: "otp invalid"}
    }

    const nowdate = new Date();
      if(otps.expired_at > nowdate){
        return {status: false, message: "otp expired"}
    }

    
     return {status: true, message: "otp valid"}
}

module.exports = {
    generateOTP,
    VerifyOTP
}

