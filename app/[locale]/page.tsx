import { useTranslations } from 'next-intl';
import GlowCard from '@/components/GlowCard';
import NeonChart from '@/components/NeonChart';
import LiveGlobalFeed from '@/components/LiveGlobalFeed';
import LiveDashboardGrid from '@/components/LiveDashboardGrid'; // IMPORTED
import { Link } from '@/i18n/routing';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyber-purple/20 blur-[100px] rounded-full -z-10" />
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyber-neon to-cyber-purple">
            {t('hero.title')}
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>
      </section>

      {/* Grid Ranking - LIVE */}
      <LiveDashboardGrid />

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Chart & Signals */}
        <div className="lg:col-span-2 space-y-8">
          <GlowCard>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-cyber-neon rounded-full animate-pulse" />
                7-Day Trend Analysis
              </h2>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1 rounded bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/30">Heat</button>
                <button className="text-xs px-3 py-1 rounded bg-white/5 text-gray-400 hover:bg-white/10">Sentiment</button>
              </div>
            </div>
            <NeonChart />
          </GlowCard>

          {/* AI Value Teaser */}
          <div className="relative p-[1px] rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-purple via-cyber-pink to-cyber-neon opacity-50 group-hover:opacity-100 transition-opacity animate-glow" />
            <div className="relative bg-black/80 backdrop-blur-xl rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  ✨ {t('signals.title')}
                </h3>
                <p className="text-gray-300 text-sm">
                  {t('signals.teaser')}
                </p>
              </div>
              <Link href="/premium">
                <button className="whitespace-nowrap px-6 py-3 bg-cyber-purple hover:bg-cyber-purple/80 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(189,0,255,0.4)] hover:scale-105">
                  {t('signals.upgrade')}
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Live Global Feed */}
        <LiveGlobalFeed />
      </div>
    </div>
  );
}