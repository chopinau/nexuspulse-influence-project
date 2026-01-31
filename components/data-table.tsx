"use client"

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MarketNews } from '@/types/dashboard'
import { format } from 'date-fns'

interface DataTableProps {
  data?: MarketNews[];
}

export function DataTable({ data }: DataTableProps) {
  const newsItems = data ? data.slice(-5).reverse() : [];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card h-full">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold text-foreground">Intelligence Log</h3>
        <p className="text-sm text-muted-foreground">Recent market intelligence reports</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground w-[100px]">Time</TableHead>
              <TableHead className="text-muted-foreground">Title</TableHead>
              <TableHead className="text-right text-muted-foreground">Heat</TableHead>
              <TableHead className="text-right text-muted-foreground">Sentiment</TableHead>
              <TableHead className="text-right text-muted-foreground">Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newsItems.length > 0 ? (
              newsItems.map((item) => (
                <TableRow key={item.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {format(new Date(item.created_at), 'MM-dd HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium text-foreground line-clamp-1 max-w-[300px]">
                    {item.title}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {item.heat_index?.toFixed(0) || '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    <span
                      className={
                        (item.sentiment || 0) >= 70
                          ? "text-success"
                          : (item.sentiment || 0) >= 50
                            ? "text-chart-4"
                            : "text-destructive"
                      }
                    >
                      {item.sentiment?.toFixed(1) || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-foreground">
                    {item.impact_score?.toFixed(1) || '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
