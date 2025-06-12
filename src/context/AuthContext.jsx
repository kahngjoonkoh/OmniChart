import { createContext, useState, useContext, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export const AuthContext = createContext();
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: true, autoRefreshToken: true } }
)

const baseUrl = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  // Retrieve user tokens from local storage if any, so that
  // the tokens are not lost when refreshing the tab
  useEffect(() => {
    // Initialize session on load
    supabase.auth.getSession().then(({ data: { session }}) => {
      setSession(session);
    })

    // Update session when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => subscription.unsubscribe();
  }, [])

  // A convenient function that returns user login status
  const isLoggedIn = () => {
    return session != null;
  }

  return (
    <AuthContext.Provider
      value={{ session, isLoggedIn }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
