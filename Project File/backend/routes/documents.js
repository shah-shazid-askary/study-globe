const express = require('express');
const router = express.Router();
const { getDocuments, submitDocument, verifyDocument } = require('../controllers/documentController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', getDocuments);
router.post('/', submitDocument);
router.put('/:id/verify', requireAdmin, verifyDocument);

module.exports = router;
