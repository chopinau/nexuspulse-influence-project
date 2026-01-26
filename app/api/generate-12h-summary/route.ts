import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

/**
 * API endpoint to generate 12-hour summaries for all entities
 * This endpoint fetches recent dynamics data and generates summaries using the AI service
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting 12-hour summary generation...');
    
    // 1. Calculate time range (last 12 hours)
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    
    console.log('[API] Fetching dynamics data from:', twelveHoursAgo.toISOString(), 'to', now.toISOString());
    
    // 2. Fetch recent dynamics data from Supabase
    const { data: dynamics, error: dynamicsError } = await supabaseServer
      .from('dynamics')
      .select('*')
      .gte('pub_date', twelveHoursAgo.toISOString())
      .order('pub_date', { ascending: false });
    
    if (dynamicsError) {
      console.error('[API] Failed to fetch dynamics:', dynamicsError);
      return NextResponse.json(
        { error: 'Failed to fetch dynamics data' },
        { status: 500 }
      );
    }
    
    console.log('[API] Fetched', dynamics?.length || 0, 'dynamics items');
    
    // 3. Group dynamics by entity_slug
    const groupedByEntity: Record<string, typeof dynamics> = {};
    
    dynamics?.forEach(item => {
      if (!groupedByEntity[item.entity_slug]) {
        groupedByEntity[item.entity_slug] = [];
      }
      groupedByEntity[item.entity_slug].push(item);
    });
    
    console.log('[API] Grouped into', Object.keys(groupedByEntity).length, 'entities');
    
    // 4. Fetch entity configurations
    const entitySlugs = Object.keys(groupedByEntity);
    const { data: entities, error: entitiesError } = await supabaseServer
      .from('config')
      .select('*')
      .in('slug', entitySlugs);
    
    if (entitiesError) {
      console.error('[API] Failed to fetch entities:', entitiesError);
      return NextResponse.json(
        { error: 'Failed to fetch entity configurations' },
        { status: 500 }
      );
    }
    
    console.log('[API] Fetched', entities?.length || 0, 'entity configurations');
    
    // 5. Generate summaries for each entity
    const summaries = [];
    
    for (const entity of entities || []) {
      const entityDynamics = groupedByEntity[entity.slug] || [];
      
      if (entityDynamics.length === 0) {
        console.log(`[API] No dynamics for entity: ${entity.name} (${entity.slug})`);
        continue;
      }
      
      // Create context for AI summary
      const context = entityDynamics
        .map(item => `${item.title}: ${item.summary || 'No summary available'}`)
        .join('\n\n');
      
      console.log(`[API] Generating summary for ${entity.name} (${entityDynamics.length} items)`);
      
      try {
        // Call the existing AI summary API
        const aiResponse = await fetch(`${request.nextUrl.origin}/api/ai/summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ context }),
        });
        
        const aiResult = await aiResponse.json();
        
        if (aiResponse.ok && aiResult.summary) {
          summaries.push({
            entity_slug: entity.slug,
            entity_name: entity.name,
            summary: aiResult.summary,
            item_count: entityDynamics.length,
            generated_at: new Date().toISOString(),
            time_range: {
              start: twelveHoursAgo.toISOString(),
              end: now.toISOString()
            }
          });
          
          console.log(`[API] Generated summary for ${entity.name}: ${aiResult.summary.slice(0, 50)}...`);
        } else {
          console.error(`[API] AI summary failed for ${entity.name}:`, aiResult.error);
        }
      } catch (aiError) {
        console.error(`[API] AI summary exception for ${entity.name}:`, aiError);
      }
    }
    
    console.log('[API] Generated summaries for', summaries.length, 'entities');
    
    // 6. Save summaries to Supabase (optional, you can implement this if needed)
    // For now, we'll just return the summaries
    
    return NextResponse.json({
      success: true,
      summaries,
      metadata: {
        generated_at: now.toISOString(),
        time_range: {
          start: twelveHoursAgo.toISOString(),
          end: now.toISOString()
        },
        total_entities: entities?.length || 0,
        entities_with_summaries: summaries.length,
        total_dynamics: dynamics?.length || 0
      }
    });
    
  } catch (error) {
    console.error('[API] 12h summary generation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Allow GET requests for testing
  return NextResponse.json({
    message: 'Use POST method to generate 12-hour summaries',
    endpoint: '/api/generate-12h-summary',
    method: 'POST',
    description: 'Generate 12-hour summaries for all entities'
  });
}
