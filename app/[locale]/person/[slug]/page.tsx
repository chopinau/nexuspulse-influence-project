import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import GlowCard from '@/components/GlowCard';
import NeonChart from '@/components/NeonChart';
import LiveEntityStats from '@/components/LiveEntityStats';
import LiveNewsFeed from '@/components/LiveNewsFeed'; // This will handle real-time logic
import { Link } from '@/i18n/routing';
import StockCard from '@/components/StockCard';
import PaidTeaser from '@/components/PaidTeaser';

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

async function getEntityData(slug: string) {
  // 1. Fetch Config
  const { data: config, error: configError } = await supabase
    .from('config')
    .select('*')
    .eq('slug', slug)
    .single();

  if (configError || !config) return null;

  // 2. Fetch Initial Dynamics (for SSR/Initial Load)
  const { data: dynamics, error: dynError } = await supabase
    .from('dynamics')
    .select('*')
    .eq('entity_slug', slug)
    .order('pub_date', { ascending: false })
    .limit(20);

  return { config, initialDynamics: dynamics || [] };
}

export default async function EntityDetailPage({ params }: Props) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'entity' });
  const data = await getEntityData(slug);

  if (!data) notFound();

  const { config, initialDynamics } = data;

  // Calculate Heat Index: (Count * weight) + Sentiment Score
  const sentimentScore = initialDynamics.reduce((acc, curr) => acc + (curr.sentiment || 0), 0);
  const heatIndex = (initialDynamics.length * 10) + (sentimentScore * 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-cyber-neon transition-colors uppercase tracking-widest text-[10px]">
          {t('dashboard')}
        </Link>
        <span className="opacity-30">/</span>
        <span className="text-cyber-neon font-mono">{config.name}</span>
      </div>

      {/* Hero Header */}
      <div className="relative">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-cyber-purple/10 rounded-full blur-[100px] -z-10" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex-1">
             <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyber-neon/30 text-cyber-neon mb-3 inline-block bg-cyber-neon/5">
                {config.type?.toUpperCase()}
              </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {config.name}
            </h1>
            <div className="flex gap-2 mt-6 flex-wrap">
              {config.tags?.split(',').map((tag: string) => (
                <button key={tag} className="px-3 py-1 rounded-sm bg-white/5 border border-white/10 text-xs font-mono hover:border-cyber-neon/50 hover:bg-cyber-neon/5 transition-all">
                  #{tag.trim()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch">
            {config.stock_symbol && (
              <div className="w-full sm:w-64">
                <StockCard symbol={config.stock_symbol} />
              </div>
            )}
            <LiveEntityStats
              slug={config.slug}
              initialHeat={heatIndex}
              initialTrend={initialDynamics.length > 0 ? 5.2 : 0} // Placeholder for trend logic
            />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
           <GlowCard className="h-full bg-black/40 backdrop-blur-xl border-white/5">
            <h2 className="text-sm font-mono font-bold mb-6 flex items-center gap-2 text-gray-400 uppercase tracking-widest">
               <span className="w-1.5 h-1.5 bg-cyber-neon rounded-full animate-ping" />
               Signal Trajectory (7D)
            </h2>
            <NeonChart data={initialDynamics} />
           </GlowCard>
        </div>

        <div className="relative">
           <LiveNewsFeed
             slug={config.slug}
             name={config.name}
             initialItems={initialDynamics}
           />
        </div>
      </div>

      <PaidTeaser />
    </div>
  );
}