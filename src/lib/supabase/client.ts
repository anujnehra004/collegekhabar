import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  if (typeof window === 'undefined') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return Boolean(url && key && !url.includes('placeholder') && url.startsWith('http'));
  }

  // Check localStorage overrides first, then environment variables
  const localUrl = localStorage.getItem('campus_connect_supabase_url');
  const localKey = localStorage.getItem('campus_connect_supabase_key');
  if (localUrl && localKey && localUrl.startsWith('http')) {
    return true;
  }

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(envUrl && envKey && !envUrl.includes('placeholder') && envUrl.startsWith('http'));
}

export function getSupabaseCredentials(): { url: string; key: string } {
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('campus_connect_supabase_url');
    const localKey = localStorage.getItem('campus_connect_supabase_key');
    if (localUrl && localKey) {
      return { url: localUrl, key: localKey };
    }
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

export function setCustomSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('campus_connect_supabase_url', url);
    localStorage.setItem('campus_connect_supabase_key', key);
    supabaseInstance = null; // force re-initialization
  }
}

export function clearCustomSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('campus_connect_supabase_url');
    localStorage.removeItem('campus_connect_supabase_key');
    supabaseInstance = null;
  }
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const { url, key } = getSupabaseCredentials();

  if (!url || !key || url.includes('placeholder') || !url.startsWith('http')) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}
