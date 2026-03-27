const rateLimit = require('express-rate-limit');

// Rate limiting for login attempts
const loginTracker = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes window
    max: 5, // Limit each IP to 5 login requests per window
    message: { message: "Too many login attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for OTP generation
const otpTracker = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes window
    max: 3, // Limit each IP to 3 OTP requests per window
    message: { message: "Too many OTP requests, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

// General rate limit for all other auth routes
const authTracker = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: { message: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginTracker,
    otpTracker,
    authTracker
};
