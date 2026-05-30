import { Enrollment, Course, Lesson, LessonProgress } from '../models/index.js';
import { Op } from 'sequelize';

export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Course, as: 'Course' },
        { model: Lesson, as: 'currentLesson' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id, {
      include: [
        { model: Course, as: 'Course' },
        { model: Lesson, as: 'currentLesson' }
      ]
    });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    if (enrollment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const existing = await Enrollment.findOne({ where: { userId: req.user.id, courseId } });
    if (existing) return res.status(400).json({ success: false, message: 'Already enrolled' });
    const firstLesson = await Lesson.findOne({ where: { courseId }, order: [['order', 'ASC']] });
    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId,
      currentLessonId: firstLesson ? firstLesson.id : null,
      progress: 0,
      completedLessons: []
    });
    course.enrolledStudents += 1;
    await course.save();
    res.status(201).json({ success: true, message: 'Enrolled successfully', enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const unenrollCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    if (enrollment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const course = await Course.findByPk(enrollment.courseId);
    if (course) {
      course.enrolledStudents = Math.max(0, course.enrolledStudents - 1);
      await course.save();
    }
    await enrollment.destroy();
    res.status(200).json({ success: true, message: 'Unenrolled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    if (enrollment.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    let completed = enrollment.completedLessons || [];
    if (completed.includes(lessonId)) return res.status(400).json({ success: false, message: 'Lesson already completed' });
    completed.push(lessonId);
    enrollment.completedLessons = completed;
    const course = await Course.findByPk(enrollment.courseId, { include: [{ model: Lesson, as: 'lessons' }] });
    const totalLessons = course.lessons?.length || 0;
    enrollment.progress = totalLessons > 0 ? Math.round((completed.length / totalLessons) * 100) : 0;
    const lessonsOrdered = course.lessons.sort((a, b) => a.order - b.order);
    const currentIndex = lessonsOrdered.findIndex(l => l.id === lessonId);
    if (currentIndex !== -1 && currentIndex < totalLessons - 1) {
      enrollment.currentLessonId = lessonsOrdered[currentIndex + 1].id;
    }
    if (enrollment.progress === 100) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
    }
    await enrollment.save();
    res.status(200).json({ success: true, message: 'Lesson completed', enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCurrentLesson = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    if (enrollment.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    enrollment.currentLessonId = lessonId;
    await enrollment.save();
    res.status(200).json({ success: true, message: 'Current lesson updated', enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackTimeSpent = async (req, res) => {
  try {
    const { lessonId, timeSpentSeconds, lastPosition } = req.body;
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    if (enrollment.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    let progress = await LessonProgress.findOne({ where: { userId: req.user.id, lessonId } });
    if (!progress) {
      progress = await LessonProgress.create({ userId: req.user.id, lessonId, timeSpentSeconds: timeSpentSeconds || 0, lastPosition: lastPosition || 0 });
    } else {
      progress.timeSpentSeconds += timeSpentSeconds || 0;
      if (lastPosition !== undefined) progress.lastPosition = lastPosition;
      await progress.save();
    }
    res.status(200).json({ success: true, message: 'Time tracked', progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};