import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'hr-calibration-dev-secret-change-in-production',
  jwtExpiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/hr_calibration',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
