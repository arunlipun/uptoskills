import { Otp } from '../models/index.js';
import { sendOtpEmail } from './emailService.js';
import { Op } from 'sequelize';

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createAndSendOtp = async (email) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  
  // Delete any previous unverified OTPs for this email
  await Otp.destroy({ where: { email, verified: false } });
  
  // Create new OTP
  await Otp.create({ email, otp, expiresAt, verified: false });
  
  // Send email
  await sendOtpEmail(email, otp, OTP_EXPIRY_MINUTES);
  
  return { success: true, message: 'OTP sent' };
};

export const verifyOtpCode = async (email, otpCode) => {
  const otpRecord = await Otp.findOne({
    where: { email, otp: otpCode, verified: false, expiresAt: { [Op.gt]: new Date() } }
  });
  if (!otpRecord) return { valid: false, message: 'Invalid or expired OTP' };
  
  otpRecord.verified = true;
  await otpRecord.save();
  return { valid: true };
};