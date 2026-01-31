"use client"

import { Sparkles, ArrowRight, Loader2 } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MarketNews } from '@/types/dashboard'

interface SignalCardProps {
  latestReport?: MarketNews | null;
}

export function SignalCard({ latestReport }: SignalCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-chart-2/5 p-6 h-full">
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-chart-2/10 blur-3xl" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-medium text-primary">Today&apos;s Investment Signal</span>
        </div>
        
        <div className="mb-6 text-sm leading-relaxed text-muted-foreground flex-grow overflow-y-auto max-h-[300px] prose prose-invert prose-sm">
          {latestReport ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {latestReport.content || "No content available."}
            </ReactMarkdown>
          ) : (
             <div className="flex items-center gap-2 text-muted-foreground">
               <Loader2 className="h-4 w-4 animate-spin" />
               <span>Analyzing market signals...</span>
             </div>
          )}
        </div>
        
        <button
          type="button"
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 mt-auto"
        >
          Unlock Full AI Analysis
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
