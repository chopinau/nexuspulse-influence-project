"use client"

import { MarketNews } from '@/types/dashboard';
import { TrendingUp, Users, Zap, Globe } from 'lucide-react';
import { cn } from "@/lib/utils";

interface StatCardsProps {
  latestReport?: MarketNews | null;
  data?: MarketNews[];
}

export function StatCards({ latestReport, data = [] }: StatCardsProps) {
  // Calculate some aggregate stats
  const avgSentiment = data.length > 0 
    ? Math.round(data.reduce((acc, item) => acc + (item.metadata?.sentiment_score ?? 50), 0) / data.length)
    : 0;
    
  const highHeatCount = data.filter(item => (item.metadata?.heat_index ?? 0) > 70).length;

  const stats = [
    {
      label: "Total Influence",
      value: "95.2",
      subtext: "score",
      change: "+12.5%",
      trend: "up",
      icon: Zap,
    },
    {
      label: "Active Entities",
      value: "1,247",
      subtext: "tracked",
      change: "+89",
      trend: "up",
      icon: Users,
    },
    {
      label: "Sentiment Score",
      value: avgSentiment.toString(),
      subtext: "avg",
      change: "-2.1%", // Static for demo match
      trend: "down",
      icon: TrendingUp,
    },
    {
      label: "Active Signals",
      value: data.length.toString(),
      subtext: "today",
      change: "+7",
      trend: "up",
      icon: Globe, // Screenshot uses lightning bolt for first, maybe signals is last?
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
           {/* Top Row: Icon and Badge */}
           <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "rounded-lg p-2",
                index === 0 ? "bg-cyan-500/10 text-cyan-500" :
                index === 1 ? "bg-purple-500/10 text-purple-500" :
                index === 2 ? "bg-yellow-500/10 text-yellow-500" :
                "bg-green-500/10 text-green-500"
              )}>
                <stat.icon className="h-5 w-5" />
              </div>
              
              <span className={cn(
                "flex items-center rounded-full px-2 py-0.5 text-xs font-bold",
                stat.trend === "up" 
                  ? "bg-green-500/10 text-green-500" 
                  : "bg-red-500/10 text-red-500"
              )}>
                {stat.change}
              </span>
           </div>

           {/* Bottom Row: Value and Label */}
           <div>
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</h3>
                <span className="text-sm font-medium text-muted-foreground">{stat.subtext}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground font-medium">{stat.label}</p>
           </div>
        </div>
      ))}
    </div>
  )
}
