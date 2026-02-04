"use client"

import { useState, useEffect } from "react"
import { Bell, Search, Globe, ChevronDown, Terminal, AlertTriangle } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/sidebar" // Keeping sidebar from dashboard for now, unless v0 generated one?
import { TrendChart } from "@/components/trend-chart"
import { DataTable } from "@/components/data-table"
import { StatCards } from "@/components/stat-cards"
import { LiveFeed } from "@/components/live-feed"
import { SignalCard } from "@/components/signal-card"
import LogicFlow from "@/components/LogicFlow"
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
  
  // Search and Report State
  const [searchQuery, setSearchQuery] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [reportData, setReportData] = useState<any>(null);

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

  // Handle Generate Report
  const handleGenerate = async () => {
    if (!searchQuery.trim()) return;

    setReportLoading(true);
    setReportData(null);
    
    // 1. Simulate Loading Steps (Frontend visual feedback)
    const steps = [
      "🔍 正在调用【选品风控 SOP】...",
      "🐂 多头 Agent 正在寻找增长机会...",
      "🐻 空头 Agent 正在评估潜在风险...",
      "⚖️ CEO (主持人) 正在生成最终决策..."
    ];

    let stepIndex = 0;
    setLoadingText(steps[0]);
    
    // Ensure minimum display time for each step to prevent "flashing"
    const MIN_STEP_TIME = 2000; 
    let stepTimer: NodeJS.Timeout;

    const advanceStep = () => {
        stepIndex++;
        if (stepIndex < steps.length) {
            setLoadingText(steps[stepIndex]);
        }
    };

    stepTimer = setInterval(advanceStep, MIN_STEP_TIME);

    try {
        const res = await fetch('/api/agent-forum', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: searchQuery }) 
        });
        
        const data = await res.json();
        
        if (data.error) {
            console.error("Agent Error:", data.error);
            setLoadingText("❌ 生成失败: " + data.error);
        } else {
            setReportData(data);
        }

    } catch (e) {
        console.error("Network Error:", e);
        setLoadingText("❌ 网络错误");
    } finally {
        try {
            clearInterval(stepTimer);
        } catch (e) {
            // Ignore error if stepTimer is not defined
        }
        setReportLoading(false);
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
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Search topic (e.g. NVIDIA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => !reportLoading && e.key === 'Enter' && handleGenerate()}
                disabled={reportLoading}
                className="rounded-lg bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none w-64 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleGenerate}
                disabled={reportLoading}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {reportLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full"></span>
                    {loadingText}
                  </span>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Generate Intel</span>
                  </>
                )}
              </button>
            </div>

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
              {activeNav === 'dashboard' && 'Influence Dashboard'}
              {activeNav === 'analytics' && 'Analytics'}
              {activeNav === 'reports' && 'Reports'}
              {activeNav === 'team' && 'Team'}
              {activeNav === 'settings' && 'Settings'}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {activeNav === 'dashboard' && 'For investors and brands tracking digital influence and market sentiment'}
              {activeNav === 'analytics' && 'Detailed analytics and performance metrics'}
              {activeNav === 'reports' && 'Generated reports and insights'}
              {activeNav === 'team' && 'Team management and collaboration'}
              {activeNav === 'settings' && 'Account and system settings'}
            </p>
          </div>

          {/* Loading Stepper */}
          {reportLoading && (
            <div className="mb-6 bg-card border border-border rounded-xl p-4">
              <h3 className="text-lg font-semibold text-primary mb-2">
                {loadingText}
              </h3>
            </div>
          )}

          {/* Dashboard Content */}
          {activeNav === 'dashboard' && (
            <>
              {/* Report Section */}
              {reportData && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    关于 {searchQuery} 的深度战略研判
                  </h3>
                  
                  {/* Logic Graph */}
                  <div className="mb-6 bg-slate-950/50 border border-border rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-primary mb-4">
                      🔄 逻辑流程图
                    </h4>
                    <div className="min-h-[400px]">
                      <LogicFlow code={reportData.mermaid_code} />
                    </div>
                  </div>
                  
                  {/* Core Conclusion */}
                  <div className="mb-6 bg-card border border-border rounded-xl p-6 shadow-lg">
                    <h4 className="text-xl font-bold text-primary mb-4">
                      📋 核心结论
                    </h4>
                    <div dangerouslySetInnerHTML={{ __html: (reportData.content || reportData.debate_details || "无结果").replace(/\n/g, '<br/>') }} />
                  </div>
                  
                  {/* Debate Details */}
                  {(reportData.debate_details && reportData.debate_details !== reportData.content) && (
                    <div className="mb-6 bg-card border border-border rounded-xl p-4">
                      <h4 className="text-lg font-semibold text-primary mb-4">
                        ⚖️ 多空博弈深度解析
                      </h4>
                      <div dangerouslySetInnerHTML={{ __html: reportData.debate_details.replace(/\n/g, '<br/>') }} />
                    </div>
                  )}
                </div>
              )}

              {/* Stat Cards */}
              {!reportData && (
                <div className="mb-6">
                  <StatCards latestReport={latestReport} data={data} />
                </div>
              )}

              {/* Bento Grid Layout */}
              {!reportData && (
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* 战略推演图区域 - 占据两列宽度 */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-2 min-h-[400px]">
                    <LogicFlow />
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
              )}
            </>
          )}

          {/* Analytics Content */}
          {activeNav === 'analytics' && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Analytics</h3>
              <p className="text-muted-foreground">Analytics page content will be displayed here.</p>
            </div>
          )}

          {/* Reports Content */}
          {activeNav === 'reports' && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Reports</h3>
              <p className="text-muted-foreground">Reports page content will be displayed here.</p>
            </div>
          )}

          {/* Team Content */}
          {activeNav === 'team' && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Team</h3>
              <p className="text-muted-foreground">Team page content will be displayed here.</p>
            </div>
          )}

          {/* Settings Content */}
          {activeNav === 'settings' && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Settings</h3>
              <p className="text-muted-foreground">Settings page content will be displayed here.</p>
            </div>
          )}

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
