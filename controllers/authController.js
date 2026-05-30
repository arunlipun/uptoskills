import { registerUser, loginUser, getUserById, createPasswordResetToken, resetUserPassword } from '../services/authService.js';
import { createAndSendOtp, verifyOtpCode } from '../services/otpService.js';
import { generateToken } from '../utils/generateToken.js';
import { User } from '../models/index.js';

export const register = async (req, res) => {
  try {
    const { user, token } = await registerUser(req.body);
    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body.email, req.body.password);
    res.status(200).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out' });
};

export const forgotPassword = async (req, res) => {
  try {
    await createPasswordResetToken(req.body.email);
    res.status(200).json({ success: true, message: 'Reset email sent' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = await resetUserPassword(req.params.resetToken, req.body.password);
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    await createAndSendOtp(req.body.email);
    res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { valid, message } = await verifyOtpCode(req.body.email, req.body.otp);
    if (!valid) return res.status(400).json({ success: false, message });
    
    let user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      // Auto-create user if new
      user = await User.create({
        email: req.body.email,
        name: req.body.email.split('@')[0],
        password: Math.random().toString(36).slice(-8)
      });
    }
    const token = generateToken(user.id);
    res.status(200).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};