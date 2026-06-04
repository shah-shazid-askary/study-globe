const express = require('express');
const router = express.Router();
const { getAllCountries, getCountryById, createCountry, updateCountry, deleteCountry } = require('../controllers/countryController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

router.get('/', getAllCountries);
router.get('/:id', getCountryById);
router.post('/', authenticateUser, requireAdmin, createCountry);
router.put('/:id', authenticateUser, requireAdmin, updateCountry);
router.delete('/:id', authenticateUser, requireAdmin, deleteCountry);

module.exports = router;
