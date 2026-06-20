const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // ─── Workspaces ────────────────────────────────────────────────────────────

  router.get('/workspaces', async (req, res) => {
    try {
      const rows = await db.query(
        'SELECT * FROM workspaces WHERE user_id = ? ORDER BY is_default DESC, created_at ASC',
        [req.user.id]
      );
      res.json({ workspaces: rows });
    } catch (err) {
      console.error('List workspaces error:', err);
      res.status(500).json({ message: 'Failed to fetch workspaces' });
    }
  });

  router.post('/workspaces', async (req, res) => {
    const { name, institution_name, type, logo_url } = req.body;
    if (!name) return res.status(400).json({ message: 'Workspace name is required' });

    try {
      const existing = await db.query(
        'SELECT COUNT(*) as count FROM workspaces WHERE user_id = ?',
        [req.user.id]
      );
      const isDefault = existing[0].count === 0 ? 1 : 0;

      await db.query(
        'INSERT INTO workspaces (user_id, name, institution_name, type, logo_url, is_default) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, name, institution_name || null, type || 'university', logo_url || null, isDefault]
      );

      const created = await db.query(
        'SELECT * FROM workspaces WHERE user_id = ? ORDER BY id DESC LIMIT 1',
        [req.user.id]
      );
      res.status(201).json({ workspace: created[0] });
    } catch (err) {
      console.error('Create workspace error:', err);
      res.status(500).json({ message: 'Failed to create workspace' });
    }
  });

  router.put('/workspaces/:id', async (req, res) => {
    const { name, institution_name, type, logo_url } = req.body;
    if (!name) return res.status(400).json({ message: 'Workspace name is required' });

    try {
      await db.query(
        'UPDATE workspaces SET name = ?, institution_name = ?, type = ?, logo_url = ? WHERE id = ? AND user_id = ?',
        [name, institution_name || null, type || 'university', logo_url || null, req.params.id, req.user.id]
      );
      res.json({ message: 'Workspace updated' });
    } catch (err) {
      console.error('Update workspace error:', err);
      res.status(500).json({ message: 'Failed to update workspace' });
    }
  });

  router.delete('/workspaces/:id', async (req, res) => {
    try {
      await db.query(
        'DELETE FROM workspaces WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
      res.json({ message: 'Workspace deleted' });
    } catch (err) {
      console.error('Delete workspace error:', err);
      res.status(500).json({ message: 'Failed to delete workspace' });
    }
  });

  router.put('/workspaces/:id/set-default', async (req, res) => {
    try {
      await db.query('UPDATE workspaces SET is_default = 0 WHERE user_id = ?', [req.user.id]);
      await db.query(
        'UPDATE workspaces SET is_default = 1 WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
      res.json({ message: 'Default workspace updated' });
    } catch (err) {
      console.error('Set default error:', err);
      res.status(500).json({ message: 'Failed to set default workspace' });
    }
  });

  // ─── Exam Patterns ─────────────────────────────────────────────────────────

  const verifyWorkspaceOwner = async (workspaceId, userId) => {
    const rows = await db.query(
      'SELECT id FROM workspaces WHERE id = ? AND user_id = ?',
      [workspaceId, userId]
    );
    return rows.length > 0;
  };

  router.get('/workspaces/:id/patterns', async (req, res) => {
    try {
      const owned = await verifyWorkspaceOwner(req.params.id, req.user.id);
      if (!owned) return res.status(404).json({ message: 'Workspace not found' });

      const rows = await db.query(
        'SELECT * FROM exam_patterns WHERE workspace_id = ? ORDER BY created_at ASC',
        [req.params.id]
      );
      const patterns = rows.map(r => ({ ...r, config: JSON.parse(r.config) }));
      res.json({ patterns });
    } catch (err) {
      console.error('List patterns error:', err);
      res.status(500).json({ message: 'Failed to fetch patterns' });
    }
  });

  router.post('/workspaces/:id/patterns', async (req, res) => {
    const { name, config } = req.body;
    if (!name || !config) return res.status(400).json({ message: 'Name and config are required' });

    try {
      const owned = await verifyWorkspaceOwner(req.params.id, req.user.id);
      if (!owned) return res.status(404).json({ message: 'Workspace not found' });

      await db.query(
        'INSERT INTO exam_patterns (workspace_id, name, config) VALUES (?, ?, ?)',
        [req.params.id, name, JSON.stringify(config)]
      );

      const created = await db.query(
        'SELECT * FROM exam_patterns WHERE workspace_id = ? ORDER BY id DESC LIMIT 1',
        [req.params.id]
      );
      res.status(201).json({ pattern: { ...created[0], config: JSON.parse(created[0].config) } });
    } catch (err) {
      console.error('Create pattern error:', err);
      res.status(500).json({ message: 'Failed to create pattern' });
    }
  });

  router.put('/workspaces/:id/patterns/:patternId', async (req, res) => {
    const { name, config } = req.body;
    if (!name || !config) return res.status(400).json({ message: 'Name and config are required' });

    try {
      await db.query(
        'UPDATE exam_patterns SET name = ?, config = ? WHERE id = ? AND workspace_id = ?',
        [name, JSON.stringify(config), req.params.patternId, req.params.id]
      );
      res.json({ message: 'Pattern updated' });
    } catch (err) {
      console.error('Update pattern error:', err);
      res.status(500).json({ message: 'Failed to update pattern' });
    }
  });

  router.delete('/workspaces/:id/patterns/:patternId', async (req, res) => {
    try {
      await db.query(
        'DELETE FROM exam_patterns WHERE id = ? AND workspace_id = ?',
        [req.params.patternId, req.params.id]
      );
      res.json({ message: 'Pattern deleted' });
    } catch (err) {
      console.error('Delete pattern error:', err);
      res.status(500).json({ message: 'Failed to delete pattern' });
    }
  });

  return router;
};
