const express = require('express');
const router = express.Router();
const externalController = require('../controllers/externalController');

// Parameter 1: External APIs
router.get('/weather', externalController.getWeather);
router.get('/quote', externalController.getQuote);
router.get('/holidays', externalController.getHolidays);
router.get('/feed', externalController.getFeed);

module.exports = router;
