#!/usr/bin/env node

/**
 * Script to generate 12-hour summaries for all entities
 * This script fetches recent dynamics data and generates summaries using the AI service
 * 
 * To run: node generate-12h-summary.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
config({
  path: '.env.local'
});

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not found. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_KEY are set in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase client initialized successfully');

async function generate12hSummaries() {
  try {
    console.log('\n📅 Starting 12-hour summary generation...');
    
    // 1. Calculate time range (last 12 hours)
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    
    console.log(`⏰ Fetching dynamics data from: ${twelveHoursAgo.toISOString()} to ${now.toISOString()}`);
    
    // 2. Fetch recent dynamics data from Supabase
    const { data: dynamics, error: dynamicsError } = await supabase
      .from('dynamics')
      .select('*')
      .gte('pub_date', twelveHoursAgo.toISOString())
      .order('pub_date', { ascending: false });
    
    if (dynamicsError) {
      console.error('❌ Failed to fetch dynamics:', dynamicsError);
      process.exit(1);
    }
    
    console.log(`📊 Fetched ${dynamics?.length || 0} dynamics items`);
    
    if (!dynamics || dynamics.length === 0) {
      console.log('ℹ️  No dynamics data found in the last 12 hours');
      process.exit(0);
    }
    
    // 3. Group dynamics by entity_slug
    const groupedByEntity = {};
    
    dynamics.forEach(item => {
      if (!groupedByEntity[item.entity_slug]) {
        groupedByEntity[item.entity_slug] = [];
      }
      groupedByEntity[item.entity_slug].push(item);
    });
    
    console.log(`🏷️  Grouped into ${Object.keys(groupedByEntity).length} entities`);
    
    // 4. Fetch entity configurations
    const entitySlugs = Object.keys(groupedByEntity);
    const { data: entities, error: entitiesError } = await supabase
      .from('config')
      .select('*')
      .in('slug', entitySlugs);
    
    if (entitiesError) {
      console.error('❌ Failed to fetch entities:', entitiesError);
      process.exit(1);
    }
    
    console.log(`👥 Fetched ${entities?.length || 0} entity configurations`);
    
    if (!entities || entities.length === 0) {
      console.log('ℹ️  No entity configurations found');
      process.exit(0);
    }
    
    // 5. Generate summaries for each entity
    const summaries = [];
    
    for (const entity of entities) {
      const entityDynamics = groupedByEntity[entity.slug] || [];
      
      if (entityDynamics.length === 0) {
        console.log(`ℹ️  No dynamics for entity: ${entity.name} (${entity.slug})`);
        continue;
      }
      
      console.log(`\n🔄 Generating summary for ${entity.name} (${entityDynamics.length} items)`);
      
      // Create context for AI summary
      const context = entityDynamics
        .map(item => `${item.title}: ${item.summary || 'No summary available'}`)
        .join('\n\n');
      
      try {
        // Call the existing AI summary API
        // Note: This assumes you have the AI service running locally on port 3000
        const aiResponse = await fetch('http://localhost:3000/api/ai/summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ context }),
        });
        
        const aiResult = await aiResponse.json();
        
        if (aiResponse.ok && aiResult.summary) {
          const summary = {
            entity_slug: entity.slug,
            entity_name: entity.name,
            summary: aiResult.summary,
            item_count: entityDynamics.length,
            generated_at: new Date().toISOString(),
            time_range: {
              start: twelveHoursAgo.toISOString(),
              end: now.toISOString()
            }
          };
          
          summaries.push(summary);
          
          console.log(`✅ Summary generated for ${entity.name}:`);
          console.log(`   ${aiResult.summary}`);
        } else {
          console.error(`❌ AI summary failed for ${entity.name}:`, aiResult.error);
        }
      } catch (aiError) {
        console.error(`❌ AI summary exception for ${entity.name}:`, aiError.message);
        // Fallback: Generate a simple summary
        const fallbackSummary = {
          entity_slug: entity.slug,
          entity_name: entity.name,
          summary: `${entity.name} had ${entityDynamics.length} news items in the last 12 hours.`,
          item_count: entityDynamics.length,
          generated_at: new Date().toISOString(),
          time_range: {
            start: twelveHoursAgo.toISOString(),
            end: now.toISOString()
          }
        };
        summaries.push(fallbackSummary);
        console.log(`⚠️  Using fallback summary for ${entity.name}`);
      }
    }
    
    console.log(`\n📋 Generated summaries for ${summaries.length} entities`);
    
    // 6. Save summaries to a file
    const outputFile = `summaries-${now.toISOString().slice(0, 10)}-${now.getHours()}h${now.getMinutes()}m.json`;
    import('fs').then(fs => {
      fs.writeFileSync(outputFile, JSON.stringify({
        success: true,
        summaries,
        metadata: {
          generated_at: now.toISOString(),
          time_range: {
            start: twelveHoursAgo.toISOString(),
            end: now.toISOString()
          },
          total_entities: entities.length,
          entities_with_summaries: summaries.length,
          total_dynamics: dynamics.length
        }
      }, null, 2));
      
      console.log(`📁 Summaries saved to ${outputFile}`);
      
      // 7. Optional: Save summaries to Supabase
      // Uncomment the following lines if you want to save to Supabase
      /*
      for (const summary of summaries) {
        await supabase.from('summaries').insert({
          entity_slug: summary.entity_slug,
          entity_name: summary.entity_name,
          summary: summary.summary,
          item_count: summary.item_count,
          start_time: summary.time_range.start,
          end_time: summary.time_range.end,
          generated_at: summary.generated_at
        });
      }
      console.log('💾 Summaries saved to Supabase');
      */
      
      console.log('🎉 Summary generation completed successfully!');
    });
    
  } catch (error) {
    console.error('❌ Summary generation failed:', error);
    process.exit(1);
  }
}

// Run the script
generate12hSummaries();
