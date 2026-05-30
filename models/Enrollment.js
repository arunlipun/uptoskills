
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 100 }
  },
  completedLessons: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  currentLessonId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  certificate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['userId', 'courseId'] }]
});

export default Enrollment;