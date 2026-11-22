const jsonStorage = require('../services/jsonStorageService');

// ----------------- EVENTS (JSON) -----------------
async function getEvents(req, res, next) {
  try {
    let events = await jsonStorage.read('events');
    const { category, search } = req.query;

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

    res.status(200).json({
      success: true,
      storage: 'Local JSON File (events.json)',
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
}

async function getEventById(req, res, next) {
  try {
    const event = await jsonStorage.findById('events', req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found in local JSON storage' });
    }
    res.status(200).json({ success: true, storage: 'Local JSON File', data: event });
  } catch (error) {
    next(error);
  }
}

async function createEvent(req, res, next) {
  try {
    const { title, description, category, date, venue, totalSeats } = req.body;
    if (!title || !description || !venue) {
      return res.status(400).json({ success: false, error: 'Title, description, and venue are required.' });
    }

    const newEvent = await jsonStorage.create('events', {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description,
      category: category || 'General',
      date: date || new Date().toISOString().split('T')[0],
      time: req.body.time || '10:00 AM',
      venue,
      club: req.body.club || 'Campus Club',
      totalSeats: Number(totalSeats) || 100,
      registeredSeats: 0,
      fee: Number(req.body.fee) || 0,
      bannerUrl: req.body.bannerUrl || '/assets/images/event-placeholder.jpg',
      tags: req.body.tags || ['Campus'],
      status: 'Upcoming'
    });

    res.status(201).json({
      success: true,
      message: 'Event successfully created in Local JSON storage',
      data: newEvent
    });
  } catch (error) {
    next(error);
  }
}

async function updateEvent(req, res, next) {
  try {
    const updated = await jsonStorage.update('events', req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Event not found in local JSON storage' });
    }
    res.status(200).json({
      success: true,
      message: 'Event updated in Local JSON storage',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const deleted = await jsonStorage.remove('events', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Event not found in local JSON storage' });
    }
    res.status(200).json({
      success: true,
      message: 'Event deleted from Local JSON storage',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
}

// ----------------- REGISTRATIONS (JSON) -----------------
async function getRegistrations(req, res, next) {
  try {
    let registrations = await jsonStorage.read('registrations');
    const { email, eventTitle, rollNumber } = req.query;

    if (email) {
      registrations = registrations.filter(r => r.email && r.email.toLowerCase() === email.toLowerCase());
    }
    if (eventTitle) {
      registrations = registrations.filter(r => r.eventTitle && r.eventTitle.toLowerCase().includes(eventTitle.toLowerCase()));
    }
    if (rollNumber) {
      registrations = registrations.filter(r => r.rollNumber && r.rollNumber.toLowerCase() === rollNumber.toLowerCase());
    }

    res.status(200).json({
      success: true,
      storage: 'Local JSON File (registrations.json)',
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    next(error);
  }
}

async function createRegistration(req, res, next) {
  try {
    const { eventTitle, fullName, rollNumber, email } = req.body;
    if (!eventTitle || !fullName || !rollNumber || !email) {
      return res.status(400).json({
        success: false,
        error: 'Event title, full name, roll number, and student email are required.'
      });
    }

    // Generate custom Registration Pass ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regId = `CC-2026-${randomSuffix}`;

    const newRegistration = await jsonStorage.create('registrations', {
      registrationId: regId,
      eventTitle,
      eventId: req.body.eventId || null,
      fullName,
      rollNumber: rollNumber.toUpperCase(),
      email: email.toLowerCase(),
      phone: req.body.phone || '',
      department: req.body.department || 'CSE',
      yearOfStudy: req.body.yearOfStudy || '3rd Year',
      tShirtSize: req.body.tShirtSize || 'M',
      teamName: req.body.teamName || '',
      dietaryPreference: req.body.dietaryPreference || 'Vegetarian',
      status: 'Confirmed'
    });

    // Increment registeredSeats in events.json if event found
    const events = await jsonStorage.read('events');
    const targetEvent = events.find(e => 
      (req.body.eventId && (e.id === req.body.eventId || e._id === req.body.eventId)) ||
      (e.title && e.title.toLowerCase().includes(eventTitle.toLowerCase()))
    );
    if (targetEvent) {
      targetEvent.registeredSeats = (targetEvent.registeredSeats || 0) + 1;
      await jsonStorage.write('events', events);
    }

    res.status(201).json({
      success: true,
      message: 'Student successfully registered (Saved to registrations.json)',
      registrationId: regId,
      data: newRegistration
    });
  } catch (error) {
    next(error);
  }
}

// ----------------- CLUBS (JSON) -----------------
async function getClubs(req, res, next) {
  try {
    const clubs = await jsonStorage.read('clubs');
    res.status(200).json({
      success: true,
      storage: 'Local JSON File (clubs.json)',
      count: clubs.length,
      data: clubs
    });
  } catch (error) {
    next(error);
  }
}

async function createClub(req, res, next) {
  try {
    const { name, category, description, leadName, leadEmail } = req.body;
    if (!name || !description) {
      return res.status(400).json({ success: false, error: 'Club name and description are required.' });
    }

    const newClub = await jsonStorage.create('clubs', {
      name,
      category: category || 'Technical',
      description,
      leadName: leadName || 'Student Coordinator',
      leadEmail: leadEmail || 'club@campus.edu',
      memberCount: Number(req.body.memberCount) || 1,
      eventsCount: 0,
      logoUrl: req.body.logoUrl || '/assets/images/club-placeholder.png',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Club successfully saved to Local JSON storage',
      data: newClub
    });
  } catch (error) {
    next(error);
  }
}

// ----------------- FEEDBACK (JSON) -----------------
async function createFeedback(req, res, next) {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }

    const newFeedback = await jsonStorage.create('feedback', {
      name,
      email: email.toLowerCase(),
      subject: req.body.subject || 'General Inquiry',
      message
    });

    res.status(201).json({
      success: true,
      message: 'Feedback received and recorded in local feedback.json',
      data: newFeedback
    });
  } catch (error) {
    next(error);
  }
}

async function getFeedback(req, res, next) {
  try {
    const feedbackList = await jsonStorage.read('feedback');
    res.status(200).json({
      success: true,
      storage: 'Local JSON File (feedback.json)',
      count: feedbackList.length,
      data: feedbackList
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getRegistrations,
  createRegistration,
  getClubs,
  createClub,
  createFeedback,
  getFeedback
};
