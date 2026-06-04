const express = require('express');
const router = express.Router();
const { reviewSop } = require('../controllers/sopReviewController');
const { authenticateUser } = require('../middleware/auth');

router.post('/', authenticateUser, reviewSop);

module.exports = router;
