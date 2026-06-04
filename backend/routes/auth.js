const express = require('express');
const router = express.Router();
const { register, login, logout, requestPasswordReset, resetPassword } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateUser, logout);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;
