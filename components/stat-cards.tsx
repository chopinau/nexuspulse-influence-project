"use client"

import { TrendingUp, Users, Activity, Zap } from "lucide-react"
import { MarketNews } from '@/types/dashboard'
import { useMemo } from 'react'

interface StatCardsProps {
  latestReport?: MarketNews | null;
  data?: MarketNews[];
}

export function StatCards({ latestReport, data }: StatCardsProps) {
  const stats = useMemo(() => {
    // Default values
    let totalInfluence = "95.2";
    let sentimentScore = "72.4";
    let activeSignals = "34";
    let activeEntities = "1,247";

    if (latestReport) {
      if (latestReport.impact_score) totalInfluence = latestReport.impact_score.toFixed(1);
      if (latestReport.sentiment) sentimentScore = latestReport.sentiment.toFixed(1);
      // Mock calculations for others based on data length or properties if available
      if (data) activeSignals = data.length.toString();
    }

    return [
      {
        label: "Total Influence",
        value: totalInfluence,
        unit: "score",
        change: "+12.5%",
        changeType: "positive" as const,
        icon: TrendingUp,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        label: "Active Entities",
        value: activeEntities,
        unit: "tracked",
        change: "+89",
        changeType: "positive" as const,
        icon: Users,
        color: "text-chart-2",
        bgColor: "bg-chart-2/10",
      },
      {
        label: "Sentiment Score",
        value: sentimentScore,
        unit: "avg",
        change: "-2.1%",
        changeType: "negative" as const,
        icon: Activity,
        color: "text-chart-4",
        bgColor: "bg-chart-4/10",
      },
      {
        label: "Active Signals",
        value: activeSignals,
        unit: "today",
        change: "+7",
        changeType: "positive" as const,
        icon: Zap,
        color: "text-success",
        bgColor: "bg-success/10",
      },
    ]
  }, [latestReport, data]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30"
          >
            {/* Subtle gradient on hover */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    stat.changeType === "positive"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">{stat.unit}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
