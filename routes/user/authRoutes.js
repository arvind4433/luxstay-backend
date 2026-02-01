const express = require('express');
const AuthController = require('../../controllers/user/authController');
const router = express.Router();

// Admin authentication routes would go here (e.g., login, logout, password reset)


router.post('/login', AuthController.login);
router.post('/resend-otp', AuthController.resendOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/register', AuthController.register);


module.exports = router;