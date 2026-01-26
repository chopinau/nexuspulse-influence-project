
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_KEY // Anon key

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkConfig() {
  console.log('Fetching config...')
  const { data, error } = await supabase.from('config').select('*').limit(1)
  
  if (error) {
    console.error('Error fetching config:', error)
    return
  }
  
  console.log('Config sample:', data)
}

checkConfig()
