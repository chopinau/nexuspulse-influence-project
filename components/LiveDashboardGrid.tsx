'use client';

import React from 'react';
import useSWR from 'swr';
import { useTranslations, Link } from '@/lib/i18nMock';
import GlowCard from './GlowCard';
import { supabase } from '@/lib/supabaseClient';
import { ENTITIES } from '@/lib/mockData';

export default function LiveDashboardGrid() {
  const t = useTranslations('home');
  const tEntity = useTranslations('home.stats');

  // Fetch Live Data from Supabase
  const { data: configData, error, isLoading } = useSWR('dashboard-config', async () => {
    try {
      console.log('[LiveDashboardGrid] Fetching dashboard data from Supabase...');
      
      // Fetch all config data from Supabase using the centralized client
      const { data, error: supabaseError } = await supabase.from('config').select('*');
      
      if (supabaseError) {
        console.warn('[LiveDashboardGrid] Supabase error, falling back to mock data:', supabaseError.message);
        throw supabaseError;
      }
      
      console.log('[LiveDashboardGrid] Data loaded successfully from Supabase:', data?.length, 'entities found');
      return data;
    } catch (error) {
      console.warn('[LiveDashboardGrid] Fetch Error/Fallback:', error);
      // Fallback to mock data
      return ENTITIES.map(e => ({
        id: e.id,
        slug: e.slug,
        name: e.name,
        type: e.type,
        heatindex: e.heatIndex,
        trend: e.trend,
        stocksymbol: e.stockSymbol,
        tags: e.tags.join(','),
        summary: ''
      }));
    }
  }, {
    refreshInterval: 30000, // Refresh every 30s
    revalidateOnFocus: true,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    onError: (err, key) => {
      console.error('[LiveDashboardGrid] SWR Error:', err, { key });
    }
  });

  // 添加SWR日志记录
  console.log('SWR 数据：', configData);  // 成功时打印数组 
  console.log('SWR 错误：', error);  // 打印错误信息 
  console.log('加载中：', isLoading);

  // Handle Loading State
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
        ))}
      </section>
    );
  }

  // Handle Error State
  if (error) {
    return (
      <section className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl">
        <h2 className="text-lg font-bold text-red-400 mb-2">Dashboard Data Error</h2>
        <p className="text-sm text-gray-400">Failed to load live dashboard data. Please try again later.</p>
        <p className="text-xs text-gray-500 mt-1">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </section>
    );
  }

  // Prepare Display Entities
  const displayEntities = configData?.filter((row: any) => row.name && row.slug) || [];
  
  // Handle No Data State
  if (displayEntities.length === 0) {
    return (
      <section className="text-center p-8 bg-gray-800/50 border border-gray-700/50 rounded-2xl">
        <h2 className="text-lg font-bold text-gray-400 mb-2">No Entities Found</h2>
        <p className="text-sm text-gray-500">No entities configured in Supabase.</p>
        <p className="text-xs text-gray-600 mt-1">Check the Supabase config table or contact support.</p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayEntities.slice(0, 4).map((entity: any, i: number) => {
        // Parse numeric values safely
        const heatIndex = entity.heatindex ? parseInt(entity.heatindex) : 0;
        const trend = entity.trend ? parseFloat(entity.trend) : 0;
        const tags = entity.tags ? entity.tags.split(',').map((tag: string) => tag.trim()) : [];
        const entityType = entity.type || 'person'; // Default to person

        return (
          <Link 
            key={entity.slug} 
            href={entityType === 'person' ? `/person/${entity.slug}` : `/category/${entity.slug}`}
            className="block h-full"
          >
            <GlowCard delay={i * 0.1} className="cursor-pointer h-full group">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs px-2 py-1 rounded border ${entityType === 'person' ? 'border-cyber-purple/50 text-cyber-purple' : 'border-cyber-green/50 text-cyber-green'}`}>
                  {entityType.toUpperCase()}
                </span>
                <div className={`flex items-center gap-1 text-sm font-bold ${trend >= 0 ? 'text-cyber-green' : 'text-red-500'}`}>
                  <span>{trend >= 0 ? '▲' : '▼'}</span>
                  <span>{Math.abs(trend)}%</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-1 group-hover:text-cyber-neon transition-colors">
                {entity.name}
              </h3>
              
              <div className="flex items-end justify-between mt-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{tEntity('heatIndex')}</p>
                  <div className="flex items-baseline gap-1">
                     <p className="text-3xl font-mono text-cyber-neon drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">
                       {heatIndex}
                     </p>
                     <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse mb-1" title="Live Data" />
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                  {tags.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </GlowCard>
          </Link>
        );
      })}
    </section>
  );
}