const express = require('express');
const router = express.Router();
const { getResources, createResource, updateResource, deleteResource } = require('../controllers/resourceController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// Anyone authenticated can read resources
router.get('/', authenticateUser, getResources);

// Admin-only mutations
router.post('/', authenticateUser, requireAdmin, createResource);
router.put('/:id', authenticateUser, requireAdmin, updateResource);
router.delete('/:id', authenticateUser, requireAdmin, deleteResource);

module.exports = router;
