import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

class AuthService {
  /**
   * Sign in with Email and Password using Supabase Auth
   */
  async signInWithPassword(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase client is not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let msg = error.message;
        if (error.message.includes('Invalid login credentials')) {
          msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
        } else if (error.message.includes('Email not confirmed')) {
          msg = 'อีเมลนี้ยังไม่ได้ยืนยันในระบบ Supabase';
        }
        return { success: false, error: msg };
      }

      return { success: true, user: data.user || undefined };
    } catch (err: any) {
      return { success: false, error: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
    }
  }

  /**
   * Sign out current admin user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) return null;
      return data.session;
    } catch {
      return null;
    }
  }

  /**
   * Listen to Auth state changes
   */
  onAuthStateChange(callback: (session: Session | null, user: User | null) => void) {
    if (!isSupabaseConfigured() || !supabase) {
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session, session?.user ?? null);
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }
}

export const authService = new AuthService();
