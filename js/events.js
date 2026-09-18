/**
 * ==========================================================================
 * CAMPUS CONNECT - EVENTS DATA & RENDERING MODULE
 * js/events.js
 * Fetching, Searching, Filtering, Sorting, and Card Rendering
 * ==========================================================================
 */

const eventsManager = {
  /**
   * Fetch all events from Supabase
   */
  async getAllEvents() {
    try {
      const { data, error } = await db
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events from Supabase:', error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('getAllEvents error:', err);
      return [];
    }
  },

  /**
   * Fetch single event by UUID
   */
  async getEventById(eventId) {
    if (!eventId) return null;
    try {
      const { data, error } = await db
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event by ID:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('getEventById error:', err);
      return null;
    }
  },

  /**
   * Get registration count for a specific event
   */
  async getEventRegistrationCount(eventId) {
    try {
      const { data, error } = await db
        .from('registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('status', 'registered');

      if (error || !data) return 0;
      return data.length;
    } catch (err) {
      return 0;
    }
  },

  /**
   * Format ISO date string to human-readable format (e.g., "Oct 10, 2026")
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      // Split YYYY-MM-DD to avoid timezone offset issues
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  },

  /**
   * Extract month and day for the event card badge
   */
  getDateBadgeParts(dateStr) {
    if (!dateStr) return { month: 'TBD', day: '00' };
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return {
          month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
          day: String(day)
        };
      }
      const d = new Date(dateStr);
      return {
        month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        day: String(d.getDate())
      };
    } catch (e) {
      return { month: 'TBD', day: '00' };
    }
  },

  /**
   * Generate HTML for a single event card
   */
  renderEventCard(event, registeredCount = 0) {
    const { month, day } = this.getDateBadgeParts(event.date);
    const availableSeats = Math.max(0, (event.max_participants || 100) - registeredCount);
    const placeholderImg = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
    const imgSrc = event.image_url || placeholderImg;

    return `
      <article class="event-card reveal-on-scroll">
        <div class="event-card-image-wrap">
          <img src="${imgSrc}" alt="${event.title}" class="event-card-img" loading="lazy" onerror="this.src='${placeholderImg}'">
          <span class="event-category-badge">${event.category}</span>
          <div class="event-date-pill">
            <div class="event-date-day">${day}</div>
            <div class="event-date-month">${month}</div>
          </div>
        </div>
        <div class="event-card-body">
          <h3 class="event-card-title">${event.title}</h3>
          <p class="event-card-desc">${event.description || ''}</p>
          
          <div class="event-meta-list">
            <div class="event-meta-item">
              <span class="event-meta-icon">⏰</span>
              <span>${event.time}</span>
            </div>
            <div class="event-meta-item">
              <span class="event-meta-icon">📍</span>
              <span>${event.venue}</span>
            </div>
            <div class="event-meta-item">
              <span class="event-meta-icon">👥</span>
              <span>By ${event.organizer}</span>
            </div>
          </div>

          <div class="event-card-footer">
            <div class="event-seats-info">
              <span class="event-seats-highlight">${availableSeats}</span> seats left
            </div>
            <a href="event-details.html?id=${event.id}" class="btn btn-primary btn-sm">
              View Details →
            </a>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Render loading skeleton cards
   */
  renderSkeletonCards(count = 6) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="event-card skeleton-card">
          <div class="skeleton" style="height: 190px; width: 100%;"></div>
          <div style="padding: 20px;">
            <div class="skeleton" style="height: 24px; width: 70%; margin-bottom: 12px;"></div>
            <div class="skeleton" style="height: 14px; width: 95%; margin-bottom: 8px;"></div>
            <div class="skeleton" style="height: 14px; width: 80%; margin-bottom: 20px;"></div>
            <div class="skeleton" style="height: 16px; width: 50%; margin-bottom: 8px;"></div>
            <div class="skeleton" style="height: 16px; width: 60%; margin-bottom: 24px;"></div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="skeleton" style="height: 18px; width: 80px;"></div>
              <div class="skeleton" style="height: 36px; width: 110px; border-radius: 8px;"></div>
            </div>
          </div>
        </div>
      `;
    }
    return html;
  }
};

window.eventsManager = eventsManager;
