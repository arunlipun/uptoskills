# StarMentor Backend API

## 🚀 Overview

StarMentor is an e-learning platform backend built with **Node.js**, **Express**, **MySQL** (Sequelize ORM), **JWT authentication**, **OTP verification**, **Google OAuth**, and **Cloudinary** for media uploads.  
It supports role‑based access (admin, instructor, student), course management, enrollment with progress tracking, approval workflow, analytics, and reporting.

---

## ✨ Features

- **Authentication & Authorization**
  - Register / Login with email & password  
  - JWT token with expiry (7 days)  
  - Forgot / Reset password (email)  
  - OTP authentication (6‑digit, email)  
  - Google OAuth 2.0 (Passport.js)  
  - Role‑based access: `admin`, `instructor`, `user`

- **Course Management**
  - Create, read, update, delete courses  
  - Add / update / delete lessons (video, resources)  
  - Search courses by keyword, category, level (with pagination)

- **Enrollment & Progress**
  - Enroll / unenroll in courses  
  - Track lesson completion (auto‑advance)  
  - Progress percentage (0–100%)  
  - Time spent per lesson (for analytics)

- **Approval Workflow**
  - Courses created by instructors are **pending** until admin approval  
  - Admin can approve/reject with comment  
  - Approval history tracked

- **Analytics & Reports** (Admin only)
  - Dashboard statistics (users, courses, enrollments, revenue)  
  - User / course analytics  
  - Completion tracking  
  - Export report as CSV

- **Media Upload** (Cloudinary)
  - Videos, PDFs, thumbnails, user avatars  
  - File validation (size ≤ 100 MB, allowed types)

- **Security**
  - Password hashing (bcrypt)  
  - Input validation (`express-validator`)  
  - Rate limiting (auth: 5 attempts/15 min; API: 100 req/15 min)  
  - Helmet / CORS (configurable)

---

## 🛠️ Tech Stack

| Layer       | Technology                         |
|-------------|------------------------------------|
| Runtime     | Node.js (ES Modules)               |
| Framework   | Express 4                          |
| Database    | MySQL                              |
| ORM         | Sequelize 6                        |
| Auth        | JWT, bcryptjs, Passport (Google)   |
| Validation  | express-validator                  |
| Email       | Nodemailer (SMTP / Ethereal)       |
| File Upload | Multer + Cloudinary                |
| Logging     | Console (ready for Winston)        |
| Testing     | Postman / Thunder Client           |

---

## 📦 Installation

### Prerequisites

- Node.js ≥ 18  
- MySQL (≥ 5.7)  
- (Optional) Cloudinary account  
- (Optional) Gmail / SMTP for real emails

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/starmentor-backend.git
   cd starmentor-backend