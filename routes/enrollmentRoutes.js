
import express from 'express';
import {
  getMyEnrollments,
  getEnrollmentById,
  enrollCourse,
  unenrollCourse,
  completeLesson,
  updateCurrentLesson,
  trackTimeSpent
} from '../controllers/enrollmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMyEnrollments);
router.get('/:id', protect, getEnrollmentById);
router.post('/', protect, enrollCourse);
router.delete('/:id', protect, unenrollCourse);
router.put('/:id/complete-lesson', protect, completeLesson);
router.put('/:id/current-lesson', protect, updateCurrentLesson);
router.post('/:id/track-time', protect, trackTimeSpent);

export default router;