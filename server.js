import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize } from './config/database.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './config/rateLimit.js';

// Load env vars
dotenv.config();

// Connect to MySQL
try {
  await sequelize.authenticate();
  console.log('✅ MySQL connected successfully');
  await sequelize.sync({ alter: true });
  console.log('✅ Database tables synced');
} catch (error) {
  console.error('❌ Unable to connect to MySQL:', error);
  process.exit(1);
}

const app = express();

// Rate limiting
app.use('/api', generalLimiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Route files
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});