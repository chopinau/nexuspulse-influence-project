"use client"

import { useState, useMemo } from "react"
import { Search, Activity, TrendingUp, DollarSign, ShieldAlert, Zap, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ProgressBar } from "@tremor/react"
import RiskGauge from "@/components/RiskGauge"
import LogicFlow from "@/components/LogicFlow"
import LiveGlobalFeed from "@/components/LiveGlobalFeed"
import { TrendChart } from "@/components/trend-chart"
import { CategorySelector } from "@/components/CategorySelector"
import { GridBackground } from "@/app/page" // Reuse GridBackground from original page for now, or move it to a shared component
import { toast } from "sonner"

// --- Reused Components (Should be moved to components/ui/ in real refactor) ---

const IronCard = ({ children, className = "", title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any }) => (
  <div className={`bg-black/40 border border-white/10 backdrop-blur-md rounded-xl overflow-hidden relative group ${className}`}>
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50 rounded-tl-md" />
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50 rounded-tr-md" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50 rounded-bl-md" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50 rounded-br-md" />
    
    {title && (
      <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
        <h3 className="text-sm font-bold text-cyan-100 uppercase tracking-wider">{title}</h3>
      </div>
    )}
    <div className="p-4">
      {children}
    </div>
  </div>
);

// Helper functions
const extractRiskScore = (text: string): number => {
  if (!text) return 0;
  const match = text.match(/(?:Risk Score|风险评分|风险指数)[：:]?\s*(\d+)\/10/i) || text.match(/(\d+)\/10/);
  return match ? parseInt(match[1]) : 5;
};

