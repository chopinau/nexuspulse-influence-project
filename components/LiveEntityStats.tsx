'use client';

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from '@/lib/i18nMock';
import { supabase } from '@/lib/supabaseClient';

interface LiveEntityStatsProps {
  slug: string;
  initialHeat: number;
  initialTrend: number;
}

export default function LiveEntityStats({ slug, initialHeat, initialTrend }: LiveEntityStatsProps) {
  const t = useTranslations('entity');
  
  // Fetch stats directly from Supabase config table
  const { data: liveRow, isLoading } = useSWR(['entity-stats', slug], async () => {
    try {
        const { data, error } = await supabase
            .from('config')
            .select('heatindex, trend')
            .eq('slug', slug)
            .single();
        
        if (error) throw error;
        return data;
    } catch (e) {
        console.warn('[LiveEntityStats] Failed to fetch stats, using initial values:', e);
        return null;
    }
  }, { 
    refreshInterval: 60000, // 1 min refresh
    revalidateOnFocus: true 
  });

  const heatIndex = liveRow?.heatindex ? parseInt(liveRow.heatindex) : initialHeat;
  const trend = liveRow?.trend ? parseFloat(liveRow.trend) : initialTrend;
  
  const isPositive = trend >= 0;

  return (
    <div className="flex gap-8 text-right bg-cyber-panel backdrop-blur-md p-6 rounded-2xl border border-white/5 flex-shrink-0 relative overflow-hidden">
      {liveRow && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
          </span>
          <span className="text-[10px] text-cyber-green font-mono uppercase">Live</span>
        </div>
      )}

      <div>
        <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">{t('heat')}</p>
        <div className="text-5xl font-mono text-cyber-neon drop-shadow-[0_0_15px_rgba(0,243,255,0.6)]">
          {heatIndex}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">{t('trend')}</p>
        <div className={`text-2xl font-bold mt-3 ${isPositive ? 'text-cyber-green' : 'text-red-500'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      </div>
    </div>
  );
}
