const { generateToken } = require("../libs/jwt")
const bcryptjs = require('bcryptjs')
const User = require("../models/User")
const SendMail = require("../services/mail")
const {OAuth2Client} = require("google-auth-library")

const { google } = require('googleapis')
const { generateOTP, VerifyOTP } = require("../utils/otpcontroller")

const OAuthClient = new OAuth2Client(
     process.env.Google_Client_ID,
    process.env.Google_Client_Secret,
    "postmessage"
)

const register = async (req,res) => {
    const { email, name, password} = req.body
    const ExistUser = await User.findOne({email:email})
    if(ExistUser){
 return res.json({
        status: false,
        message: "user exist"
    })
    }

    const hashPassword = await bcryptjs.hash(password,16)
     const user = new User({
        email,
        password:hashPassword,
        name,
    })
    user.save()
    return res.json({
        status: true,
        message: "register success"
    })
}

const login = async(req,res) => {
    const { email, password} = req.body
 var ExistUser = await User.findOne({email:email})
      if(!ExistUser){
        return res.json({
                status: false,
                message: "user not found"
            })
    }

    var ExistUsers = await bcryptjs.compare(password, ExistUser.password);
      if(!ExistUsers){
        return res.json({
                status: false,
                message: "user not found"
            })
    }
 const code = await generateOTP("login",ExistUser._id);



    const message = `<div>
      <h2>Your OTP code is </h2>
      <h1>${code}</h1>
    </div>`
    const mail = await SendMail(email,"Login OTP!", message)
    console.log(mail)
return res.json({
        status: true,
        message: "login success",
    })
}



const verifylogin  = async(req,res) => {
    const {email, otp} = req.body;
    var ExistUser = await User.findOne({email:email})
      if(!ExistUser){
        return res.json({
                status: false,
                message: "user not found"
            })
    }

    const Verify= await VerifyOTP("login",otp,ExistUser._id);
    if(!Verify.status){
        return res.json({
            status: false,
            message: Verify.message
        })
    }

    const token = await generateToken(ExistUser);

    return res.json({
        status: true,
        message: "login success",
        token: token
    })

}

const verifyOTP  = async(req,res) => {
    const {email, otp, type} = req.body;
    var ExistUser = await User.findOne({email:email})
      if(!ExistUser){
        return res.json({
                status: false,
                message: "user not found"
            })
    }

    const Verify= await VerifyOTP(type,otp,ExistUser._id);
    if(!Verify.status){
        return res.json({
            status: false,
            message: Verify.message
        })
    }

    const token = await generateToken(ExistUser);

    return res.json({
        status: true,
        message: "login success",
        token: token
    })

}



const getUser = async (req, res) => {
    try {
        const { email } = req.user;
        const ExistUser = await User.findOne({ email: email }).select("-password");

        if (!ExistUser) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        return res.json({
            status: true,
            message: "User get success",
            data: ExistUser
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal Server Error"
        });
    }
};


const updatePassword = async (req, res) => {
  const {newPassword} = req.body
    
    const decoded = req.user;

    const hashPassword = await bcryptjs.hash(newPassword,16)
    const user = User.findOneAndUpdate({
        email:decoded.email
    },{
        password: hashPassword
    })
   
      return res.json({
        status: true,
        message: "new passowrd saved",
      });
    }

const forgotPassword = async(req,res) => {
    const {email} = req.body
  const ExistUser = await User.findOne({email:email});
      if(!ExistUser){
 return res.json({
        status: false,
        message: "user not found"
    })
    }
    const otp = await generateOTP("forgot",ExistUser._id);

    const message = `<div>
      <h2>Your 6 digit otp is : </h2>
      <p>${otp}<p/>
    </div>`

    const mail = await SendMail(email,"Forgot Password!", message)
    return res.json({
        status: true,
        message: "Forgot password email sent check your email",
    })
}


const googleLogin = async (req, res) => {
   const {token} = req.body;
    const {tokens} =  await OAuthClient.getToken(token) 
    OAuthClient.setCredentials(tokens)

    const oauth2 = google.oauth2({
        auth: OAuthClient,
        version: 'v2'
    });

    const userInfo = await oauth2.userinfo.get();
    const userEmail = userInfo.data.email;
    const userName = userInfo.data.name;

    let existUser = await User.findOne({ email: userEmail });

    if (!existUser) {
        existUser = new User({ email: userEmail, name: userName });
        await existUser.save();
    }

    const jwtToken = await generateToken(existUser);

    return res.json({
        status: true,
        message: "login success",
        data: { token: jwtToken }
    });
}





module.exports = UserController = {
    login,
    register,
    getUser,
    forgotPassword,
    updatePassword,
    googleLogin,
    verifylogin,
    verifyOTP
}