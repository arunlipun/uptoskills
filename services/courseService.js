import { Course, Lesson, User, ApprovalRequest } from '../models/index.js';
import { paginate } from '../utils/paginate.js';
import { Op } from 'sequelize';

export const getCourses = async (filters = {}, page = 1, limit = 10) => {
  const where = { isPublished: true };
  if (filters.category) where.category = filters.category;
  if (filters.level) where.level = filters.level;
  if (filters.keyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${filters.keyword}%` } },
      { description: { [Op.like]: `%${filters.keyword}%` } }
    ];
  }
  const { offset, limit: limitNum } = paginate({ page, limit }, page, limit);
  const { count, rows } = await Course.findAndCountAll({
    where,
    include: [{ model: User, as: 'instructor', attributes: ['id', 'name', 'email'] }],
    offset,
    limit: limitNum,
    order: [['createdAt', 'DESC']]
  });
  return { courses: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limitNum) };
};

export const getCourseById = async (courseId) => {
  return await Course.findByPk(courseId, {
    include: [
      { model: User, as: 'instructor' },
      { model: Lesson, as: 'lessons', order: [['order', 'ASC']] }
    ]
  });
};

export const createCourse = async (courseData, userId) => {
  const course = await Course.create({
    ...courseData,
    instructorId: userId,
    isPublished: false
  });
  // Create approval request
  await ApprovalRequest.create({
    requesterId: userId,
    type: 'course',
    targetId: course.id,
    status: 'pending'
  });
  return course;
};

export const updateCourse = async (courseId, updateData, userId, userRole) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new Error('Course not found');
  if (course.instructorId !== userId && userRole !== 'admin') {
    throw new Error('Not authorized');
  }
  await course.update(updateData);
  return course;
};

export const deleteCourse = async (courseId, userId, userRole) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new Error('Course not found');
  if (course.instructorId !== userId && userRole !== 'admin') {
    throw new Error('Not authorized');
  }
  await Lesson.destroy({ where: { courseId } });
  await course.destroy();
  return true;
};

export const addLessonToCourse = async (courseId, lessonData, userId, userRole) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new Error('Course not found');
  if (course.instructorId !== userId && userRole !== 'admin') {
    throw new Error('Not authorized');
  }
  const lesson = await Lesson.create({ ...lessonData, courseId });
  return lesson;
};