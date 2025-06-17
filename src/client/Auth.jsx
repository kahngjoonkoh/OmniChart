import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: true, autoRefreshToken: true },
    realtime: { params: { eventsPerSecond: 1000, }, },
  }
)

// Retrieve the access token of current user
export const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

// Check login status of current user
export const isLoggedIn = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session != null;
}

// Set the login status
export const updateLoginStatus = async (setLoginStatus) => {
  const status = await isLoggedIn();
  setLoginStatus(status);
}
