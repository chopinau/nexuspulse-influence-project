"use client"

import { RefreshCw, ExternalLink, Clock, Zap } from "lucide-react"
import { useState } from "react"
import { MarketNews } from '@/types/dashboard'
import { format } from 'date-fns'

interface LiveFeedProps {
  latestReport?: MarketNews | null;
  loading?: boolean;
  data?: MarketNews[];
}

export function LiveFeed({ loading, data }: LiveFeedProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }
  
  // Use data or fallback to empty array
  const feedItems = data || [];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={`h-2 w-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-success'}`} />
            <div className={`absolute inset-0 h-2 w-2 animate-ping rounded-full opacity-75 ${loading ? 'bg-yellow-500' : 'bg-success'}`} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Live Dynamics</h3>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing || loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="max-h-[380px] divide-y divide-border overflow-y-auto flex-grow">
        {feedItems.length > 0 ? (
          feedItems.map((item) => (
            <div
              key={item.id}
              className="group flex gap-4 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex shrink-0 flex-col items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-xs text-muted-foreground">
                  {format(new Date(item.created_at), 'HH:mm')}
                </span>
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      item.sentiment && item.sentiment < 50
                        ? "bg-chart-4/10 text-chart-4"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Zap className="h-3 w-3" />
                    SIGNAL
                  </span>
                  <span className="text-xs text-muted-foreground">Internal</span>
                </div>
                
                <h4 className="text-sm font-medium leading-snug text-foreground group-hover:text-primary">
                  {item.title}
                </h4>
              </div>
              
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-background hover:text-foreground group-hover:opacity-100"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No live data available
          </div>
        )}
      </div>
    </div>
  )
}
