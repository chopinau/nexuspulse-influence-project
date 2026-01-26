import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { supabaseServer } from '@/lib/supabaseServer';

// Initialize Enhanced RSS Parser with better error handling and timeouts
const parser = new Parser({
  timeout: 10000, // Increased timeout to 10s for better reliability
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1',
    'Accept-Encoding': 'gzip, deflate',
  },
  // Add explicit XML parsing options
  customFields: {
    item: [
      ['dc:creator', 'creator'],
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent', { keepArray: true }],
      ['category', 'categories', { keepArray: true }]
    ]
  }
});

// Utility function to deduplicate items based on ID or content
const deduplicateItems = (items: any[]) => {
  const seen = new Set();
  const result = [];
  
  for (const item of items) {
    // Create a unique key based on ID, link, or content
    const uniqueKey = item.id || item.link || 
      (item.title && item.contentSnippet ? 
        `${item.title.slice(0, 100)}_${item.contentSnippet.slice(0, 100)}` : 
        Math.random().toString());
    
    if (!seen.has(uniqueKey)) {
      seen.add(uniqueKey);
      result.push(item);
    }
  }
  
  return result;
};

// Utility function to clean and standardize RSS item data
const cleanRssItem = (item: any, source: string, feedUrl: string) => {
  // Extract meaningful content
  const content = item.contentEncoded || item.content || item.contentSnippet || '';
  
  // Clean HTML tags from content
  const cleanContent = content.replace(/<[^>]*>/g, '').trim().slice(0, 200);
  
  // Standardize date handling
  let pubDate = item.isoDate || item.pubDate || new Date().toISOString();
  
  // Try to parse invalid dates
  try {
    const parsedDate = new Date(pubDate);
    if (isNaN(parsedDate.getTime())) {
      // Fallback to current date if parsing fails
      pubDate = new Date().toISOString();
    } else {
      // Ensure ISO format
      pubDate = parsedDate.toISOString();
    }
  } catch (e) {
    pubDate = new Date().toISOString();
  }
  
  // Standardize categories/tags
  let categories = [];
  if (item.categories) {
    categories = Array.isArray(item.categories) ? item.categories : [item.categories];
  } else if (item.category) {
    categories = Array.isArray(item.category) ? item.category : [item.category];
  }
  
  return {
    id: item.guid || item.link || Math.random().toString(),
    title: item.title || 'Untitled Article',
    link: item.link || '#',
    pubDate,
    contentSnippet: cleanContent,
    source,
    type: 'rss',
    categories: categories.map((cat: string) => cat.trim()).filter(Boolean),
    author: item.creator || item.author || '',
    _feedUrl: feedUrl,
    _originalItem: item // Keep original for debugging
  };
};

// Detailed error response structure
interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
  context?: string;
  timestamp: string;
}

