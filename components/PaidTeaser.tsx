'use client';

import React from 'react';
import { useTranslations } from '@/lib/i18nMock';
import GlowCard from './GlowCard';

export default function PaidTeaser() {
  const t = useTranslations('common');

  return (
    <GlowCard className="bg-gradient-to-br from-cyber-purple/10 to-cyber-green/10 border-cyber-neon/20">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-cyber-neon mb-2">Unlock Premium Features</h3>
          <p className="text-gray-300 text-sm mb-4">
            Get access to advanced analytics, real-time alerts, and exclusive content
          </p>
          <button className="px-4 py-2 bg-cyber-neon text-black font-bold rounded hover:bg-cyber-green transition-colors">
            Upgrade to Premium
          </button>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-cyber-neon">24/7</div>
            <div className="text-xs text-gray-400">Real-time Updates</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyber-neon">AI</div>
            <div className="text-xs text-gray-400">Powered Insights</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyber-neon">🚀</div>
            <div className="text-xs text-gray-400">Advanced Tools</div>
          </div>
        </div>
      </div>
    </GlowCard>
  );
}