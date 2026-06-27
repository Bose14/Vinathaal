const express = require('express');

module.exports = function papersRoute(db) {
  const router = express.Router();

  // Full history (no LIMIT 3 cap) — protected
  router.post('/get-all-papers-history', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
      const result = await db.query(
        `SELECT qp.id, qp.qp_s3_url AS objectUrl, DATE(qp.created_at) AS created_at, qp.subjectName
         FROM question_papers qp
         JOIN users u ON u.id = qp.user_id
         WHERE u.email = ?
         ORDER BY qp.created_at DESC`,
        [email]
      );
      res.json({ email, data: result });
    } catch (err) {
      console.error('Error fetching full history:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Delete paper by id — protected (uses req.user.id set by middleware)
  router.delete('/papers/:id', async (req, res) => {
    const paperId = parseInt(req.params.id, 10);
    const userId  = req.user?.id;

    if (!paperId || !userId) return res.status(400).json({ message: 'Invalid request' });

    try {
      const rows = await db.query(
        'SELECT id FROM question_papers WHERE id = ? AND user_id = ?',
        [paperId, userId]
      );
      if (!rows.length) return res.status(404).json({ message: 'Paper not found or access denied' });

      await db.query('DELETE FROM question_papers WHERE id = ?', [paperId]);
      res.json({ message: 'Paper deleted' });
    } catch (err) {
      console.error('Error deleting paper:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};
