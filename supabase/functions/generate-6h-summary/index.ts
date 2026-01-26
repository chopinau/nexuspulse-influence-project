
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

async function callGemini(prompt: string) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: "application/json" }
    })
  })
  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Get all entities from config
    const { data: entities, error: configError } = await supabase.from('config').select('*')
    if (configError) throw configError

    console.log(`[6h Summary] Processing ${entities.length} entities`)
    const results = []

    // Calculate time 6 hours ago
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()

    for (const entity of entities) {
      // 2. Fetch recent dynamics for this entity
      const { data: recentDynamics, error: dynamicsError } = await supabase
        .from('dynamics')
        .select('title, ai_summary, sentiment, pub_date')
        .eq('entity_slug', entity.slug)
        .gte('pub_date', sixHoursAgo) // Filter by pub_date instead of created_at
        .order('pub_date', { ascending: false })

      if (dynamicsError) {
        console.error(`[Error] Fetching dynamics for ${entity.name}:`, dynamicsError)
        results.push({ entity: entity.name, status: 'error', error: dynamicsError.message })
        continue
      }

      if (!recentDynamics || recentDynamics.length === 0) {
        console.log(`[Skip] No recent dynamics for ${entity.name} in last 6h`)
        results.push({ entity: entity.name, status: 'skipped', reason: 'No recent data' })
        continue
      }

      console.log(`[Processing] ${entity.name}: Found ${recentDynamics.length} items`)

      // 3. Prepare content for AI
      const contentText = recentDynamics.map(d => {
        const summary = d.ai_summary || d.title // Fallback if ai_summary is missing
        return `- [${d.pub_date}] ${summary} (Sentiment: ${d.sentiment})`
      }).join('\n')

      const prompt = `
        You are a senior intelligence analyst. Based on the following recent news summaries for ${entity.name} (${entity.type}):
        
        ${contentText}

        Write a strategic 6-hour briefing in Markdown format with the following structure:
        
        **Core Insight (One-Liner):** [One sentence summarizing the most critical update, bolded]

        **Sentiment:** [Sentiment Label] (Score: [0-100])

        **Categorized Updates:**
        - **🚨 Regulatory & Ethics:** [Extract relevant details if any]
        - **✈️ Aviation & Strategy:** [Extract relevant details if any]
        - **🚀 Capital & Markets:** [Extract relevant details if any]
        - **🚗 Tech & Innovation:** [Extract relevant details if any]
        *(Adapt category names dynamically based on content if needed)*

        **⚠️ Key Risks:**
        - [Risk 1]
        - [Risk 2]

        Output JSON only:
        {
          "summary": "[The full Markdown text generated above]",
          "sentiment_score": [Number],
          "sentiment_label": "[String]",
          "key_events": ["[Event 1]", "[Event 2]", "[Event 3]"]
        }
      `

      try {
        // 4. Call Gemini
        const aiResponse = await callGemini(prompt)
        
        // Robust JSON extraction
        let cleanJson = aiResponse.replace(/```json|```/g, '').trim()
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            cleanJson = jsonMatch[0]
        }

        let analysis;
        try {
            analysis = JSON.parse(cleanJson)
        } catch (parseError) {
            console.error('[AI Error] Failed to parse JSON:', cleanJson)
            console.error('[AI Raw Response]:', aiResponse)
            // Fallback
            analysis = {
                summary: `**Analysis Failed:** AI returned invalid format.\n\nRaw Output:\n${aiResponse.slice(0, 200)}...`,
                sentiment_score: 50,
                sentiment_label: "Neutral",
                key_events: []
            }
        }

        // 5. Save to analyst_reports
         const reportRow = {
           entity_id: entity.entity_id,
           entity_slug: entity.slug,
           summary: analysis.summary,
           sentiment_score: analysis.sentiment_score,
           sentiment_label: analysis.sentiment_label,
           key_events: analysis.key_events,
           created_at: new Date().toISOString()
         }

        const { error: reportError } = await supabase.from('analyst_reports').insert(reportRow)
        
        if (reportError) {
            console.error('[DB Error] inserting report:', reportError)
            results.push({ entity: entity.name, status: 'db_error', error: reportError.message })
        } else {
            console.log(`[DB Success] Inserted analyst report for ${entity.name}`)
            results.push({ entity: entity.name, status: 'success', items_processed: recentDynamics.length })
        }

      } catch (e) {
        console.error(`[Error] analyzing ${entity.name}:`, e)
        results.push({ entity: entity.name, status: 'error', error: e.message })
      }
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
