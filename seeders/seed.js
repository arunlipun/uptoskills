import dotenv from 'dotenv';
import { sequelize } from '../config/database.js';
import { User, Course, Lesson, Enrollment, ApprovalRequest, Otp, LessonProgress } from '../models/index.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
  try {
    // Sync database (force true to drop and recreate tables - use with caution)
    await sequelize.sync({ force: true });
    console.log('✅ Database synced (tables dropped and recreated)');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@starmentor.com',
      password: 'Admin123',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff'
    });

    const instructor = await User.create({
      name: 'John Instructor',
      email: 'instructor@starmentor.com',
      password: 'Instructor123',
      role: 'instructor',
      avatar: 'https://ui-avatars.com/api/?name=John&background=10b981&color=fff'
    });

    const student = await User.create({
      name: 'Jane Student',
      email: 'student@starmentor.com',
      password: 'Student123',
      role: 'user',
      avatar: 'https://ui-avatars.com/api/?name=Jane&background=f59e0b&color=fff'
    });

    console.log('✅ Users created');

    // Create courses (initially not published)
    const course1 = await Course.create({
      title: 'Complete Web Development Bootcamp',
      description: 'Learn web development from scratch. HTML, CSS, JavaScript, React, Node.js.',
      category: 'Web Development',
      level: 'beginner',
      price: 99.99,
      instructorId: instructor.id,
      thumbnail: 'https://res.cloudinary.com/demo/image/upload/v1/samples/course-webdev',
      isPublished: true
    });

    const course2 = await Course.create({
      title: 'Advanced React Masterclass',
      description: 'Master React with hooks, context API, Redux Toolkit, and advanced patterns.',
      category: 'Web Development',
      level: 'advanced',
      price: 149.99,
      instructorId: instructor.id,
      thumbnail: 'https://res.cloudinary.com/demo/image/upload/v1/samples/course-react',
      isPublished: true
    });

    const course3 = await Course.create({
      title: 'Python for Data Science',
      description: 'Learn Python, pandas, numpy, matplotlib, and machine learning basics.',
      category: 'Data Science',
      level: 'intermediate',
      price: 129.99,
      instructorId: instructor.id,
      thumbnail: 'https://res.cloudinary.com/demo/image/upload/v1/samples/course-python',
      isPublished: true
    });

    console.log('✅ Courses created');

    // Create lessons for course1
    const lesson1 = await Lesson.create({
      title: 'HTML Fundamentals',
      description: 'Learn the basics of HTML5 and semantic markup.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 45,
      order: 1,
      courseId: course1.id,
      isFree: true
    });

    const lesson2 = await Lesson.create({
      title: 'CSS Styling',
      description: 'Master CSS selectors, box model, flexbox, and grid.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 60,
      order: 2,
      courseId: course1.id,
      isFree: false
    });

    const lesson3 = await Lesson.create({
      title: 'JavaScript Basics',
      description: 'Introduction to JavaScript: variables, functions, loops, and DOM manipulation.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 75,
      order: 3,
      courseId: course1.id,
      isFree: false
    });

    // Lessons for course2
    const lesson4 = await Lesson.create({
      title: 'React Fundamentals',
      description: 'Components, props, state, and lifecycle.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 90,
      order: 1,
      courseId: course2.id,
      isFree: true
    });

    const lesson5 = await Lesson.create({
      title: 'React Hooks Deep Dive',
      description: 'useState, useEffect, useContext, and custom hooks.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 120,
      order: 2,
      courseId: course2.id,
      isFree: false
    });

    // Lessons for course3
    const lesson6 = await Lesson.create({
      title: 'Python Basics',
      description: 'Variables, data types, loops, functions, and file handling.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 60,
      order: 1,
      courseId: course3.id,
      isFree: true
    });

    const lesson7 = await Lesson.create({
      title: 'Data Analysis with Pandas',
      description: 'DataFrames, series, data cleaning, and aggregation.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: 90,
      order: 2,
      courseId: course3.id,
      isFree: false
    });

    console.log('✅ Lessons created');

    // Create enrollment for student in course1
    const enrollment = await Enrollment.create({
      userId: student.id,
      courseId: course1.id,
      currentLessonId: lesson1.id,
      progress: 0,
      completedLessons: []
    });

    console.log('✅ Enrollment created');

    // Update enrolledStudents count for courses
    await course1.update({ enrolledStudents: 1 });
    await course2.update({ enrolledStudents: 0 });
    await course3.update({ enrolledStudents: 0 });

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 Admin:     admin@starmentor.com / Admin123');
    console.log('🔹 Instructor: instructor@starmentor.com / Instructor123');
    console.log('🔹 Student:    student@starmentor.com / Student123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📚 Courses seeded:');
    console.log(`  - ${course1.title} (${course1.level})`);
    console.log(`  - ${course2.title} (${course2.level})`);
    console.log(`  - ${course3.title} (${course3.level})`);
    console.log('\n🎬 Lessons seeded: 7 lessons total');
    console.log('\n✨ Database is ready for testing!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();