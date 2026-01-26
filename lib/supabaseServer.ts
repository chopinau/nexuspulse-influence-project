import { createClient } from '@supabase/supabase-js';

// For server-side code in Vite, we need to use process.env with VITE_ prefix
// These should be defined in the Vite config's define section
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not configured properly for server-side code.');
}

// Create and export Supabase client for server-side usage
export const supabaseServer = createClient(supabaseUrl, supabaseKey);