import { 
  Event, 
  Community, 
  Profile, 
  Registration, 
  Bookmark, 
  Connection, 
  Notification,
  EventFiltersState
} from '../types';
import { 
  INITIAL_EVENTS, 
  INITIAL_COMMUNITIES, 
  INITIAL_PROFILES, 
  INITIAL_REGISTRATIONS, 
  INITIAL_BOOKMARKS, 
  INITIAL_CONNECTIONS, 
  INITIAL_NOTIFICATIONS 
} from './initialData';
import { getSupabase, isSupabaseConfigured } from '../supabase/client';
import { generateTicketCode } from '../utils';

const STORAGE_KEYS = {
  EVENTS: 'campus_connect_events',
  COMMUNITIES: 'campus_connect_communities',
  PROFILES: 'campus_connect_profiles',
  REGISTRATIONS: 'campus_connect_registrations',
  BOOKMARKS: 'campus_connect_bookmarks',
  CONNECTIONS: 'campus_connect_connections',
  NOTIFICATIONS: 'campus_connect_notifications',
  CURRENT_USER_ID: 'campus_connect_current_user_id',
};

class DataService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser()) return fallback;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage setItem failed:', e);
    }
  }

  // Initialize storage if empty
  public init(): void {
    if (!this.isBrowser()) return;

    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      this.setItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMUNITIES)) {
      this.setItem(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      this.setItem(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
      this.setItem(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) {
      this.setItem(STORAGE_KEYS.BOOKMARKS, INITIAL_BOOKMARKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONNECTIONS)) {
      this.setItem(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'd0000000-0000-0000-0000-000000000001'); // Default to Anuj Verma
    }
  }

  // Current logged in user ID
  public getCurrentUserId(): string {
    return this.getItem(STORAGE_KEYS.CURRENT_USER_ID, 'd0000000-0000-0000-0000-000000000001');
  }

  public setCurrentUserId(id: string): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  // ==========================================
  // PROFILES
  // ==========================================
  public async getProfile(userId: string): Promise<Profile | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (!error && data) return data as Profile;
      } catch (err) {
        console.warn('Supabase getProfile failed, fallback to local:', err);
      }
    }

    const profiles = this.getItem<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    return profiles.find((p) => p.id === userId) || null;
  }

  public async getProfiles(): Promise<Profile[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data && data.length > 0) return data as Profile[];
      } catch (err) {
        console.warn('Supabase getProfiles failed, fallback to local:', err);
      }
    }

    return this.getItem<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  }

  public async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
        if (!error && data) {
          // Sync local
          const profiles = this.getItem<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
          const index = profiles.findIndex((p) => p.id === userId);
          if (index !== -1) {
            profiles[index] = { ...profiles[index], ...updates };
            this.setItem(STORAGE_KEYS.PROFILES, profiles);
          }
          return data as Profile;
        }
      } catch (err) {
        console.warn('Supabase updateProfile failed, fallback to local:', err);
      }
    }

    const profiles = this.getItem<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const index = profiles.findIndex((p) => p.id === userId);
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...updates, updated_at: new Date().toISOString() };
      this.setItem(STORAGE_KEYS.PROFILES, profiles);
      return profiles[index];
    }
    throw new Error('Profile not found');
  }

  // ==========================================
  // EVENTS
  // ==========================================
  public async getEvents(filters?: Partial<EventFiltersState>): Promise<Event[]> {
    const supabase = getSupabase();
    let events: Event[] = [];

    if (supabase) {
      try {
        let query = supabase.from('events').select('*');
        if (filters?.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }
        if (filters?.eventType && filters.eventType !== 'all') {
          query = query.eq('event_type', filters.eventType);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          events = data as Event[];
        }
      } catch (err) {
        console.warn('Supabase getEvents failed, fallback to local:', err);
      }
    }

    if (events.length === 0) {
      events = this.getItem<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    }

    // Apply client filters if provided
    if (filters) {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        events = events.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            (e.community_name && e.community_name.toLowerCase().includes(q))
        );
      }

      if (filters.category && filters.category !== 'all') {
        events = events.filter((e) => e.category.toLowerCase() === filters.category?.toLowerCase());
      }

      if (filters.eventType && filters.eventType !== 'all') {
        events = events.filter((e) => e.event_type === filters.eventType);
      }

      if (filters.priceFilter && filters.priceFilter !== 'all') {
        if (filters.priceFilter === 'free') {
          events = events.filter((e) => e.is_free);
        } else if (filters.priceFilter === 'paid') {
          events = events.filter((e) => !e.is_free);
        }
      }

      if (filters.dateFilter && filters.dateFilter !== 'all') {
        const today = new Date().toISOString().split('T')[0];
        if (filters.dateFilter === 'today') {
          events = events.filter((e) => e.event_date === today);
        } else if (filters.dateFilter === 'upcoming') {
          events = events.filter((e) => e.event_date >= today);
        }
      }

      // Sorting
      if (filters.sortBy === 'popularity') {
        events.sort((a, b) => b.current_participants - a.current_participants);
      } else if (filters.sortBy === 'date-desc') {
        events.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
      } else if (filters.sortBy === 'recently-added') {
        events.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      } else {
        // Default: date-asc
        events.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
      }
    }

    return events;
  }

  public async getEventById(id: string): Promise<Event | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
        if (!error && data) return data as Event;
      } catch (err) {
        console.warn('Supabase getEventById failed, fallback to local:', err);
      }
    }

    const events = this.getItem<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    return events.find((e) => e.id === id) || null;
  }

  public async createEvent(eventData: Omit<Event, 'id' | 'current_participants' | 'created_at'>): Promise<Event> {
    const newId = 'e' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    const newEvent: Event = {
      ...eventData,
      id: newId,
      current_participants: 0,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('events').insert([newEvent]).select().single();
        if (!error && data) {
          const events = this.getItem<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
          this.setItem(STORAGE_KEYS.EVENTS, [data as Event, ...events]);
          return data as Event;
        }
      } catch (err) {
        console.warn('Supabase createEvent failed, saving to local:', err);
      }
    }

    const events = this.getItem<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const updated = [newEvent, ...events];
    this.setItem(STORAGE_KEYS.EVENTS, updated);
    return newEvent;
  }

  public async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('events').update(updates).eq('id', id).select().single();
        if (!error && data) {
          const events = this.getItem<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
          const index = events.findIndex((e) => e.id === id);
          if (index !== -1) {
            events[index] = data as Event;
            this.setItem(STORAGE_KEYS.EVENTS, events);
          }
          return data as Event;
        }
      } catch (err) {
        console.warn('Supabase updateEvent failed, updating local:', err);
      }
    }

    const events = this.getItem<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const index = events.findIndex((e) => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates, updated_at: new Date().toISOString() };
      this.setItem(STORAGE_KEYS.EVENTS, events);
      return events[index];
    }
    throw new Error('Event not found');
  }

  public async deleteEvent(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('events').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteEvent failed:', err);
      }
    }

    const events = this.getItem<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    this.setItem(STORAGE_KEYS.EVENTS, events.filter((e) => e.id !== id));
    return true;
  }

  // ==========================================
  // REGISTRATIONS
  // ==========================================
  public async registerForEvent(eventId: string, userId: string): Promise<{ success: boolean; registration?: Registration; message?: string }> {
    const event = await this.getEventById(eventId);
    if (!event) return { success: false, message: 'Event not found' };

    if (event.current_participants >= event.max_participants) {
      return { success: false, message: 'This event has reached full capacity.' };
    }

    const registrations = this.getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const existing = registrations.find((r) => r.event_id === eventId && r.user_id === userId && r.status === 'confirmed');
    if (existing) {
      return { success: false, message: 'You are already registered for this event.' };
    }

    const ticketCode = generateTicketCode(event.category.substring(0, 4).toUpperCase());
    const newReg: Registration = {
      id: 'r' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      event_id: eventId,
      user_id: userId,
      registered_at: new Date().toISOString(),
      status: 'confirmed',
      ticket_code: ticketCode,
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('registrations').insert([newReg]);
      } catch (err) {
        console.warn('Supabase register error:', err);
      }
    }

    // Update local registrations
    this.setItem(STORAGE_KEYS.REGISTRATIONS, [newReg, ...registrations]);

    // Increment event participants
    await this.updateEvent(eventId, { current_participants: event.current_participants + 1 });

    // Send notification
    await this.addNotification({
      user_id: userId,
      type: 'registration_confirmed',
      title: 'Registration Confirmed! 🎉',
      message: `You're registered for "${event.title}". Your ticket code is ${ticketCode}.`,
      related_event_id: eventId,
    });

    return { success: true, registration: newReg };
  }

  public async cancelRegistration(eventId: string, userId: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('registrations').delete().eq('event_id', eventId).eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase cancelRegistration error:', err);
      }
    }

    const registrations = this.getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    this.setItem(
      STORAGE_KEYS.REGISTRATIONS,
      registrations.filter((r) => !(r.event_id === eventId && r.user_id === userId))
    );

    const event = await this.getEventById(eventId);
    if (event) {
      await this.updateEvent(eventId, { current_participants: Math.max(0, event.current_participants - 1) });
    }

    return true;
  }

  public async isUserRegistered(eventId: string, userId: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase
          .from('registrations')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .eq('status', 'confirmed');
        if (data && data.length > 0) return true;
      } catch (err) {
        console.warn('Supabase isUserRegistered error:', err);
      }
    }

    const registrations = this.getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    return registrations.some((r) => r.event_id === eventId && r.user_id === userId && r.status === 'confirmed');
  }

  public async getUserRegistrations(userId: string): Promise<(Registration & { event: Event })[]> {
    const registrations = this.getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const userRegs = registrations.filter((r) => r.user_id === userId && r.status === 'confirmed');
    const events = await this.getEvents();

    const results: (Registration & { event: Event })[] = [];
    for (const r of userRegs) {
      const ev = events.find((e) => e.id === r.event_id);
      if (ev) {
        results.push({ ...r, event: ev });
      }
    }
    return results;
  }

  public async getEventAttendees(eventId: string): Promise<(Registration & { user: Profile })[]> {
    const registrations = this.getItem<Registration[]>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
    const eventRegs = registrations.filter((r) => r.event_id === eventId && r.status === 'confirmed');
    const profiles = await this.getProfiles();

    const results: (Registration & { user: Profile })[] = [];
    for (const r of eventRegs) {
      const prof = profiles.find((p) => p.id === r.user_id);
      if (prof) {
        results.push({ ...r, user: prof });
      }
    }
    return results;
  }

  // ==========================================
  // BOOKMARKS
  // ==========================================
  public async toggleBookmark(eventId: string, userId: string): Promise<boolean> {
    const bookmarks = this.getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, INITIAL_BOOKMARKS);
    const existingIndex = bookmarks.findIndex((b) => b.event_id === eventId && b.user_id === userId);

    const supabase = getSupabase();

    if (existingIndex !== -1) {
      // Remove
      if (supabase) {
        try {
          await supabase.from('bookmarks').delete().eq('event_id', eventId).eq('user_id', userId);
        } catch (err) {
          console.warn('Supabase delete bookmark error:', err);
        }
      }
      bookmarks.splice(existingIndex, 1);
      this.setItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
      return false; // unbookmarked
    } else {
      // Add
      const newBookmark: Bookmark = {
        id: 'b' + Math.random().toString(36).substring(2, 11),
        event_id: eventId,
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      if (supabase) {
        try {
          await supabase.from('bookmarks').insert([newBookmark]);
        } catch (err) {
          console.warn('Supabase insert bookmark error:', err);
        }
      }
      bookmarks.push(newBookmark);
      this.setItem(STORAGE_KEYS.BOOKMARKS, bookmarks);
      return true; // bookmarked
    }
  }

  public async isEventBookmarked(eventId: string, userId: string): Promise<boolean> {
    const bookmarks = this.getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, INITIAL_BOOKMARKS);
    return bookmarks.some((b) => b.event_id === eventId && b.user_id === userId);
  }

  public async getUserBookmarks(userId: string): Promise<Event[]> {
    const bookmarks = this.getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, INITIAL_BOOKMARKS);
    const userBookmarks = bookmarks.filter((b) => b.user_id === userId);
    const events = await this.getEvents();
    return events.filter((e) => userBookmarks.some((b) => b.event_id === e.id));
  }

  // ==========================================
  // COMMUNITIES
  // ==========================================
  public async getCommunities(): Promise<Community[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('communities').select('*');
        if (!error && data && data.length > 0) return data as Community[];
      } catch (err) {
        console.warn('Supabase getCommunities failed:', err);
      }
    }
    return this.getItem<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
  }

  public async getCommunityById(id: string): Promise<Community | null> {
    const communities = await this.getCommunities();
    return communities.find((c) => c.id === id || c.slug === id) || null;
  }

  public async isCommunityMember(communityId: string, userId: string): Promise<boolean> {
    const membershipKey = `campus_member_${communityId}_${userId}`;
    const isMem = localStorage.getItem(membershipKey);
    if (isMem !== null) return isMem === 'true';
    // Default: member of GDSC if Anuj
    return communityId === 'c0000000-0000-0000-0000-000000000001';
  }

  public async toggleCommunityMembership(communityId: string, userId: string): Promise<boolean> {
    const isMem = await this.isCommunityMember(communityId, userId);
    const membershipKey = `campus_member_${communityId}_${userId}`;
    const newState = !isMem;
    localStorage.setItem(membershipKey, newState ? 'true' : 'false');

    // Update community count
    const communities = this.getItem<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    const index = communities.findIndex((c) => c.id === communityId);
    if (index !== -1) {
      communities[index].member_count += newState ? 1 : -1;
      this.setItem(STORAGE_KEYS.COMMUNITIES, communities);
    }

    if (newState) {
      const comm = communities[index];
      await this.addNotification({
        user_id: userId,
        type: 'community_event',
        title: 'Joined Community! 🏛️',
        message: `You are now a member of ${comm ? comm.name : 'the community'}.`,
      });
    }

    return newState;
  }

  // ==========================================
  // CONNECTIONS
  // ==========================================
  public async getConnections(userId: string): Promise<(Connection & { user: Profile })[]> {
    const connections = this.getItem<Connection[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    const profiles = await this.getProfiles();

    const results: (Connection & { user: Profile })[] = [];
    for (const c of connections) {
      if (c.status === 'accepted') {
        const otherId = c.sender_id === userId ? c.receiver_id : c.sender_id;
        if (c.sender_id === userId || c.receiver_id === userId) {
          const prof = profiles.find((p) => p.id === otherId);
          if (prof) {
            results.push({ ...c, user: prof });
          }
        }
      }
    }
    return results;
  }

  public async getPendingRequests(userId: string): Promise<(Connection & { user: Profile })[]> {
    const connections = this.getItem<Connection[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    const profiles = await this.getProfiles();

    const results: (Connection & { user: Profile })[] = [];
    for (const c of connections) {
      if (c.status === 'pending' && c.receiver_id === userId) {
        const prof = profiles.find((p) => p.id === c.sender_id);
        if (prof) {
          results.push({ ...c, user: prof });
        }
      }
    }
    return results;
  }

  public async sendConnectionRequest(senderId: string, receiverId: string): Promise<boolean> {
    const connections = this.getItem<Connection[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    const existing = connections.find(
      (c) =>
        (c.sender_id === senderId && c.receiver_id === receiverId) ||
        (c.sender_id === receiverId && c.receiver_id === senderId)
    );

    if (existing) return false;

    const newConn: Connection = {
      id: 'cn' + Math.random().toString(36).substring(2, 11),
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    this.setItem(STORAGE_KEYS.CONNECTIONS, [newConn, ...connections]);

    const senderProfile = await this.getProfile(senderId);
    await this.addNotification({
      user_id: receiverId,
      type: 'connection_request',
      title: 'New Connection Request 👋',
      message: `${senderProfile ? senderProfile.full_name : 'A student'} wants to connect with you.`,
      related_user_id: senderId,
    });

    return true;
  }

  public async respondToConnectionRequest(connectionId: string, accept: boolean): Promise<boolean> {
    const connections = this.getItem<Connection[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    const index = connections.findIndex((c) => c.id === connectionId);
    if (index === -1) return false;

    if (accept) {
      connections[index].status = 'accepted';
      connections[index].updated_at = new Date().toISOString();
      this.setItem(STORAGE_KEYS.CONNECTIONS, connections);

      const conn = connections[index];
      const receiver = await this.getProfile(conn.receiver_id);
      await this.addNotification({
        user_id: conn.sender_id,
        type: 'connection_accepted',
        title: 'Connection Accepted! 🤝',
        message: `${receiver ? receiver.full_name : 'Student'} accepted your connection request.`,
        related_user_id: conn.receiver_id,
      });
    } else {
      connections.splice(index, 1);
      this.setItem(STORAGE_KEYS.CONNECTIONS, connections);
    }

    return true;
  }

  public async getRecommendedConnections(userId: string): Promise<Profile[]> {
    const current = await this.getProfile(userId);
    const all = await this.getProfiles();
    const connections = this.getItem<Connection[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);

    return all.filter((p) => {
      if (p.id === userId) return false;
      const isConnectedOrPending = connections.some(
        (c) =>
          (c.sender_id === userId && c.receiver_id === p.id) ||
          (c.sender_id === p.id && c.receiver_id === userId)
      );
      return !isConnectedOrPending;
    });
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  public async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async addNotification(notificationData: Omit<Notification, 'id' | 'created_at' | 'read'>): Promise<Notification> {
    const newNotif: Notification = {
      ...notificationData,
      id: 'n' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      read: false,
      created_at: new Date().toISOString(),
    };

    const notifications = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifications]);
    return newNotif;
  }

  public async markNotificationAsRead(id: string): Promise<boolean> {
    const notifications = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const index = notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
      return true;
    }
    return false;
  }

  public async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const notifications = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    for (const n of notifications) {
      if (n.user_id === userId) n.read = true;
    }
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return true;
  }
}

export const dataService = new DataService();
