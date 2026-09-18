/**
 * ==========================================================================
 * CAMPUS CONNECT - SUPABASE CLIENT INITIALIZATION & CONFIGURATION
 * js/supabase.js
 * ==========================================================================
 * IMPORTANT INSTRUCTIONS FOR USER:
 * 1. Create a free project at https://supabase.com
 * 2. In your Supabase Project Settings -> API, copy your Project URL and Anon Key
 * 3. Paste them below replacing the placeholder strings.
 * 4. Run the SQL script from `supabase.sql` in the Supabase SQL Editor.
 */

const SUPABASE_CONFIG = {
  // Replace these placeholders with your actual Supabase project credentials
  URL: 'https://YOUR_PROJECT_ID.supabase.co',
  ANON_KEY: 'YOUR_ANON_PUBLIC_KEY'
};

// Check if actual credentials have been configured
function isSupabaseConfigured() {
  return (
    SUPABASE_CONFIG.URL &&
    SUPABASE_CONFIG.URL !== 'https://YOUR_PROJECT_ID.supabase.co' &&
    SUPABASE_CONFIG.URL.startsWith('https://') &&
    SUPABASE_CONFIG.ANON_KEY &&
    SUPABASE_CONFIG.ANON_KEY !== 'YOUR_ANON_PUBLIC_KEY' &&
    SUPABASE_CONFIG.ANON_KEY.length > 20
  );
}

// Global Supabase client holder
let supabaseClient = null;

// Initialize Supabase Client
function initSupabase() {
  if (isSupabaseConfigured() && window.supabase && window.supabase.createClient) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      console.log('✅ Supabase initialized successfully in live mode.');
      return supabaseClient;
    } catch (err) {
      console.warn('⚠️ Error initializing live Supabase client, falling back to demo mode:', err);
    }
  } else {
    console.info('ℹ️ Supabase credentials not set or using placeholders. Running in Demo Mode.');
  }
  
  // Setup Fallback Mock Client so the app works seamlessly for evaluation & demonstration
  supabaseClient = createMockSupabaseClient();
  return supabaseClient;
}

/**
 * Robust Local Mock Layer
 * Allows instant local previewing of all features without breaking if Supabase keys aren't added yet.
 */
