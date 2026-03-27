const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailService = require('../../services/mailer');
const { getLocalIPInfo } = require('../../utils/ipinfo');
const generateUsername = require('../../utils/generateUsername');
const RegisterToken = require('../../models/RegisterToken');
const { generateOTP, OTPVerify } = require('../../utils/otpHandler');

const isEmail = (str) => String(str).includes('@');

const generateToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role
    }
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};


const register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || (!email && !phone) || !password) {
    return res.status(400).json({ message: "Name, Password, and either Email or Phone are required" });
  }

  const identifier = email || phone;

  try {
    const phoneLookup = phone ? [phone, phone.startsWith('+91') ? phone.slice(3) : `+91${phone}`] : [];
    const userExist = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? phoneLookup.map(p => ({ phone: p })) : [])
      ]
    });

    if (userExist) {
      // [PHONESMART] If user exists and it's a phone, try to treat as login
      if (phone) {
        const isMatch = await bcrypt.compare(password, userExist.password);
        if (isMatch) {
          const result = await generateOTP("login", userExist.phone || phone);
          return res.status(200).json({
            success: true,
            message: "Account identified. OTP sent for secure access.",
            data: { ...result, type: "login" }
          });
        }
      }
      return res.status(409).json({ message: 'Identity already registered. Please sign in.' });
    }

    const existingToken = await RegisterToken.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      phone,
      password: hashedPassword,
    };

    if (existingToken) {
      existingToken.data = userData;
      await existingToken.save();
    } else {
      await RegisterToken.create({
        email,
        phone,
        data: userData,
      });
    }
    const result = await generateOTP("register", identifier);

    return res.status(200).json({
      success: true,
      message: `Registration OTP sent to your ${email ? 'email' : 'phone'}. Please verify.`,
      data: result
    });
  } catch (error) {
    console.error("Register Error:", error);
    if (error.code === 'EENVELOPE' || error.syscall === 'getaddrinfo') {
      return res.status(500).json({ message: "Failed to send OTP. Please try again later." });
    }
    return res.status(500).json({ message: "An unexpected error occurred during registration. Please try again." });
  }
};


