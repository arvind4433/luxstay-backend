
const Otp = require("../models/Otp")

const generateOTP = async(type, user_id ,) => {

    const otp = Math.floor(100000 + Math.random() * 900000);
  
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); 
    
    const otps = new Otp({
        user_id,
        type,
        otp,
        expired_at: expirationTime
    })
    otps.save();

    return otps.otp ?? null;
    
}

const VerifyOTP = async(type,otp,user_id) => {
  
    const otps = await Otp.findOne({ user_id, type }).sort({ createdAt: -1 });

   
    if (!otps) {
        return { status: false, message: "otp invalid" }
    }
    
    if(otps.otp != otp){
        return {status: false, message: "otp invalid"}
    }

   const nowdate = new Date();
    if(otps.expired_at < nowdate){
        return {status: false, message: "otp expired"}
    }

    return {status: true, message: "otp valid"}
}

module.exports = {
    generateOTP,
    VerifyOTP
}