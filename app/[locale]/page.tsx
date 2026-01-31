"use client"

import { useState, useEffect } from "react"
import { Bell, Search, Globe, ChevronDown, Terminal, AlertTriangle } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/sidebar" // Keeping sidebar from dashboard for now, unless v0 generated one?
import { TrendChart } from "@/components/trend-chart"
import { DataTable } from "@/components/data-table"
import { StatCards } from "@/components/stat-cards"
import { LiveFeed } from "@/components/live-feed"
import { SignalCard } from "@/components/signal-card"
import { createClient } from '@supabase/supabase-js'
import { MarketNews } from '@/types/dashboard'

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("dashboard")
  
  // Supabase Data State
  const [data, setData] = useState<MarketNews[]>([]);
  const [latestReport, setLatestReport] = useState<MarketNews | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Real-time subscription
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const { data: news, error } = await supabase
        .from('market_news')
        .select('*')
        .order('created_at', { ascending: true }) // Ascending for chart
        .limit(30);

      if (error) throw error;

      if (news && news.length > 0) {
        setData(news);
        setLatestReport(news[news.length - 1]); // Last one is latest due to ascending sort
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center">
        <div className="flex items-center gap-2 animate-pulse">
          <Terminal size={24} />
          <span>ESTABLISHING SECURE CONNECTION...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <DashboardSidebar activeItem={activeNav} onItemClick={setActiveNav} />

      {/* Main Content */}
      <main className="pl-16 lg:pl-64 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">
              Real-time Influence Tracking
            </h1>
            <span className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary sm:inline-block">
              Enterprise
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              type="button"
              className="hidden items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted md:flex"
            >
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                /K
              </kbd>
            </button>

            {/* Language toggle */}
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">EN</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-lg bg-secondary p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>

            {/* User avatar */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-sm font-semibold text-primary-foreground"
            >
              N
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Page title section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Influence Dashboard
            </h2>
            <p className="mt-1 text-muted-foreground">
              For investors and brands tracking digital influence and market sentiment
            </p>
          </div>

          {/* Stat Cards */}
          <div className="mb-6">
            <StatCards latestReport={latestReport} data={data} />
          </div>

          {/* Bento Grid Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart - spans 2 columns */}
            <div className="lg:col-span-2">
              <TrendChart data={data} />
            </div>

            {/* Signal Card */}
            <div className="lg:col-span-1">
              <SignalCard latestReport={latestReport} />
            </div>

            {/* Data Table - spans 2 columns */}
            <div className="lg:col-span-2">
              <DataTable data={data} />
            </div>

            {/* Live Feed */}
            <div className="lg:col-span-1">
              <LiveFeed latestReport={latestReport} loading={loading} data={data} />
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 border-t border-border pt-6">
            <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
              <p>NEXUSPULSE © 2026. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="transition-colors hover:text-foreground">
                  Documentation
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  API
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  Support
                </a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
