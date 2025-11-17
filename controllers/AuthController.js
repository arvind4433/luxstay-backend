const { generateToken } = require("../libs/jwt")
const bcryptjs = require('bcryptjs')
const User = require("../models/User")
const SendMail = require("../services/mail")
const {OAuth2Client} = require("google-auth-library")

const { google } = require('googleapis')

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
        image
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
                message: "user not foundd"
            })
    }
 const token = await generateToken(ExistUser);
return res.json({
        status: true,
        message: "login success",
        data : {token}
    })
}

const getUser = async(req,res) => {
    const {email} = req.user
  const ExistUser = await User.findOne({email:email}).select("-password")
      if(!ExistUser){
 return res.json({
        status: false,
        message: "user not found"
    })
    }
    return res.json({
        status: true,
        message: "user get success",
        data : ExistUser 
    })
}

const updatePassword = async (req, res) => {
  const {newPass} = req.body
    
    const decoded = req.user;

    const hashPassword = await bcryptjs.hash(newPass,16)
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
    const token = await generateToken(ExistUser);

    const message = `<div>
      <h2>Please click on link </h2>
      <a href="http://localhost:5173/auth/resetpassword/${token}">Reset Password</a>
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
    googleLogin
}