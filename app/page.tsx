"use client"

import { useState } from "react"
import { Bell, Search, Globe, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import LogicFlow from "@/components/LogicFlow"

export function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-neon-cyan/5 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-neon-purple/5 blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px"
        }}
      />
      
      {/* Radial overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, var(--background) 70%)"
        }}
      />
      
      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.02) 50%)",
          backgroundSize: "100% 4px"
        }}
      />
      
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-24 h-24 border-l border-t border-neon-cyan/20 rounded-tl-3xl" />
      <div className="absolute top-4 right-4 w-24 h-24 border-r border-t border-neon-purple/20 rounded-tr-3xl" />
      <div className="absolute bottom-4 left-4 w-24 h-24 border-l border-b border-neon-purple/20 rounded-bl-3xl" />
      <div className="absolute bottom-4 right-4 w-24 h-24 border-r border-b border-neon-cyan/20 rounded-br-3xl" />
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [mermaidCode, setMermaidCode] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const handleGenerate = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setReportData(null);
    setMermaidCode(undefined);
    
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
        
        // Wait for the animation loop to catch up if the API was too fast
        // Calculate remaining time to show all steps at least once if needed, 
        // or just ensure we don't clear immediately if it was instant.
        // For "Illusion of Thinking", we might want to ensure at least 3-4s passed.
        
        if (data.error) {
            console.error("Agent Error:", data.error);
            setLoadingText("❌ 生成失败: " + data.error);
            return;
        }

        setReportData(data);
        if (data.mermaid_code) {
            setMermaidCode(data.mermaid_code);
        }

    } catch (e) {
        console.error("Network Error:", e);
        setLoadingText("❌ 网络错误");
    } finally {
        clearInterval(stepTimer);
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grid Background */}
      <GridBackground />

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
              onKeyDown={(e) => !loading && e.key === 'Enter' && handleGenerate()}
              disabled={loading}
              className="rounded-lg bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none w-64 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
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

      {/* Main Content */}
      <main className="p-6">
        {/* Page title section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Influence Dashboard
          </h2>
          <p className="mt-1 text-muted-foreground">
            For investors and brands tracking digital influence and market sentiment
          </p>
        </div>

        {/* Loading Stepper */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-card border border-border rounded-xl p-4"
          >
            <h3 className="text-lg font-semibold text-primary mb-2">
              {loadingText}
            </h3>
          </motion.div>
        )}

        {/* Report Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Logic Graph and Report Content */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            {/* Dynamic Title */}
            {reportData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="text-xl font-bold text-foreground mb-4">
                  关于 {searchQuery} 的深度战略研判
                </h3>
              </motion.div>
            )}

            {/* Logic Graph */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold text-primary mb-4">
                🔄 逻辑流程图
              </h3>
              <div className="min-h-[400px]">
                <LogicFlow code={mermaidCode} />
              </div>
            </motion.div>

            {/* 1. 核心结论 (Top) */}
            {reportData && (
              <div className="bg-card border border-border rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/80"></div>
                <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  📋 核心结论
                </h3>
                <blockquote className="pl-4 border-l-4 border-primary/30 italic text-lg text-foreground/90 bg-primary/5 p-4 rounded-r-lg">
                  <div dangerouslySetInnerHTML={{ __html: reportData.content.split('### ⚔️')[0].replace(/\n/g, '<br/>') }} />
                </blockquote>
              </div>
            )}

            {/* 3. 多空博弈细节 (Bottom - Collapsible) */}
            {reportData && (
              <div className="bg-card border border-border rounded-xl p-4 transition-all duration-300">
                <details className="group" onToggle={(e) => {
                  if ((e.target as HTMLDetailsElement).open) {
                    setTimeout(() => {
                      (e.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}>
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <span className="flex items-center gap-2 text-lg">
                      ⚔️ 多空博弈深度解析
                    </span>
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      <ChevronDown className="h-5 w-5" />
                    </span>
                  </summary>
                  <div className="mt-4 prose prose-invert prose-sm max-w-none border-t border-border pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Render the rest of the content - splitting by sections if possible or just showing all */}
                    <div dangerouslySetInnerHTML={{ __html: reportData.content.replace(/\n/g, '<br/>') }} />
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Card */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-lg font-semibold text-primary mb-4">
                🔍 搜索
              </h3>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Search topic (e.g. NVIDIA)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => !loading && e.key === 'Enter' && handleGenerate()}
                  disabled={loading}
                  className="rounded-lg bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
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
            </div>

            {/* Stats Card */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-lg font-semibold text-primary mb-4">
                📊 统计数据
              </h3>
              {reportData && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      情感得分
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {reportData.metadata?.sentiment_score || reportData.sentiment || 50}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      热度指数
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {reportData.metadata?.heat_index || reportData.heat_index || 50}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      影响得分
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {reportData.metadata?.impact_score || reportData.impact_score || 50}
                    </span>
                  </div>
                </div>
              )}
            </div>
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
      </main>
    </div>
  )
}
