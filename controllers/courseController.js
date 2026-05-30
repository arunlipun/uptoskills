import { Course, Lesson, User, ApprovalRequest } from '../models/index.js';
import { paginate } from '../utils/paginate.js';
import { Op } from 'sequelize';

// @desc    Get all courses (public)
// @route   GET /api/courses
// @access  Public
export const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { offset, limit: limitNum } = paginate(req.query, page, limit);
    const { count, rows } = await Course.findAndCountAll({
      where: { isPublished: true },
      include: [{ model: User, as: 'instructor', attributes: ['id', 'name', 'email', 'avatar'] }],
      offset,
      limit: limitNum,
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: parseInt(page),
      courses: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search courses with filters
// @route   GET /api/courses/search?keyword=&category=&level=
// @access  Public
export const searchCourses = async (req, res) => {
  try {
    const { keyword, category, level, page = 1, limit = 10 } = req.query;
    const where = { isPublished: true };
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (category) where.category = category;
    if (level) where.level = level;
    const { offset, limit: limitNum } = paginate(req.query, page, limit);
    const { count, rows } = await Course.findAndCountAll({
      where,
      include: [{ model: User, as: 'instructor', attributes: ['id', 'name', 'email'] }],
      offset,
      limit: limitNum,
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: parseInt(page),
      courses: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Lesson, as: 'lessons', order: [['order', 'ASC']] }
      ]
    });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new course (admin/instructor)
// @route   POST /api/courses
// @access  Private (Admin/Instructor)
export const createCourse = async (req, res) => {
  try {
    req.body.instructorId = req.user.id;
    req.body.isPublished = false; // Requires approval
    const course = await Course.create(req.body);
    // Create approval request for this course
    await ApprovalRequest.create({
      requesterId: req.user.id,
      type: 'course',
      targetId: course.id,
      status: 'pending'
    });
    res.status(201).json({ success: true, message: 'Course created, pending approval', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update course (admin/instructor)
// @route   PUT /api/courses/:id
// @access  Private (Admin/Instructor)
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await course.update(req.body);
    res.status(200).json({ success: true, message: 'Course updated', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete course (admin/instructor)
// @route   DELETE /api/courses/:id
// @access  Private (Admin/Instructor)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    // Delete all lessons first
    await Lesson.destroy({ where: { courseId: req.params.id } });
    await course.destroy();
    res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add lesson to course
// @route   POST /api/courses/:id/lessons
// @access  Private (Admin/Instructor)
export const addLesson = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    req.body.courseId = req.params.id;
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update lesson
// @route   PUT /api/courses/:courseId/lessons/:lessonId
// @access  Private (Admin/Instructor)
export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    const course = await Course.findByPk(lesson.courseId);
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await lesson.update(req.body);
    res.status(200).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/courses/:courseId/lessons/:lessonId
// @access  Private (Admin/Instructor)
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    const course = await Course.findByPk(lesson.courseId);
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await lesson.destroy();
    res.status(200).json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};