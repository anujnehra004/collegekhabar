const Event = require('../models/Event');
const { isMongoConnected } = require('../config/db');
const jsonStorage = require('../services/jsonStorageService');

// CREATE: POST /api/events
async function createEvent(req, res, next) {
  try {
    const { title, description, category, date, time, venue, club, totalSeats, fee, bannerUrl, tags } = req.body;

    if (!title || !description || !venue) {
      return res.status(400).json({ success: false, error: 'Title, description, and venue are required.' });
    }

    if (isMongoConnected()) {
      const event = await Event.create({
        title,
        description,
        category: category || 'General',
        date: date || new Date().toISOString().split('T')[0],
        time: time || '10:00 AM',
        venue,
        club: club || 'Campus Club',
        totalSeats: Number(totalSeats) || 100,
        registeredSeats: 0,
        fee: Number(fee) || 0,
        bannerUrl: bannerUrl || '/assets/images/event-placeholder.jpg',
        tags: Array.isArray(tags) ? tags : (tags ? [tags] : ['Campus'])
      });

      // Synchronize with local JSON fallback store
      if (process.env.ENABLE_JSON_FALLBACK === 'true') {
        try {
          await jsonStorage.create('events', event.toObject());
        } catch {}
      }

      return res.status(201).json({
        success: true,
        message: 'Event successfully created in MongoDB',
        storage: 'MongoDB (Mongoose ODM)',
        data: event
      });
    }

    // Resilient Fallback to JSON
    const fallbackEvent = await jsonStorage.create('events', req.body);
    return res.status(201).json({
      success: true,
      message: 'Event created in Local JSON store (MongoDB offline)',
      storage: 'Local JSON Storage (Fallback)',
      data: fallbackEvent
    });
  } catch (error) {
    next(error);
  }
}

// READ ALL: GET /api/events
async function getAllEvents(req, res, next) {
  try {
    const { category, search, sort } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (category && category !== 'all') {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { venue: { $regex: search, $options: 'i' } }
        ];
      }

      let eventsQuery = Event.find(query);
      if (sort === 'date') eventsQuery = eventsQuery.sort({ date: 1 });
      else if (sort === 'seats') eventsQuery = eventsQuery.sort({ totalSeats: -1 });
      else eventsQuery = eventsQuery.sort({ createdAt: -1 });

      const events = await eventsQuery.exec();
      return res.status(200).json({
        success: true,
        storage: 'MongoDB (Live)',
        count: events.length,
        data: events
      });
    }

    // Resilient Fallback to JSON
    let events = await jsonStorage.read('events');
    if (category && category !== 'all') {
      events = events.filter(e => e.category && e.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const term = search.toLowerCase();
      events = events.filter(e =>
        (e.title && e.title.toLowerCase().includes(term)) ||
        (e.description && e.description.toLowerCase().includes(term)) ||
        (e.venue && e.venue.toLowerCase().includes(term))
      );
    }
    return res.status(200).json({
      success: true,
      storage: 'Local JSON Storage (Fallback)',
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
}

// READ ONE: GET /api/events/:id
async function getEventById(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let event = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        event = await Event.findById(id);
      }
      if (!event) {
        event = await Event.findOne({ slug: id.toLowerCase() });
      }

      if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found in MongoDB' });
      }

      return res.status(200).json({
        success: true,
        storage: 'MongoDB',
        data: event
      });
    }

    // Fallback
    const event = await jsonStorage.findById('events', id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    return res.status(200).json({
      success: true,
      storage: 'Local JSON Storage (Fallback)',
      data: event
    });
  } catch (error) {
    next(error);
  }
}

// UPDATE: PUT /api/events/:id
async function updateEvent(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let event = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        event = await Event.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      }
      if (!event) {
        event = await Event.findOneAndUpdate({ slug: id.toLowerCase() }, req.body, { new: true, runValidators: true });
      }

      if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found to update' });
      }

      return res.status(200).json({
        success: true,
        message: 'Event updated successfully in MongoDB',
        storage: 'MongoDB',
        data: event
      });
    }

    // Fallback
    const updated = await jsonStorage.update('events', id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Event updated in Local JSON storage',
      storage: 'Local JSON Storage (Fallback)',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// PATCH: PATCH /api/events/:id
async function patchEvent(req, res, next) {
  return updateEvent(req, res, next);
}

// DELETE: DELETE /api/events/:id
async function deleteEvent(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let deleted = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        deleted = await Event.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await Event.findOneAndDelete({ slug: id.toLowerCase() });
      }

      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Event not found to delete' });
      }

      return res.status(200).json({
        success: true,
        message: 'Event deleted from MongoDB',
        storage: 'MongoDB',
        data: deleted
      });
    }

    // Fallback
    const deleted = await jsonStorage.remove('events', id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Event not found to delete' });
    }
    return res.status(200).json({
      success: true,
      message: 'Event deleted from Local JSON storage',
      storage: 'Local JSON Storage (Fallback)',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  patchEvent,
  deleteEvent
};
