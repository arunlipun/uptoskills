import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getPendingApprovals,
  approveRequest,
  rejectRequest,
  getApprovalCount
} from '../controllers/approvalController.js';

const router = express.Router();

// All routes require admin access
router.use(protect, authorize('admin'));

router.get('/pending', getPendingApprovals);
router.post('/:id/approve', approveRequest);
router.post('/:id/reject', rejectRequest);
router.get('/count', getApprovalCount);

export default router;