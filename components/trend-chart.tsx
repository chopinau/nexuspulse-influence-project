"use client"

import { useState, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { MarketNews } from '@/types/dashboard'
import { format } from 'date-fns'

interface TrendChartProps {
  data?: MarketNews[];
}

const tabs = ["Heat", "Sentiment"]

export function TrendChart({ data }: TrendChartProps) {
  const [activeTab, setActiveTab] = useState("Heat")

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Return default/mock data if no real data
       return [
        { day: "Mon", value: 82 },
        { day: "Tue", value: 88 },
        { day: "Wed", value: 85 },
        { day: "Thu", value: 87 },
        { day: "Fri", value: 92 },
        { day: "Sat", value: 90 },
        { day: "Sun", value: 95 },
      ]
    }

    return data.map(item => ({
      day: format(new Date(item.created_at), 'MM/dd HH:mm'),
      value: activeTab === 'Heat' ? (item.heat_index || 0) : (item.sentiment || 0),
      title: item.title // For tooltip
    })).slice(-10); // Show last 10 points
  }, [data, activeTab]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-glass-border bg-glass p-6 backdrop-blur-xl h-full">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Trend Analysis</h3>
            <p className="text-sm text-muted-foreground">Influence and market correlation</p>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-secondary p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-[280px] w-full flex-grow min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "var(--font-mono)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 15, 20, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}
                labelStyle={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{activeTab} Trend</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={activeTab === 'Heat' ? "#10b981" : "#f43f5e"}
                strokeWidth={2}
                dot={{ r: 3, fill: activeTab === 'Heat' ? "#10b981" : "#f43f5e", strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
