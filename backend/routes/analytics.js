const express = require('express');
const router = express.Router();
const { getSystemMetrics } = require('../controllers/analyticsController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

router.get('/metrics', authenticateUser, requireAdmin, getSystemMetrics);

module.exports = router;
