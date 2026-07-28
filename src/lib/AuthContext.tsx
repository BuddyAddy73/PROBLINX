import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { User } from '../types';

interface AuthContextValue {
  session: Session | null;
  user: User | null; // null while loading OR truly signed out
  isLoading: boolean;
  isAnonymous: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Turn a Supabase auth user + its profiles row into our frontend User shape.
// Google metadata (name/avatar/email) is used only on first profile creation —
// after that, the `profiles` row is the source of truth so a user can edit
// their display name later without us silently overwriting it from Google again.
function buildDisplayNameFromGoogle(authUser: any): string {
  const meta = authUser?.user_metadata || {};
  return meta.full_name || meta.name || (authUser?.email ? authUser.email.split('@')[0] : `Guest_${authUser.id.slice(0, 6)}`);
}

// Maps a raw `profiles` row (+ the auth user, for email) to our frontend User shape.
function mapProfileRow(row: any, authUser: any): User {
  return {
    id: row.id,
    email: authUser?.email ?? '',
    display_name: row.username,
    role: row.user_type,
    is_seed_account: row.is_seed_account ?? false,
    created_at: row.created_at,
    avatar_url: row.avatar_url ?? undefined,
    reputation_score: 0,
    user_tag: row.user_tag ?? null,
    tag_updated_at: row.tag_updated_at ?? null,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrCreateProfile = useCallback(async (authUser: any): Promise<User | null> => {
    const { data: existing, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Failed to fetch profile:', fetchError.message);
      return null;
    }

    if (existing) {
      return mapProfileRow(existing, authUser);
    }

    // First time we've seen this authenticated user — create their profile row.
    // Anonymous users get a generated Guest_xxxxx name (no Google metadata to use);
    // Google users get their real name/avatar pulled from user_metadata.
    const isAnon = authUser.is_anonymous === true;
    const displayName = isAnon ? `Guest_${authUser.id.slice(0, 6)}` : buildDisplayNameFromGoogle(authUser);
    const avatarUrl = isAnon ? null : (authUser.user_metadata?.avatar_url ?? null);

    const { data: created, error: upsertError } = await supabase
      .from('profiles')
      .upsert({ id: authUser.id, username: displayName, avatar_url: avatarUrl, user_type: 'member' })
      .select()
      .single();

    if (upsertError || !created) {
      console.error('Failed to create profile:', upsertError?.message);
      return null;
    }

    return mapProfileRow(created, authUser);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data } = await supabase.auth.getSession();
      let currentSession = data.session;

      // No session at all yet (first-ever visit) — fall back to an anonymous
      // session so the app is usable before anyone bothers signing in.
      if (!currentSession) {
        const { data: anonData, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Anonymous sign-in failed:', error.message);
        } else {
          currentSession = anonData.session;
        }
      }

      if (currentSession?.user && !cancelled) {
        setSession(currentSession);
        const profile = await loadOrCreateProfile(currentSession.user);
        if (!cancelled) setUser(profile);
      }
      if (!cancelled) setIsLoading(false);
    }

    init();

    // Keep state in sync with sign-in/sign-out/token-refresh events, including
    // the redirect back from Google OAuth.
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (cancelled) return;
      setSession(newSession);

      if (newSession?.user) {
        setIsLoading(true);
        const profile = await loadOrCreateProfile(newSession.user);
        if (!cancelled) {
          setUser(profile);
          setIsLoading(false);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) console.error('Google sign-in failed:', error.message);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out failed:', error.message);
      return;
    }
    setUser(null);
    setSession(null);
    // Immediately re-establish an anonymous session so the app stays usable
    // (read-only browsing) right after signing out, rather than being stuck
    // in a signed-out limbo state.
    const { data } = await supabase.auth.signInAnonymously();
    if (data.session?.user) {
      const profile = await loadOrCreateProfile(data.session.user);
      setSession(data.session);
      setUser(profile);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    const profile = await loadOrCreateProfile(session.user);
    setUser(profile);
  }, [session, loadOrCreateProfile]);

  // A missing session (auth still resolving, or anonymous sign-in failed
  // silently) must be treated as "not signed in with Google" — never as
  // the authenticated branch. Getting this backwards is what caused the
  // Header to show a fake "Member (User)" pill instead of the Sign In
  // button whenever there was no real session yet.
  const isAnonymous = !session?.user || session.user.is_anonymous === true;

  return (
    <AuthContext.Provider value={{ session, user, isLoading, isAnonymous, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
