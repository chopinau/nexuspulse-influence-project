import React, { useState, useEffect } from 'react';
import { useTranslations, Link } from '@/lib/i18nMock';
import { ENTITIES } from '@/lib/mockData';
import GlowCard from '@/components/GlowCard';
import NeonChart from '@/components/NeonChart';
import StockCard from '@/components/StockCard';
import LiveNewsFeed from '@/components/LiveNewsFeed';
import { supabase } from '@/lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EntityDetailProps {
  slug: string;
}

export default function EntityDetail({ slug }: EntityDetailProps) {
  const t = useTranslations('entity');
  const common = useTranslations('common');
  
  // State for dynamic entity data from Supabase
  const [entity, setEntity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch entity data from Supabase
  useEffect(() => {
    const fetchEntityData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('[EntityDetail] Fetching data from Supabase...');
        
        // Fetch config data
        const { data: configData, error: supabaseError } = await supabase.from('config').select('*');
        
        if (supabaseError) {
          if (supabaseError.message.includes('Could not find the table') || supabaseError.message.includes('schema cache')) {
            console.warn('[EntityDetail] Config table not accessible. Falling back to mock data.');
          } else {
             throw new Error(`Supabase error: ${supabaseError.message}`);
          }
        }

        // Fetch latest analyst report
        const { data: reportData } = await supabase
          .from('analyst_reports')
          .select('summary, created_at')
          .eq('entity_slug', slug)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        console.log('[EntityDetail] Supabase data fetched:', configData?.length, 'rows');
        
        // Find the entity by slug
        const entityRow = configData?.find((row: any) => row.slug === slug);
        
        if (entityRow) {
          // Create dynamic entity object with summary from Supabase
          const dynamicEntity = {
            id: entityRow.id || slug,
            slug: entityRow.slug,
            name: entityRow.name,
            type: entityRow.type || 'person',
            heatIndex: entityRow.heatindex ? parseInt(entityRow.heatindex) : 0,
            trend: entityRow.trend ? parseFloat(entityRow.trend) : 0,
            stockSymbol: entityRow.stocksymbol || '',
            tags: entityRow.tags ? entityRow.tags.split(',').map((tag: string) => tag.trim()) : [],
            // Prioritize report summary, fallback to config summary
            summary: reportData?.summary || entityRow.summary || '',
            lastUpdated: reportData?.created_at || entityRow.created_at
          };
          
          console.log('[EntityDetail] Dynamic entity fetched:', dynamicEntity);
          setEntity(dynamicEntity);
        } else {
          // Fallback to mock data if not found in Supabase
          console.log('[EntityDetail] Entity not found in Supabase, falling back to mock data');
          const mockEntity = ENTITIES.find(e => e.slug === slug);
          setEntity(mockEntity || null);
        }
      } catch (err) {
        console.error('[EntityDetail] Error fetching entity data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fallback to mock data on error
        const mockEntity = ENTITIES.find(e => e.slug === slug);
        setEntity(mockEntity || null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEntityData();

    // Subscribe to real-time updates for analyst_reports
    const channel = supabase
      .channel(`public:analyst_reports:slug=${slug}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analyst_reports',
          filter: `entity_slug=eq.${slug}`
        },
        (payload) => {
          console.log('[EntityDetail] Real-time update received:', payload);
          const newReport = payload.new as any;
          setEntity((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              summary: newReport.summary,
              lastUpdated: newReport.created_at
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-neon mb-4"></div>
        <p className="text-cyber-neon">Loading entity data...</p>
      </div>
    );
  }
  
  if (error) {
    console.error('[EntityDetail] Error:', error);
  }

  if (!entity) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h1 className="text-4xl font-bold text-red-500">Entity Not Found</h1>
        <Link href="/" className="mt-4 text-cyber-neon hover:underline">{t('back')}</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-cyber-neon transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-cyber-neon">{entity.name}</span>
      </div>

      {/* Hero Header */}
      <div className="relative">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-cyber-neon/10 rounded-full blur-[100px] -z-10" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex-1">
             <span className={`text-xs font-mono px-2 py-1 rounded border mb-2 inline-block ${entity.type === 'person' ? 'border-cyber-purple/50 text-cyber-purple' : 'border-cyber-green/50 text-cyber-green'}`}>
                {entity.type.toUpperCase()}
              </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
              {entity.name}
            </h1>
            <div className="flex gap-2 mt-4">
              {entity.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm hover:border-cyber-neon/50 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* New Stock Card Integration */}
            {entity.stockSymbol && (
              <div className="w-full sm:w-64">
                <StockCard symbol={entity.stockSymbol} />
              </div>
            )}

            <div className="flex gap-8 text-right bg-cyber-panel backdrop-blur-md p-6 rounded-2xl border border-white/5 flex-shrink-0">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">{t('heat')}</p>
                <div className="text-5xl font-mono text-cyber-neon drop-shadow-[0_0_15px_rgba(0,243,255,0.6)]">
                  {entity.heatIndex}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">{t('trend')}</p>
                <div className={`text-2xl font-bold mt-3 ${entity.trend >= 0 ? 'text-cyber-green' : 'text-red-500'}`}>
                  {entity.trend >= 0 ? '▲' : '▼'} {Math.abs(entity.trend)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      <GlowCard className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-purple/10 blur-[60px] -z-10" />
        
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-cyber-neon rounded-full animate-pulse" />
          <h2 className="text-xl font-bold text-white">AI Analyst Summary</h2>
        </div>
        
        <div className="prose prose-invert max-w-none">
          {/* AI Summary Display */}
          {entity.summary ? (
            <div className="text-gray-300 leading-relaxed text-sm">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  strong: ({node, ...props}) => <strong className="text-cyber-neon font-bold" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-none space-y-2 pl-0 my-4" {...props} />,
                  li: ({node, ...props}) => <li className="relative pl-4 before:content-['>'] before:absolute before:left-0 before:text-cyber-purple/70" {...props} />,
                  h1: ({node, ...props}) => <h3 className="text-lg font-bold text-white mt-4 mb-2" {...props} />,
                  h2: ({node, ...props}) => <h4 className="text-base font-bold text-white mt-3 mb-2" {...props} />,
                  h3: ({node, ...props}) => <h5 className="text-sm font-bold text-cyber-neon/80 mt-2 mb-1 uppercase tracking-wider" {...props} />,
                  p: ({node, ...props}) => <p className="my-2" {...props} />,
                }}
              >
                {entity.summary}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No AI summary available for this entity yet.</p>
              <p className="text-xs mt-2">AI analysis will be generated once data is available.</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="uppercase tracking-wider">Last updated</span>
            <span className="font-mono">{new Date(entity.lastUpdated || Date.now()).toLocaleString()}</span>
          </div>
        </div>
      </GlowCard>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Chart */}
        <div className="lg:col-span-2">
           <GlowCard className="h-full">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
               <span className="w-2 h-2 bg-cyber-purple rounded-full animate-pulse" />
               Influence Trajectory
            </h2>
            <NeonChart />
           </GlowCard>
        </div>

        {/* Right: Specific News (Live from API) */}
        <div>
          {/* Use LiveNewsFeed component with the slug */}
          <LiveNewsFeed 
            slug={entity.slug} 
            name={entity.name} 
            initialItems={[]} 
            showSentiment={true}
            filterSlug={entity.slug}
          />
        </div>
      </div>
    </div>
  );
}