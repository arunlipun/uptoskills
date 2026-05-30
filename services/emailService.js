import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
};

export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `"StarMentor" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
    };
    if (html) mailOptions.html = html;
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Could not send email');
  }
};

export const sendOtpEmail = async (email, otp, expiryMinutes = 10) => {
  const subject = 'Your OTP Code';
  const text = `Your OTP is ${otp}. It is valid for ${expiryMinutes} minutes.`;
  return sendEmail(email, subject, text);
};

export const sendPasswordResetEmail = async (email, resetToken, frontendUrl) => {
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
  const subject = 'Password Reset Request';
  const text = `You requested a password reset. Click or paste this link: ${resetUrl}\nThis link expires in 10 minutes.`;
  return sendEmail(email, subject, text);
};