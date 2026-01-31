"use client"

import { Sparkles, ArrowRight, Lock } from "lucide-react"
import { MarketNews } from '@/types/dashboard';
import { cn } from "@/lib/utils";

interface SignalCardProps {
  latestReport?: MarketNews | null;
}

export function SignalCard({ latestReport }: SignalCardProps) {
  // Use latest report summary or fallback to static text if loading/empty
  const summary = latestReport?.metadata?.summary || 
    "Musk's satellite remarks may boost auto stocks. Upgrade to get the full analysis report including sector correlation data and predictive sentiment indicators.";

  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
      {/* Background Gradient/Glow effects */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-4">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-semibold tracking-tight">Today's Investment Signal</h3>
          </div>
          
          <p className="text-muted-foreground leading-relaxed">
            {summary}
          </p>
        </div>

        <button className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-cyan-500 px-4 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]">
          <span>Unlock AI Analysis</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  )
}

