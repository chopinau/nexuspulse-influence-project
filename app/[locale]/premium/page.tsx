import { useTranslations } from 'next-intl';
import GlowCard from '@/components/GlowCard';

export default function PremiumPage() {
  const t = useTranslations('home.signals');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-purple/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-neon/20 rounded-full blur-[120px]" />
      </div>

      <h1 className="text-4xl md:text-6xl font-bold">
        <span className="block text-white mb-2">Unlock Alpha</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyber-neon to-cyber-purple">
          Deep Market Insights
        </span>
      </h1>
      
      <p className="text-xl text-gray-400 max-w-2xl">
        Get AI-generated correlations, trend predictions, and customized alerts for your portfolio entities.
      </p>

      <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
        {[
          { title: "Daily Brief", desc: "AI Summaries delivered every morning." },
          { title: "Trend Prediction", desc: "Proprietary algorithm predicting 24h heat." },
          { title: "Cross-Analysis", desc: "Correlate entities (e.g., Musk vs. Bitcoin)." }
        ].map((feat, i) => (
          <GlowCard key={i} className="flex flex-col items-center justify-center text-center p-8 border-cyber-neon/20">
            <h3 className="text-xl font-bold text-cyber-neon mb-2">{feat.title}</h3>
            <p className="text-sm text-gray-400">{feat.desc}</p>
          </GlowCard>
        ))}
      </div>

      <button className="mt-8 px-10 py-4 bg-gradient-to-r from-cyber-purple to-cyber-pink hover:from-cyber-purple/80 hover:to-cyber-pink/80 text-white font-bold rounded-full text-lg shadow-[0_0_30px_rgba(189,0,255,0.4)] transition-transform hover:scale-105">
        Get Early Access
      </button>
    </div>
  );
}