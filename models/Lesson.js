
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resources: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

export default Lesson;