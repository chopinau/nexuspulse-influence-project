import { createClient } from '@supabase/supabase-js';

// For Vite projects, use import.meta.env instead of process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not configured properly. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_KEY are set in .env.local.');
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');