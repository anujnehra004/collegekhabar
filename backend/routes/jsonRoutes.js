const express = require('express');
const router = express.Router();
const jsonController = require('../controllers/jsonController');

// Parameter 3: Local JSON Storage Endpoints (/api/local/*)
router.get('/events', jsonController.getEvents);
router.get('/events/:id', jsonController.getEventById);
router.post('/events', jsonController.createEvent);
router.put('/events/:id', jsonController.updateEvent);
router.delete('/events/:id', jsonController.deleteEvent);

router.get('/registrations', jsonController.getRegistrations);
router.post('/registrations', jsonController.createRegistration);

router.get('/clubs', jsonController.getClubs);
router.post('/clubs', jsonController.createClub);

router.post('/feedback', jsonController.createFeedback);
router.get('/feedback', jsonController.getFeedback);

module.exports = router;
