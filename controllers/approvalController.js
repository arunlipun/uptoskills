import { ApprovalRequest, Course, User } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Get all pending approval requests (admin only)
// @route   GET /api/approvals/pending
// @access  Private/Admin
export const getPendingApprovals = async (req, res) => {
  try {
    const approvals = await ApprovalRequest.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'requester', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'ASC']]
    });
    res.status(200).json({ success: true, count: approvals.length, approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve a request (admin only)
// @route   POST /api/approvals/:id/approve
// @access  Private/Admin
export const approveRequest = async (req, res) => {
  try {
    const approval = await ApprovalRequest.findByPk(req.params.id);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }
    if (approval.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }
    approval.status = 'approved';
    approval.reviewedBy = req.user.id;
    approval.reviewedAt = new Date();
    await approval.save();

    // Update target based on type
    if (approval.type === 'course') {
      await Course.update({ isPublished: true }, { where: { id: approval.targetId } });
    } else if (approval.type === 'instructor') {
      await User.update({ role: 'instructor' }, { where: { id: approval.targetId } });
    }
    res.status(200).json({ success: true, message: 'Request approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a request (admin only)
// @route   POST /api/approvals/:id/reject
// @access  Private/Admin
export const rejectRequest = async (req, res) => {
  try {
    const { adminComment } = req.body;
    const approval = await ApprovalRequest.findByPk(req.params.id);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }
    if (approval.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }
    approval.status = 'rejected';
    approval.adminComment = adminComment || '';
    approval.reviewedBy = req.user.id;
    approval.reviewedAt = new Date();
    await approval.save();
    res.status(200).json({ success: true, message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get count of pending approvals (admin only)
// @route   GET /api/approvals/count
// @access  Private/Admin
export const getApprovalCount = async (req, res) => {
  try {
    const count = await ApprovalRequest.count({ where: { status: 'pending' } });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};