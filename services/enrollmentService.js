import { Enrollment, Course, Lesson } from '../models/index.js';

export const getEnrollmentsByUser = async (userId) => {
  return await Enrollment.findAll({
    where: { userId },
    include: [
      { model: Course, as: 'Course' },
      { model: Lesson, as: 'currentLesson' }
    ],
    order: [['createdAt', 'DESC']]
  });
};

export const enrollInCourse = async (userId, courseId) => {
  const course = await Course.findByPk(courseId);
  if (!course) throw new Error('Course not found');
  
  const existing = await Enrollment.findOne({ where: { userId, courseId } });
  if (existing) throw new Error('Already enrolled');
  
  const firstLesson = await Lesson.findOne({
    where: { courseId },
    order: [['order', 'ASC']]
  });
  
  const enrollment = await Enrollment.create({
    userId,
    courseId,
    currentLessonId: firstLesson ? firstLesson.id : null,
    progress: 0,
    completedLessons: []
  });
  
  course.enrolledStudents += 1;
  await course.save();
  return enrollment;
};

export const completeLesson = async (enrollmentId, userId, lessonId) => {
  const enrollment = await Enrollment.findByPk(enrollmentId);
  if (!enrollment) throw new Error('Enrollment not found');
  if (enrollment.userId !== userId) throw new Error('Not authorized');
  
  let completed = enrollment.completedLessons || [];
  if (completed.includes(lessonId)) throw new Error('Lesson already completed');
  
  completed.push(lessonId);
  enrollment.completedLessons = completed;
  
  const course = await Course.findByPk(enrollment.courseId, {
    include: [{ model: Lesson, as: 'lessons' }]
  });
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
  return enrollment;
};