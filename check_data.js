
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_KEY // This is Anon Key, might have RLS issues if not public

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDynamics() {
  const { data, error } = await supabase
    .from('dynamics')
    .select('pub_date')
    .order('pub_date', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error checking pub_date:', error)
  } else {
    console.log('Recent pub_dates:', data)
  }
}

checkDynamics()
