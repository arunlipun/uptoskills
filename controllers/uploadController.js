
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// @desc    Upload video (instructor/admin only)
// @route   POST /api/upload/video
// @access  Private (Instructor/Admin)
export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'video',
      folder: 'starmentor/videos'
    });
    res.status(200).json({ success: true, url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload PDF (instructor/admin only)
// @route   POST /api/upload/pdf
// @access  Private (Instructor/Admin)
export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'raw',
      folder: 'starmentor/pdfs'
    });
    res.status(200).json({ success: true, url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload avatar (any authenticated user)
// @route   POST /api/upload/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'starmentor/avatars',
      transformation: [{ width: 300, height: 300, crop: 'fill' }]
    });
    // Update user's avatar in DB
    const { User } = await import('../models/index.js');
    await User.update({ avatar: result.secure_url }, { where: { id: req.user.id } });
    res.status(200).json({ success: true, url: result.secure_url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload course thumbnail (instructor/admin only)
// @route   POST /api/upload/thumbnail
// @access  Private (Instructor/Admin)
export const uploadThumbnail = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'starmentor/thumbnails',
      transformation: [{ width: 640, height: 360, crop: 'fill' }]
    });
    res.status(200).json({ success: true, url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};