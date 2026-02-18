import { Router } from 'express';
import { query } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';

const router = Router();
router.use(authMiddleware);

// GET /api/datasets - list all datasets (metadata only)
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const result = await query(
      'SELECT id, name, created_at FROM saved_datasets WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user!.userId]
    );
    res.json({ datasets: result.rows });
  } catch (err) {
    console.error('List datasets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/datasets - save a new named dataset
router.post('/', async (req: AuthenticatedRequest, res) => {
  const { name, employees, settings } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Dataset name is required' });
    return;
  }
  if (name.trim().length > 100) {
    res.status(400).json({ error: 'Dataset name must be 100 characters or less' });
    return;
  }
  if (!Array.isArray(employees) || employees.length === 0) {
    res.status(400).json({ error: 'Employees data is required' });
    return;
  }
  if (!settings) {
    res.status(400).json({ error: 'Settings data is required' });
    return;
  }

  try {
    const result = await query(
      'INSERT INTO saved_datasets (user_id, name, employees, settings) VALUES ($1, $2, $3, $4) RETURNING id, name, created_at',
      [req.user!.userId, name.trim(), JSON.stringify(employees), JSON.stringify(settings)]
    );
    res.status(201).json({ dataset: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'A dataset with that name already exists' });
      return;
    }
    console.error('Save dataset error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/datasets/:id - load a single dataset with full data
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM saved_datasets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    const row = result.rows[0];
    res.json({
      dataset: {
        id: row.id,
        name: row.name,
        employees: JSON.parse(row.employees),
        settings: JSON.parse(row.settings),
        created_at: row.created_at,
      },
    });
  } catch (err) {
    console.error('Load dataset error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/datasets/:id
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const result = await query(
      'DELETE FROM saved_datasets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Dataset not found' });
      return;
    }

    res.json({ message: 'Dataset deleted' });
  } catch (err) {
    console.error('Delete dataset error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
