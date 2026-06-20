const express = require('express');

module.exports = (db, config) => {
  const router = express.Router();

  router.get('/stats', async (req, res) => {
    try {
      const userRows = await db.query('SELECT COUNT(*) as count FROM users');
      const paperRows = await db.query('SELECT COUNT(*) as count FROM question_papers');

      res.json({
        totalPapers: paperRows[0]?.count || 0,
        activeUsers: userRows[0]?.count || 0,
        avgTime: 3,
        satisfaction: 98,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  return router;
};
