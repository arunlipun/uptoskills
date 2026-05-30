import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/index.js';
import { generateToken } from '../utils/generateToken.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ where: { googleId: profile.id } });
      if (!user) {
        user = await User.findOne({ where: { email: profile.emails[0].value } });
        if (user) {
          user.googleId = profile.id;
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            password: Math.random().toString(36).slice(-8)
          });
        }
      }
      const token = generateToken(user.id);
      return done(null, { user, token });
    } catch (error) {
      return done(error, null);
    }
  }
));

export default passport;