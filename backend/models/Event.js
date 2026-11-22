const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  category: {
    type: String,
    required: true,
    enum: ['Hackathon', 'Workshop', 'Cultural', 'Seminar', 'Sports', 'Technical', 'General'],
    default: 'General'
  },
  date: {
    type: String,
    required: [true, 'Event date is required (YYYY-MM-DD)']
  },
  time: {
    type: String,
    default: '10:00 AM'
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required']
  },
  club: {
    type: String,
    default: 'Campus Life'
  },
  organizer: {
    type: String,
    default: 'Student Affairs'
  },
  totalSeats: {
    type: Number,
    required: true,
    min: [1, 'Total seats must be at least 1'],
    default: 100
  },
  registeredSeats: {
    type: Number,
    default: 0,
    min: 0
  },
  fee: {
    type: Number,
    default: 0
  },
  bannerUrl: {
    type: String,
    default: '/assets/images/event-placeholder.jpg'
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  }
}, {
  timestamps: true
});

// Auto-generate slug before saving
eventSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
