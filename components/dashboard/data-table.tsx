"use client"

import { MarketNews } from '@/types/dashboard';
import { format } from 'date-fns';
import { ArrowUpRight, MoreHorizontal } from 'lucide-react';

interface DataTableProps {
  data?: MarketNews[];
}

export function DataTable({ data = [] }: DataTableProps) {
  // Take the last 5 items, reverse to show newest first
  const recentData = [...data].reverse().slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="font-semibold text-foreground">Recent Intelligence</h3>
          <p className="text-sm text-muted-foreground">Latest market signals and reports</p>
        </div>
        <button className="text-sm font-medium text-primary hover:underline">
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">Report Title</th>
              <th className="px-6 py-3 font-medium">Sentiment</th>
              <th className="px-6 py-3 font-medium">Heat</th>
              <th className="px-6 py-3 font-medium">Time</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentData.map((item) => (
              <tr key={item.id} className="group hover:bg-muted/50">
                <td className="px-6 py-4 font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[200px]">{item.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    (item.metadata?.sentiment_score ?? 50) >= 60 
                      ? "bg-green-500/10 text-green-500" 
                      : (item.metadata?.sentiment_score ?? 50) <= 40
                      ? "bg-red-500/10 text-red-500"
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {item.metadata?.sentiment_score ?? 50}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                      <div 
                        className="h-full bg-orange-500" 
                        style={{ width: `${item.metadata?.heat_index ?? 50}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.metadata?.heat_index ?? 50}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {format(new Date(item.created_at), 'HH:mm')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {recentData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
