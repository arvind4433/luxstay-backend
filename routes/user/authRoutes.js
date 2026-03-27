const express = require('express');
const passport = require('passport');
const AuthController = require('../../controllers/user/authController');
const { loginTracker, otpTracker, authTracker } = require('../../middleware/rateLimiter');
const router = express.Router();

router.use(authTracker);

router.post('/login', loginTracker, AuthController.login);
router.post('/resend-otp', otpTracker, AuthController.resendOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/register', AuthController.register);
router.post('/forgot-password', otpTracker, AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// OAuth Routes
const redirectURL = process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:5173";

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: redirectURL }), AuthController.socialAuthCallback);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: redirectURL }), AuthController.socialAuthCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: redirectURL }), AuthController.socialAuthCallback);

module.exports = router;