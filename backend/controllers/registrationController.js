const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { isMongoConnected } = require('../config/db');
const jsonStorage = require('../services/jsonStorageService');

// CREATE: POST /api/registrations
async function createRegistration(req, res, next) {
  try {
    const email = req.body.email ? req.body.email.trim() : '';
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Student email address is required.'
      });
    }

    const fullName = req.body.fullName || req.body.name || email.split('@')[0];
    const rollNumber = (req.body.rollNumber || email.split('@')[0]).toUpperCase();
    const eventTitle = req.body.eventTitle || 'TechFest 2026: Code & Innovate';
    const { phone, yearOfStudy, department, tShirtSize, teamName, dietaryPreference } = req.body;

    // Generate unique Registration ID e.g., CC-2026-4892
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regId = `CC-2026-${randomSuffix}`;

    if (isMongoConnected()) {
      // Check seat availability on Event if event exists
      const event = await Event.findOne({
        title: { $regex: new RegExp(eventTitle.trim(), 'i') }
      });

      if (event && event.registeredSeats >= event.totalSeats) {
        return res.status(409).json({
          success: false,
          error: 'This event has reached maximum seating capacity. Registration is closed.'
        });
      }

      const registration = await Registration.create({
        registrationId: regId,
        eventTitle,
        eventId: event ? event._id : (req.body.eventId || null),
        fullName,
        rollNumber: rollNumber.toUpperCase(),
        email: email.toLowerCase(),
        phone: phone || '',
        department: department || 'CSE',
        yearOfStudy: yearOfStudy || '3rd Year',
        tShirtSize: tShirtSize || 'M',
        teamName: teamName || '',
        dietaryPreference: dietaryPreference || 'Vegetarian',
        status: 'Confirmed'
      });

      // Increment registered seats count
      if (event) {
        event.registeredSeats = (event.registeredSeats || 0) + 1;
        await event.save();
      }

      // Synchronize with Local JSON file
      if (process.env.ENABLE_JSON_FALLBACK === 'true') {
        try {
          await jsonStorage.create('registrations', registration.toObject());
        } catch {}
      }

      return res.status(201).json({
        success: true,
        message: 'Student event registration successful',
        storage: 'MongoDB (Live)',
        registrationId: regId,
        data: registration
      });
    }

    // Resilient Fallback to JSON
    const fallbackRegistration = await jsonStorage.create('registrations', {
      registrationId: regId,
      eventTitle,
      fullName,
      rollNumber: rollNumber.toUpperCase(),
      email: email.toLowerCase(),
      phone: phone || '',
      department: department || 'CSE',
      yearOfStudy: yearOfStudy || '3rd Year',
      tShirtSize: tShirtSize || 'M',
      teamName: teamName || '',
      dietaryPreference: dietaryPreference || 'Vegetarian',
      status: 'Confirmed'
    });

    return res.status(201).json({
      success: true,
      message: 'Student event registration successful (Saved to Local JSON store)',
      storage: 'Local JSON Storage (Fallback)',
      registrationId: regId,
      data: fallbackRegistration
    });
  } catch (error) {
    next(error);
  }
}

// READ ALL: GET /api/registrations
async function getRegistrations(req, res, next) {
  try {
    const { email, eventTitle, rollNumber } = req.query;

    if (isMongoConnected()) {
      let filter = {};
      if (email) filter.email = email.toLowerCase().trim();
      if (rollNumber) filter.rollNumber = rollNumber.toUpperCase().trim();
      if (eventTitle) filter.eventTitle = { $regex: eventTitle, $options: 'i' };

      const registrations = await Registration.find(filter).sort({ registeredAt: -1 });
      return res.status(200).json({
        success: true,
        storage: 'MongoDB (Live)',
        count: registrations.length,
        data: registrations
      });
    }

    // Fallback
    let registrations = await jsonStorage.read('registrations');
    if (email) registrations = registrations.filter(r => r.email && r.email.toLowerCase() === email.toLowerCase());
    if (rollNumber) registrations = registrations.filter(r => r.rollNumber && r.rollNumber.toLowerCase() === rollNumber.toLowerCase());
    if (eventTitle) registrations = registrations.filter(r => r.eventTitle && r.eventTitle.toLowerCase().includes(eventTitle.toLowerCase()));

    return res.status(200).json({
      success: true,
      storage: 'Local JSON Storage (Fallback)',
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    next(error);
  }
}

// READ ONE: GET /api/registrations/:id
async function getRegistrationById(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let reg = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        reg = await Registration.findById(id);
      }
      if (!reg) {
        reg = await Registration.findOne({ registrationId: id });
      }

      if (!reg) {
        return res.status(404).json({ success: false, error: 'Registration record not found' });
      }

      return res.status(200).json({ success: true, storage: 'MongoDB', data: reg });
    }

    // Fallback
    const reg = await jsonStorage.findById('registrations', id);
    if (!reg) {
      return res.status(404).json({ success: false, error: 'Registration record not found' });
    }
    return res.status(200).json({ success: true, storage: 'Local JSON Storage (Fallback)', data: reg });
  } catch (error) {
    next(error);
  }
}

// UPDATE: PUT /api/registrations/:id
async function updateRegistration(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let reg = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        reg = await Registration.findByIdAndUpdate(id, req.body, { new: true });
      }
      if (!reg) {
        reg = await Registration.findOneAndUpdate({ registrationId: id }, req.body, { new: true });
      }

      if (!reg) {
        return res.status(404).json({ success: false, error: 'Registration record not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Registration updated successfully',
        storage: 'MongoDB',
        data: reg
      });
    }

    // Fallback
    const updated = await jsonStorage.update('registrations', id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Registration record not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Registration updated in Local JSON storage',
      storage: 'Local JSON Storage (Fallback)',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// DELETE: DELETE /api/registrations/:id
async function deleteRegistration(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let deleted = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        deleted = await Registration.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await Registration.findOneAndDelete({ registrationId: id });
      }

      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Registration not found' });
      }

      // Decrement event seats count
      if (deleted.eventId) {
        await Event.findByIdAndUpdate(deleted.eventId, { $inc: { registeredSeats: -1 } });
      } else if (deleted.eventTitle) {
        await Event.findOneAndUpdate(
          { title: { $regex: new RegExp(deleted.eventTitle, 'i') } },
          { $inc: { registeredSeats: -1 } }
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Registration cancelled and event seat count released',
        storage: 'MongoDB',
        data: deleted
      });
    }

    // Fallback
    const deleted = await jsonStorage.remove('registrations', id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Registration cancelled from Local JSON storage',
      storage: 'Local JSON Storage (Fallback)',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration
};
