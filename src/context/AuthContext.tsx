'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../lib/types';
import { dataService } from '../lib/data/storage';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase/client';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  signup: (userData: Partial<Profile> & { email: string; password?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>;
  switchUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  useEffect(() => {
    async function loadUser() {
      dataService.init();
      const supabaseConfigured = isSupabaseConfigured();
      setIsDemoMode(!supabaseConfigured);

      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await dataService.getProfile(session.user.id);
            if (profile) {
              setUser(profile);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase auth session check failed:', err);
        }
      }

      // Fallback or default student profile
      const currentId = dataService.getCurrentUserId();
      const profile = await dataService.getProfile(currentId);
      setUser(profile);
      setIsLoading(false);
    }

    loadUser();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    const supabase = getSupabase();

    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { success: false, message: error.message };
        }
        if (data.user) {
          const profile = await dataService.getProfile(data.user.id);
          if (profile) {
            setUser(profile);
            dataService.setCurrentUserId(profile.id);
          }
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase signin failed, trying local fallback:', err);
      }
    }

    // Local/Demo login matching by email or fallback to student
    const profiles = await dataService.getProfiles();
    const matched = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setUser(matched);
      dataService.setCurrentUserId(matched.id);
      setIsLoading(false);
      return { success: true };
    }

    // If no matching profile, create one on the fly for demo convenience
    const newProfile: Profile = {
      id: 'd' + Math.random().toString(36).substring(2, 10),
      full_name: email.split('@')[0].replace('.', ' '),
      email,
      university: 'National Institute of Technology',
      department: 'Computer Science & Engineering',
      year: '1st Year',
      bio: 'New student on Campus Connect!',
      profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      skills: ['Problem Solving', 'Python'],
      interests: ['Hackathons', 'Tech Clubs'],
      is_organizer: false,
    };

    const currentProfiles = await dataService.getProfiles();
    localStorage.setItem('campus_connect_profiles', JSON.stringify([newProfile, ...currentProfiles]));
    setUser(newProfile);
    dataService.setCurrentUserId(newProfile.id);
    setIsLoading(false);
    return { success: true };
  };

  const signup = async (userData: Partial<Profile> & { email: string; password?: string }) => {
    setIsLoading(true);
    const supabase = getSupabase();

    if (supabase && userData.password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              full_name: userData.full_name || 'Student',
              university: userData.university || 'National Institute of Technology',
              department: userData.department || 'Computer Science & Engineering',
              year: userData.year || '1st Year',
              interests: userData.interests || ['Hackathons'],
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, message: error.message };
        }

        if (data.user) {
          // Trigger or manual profile insert
          const newProfile: Profile = {
            id: data.user.id,
            full_name: userData.full_name || 'Student',
            email: userData.email,
            university: userData.university || 'National Institute of Technology',
            department: userData.department || 'Computer Science & Engineering',
            year: userData.year || '1st Year',
            bio: userData.bio || 'New student on Campus Connect!',
            profile_image: userData.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
            skills: userData.skills || ['Communication', 'Teamwork'],
            interests: userData.interests || ['Hackathons'],
            is_organizer: false,
          };
          setUser(newProfile);
          dataService.setCurrentUserId(newProfile.id);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase signup error, fallback to local:', err);
      }
    }

    // Local / Demo signup
    const newProfile: Profile = {
      id: 'd' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      full_name: userData.full_name || 'Student',
      email: userData.email,
      university: userData.university || 'National Institute of Technology',
      department: userData.department || 'Computer Science & Engineering',
      year: userData.year || '1st Year',
      bio: userData.bio || 'New student exploring campus opportunities on Campus Connect.',
      profile_image: userData.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
      skills: userData.skills || ['Creativity', 'Problem Solving'],
      interests: userData.interests || ['Hackathons', 'Tech Clubs'],
      is_organizer: Boolean(userData.is_organizer),
    };

    const currentProfiles = await dataService.getProfiles();
    localStorage.setItem('campus_connect_profiles', JSON.stringify([newProfile, ...currentProfiles]));
    setUser(newProfile);
    dataService.setCurrentUserId(newProfile.id);
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signout failed:', err);
      }
    }
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<Profile> => {
    if (!user) throw new Error('Not logged in');
    const updated = await dataService.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  const switchUser = async (userId: string) => {
    setIsLoading(true);
    const profile = await dataService.getProfile(userId);
    if (profile) {
      setUser(profile);
      dataService.setCurrentUserId(userId);
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        isDemoMode,
        login,
        signup,
        logout,
        updateProfile,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
