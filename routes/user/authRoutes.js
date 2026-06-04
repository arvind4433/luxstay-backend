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

const ensureProvider = (provider) => (req, res, next) => {
  if (!passport.enabledProviders?.includes(provider)) {
    return res.status(503).json({
      status: false,
      message: `${provider} login is not configured on this server.`,
    });
  }
  return next();
};

router.get('/google', ensureProvider('google'), passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', ensureProvider('google'), passport.authenticate('google', { failureRedirect: redirectURL }), AuthController.socialAuthCallback);

router.get('/facebook', ensureProvider('facebook'), passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', ensureProvider('facebook'), passport.authenticate('facebook', { failureRedirect: redirectURL }), AuthController.socialAuthCallback);

router.get('/github', ensureProvider('github'), passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', ensureProvider('github'), passport.authenticate('github', { failureRedirect: redirectURL }), AuthController.socialAuthCallback);

module.exports = router;
