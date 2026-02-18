import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/database.js';
import { config } from '../config.js';
import { authMiddleware } from '../middleware/auth.js';
import type { DbUser, AuthenticatedRequest } from '../types.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  if (username.length < 3 || password.length < 6) {
    res.status(400).json({ error: 'Username must be at least 3 characters, password at least 6' });
    return;
  }

  try {
    const existing = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }

    // First user becomes admin
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    const role = parseInt(userCount.rows[0].count) === 0 ? 'admin' : 'user';

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = await query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
      [username, passwordHash, role]
    );

    const userId = result.rows[0].id;

    // Create default settings for the user
    await query('INSERT INTO user_settings (user_id) VALUES ($1)', [userId]);

    const token = jwt.sign(
      { userId, username, role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({
      token,
      user: { id: userId, username, role },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  try {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0] as DbUser | undefined;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await query(
      'SELECT id, username, role, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );

    const user = result.rows[0];

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
