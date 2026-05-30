
import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  updateProfile,
  changePassword,
  searchUsers
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Own profile routes (protected)
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Search users (any authenticated user)
router.get('/search', protect, searchUsers);

// Admin only routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.put('/:id/role', protect, authorize('admin'), changeUserRole);

export default router;