import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseClient: SupabaseClient | null = null;

if (config.isSupabaseConfigured) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: { persistSession: false }
    });
    console.log('✅ Supabase connected successfully to:', config.supabaseUrl);
  } catch (error) {
    console.error('⚠️ Failed to initialize Supabase client:', error);
  }
} else {
  console.log('ℹ️ Supabase credentials not detected. MediKiosk backend running with robust in-memory database store.');
}

export const supabase = supabaseClient;
