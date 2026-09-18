/**
 * ==========================================================================
 * CAMPUS CONNECT - STUDENT ACTIONS & REGISTRATION MODULE
 * js/student.js
 * Registration, My Events, Profile Management, and Cancellation
 * ==========================================================================
 */

const studentManager = {
  /**
   * Register the currently logged in student for an event
   */
  async registerForEvent(eventId) {
    const userData = await authManager.getCurrentUser();
    if (!userData?.user) {
      showToast('Please login to register for this event.', 'warning');
      setTimeout(() => {
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
      }, 900);
      return { success: false, reason: 'unauthenticated' };
    }

    const userId = userData.user.id;

    // 1. Fetch event details to check seats & deadline
    const event = await eventsManager.getEventById(eventId);
    if (!event) {
      showToast('Event details not found.', 'error');
      return { success: false, reason: 'not_found' };
    }

    // 2. Check registration deadline
    if (event.registration_deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadline = new Date(event.registration_deadline);
      if (today > deadline) {
        showToast('Registration deadline for this event has passed.', 'error');
        return { success: false, reason: 'deadline_passed' };
      }
    }

    // 3. Check if already registered
    const isRegistered = await this.checkIfRegistered(eventId, userId);
    if (isRegistered) {
      showToast('You are already registered for this event.', 'warning');
      return { success: false, reason: 'already_registered' };
    }

    // 4. Check available seats
    const currentCount = await eventsManager.getEventRegistrationCount(eventId);
    const maxSeats = event.max_participants || 100;
    if (currentCount >= maxSeats) {
      showToast('Sorry, this event is already fully booked.', 'error');
      return { success: false, reason: 'event_full' };
    }

    // 5. Insert into registrations
    try {
      const { data, error } = await db.from('registrations').insert([
        {
          event_id: eventId,
          student_id: userId,
          status: 'registered'
        }
      ]);

      if (error) {
        if (error.message && error.message.toLowerCase().includes('duplicate') || error.code === '23505') {
          showToast('You are already registered for this event.', 'warning');
          return { success: false, reason: 'already_registered' };
        }
        throw error;
      }

      showToast("You're registered!", 'success');
      return { success: true };
    } catch (err) {
      console.error('Registration insertion error:', err);
      showToast(err.message || 'Registration failed. Please try again.', 'error');
      return { success: false, error: err };
    }
  },

  /**
   * Check if a specific student is registered for an event
   */
  async checkIfRegistered(eventId, studentId) {
    try {
      const { data, error } = await db
        .from('registrations')
        .select('id, status')
        .eq('event_id', eventId)
        .eq('student_id', studentId)
        .eq('status', 'registered');

      if (error || !data) return false;
      return data.length > 0;
    } catch (err) {
      return false;
    }
  },

  /**
   * Get all registrations for the logged in student with event details
   */
  async getMyRegistrations() {
    const userData = await authManager.getCurrentUser();
    if (!userData?.user) return [];

    try {
      const { data, error } = await db
        .from('registrations')
        .select('id, registered_at, status, events(*)')
        .eq('student_id', userData.user.id)
        .order('registered_at', { ascending: false });

      if (error) {
        console.error('Error fetching student registrations:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('getMyRegistrations error:', err);
      return [];
    }
  },

  /**
   * Cancel an event registration
   */
  async cancelRegistration(registrationId) {
    if (!registrationId) return false;

    try {
      // Update registration status to 'cancelled'
      const { error } = await db
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId);

      if (error) throw error;

      showToast('Registration cancelled successfully.', 'info');
      return true;
    } catch (err) {
      console.error('Cancel registration error:', err);
      showToast('Failed to cancel registration.', 'error');
      return false;
    }
  },

  /**
   * Update student profile display name
   */
  async updateProfileName(newName) {
    if (!newName || !newName.trim()) {
      showToast('Please enter a valid display name.', 'warning');
      return false;
    }

    const userData = await authManager.getCurrentUser();
    if (!userData?.user) return false;

    try {
      const { error } = await db
        .from('profiles')
        .update({ name: newName.trim() })
        .eq('id', userData.user.id);

      if (error) throw error;

      showToast('Profile updated successfully!', 'success');
      return true;
    } catch (err) {
      console.error('Update profile error:', err);
      showToast('Could not update profile.', 'error');
      return false;
    }
  }
};

window.studentManager = studentManager;
