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

export default function LiveGlobalFeed({ topic }: { topic?: string }) {
  const t = useTranslations('home.dynamics');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Replaces all MOCK data with Real/AI data from Backend
  useEffect(() => {
    const fetchNews = async () => {
      if (!topic) return;
      
      setIsLoading(true);
      try {
          // Use the news endpoint (to be implemented)
          // For now, we simulate the fetch call to the Python backend's news engine
          // In a real scenario, this would call /api/news?topic={topic}
          
          // Since we are refactoring python_backend/news_engine.py, we need a way to get data.
          // For this immediate task, we will assume the backend provides an endpoint.
          // BUT, since we don't have the route yet, let's just clear the mocks first as requested.
          
          // Placeholder for real fetch
          // const res = await fetch(`/api/news?topic=${encodeURIComponent(topic)}`);
          // const data = await res.json();
          // setItems(data);
          
          setItems([]); // Clear mocks for now until backend connects
          
      } catch (e) {
          console.error("News fetch failed", e);
      } finally {
          setIsLoading(false);
      }
    };
    
    fetchNews();
  }, [topic]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-lg font-bold text-gray-200">{t('title')}</h2>
        {isLoading && <span className="text-xs text-cyan-400 animate-pulse">Scanning...</span>}
      </div>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {items.length > 0 ? (
          items.map((item, i) => (
            <GlowCard key={i} className="!p-4" delay={i * 0.05}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-gray-500 font-mono">
                  LIVE
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.sentiment === 'Bearish' ? 'border-red-500 text-red-400' : 'border-cyan-500 text-cyan-400'}`}>
                  {item.source}
                </span>
              </div>
              <h4 className="text-sm font-bold text-gray-100 mb-1 leading-tight hover:text-cyan-400 cursor-pointer">
                {item.title}
              </h4>
            </GlowCard>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
             {topic ? "Scanning Global Feeds..." : "Waiting for Target..."}
          </div>
        )}
      </div>
    </div>
  );
}