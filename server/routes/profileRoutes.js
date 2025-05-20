const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

router.get('/profile', authenticateToken, (req, res) => {
  res.json({ email: req.user.email, role: req.user.role });
});

module.exports = router;
