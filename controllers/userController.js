
import { User, Enrollment, Course } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user (admin or own user)
// @route   PUT /api/users/:id
// @access  Private (Admin or owner)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can change role' });
    }
    delete req.body.password;
    await user.update(req.body);
    const updated = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
    });
    res.status(200).json({ success: true, message: 'User updated', user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    await user.destroy();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'instructor'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role' });
    }
    user.role = role;
    await user.save();
    res.status(200).json({ success: true, message: 'Role changed', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByPk(req.user.id);
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search users by name or email
// @route   GET /api/users/search?keyword=...
// @access  Private (any authenticated user)
export const searchUsers = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let where = {};
    if (keyword) {
      where = {
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } }
        ]
      };
    }
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] },
      limit: parseInt(limit),
      offset,
      order: [['name', 'ASC']]
    });
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      users: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};