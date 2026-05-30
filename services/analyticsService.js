import { User, Course, Enrollment } from '../models/index.js';
import { sequelize } from '../config/database.js';

export const getDashboardStats = async () => {
  const totalUsers = await User.count();
  const totalCourses = await Course.count();
  const totalEnrollments = await Enrollment.count();
  const completedCourses = await Enrollment.count({ where: { isCompleted: true } });
  const publishedCourses = await Course.count({ where: { isPublished: true } });
  
  const [revenueResult] = await sequelize.query(`
    SELECT SUM(c.price) as total 
    FROM Enrollments e 
    JOIN Courses c ON e.courseId = c.id 
    WHERE e.isCompleted = true
  `);
  
  return {
    totalUsers,
    totalCourses,
    totalEnrollments,
    completedCourses,
    publishedCourses,
    totalRevenue: revenueResult[0]?.total || 0
  };
};

export const getCourseCompletionRates = async () => {
  const [completionRates] = await sequelize.query(`
    SELECT c.id, c.title, 
      COUNT(e.id) as enrollments,
      SUM(CASE WHEN e.isCompleted THEN 1 ELSE 0 END) as completed,
      ROUND(SUM(CASE WHEN e.isCompleted THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(e.id), 0), 2) as completionRate
    FROM Courses c 
    LEFT JOIN Enrollments e ON c.id = e.courseId
    GROUP BY c.id
    ORDER BY completionRate DESC
  `);
  return completionRates;
};