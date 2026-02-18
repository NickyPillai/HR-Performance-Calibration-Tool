import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';

const router = Router();
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/users
router.get('/users', async (_req: AuthenticatedRequest, res) => {
  try {
    const result = await query(
      'SELECT id, username, role, created_at FROM users ORDER BY id'
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/users
router.post('/users', async (req: AuthenticatedRequest, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  if (username.length < 3 || password.length < 6) {
    res.status(400).json({ error: 'Username must be at least 3 characters, password at least 6' });
    return;
  }

  if (role && !['admin', 'user'].includes(role)) {
    res.status(400).json({ error: 'Role must be admin or user' });
    return;
  }

  try {
    const existing = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userRole = role || 'user';

    const result = await query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
      [username, passwordHash, userRole]
    );

    const userId = result.rows[0].id;

    // Create default settings
    await query('INSERT INTO user_settings (user_id) VALUES ($1)', [userId]);

    res.status(201).json({
      user: { id: userId, username, role: userRole },
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: AuthenticatedRequest, res) => {
  const userId = parseInt(req.params.id as string, 10);

  if (userId === req.user!.userId) {
    res.status(400).json({ error: 'Cannot delete your own account' });
    return;
  }

  try {
    const result = await query('SELECT id FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
