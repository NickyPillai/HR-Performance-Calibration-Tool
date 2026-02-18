import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { initializeDatabase } from './db/database.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import settingsRoutes from './routes/settings.js';
import adminRoutes from './routes/admin.js';
import datasetRoutes from './routes/datasets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/datasets', datasetRoutes);

// Only start the listener when running locally (not on Vercel)
if (!process.env.VERCEL) {
  // In production, serve the built frontend
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '..', 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  async function start() {
    await initializeDatabase();
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  }

  start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
