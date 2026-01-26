// @ts-nocheck
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';

// --- Types ---
interface UsageMeterProps {
  current: number;
  max: number;
  label: string;
}

interface PlanBadgeProps {
  plan: string;
}

interface TrialCountdownProps {
  endDate: Date;
}

interface ActivityItemProps {
  title: string;
  date: string;
  sentiment: string;
  key?: React.Key | null | undefined;
}

// --- Components ---

export function PlanBadge({ plan }: PlanBadgeProps) {
  const styles = {
    FREE: "bg-gray-800 text-gray-400 border-gray-700",
    TRIAL: "bg-amber-500/10 text-amber-500 border-amber-500/50 animate-pulse-slow",
    PAID: "bg-cyber-neon/10 text-cyber-neon border-cyber-neon/50 shadow-[0_0_10px_rgba(0,243,255,0.2)]"
  };

  const activeStyle = styles[plan as keyof typeof styles] || styles.FREE;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wider uppercase ${activeStyle}`}>
      {plan} Plan
    </span>
  );
}

export function TrialCountdown({ endDate }: TrialCountdownProps) {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  const diffHours = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));

  if (diffHours <= 0) return null;

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-900/20 to-transparent border border-amber-500/30 mb-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="text-sm text-gray-300 font-medium">Trial Active</p>
        <p className="text-xl font-bold text-white leading-none">
          {diffHours} hours remaining
        </p>
      </div>
      <Link href="/premium" className="ml-auto">
        <button className="text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-lg transition-colors">
          Secure Rate
        </button>
      </Link>
    </div>
  );
}

export function UsageMeter({ current, max, label }: UsageMeterProps) {
  const percentage = Math.min(100, (current / Math.max(1, max)) * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-cyber-neon font-mono">{current} / {max}</span>
      </div>
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        {/* @ts-ignore */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-cyber-neon to-cyber-purple"
        />
      </div>
    </div>
  );
}

export function ActivityItem({ title, date, sentiment }: ActivityItemProps) {
  const sentimentColor = {
    positive: 'text-cyber-green',
    neutral: 'text-gray-400',
    negative: 'text-red-400'
  }[sentiment as 'positive' | 'neutral' | 'negative'] || 'text-gray-400';

  return (
    <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${sentiment === 'positive' ? 'bg-cyber-green' : sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'}`} />
        <div>
          <p className="text-sm font-medium text-gray-200">{title}</p>
          <p className="text-[10px] text-gray-500">{new Date(date).toLocaleDateString()}</p>
        </div>
      </div>
      <span className={`text-xs font-mono uppercase ${sentimentColor}`}>
        {sentiment}
      </span>
    </div>
  );
}