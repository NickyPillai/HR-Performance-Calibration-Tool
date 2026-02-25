import { Router } from 'express';
import { query, getClient } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest, DbEmployee } from '../types.js';

const router = Router();
router.use(authMiddleware);

// GET /api/employees
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM employees WHERE user_id = $1 ORDER BY id',
      [req.user!.userId]
    );

    res.json({
      employees: result.rows.map(mapDbEmployee),
    });
  } catch (err) {
    console.error('Get employees error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/employees/bulk
router.post('/bulk', async (req: AuthenticatedRequest, res) => {
  const { employees } = req.body;

  if (!Array.isArray(employees)) {
    res.status(400).json({ error: 'employees must be an array' });
    return;
  }

  const client = await getClient();
  const userId = req.user!.userId;

  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM employees WHERE user_id = $1', [userId]);

    // Batch insert for performance (avoid N individual queries over network)
    const BATCH_SIZE = 50;
    for (let i = 0; i < employees.length; i += BATCH_SIZE) {
      const batch = employees.slice(i, i + BATCH_SIZE);
      const values: unknown[] = [];
      const placeholders: string[] = [];
      batch.forEach((emp, idx) => {
        const offset = idx * 7;
        placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`);
        values.push(userId, emp.employeeId, emp.name, emp.department, emp.manager, emp.rating, emp.isFrozen ? 1 : 0);
      });
      await client.query(
        `INSERT INTO employees (user_id, employee_id, name, department, manager, rating, is_frozen) VALUES ${placeholders.join(', ')}`,
        values
      );
    }

    await client.query('COMMIT');

    const result = await query(
      'SELECT * FROM employees WHERE user_id = $1 ORDER BY id',
      [userId]
    );

    res.json({ employees: result.rows.map(mapDbEmployee) });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Bulk upload error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const check = await query(
      'SELECT * FROM employees WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );

    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    const updates = req.body;
    const fields: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (updates.employeeId !== undefined) { fields.push(`employee_id = $${paramIndex++}`); values.push(updates.employeeId); }
    if (updates.name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(updates.name); }
    if (updates.department !== undefined) { fields.push(`department = $${paramIndex++}`); values.push(updates.department); }
    if (updates.manager !== undefined) { fields.push(`manager = $${paramIndex++}`); values.push(updates.manager); }
    if (updates.rating !== undefined) { fields.push(`rating = $${paramIndex++}`); values.push(updates.rating); }
    if (updates.isFrozen !== undefined) { fields.push(`is_frozen = $${paramIndex++}`); values.push(updates.isFrozen ? 1 : 0); }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No updates provided' });
      return;
    }

    values.push(Number(req.params.id), req.user!.userId);
    const result = await query(
      `UPDATE employees SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
      values
    );

    res.json({ employee: mapDbEmployee(result.rows[0]) });
  } catch (err) {
    console.error('Update employee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/employees/:id/freeze
router.patch('/:id/freeze', async (req: AuthenticatedRequest, res) => {
  try {
    const check = await query(
      'SELECT * FROM employees WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );

    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    const currentFrozen = check.rows[0].is_frozen;
    const result = await query(
      'UPDATE employees SET is_frozen = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [currentFrozen ? 0 : 1, Number(req.params.id), req.user!.userId]
    );

    res.json({ employee: mapDbEmployee(result.rows[0]) });
  } catch (err) {
    console.error('Freeze employee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/employees - add a single employee
router.post('/', async (req: AuthenticatedRequest, res) => {
  const { employeeId, name, department, manager, rating } = req.body;
  const userId = req.user!.userId;

  try {
    const result = await query(
      'INSERT INTO employees (user_id, employee_id, name, department, manager, rating, is_frozen) VALUES ($1, $2, $3, $4, $5, $6, 0) RETURNING *',
      [userId, employeeId || '', name || '', department || '', manager || '', rating || 3]
    );
    res.status(201).json({ employee: mapDbEmployee(result.rows[0]) });
  } catch (err) {
    console.error('Add employee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/employees/:id - delete a single employee
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const result = await query(
      'DELETE FROM employees WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/employees
router.delete('/', async (req: AuthenticatedRequest, res) => {
  try {
    await query('DELETE FROM employees WHERE user_id = $1', [req.user!.userId]);
    res.json({ message: 'All employees deleted' });
  } catch (err) {
    console.error('Delete employees error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function mapDbEmployee(row: DbEmployee) {
  return {
    id: String(row.id),
    employeeId: row.employee_id,
    name: row.name,
    department: row.department,
    manager: row.manager,
    rating: row.rating,
    isFrozen: row.is_frozen === 1,
  };
}

export default router;