function createMockSupabaseClient() {
  // Initial seed data for fallback mode
  const STORAGE_KEYS = {
    EVENTS: 'campus_connect_mock_events',
    REGISTRATIONS: 'campus_connect_mock_registrations',
    USERS: 'campus_connect_mock_users',
    CURRENT_USER: 'campus_connect_mock_session'
  };

  const defaultEvents = [
    {
      id: 'e1111111-1111-4111-8111-111111111111',
      title: 'TechFest 2026',
      category: 'Technology',
      description: 'An annual technology festival featuring coding competitions, project exhibitions, technical talks and innovation challenges.',
      date: '2026-10-10',
      time: '10:00 AM - 5:00 PM',
      venue: 'Main Auditorium',
      organizer: 'Computer Science Club',
      registration_deadline: '2026-10-07',
      max_participants: 250,
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString()
    },
    {
      id: 'e2222222-2222-4222-8222-222222222222',
      title: 'CodeSprint Hackathon',
      category: 'Hackathon',
      description: 'A 12-hour coding hackathon where students build innovative solutions to real-world problems.',
      date: '2026-10-18',
      time: '9:00 AM - 8:00 PM',
      venue: 'Innovation Lab',
      organizer: 'Coding Club',
      registration_deadline: '2026-10-15',
      max_participants: 100,
      image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString()
    },
    {
      id: 'e3333333-3333-4333-8333-333333333333',
      title: 'Campus Cultural Night',
      category: 'Cultural',
      description: 'An evening of music, dance, performances and student talent.',
      date: '2026-10-24',
      time: '6:00 PM - 10:00 PM',
      venue: 'Open Air Theatre',
      organizer: 'Cultural Society',
      registration_deadline: '2026-10-22',
      max_participants: 500,
      image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString()
    },
    {
      id: 'e4444444-4444-4444-8444-444444444444',
      title: 'AI & Future Technology Seminar',
      category: 'Seminar',
      description: 'An interactive seminar discussing artificial intelligence, emerging technologies and the future of computing.',
      date: '2026-11-02',
      time: '11:00 AM - 1:00 PM',
      venue: 'Seminar Hall',
      organizer: 'AI Society',
      registration_deadline: '2026-10-31',
      max_participants: 200,
      image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString()
    },
    {
      id: 'e5555555-5555-4555-8555-555555555555',
      title: 'Inter-College Cricket Tournament',
      category: 'Sports',
      description: 'An inter-college cricket tournament bringing together university teams for a competitive sporting event.',
      date: '2026-11-08',
      time: '8:00 AM - 4:00 PM',
      venue: 'University Sports Ground',
      organizer: 'Sports Committee',
      registration_deadline: '2026-11-04',
      max_participants: 160,
      image_url: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString()
    },
    {
      id: 'e6666666-6666-4666-8666-666666666666',
      title: 'Startup Pitch Challenge',
      category: 'Competition',
      description: 'Students pitch innovative startup ideas to a panel of mentors and industry professionals.',
      date: '2026-11-15',
      time: '10:00 AM - 3:00 PM',
      venue: 'Innovation Center',
      organizer: 'Entrepreneurship Cell',
      registration_deadline: '2026-11-12',
      max_participants: 80,
      image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
      created_at: new Date().toISOString()
    }
  ];

  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(defaultEvents));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify([]));
  }

  // Helper storage accessors
  const getEvents = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
  const saveEvents = (events) => localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  const getRegistrations = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTRATIONS) || '[]');
  const saveRegistrations = (regs) => localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(regs));

  return {
    isMock: true,
    auth: {
      async signUp({ email, password, options }) {
        const userId = 'usr_' + Math.random().toString(36).substr(2, 9);
        const name = options?.data?.name || email.split('@')[0];
        const role = options?.data?.role || 'student';
        const user = { id: userId, email, user_metadata: { name, role } };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ user }));
        return { data: { user, session: { user } }, error: null };
      },
      async signInWithPassword({ email, password }) {
        // Recognize the demo student credentials
        if (email.toLowerCase() === 'student@university.edu' && password === 'student123') {
          const user = {
            id: 'stu_demo_1001',
            email: 'student@university.edu',
            user_metadata: { name: 'Alex Johnson', role: 'student' }
          };
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ user }));
          return { data: { user, session: { user } }, error: null };
        }
        // Recognize the demo admin credentials
        if (email.toLowerCase() === 'admin@campusconnect.edu' && password === 'Admin@123') {
          const user = {
            id: 'adm_demo_2001',
            email: 'admin@campusconnect.edu',
            user_metadata: { name: 'Campus Admin', role: 'admin' }
          };
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ user }));
          return { data: { user, session: { user } }, error: null };
        }
        // General password verification
        if (password.length >= 6) {
          const role = email.includes('admin') ? 'admin' : 'student';
          const user = {
            id: 'usr_' + Math.random().toString(36).substr(2, 9),
            email,
            user_metadata: { name: email.split('@')[0], role }
          };
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ user }));
          return { data: { user, session: { user } }, error: null };
        }
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
      },
      async signOut() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        return { error: null };
      },
      async getSession() {
        const sessionStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (sessionStr) {
          try {
            const parsed = JSON.parse(sessionStr);
            return { data: { session: parsed }, error: null };
          } catch(e) {}
        }
        return { data: { session: null }, error: null };
      },
      async getUser() {
        const sessionStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (sessionStr) {
          try {
            const parsed = JSON.parse(sessionStr);
            return { data: { user: parsed.user }, error: null };
          } catch(e) {}
        }
        return { data: { user: null }, error: null };
      },
      onAuthStateChange(callback) {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from(tableName) {
      let currentQuery = {
        table: tableName,
        filters: [],
        orders: [],
        selectFields: '*'
      };

      const queryBuilder = {
        select(fields = '*') {
          currentQuery.selectFields = fields;
          return queryBuilder;
        },
        eq(col, val) {
          currentQuery.filters.push({ col, val, op: 'eq' });
          return queryBuilder;
        },
        order(col, { ascending = true } = {}) {
          currentQuery.orders.push({ col, ascending });
          return queryBuilder;
        },
        async single() {
          const res = await queryBuilder.execute();
          if (res.error) return res;
          return { data: res.data && res.data.length > 0 ? res.data[0] : null, error: null };
        },
        async insert(records) {
          const items = Array.isArray(records) ? records : [records];
          if (tableName === 'events') {
            const list = getEvents();
            const created = items.map(item => ({
              id: 'evt_' + Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              ...item
            }));
            list.unshift(...created);
            saveEvents(list);
            return { data: created, error: null };
          }
          if (tableName === 'registrations') {
            const list = getRegistrations();
            for (const item of items) {
              const exists = list.some(r => r.event_id === item.event_id && r.student_id === item.student_id);
              if (exists) {
                return { data: null, error: { message: 'You are already registered for this event.' } };
              }
            }
            const created = items.map(item => ({
              id: 'reg_' + Math.random().toString(36).substr(2, 9),
              registered_at: new Date().toISOString(),
              status: 'registered',
              ...item
            }));
            list.unshift(...created);
            saveRegistrations(list);
            return { data: created, error: null };
          }
          return { data: items, error: null };
        },
        async update(updates) {
          if (tableName === 'events') {
            const list = getEvents();
            let updated = null;
            const updatedList = list.map(item => {
              const match = currentQuery.filters.every(f => item[f.col] === f.val);
              if (match) {
                updated = { ...item, ...updates, updated_at: new Date().toISOString() };
                return updated;
              }
              return item;
            });
            saveEvents(updatedList);
            return { data: updated, error: null };
          }
          if (tableName === 'registrations') {
            const list = getRegistrations();
            let updated = null;
            const updatedList = list.map(item => {
              const match = currentQuery.filters.every(f => item[f.col] === f.val);
              if (match) {
                updated = { ...item, ...updates };
                return updated;
              }
              return item;
            });
            saveRegistrations(updatedList);
            return { data: updated, error: null };
          }
          if (tableName === 'profiles') {
            const sessionStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            if (sessionStr) {
              const session = JSON.parse(sessionStr);
              session.user.user_metadata = { ...session.user.user_metadata, ...updates };
              localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(session));
            }
            return { data: updates, error: null };
          }
          return { data: updates, error: null };
        },
        async delete() {
          if (tableName === 'events') {
            const list = getEvents();
            const filtered = list.filter(item => !currentQuery.filters.some(f => item[f.col] === f.val));
            saveEvents(filtered);
            return { data: null, error: null };
          }
          if (tableName === 'registrations') {
            const list = getRegistrations();
            const filtered = list.filter(item => !currentQuery.filters.some(f => item[f.col] === f.val));
            saveRegistrations(filtered);
            return { data: null, error: null };
          }
          return { data: null, error: null };
        },
        async execute() {
          let data = [];
          if (tableName === 'events') {
            data = getEvents();
          } else if (tableName === 'registrations') {
            data = getRegistrations();
            // Mock join on events
            if (currentQuery.selectFields.includes('events(') || currentQuery.selectFields.includes('events.*')) {
              const allEvents = getEvents();
              data = data.map(reg => ({
                ...reg,
                events: allEvents.find(e => e.id === reg.event_id) || null
              }));
            }
          } else if (tableName === 'profiles') {
            const sessionStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            if (sessionStr) {
              const { user } = JSON.parse(sessionStr);
              data = [{
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || 'Student User',
                role: user.user_metadata?.role || 'student',
                created_at: new Date().toISOString()
              }];
            }
          }

          // Apply filters
          for (const f of currentQuery.filters) {
            data = data.filter(item => item[f.col] === f.val);
          }

          // Apply ordering
          for (const o of currentQuery.orders) {
            data.sort((a, b) => {
              if (a[o.col] < b[o.col]) return o.ascending ? -1 : 1;
              if (a[o.col] > b[o.col]) return o.ascending ? 1 : -1;
              return 0;
            });
          }

          return { data, error: null };
        },
        then(onfulfilled, onrejected) {
          return queryBuilder.execute().then(onfulfilled, onrejected);
        }
      };

      return queryBuilder;
    }
  };
}

// Automatically initialize client on script evaluation
const db = initSupabase();
