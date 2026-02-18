import { Router } from 'express';
import { query } from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest, DbUserSettings } from '../types.js';

const router = Router();
router.use(authMiddleware);

// GET /api/settings
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [req.user!.userId]
    );

    const settings = result.rows[0] as DbUserSettings | undefined;

    if (!settings) {
      res.status(404).json({ error: 'Settings not found' });
      return;
    }

    res.json({
      targetPercentages: JSON.parse(settings.target_percentages),
      deviationThreshold: settings.deviation_threshold,
      theme: settings.theme,
    });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/settings
router.put('/', async (req: AuthenticatedRequest, res) => {
  const { targetPercentages, deviationThreshold, theme } = req.body;

  try {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (targetPercentages !== undefined) {
      fields.push(`target_percentages = $${paramIndex++}`);
      values.push(JSON.stringify(targetPercentages));
    }
    if (deviationThreshold !== undefined) {
      fields.push(`deviation_threshold = $${paramIndex++}`);
      values.push(deviationThreshold);
    }
    if (theme !== undefined) {
      fields.push(`theme = $${paramIndex++}`);
      values.push(theme);
    }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No updates provided' });
      return;
    }

    values.push(req.user!.userId);
    const result = await query(
      `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
      values
    );

    const updated = result.rows[0] as DbUserSettings;

    res.json({
      targetPercentages: JSON.parse(updated.target_percentages),
      deviationThreshold: updated.deviation_threshold,
      theme: updated.theme,
    });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
