const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const ALLOWED_STATUSES = ['To Do', 'Done'];
const PAGE_SIZE = 20;

router.get('/api/tasks', authenticate, async (req, res) => {
  const { projectId } = req.query;
  const page = Number(req.query.page || 1);
  if (!Number.isInteger(page) || page < 1) {
    return res.status(400).json({ message: 'Invalid page' });
  }
  const offset = (page - 1) * PAGE_SIZE;

  try {
    const conditions = [];
    const params = [];

    if (projectId) {
      params.push(projectId);
      conditions.push(`project_id = $${params.length}`);
    }

    if (req.user.role !== 'admin') {
      params.push(req.user.id);
      conditions.push(`assigned_to = $${params.length}`);
    }

    let sql = 'SELECT * FROM tasks';
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ` ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`;

    const result = await db.query(sql, params);
    return res.status(200).json({ tasks: result.rows, page });
  } catch (err) {
    console.error('GET /api/tasks failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/api/tasks/:id/status', authenticate, async (req, res) => {
  const taskId = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(taskId)) {
    return res.status(400).json({ message: 'Invalid task id' });
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = rows[0];
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = Number(task.assigned_to) === Number(req.user.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'No permission to edit this task' });
    }

    if (!isAdmin && !(task.status === 'To Do' && status === 'Done')) {
      return res.status(409).json({ message: 'Employee can only change To Do to Done' });
    }

    await db.query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, taskId]
    );

    await db.query(
      'INSERT INTO audit_log (task_id, user_id, action) VALUES ($1, $2, $3)',
      [taskId, req.user.id, `status:${status}`]
    );

    return res.status(200).json({ task: { ...task, status } });
  } catch (err) {
    console.error('PATCH /api/tasks/:id/status failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/api/tasks/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  try {
    await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    return res.status(204).end();
  } catch (err) {
    console.error('DELETE /api/tasks/:id failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
