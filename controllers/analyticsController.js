import { User, Course, Enrollment } from '../models/index.js';
import { sequelize } from '../config/database.js';
import { Parser } from 'json2csv';

export const getDashboardStats = async (req, res) => {
  try {
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
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        completedCourses,
        publishedCourses,
        totalRevenue: revenueResult[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserAnalytics = async (req, res) => {
  try {
    const usersByRole = await User.findAll({
      attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['role']
    });
    const recentUsers = await User.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] }
    });
    res.status(200).json({ success: true, usersByRole, recentUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseAnalytics = async (req, res) => {
  try {
    const popularCourses = await Course.findAll({
      order: [['enrolledStudents', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'enrolledStudents', 'rating']
    });
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
    res.status(200).json({ success: true, popularCourses, completionRates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompletionTracking = async (req, res) => {
  try {
    const { userId, courseId } = req.query;
    let where = {};
    if (userId) where.userId = userId;
    if (courseId) where.courseId = courseId;
    const completions = await Enrollment.findAll({
      where,
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Course, attributes: ['id', 'title'] }
      ]
    });
    res.status(200).json({ success: true, completions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportReport = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Course, attributes: ['title'] }
      ],
      raw: true
    });
    const flattened = enrollments.map(e => ({
      id: e.id,
      progress: e.progress,
      isCompleted: e.isCompleted,
      enrolledAt: e.createdAt,
      userName: e['User.name'],
      userEmail: e['User.email'],
      courseTitle: e['Course.title']
    }));
    const parser = new Parser({ fields: ['id', 'progress', 'isCompleted', 'enrolledAt', 'userName', 'userEmail', 'courseTitle'] });
    const csv = parser.parse(flattened);
    res.header('Content-Type', 'text/csv');
    res.attachment('enrollment_report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};