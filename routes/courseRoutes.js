
import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  updateLesson,
  deleteLesson,
  searchCourses
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateCourse, validateLesson } from '../validators/courseValidator.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/search', searchCourses);
router.get('/:id', getCourseById);

// Protected routes - Admin/Instructor only
router.post('/', protect, authorize('admin', 'instructor'), validateCourse, createCourse);
router.put('/:id', protect, authorize('admin', 'instructor'), validateCourse, updateCourse);
router.delete('/:id', protect, authorize('admin', 'instructor'), deleteCourse);

// Lesson routes (nested under courses)
router.post('/:id/lessons', protect, authorize('admin', 'instructor'), validateLesson, addLesson);
router.put('/:courseId/lessons/:lessonId', protect, authorize('admin', 'instructor'), validateLesson, updateLesson);
router.delete('/:courseId/lessons/:lessonId', protect, authorize('admin', 'instructor'), deleteLesson);

export default router;