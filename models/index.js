import User from './User.js';
import Course from './Course.js';
import Lesson from './Lesson.js';
import Enrollment from './Enrollment.js';
import ApprovalRequest from './ApprovalRequest.js';
import Otp from './Otp.js';
import LessonProgress from './LessonProgress.js';

// User ↔ Course (instructor)
User.hasMany(Course, { foreignKey: 'instructorId', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

// Course ↔ Lesson
Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons' });
Lesson.belongsTo(Course, { foreignKey: 'courseId' });

// User ↔ Enrollment
User.hasMany(Enrollment, { foreignKey: 'userId' });
Enrollment.belongsTo(User, { foreignKey: 'userId' });

// Course ↔ Enrollment
Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

// Enrollment ↔ Lesson (current lesson only, not the completed list)
Enrollment.belongsTo(Lesson, { foreignKey: 'currentLessonId', as: 'currentLesson' });

// ApprovalRequest associations
User.hasMany(ApprovalRequest, { foreignKey: 'requesterId' });
ApprovalRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
User.hasMany(ApprovalRequest, { foreignKey: 'reviewedBy' });
ApprovalRequest.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// LessonProgress
User.hasMany(LessonProgress, { foreignKey: 'userId' });
Lesson.hasMany(LessonProgress, { foreignKey: 'lessonId' });

export { User, Course, Lesson, Enrollment, ApprovalRequest, Otp, LessonProgress };