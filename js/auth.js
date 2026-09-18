/**
 * ==========================================================================
 * CAMPUS CONNECT - AUTHENTICATION & ROLE MANAGEMENT
 * js/auth.js
 * Handles Sign In, Sign Up, Sign Out, Profile Retrieval, and Route Guards
 * ==========================================================================
 */

const authManager = {
  /**
   * Retrieve current authenticated user
   */
  async getCurrentUser() {
    try {
      const { data, error } = await db.auth.getUser();
      if (error || !data?.user) return null;
      return data;
    } catch (err) {
      console.error('Error fetching current user:', err);
      return null;
    }
  },

  /**
   * Retrieve user profile from profiles table (or metadata fallback)
   */
  async getUserProfile() {
    const userData = await this.getCurrentUser();
    if (!userData?.user) return null;

    const user = userData.user;
    try {
      const { data, error } = await db
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        return data;
      }
    } catch (err) {
      console.warn('Could not query profiles table, using user metadata:', err);
    }

    // Fallback to user metadata
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email.split('@')[0],
      role: user.user_metadata?.role || 'student'
    };
  },

  /**
   * Student Signup
   */
  async signupStudent(name, email, password) {
    if (!email || !password || !name) {
      throw new Error('Please fill in all required fields.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const { data, error } = await db.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
          role: 'student'
        }
      }
    });

    if (error) {
      throw error;
    }

    // Attempt to ensure profile entry exists if database trigger is not yet configured
    if (data?.user) {
      try {
        await db.from('profiles').insert([
          {
            id: data.user.id,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            role: 'student'
          }
        ]);
      } catch (profileErr) {
        console.info('Profile trigger already handled creation or table exists:', profileErr);
      }
    }

    return data;
  },

  /**
   * Student Login
   */
  async loginStudent(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const { data, error } = await db.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      throw error;
    }

    const profile = await this.getUserProfile();
    return { user: data.user, profile };
  },

  /**
   * Admin Login with Role Verification
   */
  async loginAdmin(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both admin email and password.');
    }

    const { data, error } = await db.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      throw error;
    }

    // Verify admin role in profiles
    const profile = await this.getUserProfile();
    const isAdmin = profile?.role === 'admin' || data.user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      // Immediately sign out unauthorized user
      await db.auth.signOut();
      throw new Error('Unauthorized access: You do not have administrator privileges.');
    }

    return { user: data.user, profile };
  },

  /**
   * Sign out current session
   */
  async logout() {
    try {
      await db.auth.signOut();
      showToast('Logged out successfully', 'info');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = 'index.html';
    }
  },

  /**
   * Route Guard: Protect student-only pages
   */
  async requireStudentAuth() {
    const userData = await this.getCurrentUser();
    if (!userData?.user) {
      showToast('Please login to access this page.', 'warning');
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      setTimeout(() => {
        window.location.href = `login.html?redirect=${currentUrl}`;
      }, 700);
      return false;
    }
    return true;
  },

  /**
   * Route Guard: Protect admin-only pages
   */
  async requireAdminAuth() {
    const userData = await this.getCurrentUser();
    if (!userData?.user) {
      showToast('Please log in with administrator credentials.', 'warning');
      setTimeout(() => {
        window.location.href = 'admin-login.html';
      }, 700);
      return false;
    }

    const profile = await this.getUserProfile();
    const isAdmin = profile?.role === 'admin' || userData.user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      showToast('Unauthorized access: Administrator role required.', 'error');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
      return false;
    }

    return true;
  }
};

window.authManager = authManager;
