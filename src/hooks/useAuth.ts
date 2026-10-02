import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    // 1. Initial session load
    authService.getSession().then((currSession) => {
      if (!mounted) return;
      setSession(currSession);
      setUser(currSession?.user ?? null);
      setLoading(false);
    });

    // 2. Subscribe to auth changes
    const sub = authService.onAuthStateChange((newSession, newUser) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newUser);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, pass: string) => {
    const res = await authService.signInWithPassword(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  }, []);

  const signOut = useCallback(async () => {
    const res = await authService.signOut();
    setUser(null);
    setSession(null);
    return res;
  }, []);

  return {
    user,
    session,
    isAuthenticated: Boolean(user && session),
    loading,
    signIn,
    signOut,
  };
}
