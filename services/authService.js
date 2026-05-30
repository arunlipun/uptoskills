import { User } from '../models/index.js';
import { generateToken } from '../utils/generateToken.js';
import { sendPasswordResetEmail } from './emailService.js';
import crypto from 'crypto';
import { Op } from 'sequelize';

export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error('User already exists');
  
  const user = await User.create({ name, email, password, role: role || 'user' });
  const token = generateToken(user.id);
  return { user, token };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  
  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error('Invalid credentials');
  
  const token = generateToken(user.id);
  return { user, token };
};

export const getUserById = async (userId) => {
  return await User.findByPk(userId, {
    attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
  });
};

export const createPasswordResetToken = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('No user found with that email');
  
  const resetToken = user.getResetPasswordToken();
  await user.save();
  await sendPasswordResetEmail(email, resetToken, process.env.FRONTEND_URL);
  return { success: true };
};

export const resetUserPassword = async (resetToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const user = await User.findOne({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { [Op.gt]: new Date() }
    }
  });
  if (!user) throw new Error('Invalid or expired token');
  
  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();
  
  const token = generateToken(user.id);
  return { token };
};