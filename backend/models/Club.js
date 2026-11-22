const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Club name is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technical', 'Cultural', 'Sports', 'Social', 'Literary', 'Entrepreneurship', 'General'],
    default: 'General'
  },
  description: {
    type: String,
    required: [true, 'Club description is required']
  },
  leadName: {
    type: String,
    default: 'Student Lead'
  },
  leadEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: 'lead@campus.edu'
  },
  memberCount: {
    type: Number,
    default: 25
  },
  eventsCount: {
    type: Number,
    default: 0
  },
  logoUrl: {
    type: String,
    default: '/assets/images/club-placeholder.png'
  },
  socialLinks: {
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Club', clubSchema);