const getSentimentColor = (score: number) => {
    if (score >= 60) return "emerald";
    if (score <= 40) return "rose";
    return "blue";
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState("GENERAL");

  // Inject High-Growth Markets Data (Mock for SaaS Feel)
  const growthMarkets = [
    { name: "AI Wearables", growth: "+450%", risk: "High" },
    { name: "Sustainable Swimwear", growth: "+120%", risk: "Med" },
    { name: "Pet Tech", growth: "+85%", risk: "Low" }
  ];

  const riskScore = useMemo(() => {
    const v = reportData?.structured_data?.risk_score;
    if (typeof v === "number") return v;
    if (!reportData?.verdict_text) return 0;
    return extractRiskScore(reportData.verdict_text);
  }, [reportData]);

  const handleGenerate = async () => {
    if (!searchQuery.trim()) {
        toast.error("Please enter a topic");
        return;
    }

    setLoading(true);
    setReportData(null);
    
    const steps = [
      "🔍 INITIATING SCAN: Target Identified...",
      "📡 INTERCEPTING SIGNALS: Processing Global Feeds...",
      "🧠 NEURAL LINK ESTABLISHED: Analyzing Patterns...",
      "🛡️ STRATEGIC PROTOCOLS: Generating Verdict..."
    ];

    let stepIndex = 0;
    setLoadingText(steps[0]);
    
    const MIN_STEP_TIME = 1500; 
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
            body: JSON.stringify({ topic: searchQuery, mode: mode }) 
        });
        
        const data = await res.json();
        
        if (data.error) {
            console.error("Agent Error:", data.error);
            setLoadingText("❌ SYSTEM FAILURE: " + data.error);
            toast.error("Analysis Failed: " + data.error);
        } else {
            setReportData(data);
            toast.success("Intelligence Report Generated Successfully");
        }

    } catch (e) {
        console.error("Network Error:", e);
        setLoadingText("❌ NETWORK ERROR");
        toast.error("Network Error: Failed to connect to intelligence grid");
    } finally {
        try {
            clearInterval(stepTimer);
        } catch (e) { }
        setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative bg-black text-white">
      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 relative z-10 flex-1 min-h-0">
        
        {/* LEFT COLUMN: HARD DATA (Span 3) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          <IronCard title="Mission Status" icon={Activity}>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-xs text-gray-400">System Load</span>
                   <span className="text-xs font-mono text-cyan-400">42%</span>
                </div>
                <ProgressBar value={42} color="cyan" className="mt-2" />
                <div className="flex justify-between items-center mt-2">
                   <span className="text-xs text-gray-400">Active Agents</span>
                   <span className="text-xs font-mono text-green-400">3 ONLINE</span>
                </div>
             </div>
          </IronCard>

          <IronCard title="Strategic Risk Level" icon={ShieldAlert} className="flex-1 min-h-[300px]">
             {reportData ? (
                <div className="flex flex-col items-center justify-center h-full py-6 relative">
                   <RiskGauge score={riskScore} />
                   
                   <div className="mt-6 text-center space-y-2 w-full">
                      <div className="flex justify-between text-xs px-4 border-b border-white/10 pb-2">
                        <span className="text-gray-400">Bull Force</span>
                        <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500" style={{ width: `${reportData.structured_data?.bull_force || 50}%` }} />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs px-4">
                        <span className="text-gray-400">Bear Force</span>
                        <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                           <div className="h-full bg-red-500" style={{ width: `${reportData.structured_data?.bear_force || 50}%` }} />
                        </div>
                      </div>
                   </div>
                </div>
             ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                   Awaiting Target...
                </div>
             )}
          </IronCard>

          <IronCard title="Market Trends" icon={TrendingUp} className="flex-1 min-h-[250px]">
             <div className="h-full w-full -m-4 p-4 flex flex-col gap-2"> 
                {growthMarkets.map((m, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setSearchQuery(m.name)}>
                    <span className="text-xs text-gray-300">{m.name}</span>
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-400 font-mono">{m.growth}</span>
                      <span className={`px-1 rounded text-[10px] ${m.risk === 'High' ? 'bg-red-500/20 text-red-400' : m.risk === 'Med' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                        {m.risk}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="mt-auto h-24 w-full">
                   <TrendChart />
                </div>
             </div>
          </IronCard>
        </div>

        {/* CENTER COLUMN: MAIN STAGE (Span 6) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
           
           {/* Category Selector - New Dual-Track Component */}
           <CategorySelector onSelect={(label) => setSearchQuery(label)} />
           
           {/* Search Bar */}
           <div className="bg-black/40 border border-white/10 backdrop-blur-md rounded-xl p-2 flex items-center gap-2 sticky top-0 z-20">
              <Search className="w-5 h-5 text-gray-400 ml-2" />
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="shrink-0 bg-blue-900/50 border border-cyan-500/30 text-white px-2 h-10 rounded-lg text-sm outline-none focus:border-cyan-500 transition-colors min-w-[190px] cursor-pointer"
              >
                <option value="GENERAL" className="bg-black">General Strategy</option>
                <option value="TIKTOK_MARKETING" className="bg-black">TikTok Viral Marketing</option>
                <option value="TIKTOK_RISK" className="bg-black">TikTok Risk/Compliance</option>
                <option value="CROSS_BORDER_CFO" className="bg-black">Financial/CFO Audit</option>
                <option value="BRAND_ARCHITECT" className="bg-black">Brand Building</option>
              </select>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => !loading && e.key === 'Enter' && handleGenerate()}
                placeholder="ENTER TARGET..."
                className="flex-1 bg-transparent border-none outline-none text-white h-10 placeholder:text-gray-600 font-mono min-w-0"
              />
              <button 
                 onClick={handleGenerate}
                 disabled={loading}
                 className="shrink-0 bg-cyan-600 hover:bg-cyan-500 text-white px-6 h-10 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                 {loading ? loadingText : "Execute"}
              </button>
           </div>

           {/* Animated Stream Content */}
           <AnimatePresence>
             {reportData && (
               <motion.div 
                 className="flex flex-col gap-4 pb-20"
                 initial="hidden"
                 animate="visible"
                 variants={{
                   hidden: { opacity: 0 },
                   visible: {
                     opacity: 1,
                     transition: {
                       staggerChildren: 0.3
                     }
                   }
                 }}
               >
                 {/* Verdict Card */}
                 <motion.div variants={{
                   hidden: { y: -20, opacity: 0 },
                   visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
                 }}>
                    <IronCard className="border-cyan-500/30 bg-cyan-950/20">
                       <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2 border-b border-cyan-500/20 pb-2">
                          <ShieldAlert className="w-6 h-6" />
                          STRATEGIC VERDICT // 战略裁决
                       </h2>
                       <div className="text-white text-lg leading-relaxed font-medium pl-4 border-l-4 border-cyan-500/50 py-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                          <div dangerouslySetInnerHTML={{ __html: (reportData?.verdict_text || "").replace(/\n/g, '<br/>') }} />
                       </div>
                    </IronCard>
                 </motion.div>

                 {/* Logic Graph */}
                 <motion.div variants={{
                   hidden: { opacity: 0, scale: 0.95 },
                   visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
                 }} className="flex-1 min-h-[500px]">
                    {reportData?.mermaid_code ? (
                       <LogicFlow code={reportData.mermaid_code} />
                    ) : (
                       <IronCard title="Logic Flow Graph" icon={TrendingUp} className="h-full">
                           <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50 min-h-[400px]">
                              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 animate-spin-slow" />
                              <p className="font-mono text-sm">WAITING FOR TARGET ANALYSIS...</p>
                           </div>
                       </IronCard>
                    )}
                 </motion.div>

                 {/* Debate Section */}
                 <motion.div variants={{
                   hidden: { y: 20, opacity: 0 },
                   visible: { y: 0, opacity: 1 }
                 }}>
                    <IronCard title="Agent Debate Logs" icon={Activity}>
                       <div className="prose prose-invert prose-sm max-w-none max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                          <div dangerouslySetInnerHTML={{ __html: (reportData?.debate_details || "").replace(/\n/g, '<br/>') }} />
                       </div>
                    </IronCard>
                 </motion.div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: LIVE DYNAMICS (Span 3) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
           
           {/* Sentiment Balance Bar */}
           <IronCard title="Market Sentiment" icon={DollarSign}>
              {reportData ? (
                 <div className="space-y-4">
                    <div className="flex justify-between items-end mb-1">
                       <span className="text-xs font-bold text-red-400">BEARISH</span>
                       <span className="text-xl font-bold text-white">{reportData.structured_data?.sentiment_score || 50}</span>
                       <span className="text-xs font-bold text-green-400">BULLISH</span>
                    </div>
                    <ProgressBar 
                       value={reportData.structured_data?.sentiment_score || 50} 
                       color={getSentimentColor(reportData.structured_data?.sentiment_score || 50)} 
                       className="h-3"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                       <span>EXTREME FEAR</span>
                       <span>NEUTRAL</span>
                       <span>EXTREME GREED</span>
                    </div>
                 </div>
              ) : (
                 <div className="h-24 flex items-center justify-center text-gray-500 text-xs">
                    No Signal Detected
                 </div>
              )}
           </IronCard>

           <IronCard title="Live Dynamics" icon={Globe} className="flex-1 flex flex-col min-h-[400px]">
              <div className="flex-1 overflow-hidden">
                 <LiveGlobalFeed topic={searchQuery} />
              </div>
           </IronCard>
        </div>

      </div>
    </div>
  )
}
