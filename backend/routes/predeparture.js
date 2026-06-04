const express = require('express');
const router = express.Router();
const { getPreDeparture, updatePreDeparture } = require('../controllers/predepartureController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', getPreDeparture);
router.put('/', updatePreDeparture);

module.exports = router;
