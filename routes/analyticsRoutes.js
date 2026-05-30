
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getDashboardStats,
  getUserAnalytics,
  getCourseAnalytics,
  getCompletionTracking,
  exportReport
} from '../controllers/analyticsController.js';

const router = express.Router();

// All analytics routes require admin access
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUserAnalytics);
router.get('/courses', getCourseAnalytics);
router.get('/completion', getCompletionTracking);
router.get('/export', exportReport);

export default router;