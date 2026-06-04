const express = require('express');
const router = express.Router();
const { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity } = require('../controllers/universityController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

router.get('/', getAllUniversities);
router.get('/:id', getUniversityById);
router.post('/', authenticateUser, requireAdmin, createUniversity);
router.put('/:id', authenticateUser, requireAdmin, updateUniversity);
router.delete('/:id', authenticateUser, requireAdmin, deleteUniversity);

module.exports = router;
