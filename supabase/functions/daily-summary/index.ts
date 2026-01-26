
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Gemini API setup
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

// Helper to fetch RSS
async function fetchRSS(url: string) {
  try {
    const response = await fetch(url)
    const text = await response.text()
    // Simple regex parsing for <item> or <entry>
    const items = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    while ((match = itemRegex.exec(text)) !== null) {
      const itemContent = match[1]
      const title = itemContent.match(/<title>(.*?)<\/title>/)?.[1] || ''
      const link = itemContent.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const pubDate = itemContent.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const description = itemContent.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ''
      
      items.push({
        title: title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
        link: link.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim(),
        pubDate: pubDate ? new Date(pubDate) : new Date(),
        description: description.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim()
      })
    }
    return items
  } catch (e) {
    console.error(`Error fetching RSS from ${url}:`, e)
    return []
  }
}

// Helper to call Gemini for single item analysis
async function analyzeItem(item: any, entityName: string) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')
  
  const prompt = `
    Analyze this news item for ${entityName}.
    Title: ${item.title}
    Content: ${item.description.substring(0, 500)}

    1. Write a concise 1-sentence summary (max 30 words).
    2. Determine sentiment (Positive, Neutral, Negative).

    Output JSON only:
    {
      "summary": "...",
      "sentiment": "Neutral"
    }
  `
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })
    
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleanJson = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleanJson)
  } catch (e) {
    console.error('Gemini Analysis Error:', e)
    return { summary: item.description.substring(0, 100), sentiment: 'Neutral' } // Fallback
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get entities
    const { data: entities, error: configError } = await supabase.from('config').select('*')
    if (configError) throw configError

    console.log(`[Daily Summary] Processing ${entities.length} entities`)
    const results = []

    for (const entity of entities) {
      if (!entity.rss) {
        results.push({ entity: entity.name, status: 'skipped', reason: 'No RSS' })
        continue
      }

      // 2. Fetch RSS
      const rssItems = await fetchRSS(entity.rss)
      // Limit to top 5 newest items to save tokens/time per run
      const newItems = rssItems.slice(0, 5)
      
      let processedCount = 0

      for (const item of newItems) {
        // Check if exists to avoid re-analysis
        const { data: existing } = await supabase
          .from('dynamics')
          .select('id')
          .eq('url', item.link)
          .single()
        
        if (existing) continue

        // 3. Analyze with Gemini
        const analysis = await analyzeItem(item, entity.name)
        
        // 4. Insert into dynamics
        const { error: insertError } = await supabase.from('dynamics').insert({
          entity_slug: entity.slug,
          title: item.title,
          url: item.link,
          pub_date: item.pubDate.toISOString(),
          description: item.description.substring(0, 500), // Original description
          ai_summary: analysis.summary, // Gemini summary
          sentiment: analysis.sentiment, // Gemini sentiment
          source: 'RSS',
          created_at: new Date().toISOString()
        })

        if (!insertError) processedCount++
      }
      
      results.push({ entity: entity.name, new_items: processedCount })
    }

    return new Response(JSON.stringify({ success: true, results }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
