const express = require('express');
const router = express.Router();
const { getGuidelines, updateGuidelines } = require('../controllers/guidelineController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

router.get('/:country_id', authenticateUser, getGuidelines);
router.post('/:country_id', authenticateUser, requireAdmin, updateGuidelines);

module.exports = router;
