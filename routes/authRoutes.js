
import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { 
  validateRegister, 
  validateLogin, 
  validateSendOtp, 
  validateVerifyOtp,
  validateForgotPassword,
  validateResetPassword
} from '../validators/authValidator.js';
import { authLimiter } from '../config/rateLimit.js';
import passport from '../config/passport.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/send-otp', authLimiter, validateSendOtp, sendOtp);
router.post('/verify-otp', authLimiter, validateVerifyOtp, verifyOtp);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password/:resetToken', validateResetPassword, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const { token, user } = req.user;
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

export default router;