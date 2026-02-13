import dotenv from 'dotenv';
dotenv.config();  // <--- 这行代码负责加载 .env 文件里的变量

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting 12-hour summary generation...');
    
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    
    console.log('[API] Fetching dynamics data from:', twelveHoursAgo.toISOString(), 'to', now.toISOString());
    
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
    
    const groupedByEntity: Record<string, typeof dynamics> = {};
    
    dynamics?.forEach(item => {
      if (!groupedByEntity[item.entity_slug]) {
        groupedByEntity[item.entity_slug] = [];
      }
      groupedByEntity[item.entity_slug].push(item);
    });
    
    console.log('[API] Grouped into', Object.keys(groupedByEntity).length, 'entities');
    
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
    
    const summaries = [];
    
    for (const entity of entities || []) {
      const entityDynamics = groupedByEntity[entity.slug] || [];
      
      if (entityDynamics.length === 0) {
        console.log(`[API] No dynamics for entity: ${entity.name} (${entity.slug})`);
        continue;
      }
      
      const context = entityDynamics
        .map(item => `${item.title}: ${item.summary || 'No summary available'}`)
        .join('\n\n');
      
      console.log(`[API] Generating summary for ${entity.name} (${entityDynamics.length} items)`);
      
      try {
        const summary = `Summary for ${entity.name}:\n${context.slice(0, 500)}...`;
        
        summaries.push({
          entity_slug: entity.slug,
          entity_name: entity.name,
          summary,
          item_count: entityDynamics.length,
          generated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error(`[API] Failed to generate summary for ${entity.name}:`, err);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      count: summaries.length,
      summaries 
    });
    
  } catch (error) {
    console.error('[API] 12-hour summary error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
