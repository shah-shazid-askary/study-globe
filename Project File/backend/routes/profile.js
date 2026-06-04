const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getRecommendations } = require('../controllers/profileController');
const { authenticateUser } = require('../middleware/auth');

router.get('/', authenticateUser, getProfile);
router.get('/recommendations', authenticateUser, getRecommendations);
router.put('/', authenticateUser, updateProfile);

module.exports = router;
