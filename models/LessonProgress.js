
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const LessonProgress = sequelize.define('LessonProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  lessonId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  timeSpentSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastPosition: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['userId', 'lessonId'] }]
});

export default LessonProgress;