// Enhanced error handler
const createErrorResponse = (message: string, code: string, status: number, details?: string, context?: string) => {
  const errorResponse: ErrorResponse = {
    error: message,
    code,
    details,
    context,
    timestamp: new Date().toISOString()
  };
  return NextResponse.json(errorResponse, { status });
};

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  console.log(`[API] Starting dynamics fetch for slug: ${slug}`);

  if (!slug) {
    return createErrorResponse('Missing required parameter', 'INVALID_REQUEST', 400, 'Slug parameter is required', 'Request Validation');
  }

  try {
    // 1. Fetch Config from Supabase
    const context = 'Supabase Config Fetch';
    console.log(`[API] [${context}] Fetching config data from Supabase...`);
    
    // Use the centralized server-side Supabase client
    const { data: rows, error: supabaseError } = await supabaseServer.from('config').select('*');
    
    if (supabaseError) {
      const errorMsg = `Supabase fetch failed: ${supabaseError.message}`;
      console.error(`[API] [${context}] ${errorMsg}`);
      return createErrorResponse(
        'Failed to fetch configuration data',
        'SUPABASE_FETCH_FAILED',
        500,
        errorMsg,
        context
      );
    }
    
    // Log available headers for debugging
    if (rows && rows.length > 0) {
      const availableHeaders = Object.keys(rows[0]).sort();
      console.log(`[API] [${context}] Available Supabase Fields:`, availableHeaders);
    }

    // 2. Find the Entity
    const entityContext = 'Entity Lookup';
    const entityRow = rows?.find((r: any) => r.slug === slug);

    if (!entityRow) {
      const errorMsg = `Entity not found for slug: ${slug}`;
      console.warn(`[API] [${entityContext}] ${errorMsg}`);
      return createErrorResponse(
        'Entity configuration not found',
        'ENTITY_NOT_FOUND',
        404,
        errorMsg,
        entityContext
      );
    }

    console.log(`[API] [${entityContext}] Found entity: ${entityRow.name}`);

    // 3. Extract Data & URLs
    const rssContext = 'RSS Feed Extraction';
    const feedsToFetch: { url: string, source: string }[] = [];
    
    // Check all variations with clear logging
    const rss1 = entityRow.mainrss || entityRow.rss || entityRow.feed || entityRow.url;
    const rss2 = entityRow.googlenewsrss || entityRow.googlerss || entityRow.secondaryrss;

    if (rss1 && rss1.startsWith('http')) {
      feedsToFetch.push({ url: rss1, source: 'Primary Feed' });
      console.log(`[API] [${rssContext}] Found Primary RSS: ${rss1}`);
    } else {
      console.log(`[API] [${rssContext}] No valid Primary RSS found. Checked fields: mainrss, rss, feed, url`);
      console.log(`[API] [${rssContext}] Values checked: mainrss="${rss1}"`);
    }
    
    if (rss2 && rss2.startsWith('http')) {
      feedsToFetch.push({ url: rss2, source: 'News Feed' });
      console.log(`[API] [${rssContext}] Found News RSS: ${rss2}`);
    } else {
      console.log(`[API] [${rssContext}] No valid News RSS found. Checked fields: googlenewsrss, googlerss, secondaryrss`);
      console.log(`[API] [${rssContext}] Values checked: googlenewsrss="${rss2}"`);
    }

    console.log(`[API] [${rssContext}] Total feeds to fetch: ${feedsToFetch.length}`);

    // 4. Manual Summary
    const manualContext = 'Manual Summary';
    const items = [];
    if (entityRow.summary && entityRow.summary.length > 5) {
      items.push({
        id: 'manual-briefing',
        title: 'Analyst Briefing: Market Update',
        link: '#',
        pubDate: new Date().toISOString(),
        contentSnippet: entityRow.summary,
        source: 'NexusPulse Analyst',
        type: 'manual',
        sentiment: entityRow.sentiment || 'neutral'
      });
      console.log(`[API] [${manualContext}] Added manual summary: ${entityRow.summary.slice(0, 50)}...`);
    } else {
      console.log(`[API] [${manualContext}] No manual summary available`);
    }

    // 5. Fetch RSS Feeds with optimized parsing
    const rssFetchContext = 'RSS Feed Parsing';
    const feedPromises = feedsToFetch.map(async (feed) => {
      try {
        console.log(`[API] [${rssFetchContext}] Parsing RSS: ${feed.url}`);
        const feedData = await parser.parseURL(feed.url);
        
        // Clean and standardize each RSS item
        const cleanedItems = feedData.items.map((item) => 
          cleanRssItem(item, feed.source, feed.url)
        );
        
        console.log(`[API] [${rssFetchContext}] Success: ${feed.url} (${cleanedItems.length} items)`);
        return cleanedItems;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[API] [${rssFetchContext}] Failed to fetch RSS: ${feed.url}`, {
          error: errorMsg,
          errorType: err instanceof Error ? err.name : 'Unknown Error',
          feedUrl: feed.url
        });
        
        // Return empty array instead of throwing to allow other feeds to succeed
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    let rawRssItems = results.flat();
    
    console.log(`[API] [${rssFetchContext}] Total RSS items fetched: ${rawRssItems.length}`);
    
    // 7. Deduplicate items to avoid duplicate content
    const deduplicatedItems = deduplicateItems(rawRssItems);
    console.log(`[API] [${rssFetchContext}] After deduplication: ${deduplicatedItems.length} items`);

    // 8. Merge & Sort with enhanced logic
    const mergeContext = 'Data Merging & Sorting';
    const allItems = [...items, ...deduplicatedItems];
    
    allItems.sort((a, b) => {
      // Manual items always come first
      if (a.type === 'manual') return -1;
      if (b.type === 'manual') return 1;
      
      // Sort by date, with fallback for invalid dates
      try {
        const dateA = new Date(b.pubDate).getTime();
        const dateB = new Date(a.pubDate).getTime();
        
        // If both dates are valid, sort by newest first
        if (!isNaN(dateA) && !isNaN(dateB)) {
          return dateA - dateB;
        }
        
        // If only one date is valid, prioritize it
        if (!isNaN(dateA)) return -1;
        if (!isNaN(dateB)) return 1;
        
        // If both dates are invalid, keep original order
        return 0;
      } catch (e) {
        console.warn(`[API] [${mergeContext}] Invalid date encountered:`, {
          pubDateA: b.pubDate,
          pubDateB: a.pubDate,
          error: e instanceof Error ? e.message : 'Unknown error'
        });
        return 0;
      }
    });
    
    // Filter out items with empty titles or content (edge case handling)
    const filteredItems = allItems.filter(item => 
      item.title && item.title !== 'Untitled Article' && 
      item.contentSnippet && item.contentSnippet.length > 10
    );
    
    console.log(`[API] [${mergeContext}] Final filtered items: ${filteredItems.length} items`);

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`[API] Request completed successfully for slug: ${slug}`, {
      finalItems: filteredItems.length,
      manualItems: items.length,
      rssFeeds: feedsToFetch.length,
      durationMs: duration
    });

    return NextResponse.json({
      entity: {
        name: entityRow.name,
        slug: entityRow.slug,
      },
      items: filteredItems.slice(0, 20),
      metadata: {
        totalItems: filteredItems.length,
        rawItems: allItems.length,
        deduplicatedItems: deduplicatedItems.length,
        durationMs: duration,
        timestamp: new Date().toISOString(),
        rssFeedsProcessed: feedsToFetch.length,
        rssFeedsFailed: feedPromises.length - results.filter(r => r.length > 0).length
      }
    });

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('[API] Internal Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown Error',
      slug,
      durationMs: duration,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return createErrorResponse(
      'Internal Server Error',
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Unknown error',
      'Request Processing'
    );
  }
}