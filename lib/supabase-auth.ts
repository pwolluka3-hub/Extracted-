import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/supabase/client';

const IS_MOCK_AUTH = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');

export const getSupabaseClient = () => {
  return createClientComponentClient<Database>();
};

export const signInWithEmail = async (email: string, password: string) => {
  if (IS_MOCK_AUTH) {
    console.log('[MockAuth] Signing in...', { email });
    localStorage.setItem('supabase.auth.session', JSON.stringify({ user: { email }, accessToken: 'mock_token' }));
    return { data: { user: { email } }, error: null };
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (IS_MOCK_AUTH) {
    console.log('[MockAuth] Signing up...', { email });
    localStorage.setItem('supabase.auth.session', JSON.stringify({ user: { email }, accessToken: 'mock_token' }));
    return { data: { user: { email } }, error: null };
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
};

export const signUpWithMagicLink = async (email: string) => {
  if (IS_MOCK_AUTH) {
    console.log('[MockAuth] Magic link sent to...', email);
    localStorage.setItem('supabase.auth.session', JSON.stringify({ user: { email }, accessToken: 'mock_token' }));
    return { data: { user: { email } }, error: null };
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
};

export const signInWithGoogle = async () => {
  if (IS_MOCK_AUTH) {
    console.log('[MockAuth] Google Sign-in successful');
    localStorage.setItem('supabase.auth.session', JSON.stringify({ user: { email: 'google-user@example.com' }, accessToken: 'mock_token' }));
    return { data: { user: { email: 'google-user@example.com' } }, error: null };
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
};

export const signOut = async () => {
  if (IS_MOCK_AUTH) {
    localStorage.removeItem('supabase.auth.session');
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};