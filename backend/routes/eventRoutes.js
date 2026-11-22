const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Parameter 4: MongoDB Events CRUD (/api/events)
router.post('/', eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', eventController.updateEvent);
router.patch('/:id', eventController.patchEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
