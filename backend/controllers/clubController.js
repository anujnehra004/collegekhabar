const Club = require('../models/Club');
const { isMongoConnected } = require('../config/db');
const jsonStorage = require('../services/jsonStorageService');

// CREATE: POST /api/clubs
async function createClub(req, res, next) {
  try {
    const { name, category, description, leadName, leadEmail, memberCount, logoUrl, socialLinks } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, error: 'Club name and description are required.' });
    }

    if (isMongoConnected()) {
      const club = await Club.create({
        name,
        category: category || 'General',
        description,
        leadName: leadName || 'Student Coordinator',
        leadEmail: leadEmail || 'lead@campus.edu',
        memberCount: Number(memberCount) || 20,
        logoUrl: logoUrl || '/assets/images/club-placeholder.png',
        socialLinks: socialLinks || {}
      });

      if (process.env.ENABLE_JSON_FALLBACK === 'true') {
        try {
          await jsonStorage.create('clubs', club.toObject());
        } catch {}
      }

      return res.status(201).json({
        success: true,
        message: 'Club created in MongoDB',
        storage: 'MongoDB (Live)',
        data: club
      });
    }

    // Fallback
    const fallbackClub = await jsonStorage.create('clubs', req.body);
    return res.status(201).json({
      success: true,
      message: 'Club created in Local JSON storage',
      storage: 'Local JSON Storage (Fallback)',
      data: fallbackClub
    });
  } catch (error) {
    next(error);
  }
}

// READ ALL: GET /api/clubs
async function getAllClubs(req, res, next) {
  try {
    const { category } = req.query;

    if (isMongoConnected()) {
      let filter = { isActive: true };
      if (category && category !== 'all') {
        filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }
      const clubs = await Club.find(filter).sort({ memberCount: -1 });
      return res.status(200).json({
        success: true,
        storage: 'MongoDB (Live)',
        count: clubs.length,
        data: clubs
      });
    }

    // Fallback
    let clubs = await jsonStorage.read('clubs');
    if (category && category !== 'all') {
      clubs = clubs.filter(c => c.category && c.category.toLowerCase() === category.toLowerCase());
    }
    return res.status(200).json({
      success: true,
      storage: 'Local JSON Storage (Fallback)',
      count: clubs.length,
      data: clubs
    });
  } catch (error) {
    next(error);
  }
}

// READ ONE: GET /api/clubs/:id
async function getClubById(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let club = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        club = await Club.findById(id);
      }
      if (!club) {
        club = await Club.findOne({ name: { $regex: new RegExp(`^${id}$`, 'i') } });
      }

      if (!club) {
        return res.status(404).json({ success: false, error: 'Club not found' });
      }

      return res.status(200).json({ success: true, storage: 'MongoDB', data: club });
    }

    // Fallback
    const club = await jsonStorage.findById('clubs', id);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }
    return res.status(200).json({ success: true, storage: 'Local JSON Storage (Fallback)', data: club });
  } catch (error) {
    next(error);
  }
}

// UPDATE: PUT /api/clubs/:id
async function updateClub(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let club = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        club = await Club.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      }
      if (!club) {
        return res.status(404).json({ success: false, error: 'Club not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Club updated in MongoDB',
        storage: 'MongoDB',
        data: club
      });
    }

    // Fallback
    const updated = await jsonStorage.update('clubs', id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Club updated in Local JSON storage',
      storage: 'Local JSON Storage (Fallback)',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// DELETE: DELETE /api/clubs/:id
async function deleteClub(req, res, next) {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      let deleted = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        deleted = await Club.findByIdAndDelete(id);
      }
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Club not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Club deleted from MongoDB',
        storage: 'MongoDB',
        data: deleted
      });
    }

    // Fallback
    const deleted = await jsonStorage.remove('clubs', id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Club deleted from Local JSON storage',
      storage: 'Local JSON Storage (Fallback)',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createClub,
  getAllClubs,
  getClubById,
  updateClub,
  deleteClub
};
