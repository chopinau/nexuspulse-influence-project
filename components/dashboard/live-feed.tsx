"use client"

import { MarketNews } from '@/types/dashboard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Loader2 } from 'lucide-react';

interface LiveFeedProps {
  latestReport?: MarketNews | null;
  loading?: boolean;
}

export function LiveFeed({ latestReport, loading }: LiveFeedProps) {
  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl border border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!latestReport) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
        No intelligence data available
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-foreground">Live Intelligence</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(latestReport.created_at).toLocaleTimeString()}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 max-h-[500px] prose prose-invert prose-sm max-w-none">
        {/* Title */}
        <h2 className="text-lg font-bold text-foreground mb-4">{latestReport.title}</h2>
        
        {/* Markdown Content */}
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-4 border border-border rounded-lg">
                <table className="w-full text-sm text-left" {...props} />
              </div>
            ),
            thead: ({node, ...props}) => <thead className="bg-muted/50 text-muted-foreground uppercase text-xs" {...props} />,
            th: ({node, ...props}) => <th className="px-4 py-3 font-medium border-b border-border" {...props} />,
            td: ({node, ...props}) => <td className="px-4 py-2 border-b border-border/50" {...props} />,
            blockquote: ({node, ...props}) => (
              <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground my-4 bg-primary/5 py-2 pr-2 rounded-r" {...props} />
            ),
            a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
          }}
        >
          {latestReport.content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