const login = async (req, res) => {
  const { email, phone, password } = req.body;
  const identifier = email || phone;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Identifier and password are required" });
  }

  try {
    const phoneLookup = phone ? [phone, phone.startsWith('+91') ? phone.slice(3) : `+91${phone}`] : [];
    const userExist = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(email ? [{ username: email }] : []),
        ...(phone ? phoneLookup.map(p => ({ phone: p })) : [])
      ]
    });

    if (!userExist) {
      // [PHONESMART] If phone user not found, treat as register
      if (phone) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
          name: `Guest_${phone.slice(-4)}`, // Default name for new phone users
          phone,
          password: hashedPassword,
        };

        await RegisterToken.findOneAndUpdate(
          { phone },
          { $set: { data: userData } },
          { upsert: true, new: true }
        );

        const result = await generateOTP("register", phone);
        return res.status(200).json({
          success: true,
          message: "New identity protocol initiated. Registration OTP sent.",
          data: { ...result, type: "register" }
        });
      }
      return res.status(401).json({ message: 'Invalid credentials or identity not found' });
    }

    const isMatch = await bcrypt.compare(password, userExist.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Instead of returning token, send OTP for login verification
    // Use the user's actual email or phone depending on how they identified
    const otpDestination = (phone && userExist.phone) ? userExist.phone : userExist.email;
    const result = await generateOTP("login", otpDestination);

    await getLocalIPInfo();
    res.json({
      success: true,
      message: `OTP sent to your ${isEmail(otpDestination) ? 'email' : 'phone'}. Please verify to login.`,
      data: result
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    if (error.code === 'EENVELOPE' || error.syscall === 'getaddrinfo') {
      return res.status(500).json({ message: "Failed to send OTP. Please try again later." });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};



const forgotPassword = async (req, res) => {
  const { email, phone } = req.body;
  const identifier = email || phone;

  if (!identifier) {
    return res.status(400).json({ message: "Identifier is required" });
  }

  try {
    const user = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otpDestination = (phone && user.phone) ? user.phone : user.email;
    const result = await generateOTP("forgot", otpDestination);
    res.json({ success: true, message: `OTP sent to your ${isEmail(otpDestination) ? 'email' : 'phone'}. Please verify to reset password.`, data: result });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    if (error.code === 'EENVELOPE' || error.syscall === 'getaddrinfo') {
      return res.status(500).json({ message: "Failed to send OTP. Please try again later." });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

const resetPassword = async (req, res) => {
  const { newPassword, token } = req.body;

  try {
    if (!token) return res.status(401).json({ message: "Token missing" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    await mailService.sendResetConfirmationEmail(user.email, user.name);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
}

const resendOTP = async (req, res) => {
  const { email, phone, type } = req.body;
  const identifier = email || phone;

  if (!identifier || !type) {
    return res.status(400).json({ message: "Identifier and type are required" });
  }

  try {
    const result = await generateOTP(type, identifier);

    return res.status(200).json({
      success: true,
      message: `New OTP sent successfully to your ${isEmail(identifier) ? 'email' : 'phone'}.`,
      data: result
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    if (error.code === 'EENVELOPE' || error.syscall === 'getaddrinfo') {
      return res.status(500).json({ message: "Failed to send OTP. Please try again later." });
    }
    return res.status(500).json({ message: "Server error" });
  }
}

const verifyOTP = async (req, res) => {
  const { email, phone, type, otp } = req.body;
  const identifier = email || phone;

  if (!identifier || !type || !otp) {
    return res.status(400).json({ message: "Identifier, type and OTP are required" });
  }

  try {
    // ✅ Verify OTP (throws if invalid / expired)
    const result = await OTPVerify(type, identifier, otp);

    if (result && !result.status) {
      return res.status(400).json({ message: result.message });
    }

    /* ---------------- REGISTER FLOW ---------------- */
    if (type === "register") {
      const existingToken = await RegisterToken.findOne({
        $or: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      });

      if (!existingToken) {
        return res.status(400).json({ message: "Registration session expired" });
      }

      const userExist = await User.findOne({
        $or: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      });

      if (userExist) {
        return res.status(409).json({ message: "User already exists" });
      }

      const userData = {
        ...existingToken.data,
        username: generateUsername()
      };
      const user = await User.create(userData);

      await RegisterToken.findByIdAndDelete(existingToken._id);

      const token = generateToken(user);

      return res.status(200).json({
        message: "User registered successfully",
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          }
        }
      });
    }

    /* ---------------- LOGIN FLOW ---------------- */
    if (type === "login") {
      const userExist = await User.findOne({
        $or: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      });

      if (!userExist) {
        return res.status(401).json({ message: "User not found" });
      }

      const token = generateToken(userExist);

      // Send Login Alert Notification
      if (userExist.email) {
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device/Browser';
        mailService.sendLoginAlertEmail(userExist.email, userExist.name || 'User', new Date().toLocaleString(), deviceInfo);
      }

      return res.status(200).json({
        message: "Login successful",
        success: true,
        data: {
          token,
          user: {
            id: userExist._id,
            name: userExist.name,
            email: userExist.email,
            phone: userExist.phone,
            role: userExist.role
          }
        }
      });
    }

    /* ---------------- FORGOT PASSWORD FLOW ---------------- */
    if (type === "forgot") {
      const userExist = await User.findOne({
        $or: [
          { email: identifier },
          { phone: identifier }
        ]
      });
      if (!userExist) {
        return res.status(401).json({ message: "User not found" });
      }

      const token = generateToken(userExist);

      return res.status(200).json({
        message: "OTP verified",
        success: true,
        data: {
          token,
          user: {
            id: userExist._id,
            name: userExist.name,
            email: userExist.email,
            phone: userExist.phone,
            role: userExist.role
          }
        }
      });
    }


    return res.status(400).json({ message: "Invalid OTP type" });

  } catch (error) {
    console.error("OTP Verify Error:", error.message);

    return res.status(400).json({
      message: error.message || "OTP verification failed",
    });
  }
};




const socialAuthCallback = (req, res) => {
  const token = generateToken(req.user);
  const frontendUrl = process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:5173";
  res.redirect(`${frontendUrl}/oauth-success?token=${token}&userId=${req.user._id}`);
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  resendOTP,
  verifyOTP,
  socialAuthCallback
};
