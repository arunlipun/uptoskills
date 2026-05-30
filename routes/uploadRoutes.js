
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { 
  uploadVideo, 
  uploadPDF, 
  uploadAvatar, 
  uploadThumbnail 
} from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { uploadLimiter } from '../config/rateLimit.js';

const router = express.Router();

// Video upload (instructor/admin only)
router.post('/video', protect, authorize('admin', 'instructor'), uploadLimiter, upload.single('video'), uploadVideo);

// PDF upload (instructor/admin only)
router.post('/pdf', protect, authorize('admin', 'instructor'), uploadLimiter, upload.single('pdf'), uploadPDF);

// Avatar upload (any authenticated user)
router.post('/avatar', protect, uploadLimiter, upload.single('avatar'), uploadAvatar);

// Thumbnail upload (instructor/admin only)
router.post('/thumbnail', protect, authorize('admin', 'instructor'), uploadLimiter, upload.single('thumbnail'), uploadThumbnail);

export default router;