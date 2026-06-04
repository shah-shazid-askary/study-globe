const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole } = require('../controllers/userController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateUser, requireAdmin, getAllUsers);
router.put('/:id/role', authenticateUser, requireAdmin, updateUserRole);

module.exports = router;
