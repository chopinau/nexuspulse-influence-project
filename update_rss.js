
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateElonMuskRSS() {
  console.log('Updating Elon Musk RSS in Supabase config table...');
  
  // 1. Check if Elon Musk exists
  const { data: existing, error: fetchError } = await supabase
    .from('config')
    .select('*')
    .eq('slug', 'elon-musk')
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching Elon Musk:', fetchError);
    return;
  }

  const rssUrl = 'https://news.google.com/rss/search?q=Elon+Musk&hl=en-US&gl=US&ceid=US:en';
  
  if (existing) {
    // Update
    const { error: updateError } = await supabase
      .from('config')
      .update({ rss: rssUrl })
      .eq('slug', 'elon-musk');
      
    if (updateError) {
      console.error('Error updating Elon Musk (likely RLS):', updateError);
      process.exit(1);
    } else {
      console.log('Successfully updated Elon Musk RSS URL.');
    }
  } else {
    // Insert
    const { error: insertError } = await supabase
      .from('config')
      .insert({
        slug: 'elon-musk',
        name: 'Elon Musk',
        type: 'person',
        heatindex: 98,
        trend: 12,
        stocksymbol: 'TSLA',
        tags: 'Tech,Space,EV',
        rss: rssUrl
      });
      
    if (insertError) {
      console.error('Error inserting Elon Musk:', insertError);
      process.exit(1);
    } else {
      console.log('Successfully inserted Elon Musk with RSS URL.');
    }
  }
}

updateElonMuskRSS();
