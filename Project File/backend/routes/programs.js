const express = require('express');
const router = express.Router();
const { getAllPrograms, getProgramsByUniversity, createProgram, updateProgram, deleteProgram } = require('../controllers/programController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

router.get('/', getAllPrograms);
// FIX: Added missing route for FR-06 (programs by university)
router.get('/university/:university_id', getProgramsByUniversity);
router.post('/', authenticateUser, requireAdmin, createProgram);
router.put('/:id', authenticateUser, requireAdmin, updateProgram);
router.delete('/:id', authenticateUser, requireAdmin, deleteProgram);

module.exports = router;
