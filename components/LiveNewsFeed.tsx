'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useTranslations } from '@/lib/i18nMock';
import GlowCard from './GlowCard';
import { DynamicUpdate } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { DYNAMICS, ENTITIES } from '@/lib/mockData';

// Helper function to fetch and parse RSS feeds
const fetchRSS = async (rssUrl: string, sourceName: string) => {
  if (!rssUrl || rssUrl === '#' || !rssUrl.startsWith('http')) return [];
  
  const cb = `&_t=${Date.now()}`;
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}${cb}`,
    `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`
  ];

  for (const proxyUrl of proxies) {
    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) continue;
      const text = await res.text();
      if (!text.includes('<rss') && !text.includes('<feed') && !text.includes('<item') && !text.includes('<entry')) continue;

      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const items = Array.from(xml.querySelectorAll('item, entry')).slice(0, 10);

      if (items.length === 0) continue;

      return items.map((item) => {
        const title = item.querySelector('title')?.textContent || 'No Title';
        const linkNode = item.querySelector('link');
        const url = linkNode?.textContent || linkNode?.getAttribute('href') || '#';
        
        // Get raw date string from RSS feed
        const rawDate = item.querySelector('pubDate, published, updated')?.textContent;
        
        // Parse date with fallback for invalid formats
        const parseRssDate = (dateStr: string | null | undefined) => {
          if (!dateStr) return new Date();
          
          // Try different parsing strategies
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) return date;
          
          // Try parsing with different formats
          const parsed = Date.parse(dateStr);
          if (!isNaN(parsed)) return new Date(parsed);
          
          // Fallback to current date if all parsing fails
          return new Date();
        };
        
        const date = parseRssDate(rawDate);
        const isoDate = date.toISOString();
        
        return {
          id: `rss-${sourceName}-${Math.random().toString(36).substr(2, 9)}`,
          entityId: '', // This will be populated later if needed
          entity_slug: '', // This will be populated later
          title,
          url,
          timestamp: isoDate,
          pub_date: isoDate,
          summary: (item.querySelector('description, summary, content')?.textContent || '').replace(/<[^>]*>?/gm, '').substring(0, 120) + '...',
          source: sourceName,
          type: 'rss',
          sentiment: 'neutral' // Default sentiment
        };
      });
    } catch { continue; }
  }
  return [];
};

interface LiveNewsFeedProps {
  slug: string;
  name: string; // Fallback display name
  initialItems?: DynamicUpdate[];
  showSentiment?: boolean; // Toggle to show sentiment badge instead of name
  filterSlug?: string; // Optional slug to filter by (redundant if using slug prop for data fetching, but good for clarity)
}

export default function LiveNewsFeed({ slug, name, initialItems = [], showSentiment = false, filterSlug }: LiveNewsFeedProps) {
  const t = useTranslations('entity');
  const common = useTranslations('common');
  
  // State for realtime updates combining SWR data with realtime inserts and RSS feeds
  const [displayItems, setDisplayItems] = useState<DynamicUpdate[]>([]);
  const [source, setSource] = useState<'offline' | 'live' | 'static' | 'mock'>('offline');
  const [rssItems, setRssItems] = useState<any[]>([]);
  const [isRssLoading, setIsRssLoading] = useState(false);
  const [rssError, setRssError] = useState<string | null>(null);

  // Fetch entity config from Supabase to get RSS URL
  const { data: entityConfig, isLoading: isConfigLoading } = useSWR(
    ['entity-config', slug],
    async () => {
      try {
        const { data, error } = await supabase
          .from('config')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (error) {
          throw error;
        }
        
        console.log('[LiveNewsFeed] Entity config fetched:', data);
        return data;
      } catch (err) {
        console.warn('[LiveNewsFeed] Supabase config error, falling back to mock data:', err);
        return ENTITIES.find(e => e.slug === slug) || null;
      }
    },
    {
      refreshInterval: 120000, // 2 minutes refresh for config
      revalidateOnFocus: true
    }
  );

  // Fetch RSS feeds on client side with multiple RSS field support
  const fetchAndUpdateRSS = async () => {
    if (!entityConfig) return;
    
    setIsRssLoading(true);
    setRssError(null);
    
    try {
      console.log(`[LiveNewsFeed] Fetching RSS for ${slug}`);
      
      // Check multiple RSS URL fields (same as LiveGlobalFeed)
      const rssFields = [
        entityConfig.rss,
        entityConfig.main_rss,
        entityConfig.google_news_rss,
        entityConfig.googlenewsrss,
        entityConfig.mainrss
      ];
      
      const rssPromises = [];
      for (const rssUrl of rssFields) {
        if (rssUrl) {
          rssPromises.push(fetchRSS(rssUrl, entityConfig.name || name));
        }
      }
      
      if (rssPromises.length > 0) {
        const rssResults = await Promise.all(rssPromises);
        const allRssItems = rssResults.flat();
        
        // Remove duplicate items based on URL and title
        const uniqueRssItems = allRssItems.filter((item, index, self) => 
          index === self.findIndex((t) => (t.url === item.url && t.title === item.title))
        );
        
        console.log(`[LiveNewsFeed] Fetched ${uniqueRssItems.length} unique RSS items for ${slug}`);
        setRssItems(uniqueRssItems);
        
        // If we got RSS items, set source to live
        if (uniqueRssItems.length > 0) {
          setSource('live');
        }
      } else {
        console.log(`[LiveNewsFeed] No RSS URLs found for ${slug}`);
      }
    } catch (error) {
      console.error(`[LiveNewsFeed] Error fetching RSS for ${slug}:`, error);
      setRssError('Failed to fetch RSS feeds');
    } finally {
      setIsRssLoading(false);
    }
  };

  // Fetch RSS feeds with regular refresh
  useEffect(() => {
    fetchAndUpdateRSS();
    
    // Refresh RSS every 5 minutes
    const rssRefreshInterval = setInterval(() => {
      fetchAndUpdateRSS();
    }, 300000); // 5 minutes
    
    return () => clearInterval(rssRefreshInterval);
  }, [entityConfig, slug, name]);

  // Fetch dynamics data directly from Supabase using SWR
  const { data: dynamicsItems, error, isLoading, mutate } = useSWR(
    ['dynamics', slug],
    async () => {
      try {
        const { data, error } = await supabase
          .from('dynamics')
          .select('*')
          .eq('entity_slug', slug)
          .order('pub_date', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        console.log('[LiveNewsFeed] Dynamics data fetched:', data?.length, 'items');
        return data;
      } catch (err) {
        console.warn('[LiveNewsFeed] Supabase dynamics error, falling back to mock data:', err);
        // Find entity ID for the slug to filter mock dynamics
        const entity = ENTITIES.find(e => e.slug === slug);
        if (entity) {
          return DYNAMICS.filter(d => d.entityId === entity.id).map(d => ({
            id: d.id,
            entity_slug: slug,
            title: d.title,
            summary: d.summary,
            source: d.source,
            pub_date: d.timestamp,
            sentiment: d.sentiment,
            url: d.url,
            created_at: d.timestamp
          }));
        }
        return [];
      }
    },
    {
      refreshInterval: 60000, // Sync with global feed (1 min)
      revalidateOnFocus: true
    }
  );

  // Update display items by combining dynamics and RSS data
  useEffect(() => {
    // Priority: DB Dynamics -> RSS
    const allItems = [...(dynamicsItems || [])];
    
    // Add RSS items only if they are not already in DB (optional de-duplication could go here)
    // For now, we append RSS items that might not be in DB yet
    // But since the requirement is "Unified Source", we primarily rely on DB.
    // We keep RSS as a fallback or supplementary source if DB is empty, or just mix them.
    // Given the user instruction "Unified Data Source", we should prioritize DB.
    // If RSS fetching is active client-side, we add them.
    if (rssItems.length > 0) {
       allItems.push(...rssItems);
    }
    
    if (allItems.length > 0) {
      // Sort all items by date (newest first)
      const sortedItems = allItems.sort((a, b) => {
        // Standardize date fields for sorting
        const dateAStr = a.pub_date || a.timestamp || a.created_at || a.pubDate;
        const dateBStr = b.pub_date || b.timestamp || b.created_at || b.pubDate;
        
        const dateA = dateAStr ? new Date(dateAStr).getTime() : 0;
        const dateB = dateBStr ? new Date(dateBStr).getTime() : 0;
        return dateB - dateA;
      });
      
      setDisplayItems(sortedItems.slice(0, 20)); // Limit to 20 items
      setSource('live');
    } else if (initialItems.length > 0) {
      setDisplayItems(initialItems);
      setSource('static');
    } else {
      setDisplayItems([]);
      setSource('offline');
    }
  }, [dynamicsItems, rssItems, initialItems]);

  // Supabase Realtime Subscription for new dynamics
  useEffect(() => {
    const channel = supabase
      .channel(`dynamics_realtime_${slug}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dynamics',
          filter: `entity_slug=eq.${slug}`,
        },
        (payload) => {
          console.log('[LiveNewsFeed] Realtime update received:', payload.new);
          setDisplayItems((prev) => [payload.new as DynamicUpdate, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      mutate(), // Trigger SWR re-fetch
      fetchAndUpdateRSS() // Refresh RSS feeds immediately
    ]);
    setIsRefreshing(false);
  };

  // Sentiment Helper
  const getSentimentStyle = (sentiment: string, type: string) => {
    if (type === 'manual') return 'border-cyber-neon text-cyber-neon bg-cyber-neon/10 shadow-[0_0_8px_rgba(0,243,255,0.3)]';
    
    // Simple keyword sentiment analysis for RSS items if not provided
    const s = sentiment?.toLowerCase() || 'neutral';
    if (s.includes('positive') || s.includes('bull')) return 'border-cyber-green/50 text-cyber-green';
    if (s.includes('negative') || s.includes('bear')) return 'border-red-500/50 text-red-400';
    return 'border-gray-500/30 text-gray-400';
  };

  return (
    <div className="space-y-4">
      {/* Header with Refresh Control */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-200">{t('news')}</h2>
          {source === 'live' && (
             <span className="flex items-center gap-1.5 bg-cyber-green/10 px-2 py-0.5 rounded text-[10px] text-cyber-green border border-cyber-green/20">
               <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
               LIVE
             </span>
          )}
        </div>
        
        <button 
          onClick={handleManualRefresh}
          disabled={isLoading || isRefreshing}
          className="text-gray-400 hover:text-cyber-neon transition-colors p-1 rounded-full hover:bg-white/5 disabled:opacity-50"
          title="Refresh Signals"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className={`w-4 h-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && !dynamicsItems && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
             <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      )}

      {/* Feed Content */}
      <div className="space-y-4">
        {displayItems.length > 0 ? (
          displayItems.map((item: any, i: number) => {
            // Safe date formatting
            let dateStr = '';
            try {
              // Standardize date field priority: pub_date (DB) -> timestamp (generic) -> created_at (DB) -> pubDate (RSS)
              const rawDate = item.pub_date || item.timestamp || item.created_at || item.pubDate;
              if (rawDate) {
                 dateStr = new Date(rawDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              } else {
                 dateStr = 'Just Now';
              }
            } catch (e) { dateStr = 'Just Now'; }

            return (
              <GlowCard key={item.id || i} className={`!p-4 group ${item.type === 'manual' ? 'border-cyber-neon/30 bg-cyber-neon/5' : ''}`} delay={i * 0.05}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-gray-500 font-mono">
                    {dateStr}
                  </span>
                  {showSentiment ? (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${getSentimentStyle(item.sentiment, item.type)}`}>
                       {item.sentiment || 'NEUTRAL'}
                    </span>
                  ) : (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${getSentimentStyle(item.sentiment, item.type)}`}>
                      {item.type === 'manual' ? 'Analyst Brief' : 'Signal'}
                    </span>
                  )}
                </div>
                
                <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                  <a 
                    href={item.link || item.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`transition-colors ${(item.link && item.link !== '#') ? 'hover:text-cyber-neon' : 'cursor-default pointer-events-none'}`}
                  >
                    {item.title}
                  </a>
                </h4>
                
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                  {item.summary || item.contentSnippet}
                </p>
                
                {(item.link && item.link !== '#') && (
                  <div className="mt-3 flex justify-between items-center text-[10px] text-gray-600 border-t border-white/5 pt-2">
                     <span className="uppercase tracking-wider">{item.source || 'RSS'}</span>
                     <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-cyber-neon/70 hover:text-cyber-neon transition-colors">
                       READ FULL <span className="text-xs">↗</span>
                     </a>
                  </div>
                )}
              </GlowCard>
            );
          })
        ) : (
          !isLoading && (
            <div className="p-8 text-center text-gray-500 border border-white/5 rounded-2xl">
              <p>No active signals detected for {name}.</p>
              <p className="text-xs mt-2 opacity-50">System awaiting new data stream.</p>
            </div>
          )
        )}
      </div>
      
      {/* Error State */}
      {error && (
        <div className="text-xs text-red-400 text-center bg-red-500/10 p-2 rounded border border-red-500/20">
          Connection Interrupted: Unable to sync with data feeds.
        </div>
      )}
    </div>
  );
}