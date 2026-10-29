// Reads settings from server/.env (see .env.example) with safe defaults for local development.
import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 5050,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_lost_found',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  dossEmail: process.env.DOSS_EMAIL || 'doss@college.edu',
  dossPassword: process.env.DOSS_PASSWORD || 'Doss@123',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@college.edu',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
  studentEmail: process.env.STUDENT_EMAIL || 'student@college.edu',
  studentPassword: process.env.STUDENT_PASSWORD || 'Student@123',
  isTest: process.env.NODE_ENV === 'test',
};
