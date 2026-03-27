const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    proxy: true
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Find user by googleId or email
            let user = await User.findOne({
                $or: [
                    { googleId: profile.id },
                    { email: profile.emails[0].value }
                ]
            });

            if (user) {
                // Update user if they don't have googleId yet
                if (!user.googleId) {
                    user.googleId = profile.id;
                    if (!user.avatar) user.avatar = profile.photos[0].value;
                    await user.save();
                }
                return done(null, user);
            }

            // Create new user
            user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                avatar: profile.photos[0].value,
                status: 'active'
            });
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID || 'placeholder',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'placeholder',
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'photos'],
    proxy: true
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({
                $or: [
                    { facebookId: profile.id },
                    { email: profile.emails ? profile.emails[0].value : null }
                ].filter(q => q.email !== null)
            });

            if (user) {
                if (!user.facebookId) {
                    user.facebookId = profile.id;
                    await user.save();
                }
                return done(null, user);
            }

            user = await User.create({
                name: profile.displayName,
                email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`,
                facebookId: profile.id,
                avatar: profile.photos ? profile.photos[0].value : '',
                status: 'active'
            });
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }
));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'placeholder',
    callbackURL: process.env.GITHUB_CALLBACK_URL || "/api/auth/github/callback",
    proxy: true
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({
                $or: [
                    { githubId: profile.id },
                    { email: profile.emails ? profile.emails[0].value : null }
                ].filter(q => q.email !== null)
            });

            if (user) {
                if (!user.githubId) {
                    user.githubId = profile.id;
                    await user.save();
                }
                return done(null, user);
            }

            user = await User.create({
                name: profile.displayName || profile.username,
                email: profile.emails ? profile.emails[0].value : `${profile.username}@github.com`,
                githubId: profile.id,
                avatar: profile._json.avatar_url,
                status: 'active'
            });
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    }
));

module.exports = passport;
