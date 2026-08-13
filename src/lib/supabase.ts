import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const extra = Constants.expoConfig?.extra ?? {};

const supabaseUrl = (extra.supabaseUrl as string | undefined) ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  (extra.supabaseAnonKey as string | undefined) ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Undefined until a Supabase project is created and its URL/anon key are set
// in .env (see .env.example). Screens fall back to demo data until then.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
