'use client';

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from '@/lib/i18nMock';
import GlowCard from './GlowCard';
import { supabase } from '@/lib/supabaseClient';

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
      const items = Array.from(xml.querySelectorAll('item, entry')).slice(0, 2);

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
          title,
          url,
          timestamp: isoDate,
          summary: (item.querySelector('description, summary, content')?.textContent || '').replace(/<[^>]*>?/gm, '').substring(0, 80) + '...',
          source: sourceName,
          type: 'rss'
        };
      });
    } catch { continue; }
  }
  return [];
};

export default function LiveGlobalFeed() {
  const t = useTranslations('home.dynamics');

  // Fetch config data from Supabase to get RSS URLs
  const { data: configRows } = useSWR('global-config', async () => {
    try {
      const { data, error } = await supabase.from('config').select('*');
      if (error) {
        console.warn('[LiveGlobalFeed] Failed to fetch config:', error);
        return [];
      }
      console.log('[LiveGlobalFeed] Fetched', data?.length, 'config rows');
      return data;
    } catch (err) {
      console.warn('[LiveGlobalFeed] Error fetching config:', err);
      return [];
    }
  }, {
    refreshInterval: 120000,
    revalidateOnFocus: true
  });

  // Fetch global dynamics directly from Supabase
  const { data: dynamics, isLoading: isDynamicsLoading, mutate: mutateDynamics } = useSWR('global-dynamics', async () => {
    try {
      const { data, error } = await supabase
        .from('dynamics')
        .select('*')
        .order('pub_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      console.log('[LiveGlobalFeed] Fetched', data?.length, 'items from dynamics table');
      return data;
    } catch (err) {
      console.warn('[LiveGlobalFeed] Failed to fetch dynamics:', err);
      return [];
    }
  }, {
    refreshInterval: 60000,
    revalidateOnFocus: true
  });

  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRssLoading, setIsRssLoading] = useState(false);

  // Fetch and combine all data sources
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setIsRssLoading(true);
      
      let allItems: any[] = [];
      
      // 1. Add dynamics data
      if (dynamics) {
        const mappedDynamics = dynamics.map((item: any) => ({
          id: item.id,
          title: item.title,
          url: item.url || item.link || '#',
          timestamp: item.pub_date || item.created_at || new Date().toISOString(),
          summary: item.summary || item.content_snippet || '',
          source: item.source || 'NexusPulse',
          type: 'signal', // Use 'signal' style for DB items
          sentiment: item.sentiment || 'neutral'
        }));
        allItems = [...allItems, ...mappedDynamics];
      }
      
      // 2. Fetch RSS data from all config rows
      if (configRows && configRows.length > 0) {
        const rssPromises = [];
        
        configRows.forEach((config: any) => {
          // Check various RSS URL fields
          const rssFields = [
            config.rss,
            config.main_rss,
            config.google_news_rss,
            config.googlenewsrss,
            config.mainrss
          ];
          
          rssFields.forEach((rssUrl) => {
            if (rssUrl) {
              rssPromises.push(fetchRSS(rssUrl, config.name || 'Unknown'));
            }
          });
        });
        
        if (rssPromises.length > 0) {
          const rssResults = await Promise.all(rssPromises);
          const rssItems = rssResults.flat();
          allItems = [...allItems, ...rssItems];
        }
      }
      
      // 3. Sort all items by date (newest first)
      allItems.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });
      
      // 4. Limit to 20 items
      allItems = allItems.slice(0, 20);
      
      console.log('[LiveGlobalFeed] Combined', allItems.length, 'items from all sources');
      setItems(allItems);
      setIsLoading(false);
      setIsRssLoading(false);
    };
    
    // Call the async function
    fetchAllData();
  }, [dynamics, configRows, isDynamicsLoading]);

  // Add mutate functions for manual refresh
  const { mutate: mutateConfig } = useSWR('global-config');
  
  const handleManualRefresh = async () => {
    console.log('[LiveGlobalFeed] Manual refresh triggered');
    setIsLoading(true);
    setIsRssLoading(true);
    
    // Refresh both config and dynamics data
    await Promise.all([
      mutateConfig(),
      mutateDynamics()
    ]);
    
    // Wait a bit to ensure data is processed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsLoading(false);
    setIsRssLoading(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-lg font-bold text-gray-200">{t('title')}</h2>
        <div className="flex items-center gap-2">
          {(isLoading || isDynamicsLoading) && (
            <span className="text-xs text-cyber-neon animate-pulse">Syncing...</span>
          )}
          <button 
            onClick={handleManualRefresh} 
            className="text-xs text-cyber-neon hover:underline flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {items.length > 0 ? (
          items.map((item, i) => (
            <GlowCard key={item.id} className={`!p-4 ${item.type === 'manual' ? 'border-cyber-neon/40 bg-cyber-neon/5' : ''}`} delay={i * 0.05}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-gray-500 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.type === 'manual' ? 'border-cyber-neon text-cyber-neon font-bold shadow-[0_0_5px_rgba(0,243,255,0.3)]' : item.type === 'signal' ? 'border-cyber-green text-cyber-green font-bold' : 'border-cyber-purple/30 text-cyber-purple'}`}>
                  {item.type === 'manual' ? 'BRIEFING' : item.type === 'signal' ? 'SIGNAL' : item.source}
                </span>
              </div>
              
              <h4 className="text-sm font-bold text-gray-100 mb-1 leading-tight hover:text-cyber-neon cursor-pointer">
                {item.url !== '#' ? (
                  <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
                ) : (
                  item.title
                )}
              </h4>
              
              <p className="text-xs text-gray-400 line-clamp-3 mb-2 leading-relaxed">
                {item.summary}
              </p>
              
              {item.url !== '#' && (
                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span>Via {item.type === 'signal' ? 'Database' : 'RSS'}</span>
                  <a href={item.url} target="_blank" rel="noreferrer" className="hover:text-cyber-neon">Read Source ↗</a>
                </div>
              )}
            </GlowCard>
          ))
        ) : (
          !isLoading && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Waiting for satellite uplink... <br/>
              <span className="text-xs opacity-50">(Check Sheet Config)</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}