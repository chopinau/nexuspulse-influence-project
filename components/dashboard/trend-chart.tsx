"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { MarketNews } from '@/types/dashboard';

interface TrendChartProps {
  data?: MarketNews[];
}

export function TrendChart({ data = [] }: TrendChartProps) {
  // Prepare Chart Data
  const chartData = data.map(item => ({
    time: format(new Date(item.created_at), 'MM-dd HH:mm'),
    sentiment: item.metadata?.sentiment_score ?? 50,
    heat: item.metadata?.heat_index ?? 50,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Trend Analysis</h3>
          <p className="text-sm text-muted-foreground">30-period sentiment & heat tracking</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500" /> Sentiment
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-orange-500" /> Heat
          </div>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#666" 
              tick={{fill: '#888', fontSize: 10}} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="#666" 
              tick={{fill: '#888', fontSize: 10}} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px' }}
              labelStyle={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey="sentiment" 
              stroke="#22c55e" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              dataKey="heat" 
              stroke="#f97316" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
