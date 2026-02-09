"use client"

import { useState } from "react"
import { Bell, Search, Globe, ChevronDown, Activity, TrendingUp, DollarSign, ShieldAlert, BarChart3, Zap } from "lucide-react"
import { motion } from "framer-motion"
import LogicFlow from "@/components/LogicFlow"
import LiveGlobalFeed from "@/components/LiveGlobalFeed"
import { TrendChart } from "@/components/trend-chart"

// Available skills for dropdown
const AVAILABLE_SKILLS = [
  "NVIDIA",
  "SHEIN",
  "TikTok Shop 美妆选品",
  "跨境电商物流",
  "品牌营销策略"
];

function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #22d3ee 1px, transparent 1px),
            linear-gradient(to bottom, #22d3ee 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />
      
      {/* Radial overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, #000 80%)"
        }}
      />
      
      {/* Scan line effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 50%)",
          backgroundSize: "100% 4px"
        }}
      />
    </div>
  );
}

// Iron Man Style Card Component
const IronCard = ({ children, className = "", title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any }) => (
  <div className={`bg-black/40 border border-white/10 backdrop-blur-md rounded-xl overflow-hidden relative group ${className}`}>
    {/* Tech borders */}
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

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      const filtered = AVAILABLE_SKILLS.filter(skill => 
        skill.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSkills(filtered);
      setShowDropdown(true);
    } else {
      setFilteredSkills([]);
      setShowDropdown(false);
    }
  };

  const handleSkillSelect = (skill: string) => {
    setSearchQuery(skill);
    setShowDropdown(false);
  };

  const handleGenerate = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setReportData(null);
    
    // 1. Simulate Loading Steps (Frontend visual feedback)
    const steps = [
      "🔍 启动扫描: 目标已识别...",
      "📡 拦截信号: 正在处理全球数据流...",
      "🧠 神经网络已连接: 正在分析模式...",
      "🛡️ 战略协议: 正在生成最终裁决..."
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
            body: JSON.stringify({ topic: searchQuery }) 
        });
        
        const data = await res.json();
        
        if (data.error) {
            console.error("Agent Error:", data.error);
            setLoadingText("❌ 系统故障: " + data.error);
        } else {
            setReportData(data);
        }

    } catch (e) {
        console.error("Network Error:", e);
        setLoadingText("❌ 网络错误");
    } finally {
        try {
            clearInterval(stepTimer);
        } catch (e) { }
        setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black text-white relative overflow-hidden font-sans">
      <GridBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/50">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            NEXUS<span className="text-white">PULSE</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-xs text-cyan-500/70 font-mono animate-pulse">系统在线</span>
           <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
        </div>
      </header>

      {/* Main Content - 3 Column Grid */}
      <main className="pt-20 pb-6 px-6 h-full grid grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: HARD DATA (Span 3) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar">
          <IronCard title="任务状态" icon={Activity}>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-xs text-gray-400">系统负载</span>
                   <span className="text-xs font-mono text-cyan-400">42%</span>
                </div>
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                   <div className="bg-cyan-500 h-full w-[42%]" />
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs text-gray-400">活跃特工</span>
                   <span className="text-xs font-mono text-green-400">3 在线</span>
                </div>
             </div>
          </IronCard>

          <IronCard title="核心指标" icon={BarChart3} className="flex-1">
             {reportData ? (
                <div className="space-y-6">
                   <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
                      <div className="text-xs text-gray-400 mb-1">情绪评分</div>
                      <div className="text-3xl font-bold text-cyan-400">{reportData.structured_data?.sentiment_score || 50}</div>
                   </div>
                   <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
                      <div className="text-xs text-gray-400 mb-1">热度指数</div>
                      <div className="text-3xl font-bold text-orange-400">{reportData.structured_data?.heat_index || 50}</div>
                   </div>
                   <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
                      <div className="text-xs text-gray-400 mb-1">影响得分</div>
                      <div className="text-3xl font-bold text-purple-400">{reportData.structured_data?.impact_score || 50}</div>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-white/10">
                      <h4 className="text-xs font-bold text-gray-300 mb-2 uppercase">检测信号</h4>
                      <div className="flex flex-wrap gap-2">
                         <span className="px-2 py-1 text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 rounded">风险: 高</span>
                         <span className="px-2 py-1 text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 rounded">机会: 中</span>
                      </div>
                   </div>
                </div>
             ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                   等待数据流...
                </div>
             )}
          </IronCard>

          <IronCard title="市场趋势" icon={TrendingUp} className="flex-1 min-h-[300px]">
             <div className="h-full w-full -m-4 p-4">
                <TrendChart />
             </div>
          </IronCard>
        </div>

        {/* CENTER COLUMN: MAIN STAGE (Span 6) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar">
           
           {/* Search Bar */}
           <div className="bg-black/40 border border-white/10 backdrop-blur-md rounded-xl p-2 flex items-center gap-2 relative">
              <Search className="w-5 h-5 text-gray-400 ml-2" />
              <input 
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => !loading && e.key === 'Enter' && handleGenerate()}
                onFocus={() => searchQuery && setShowDropdown(true)}
                placeholder="输入战略目标 (例如: NVIDIA, SHEIN)..."
                className="bg-transparent border-none outline-none text-white w-full h-10 placeholder:text-gray-600 font-mono"
              />
              <button 
                 onClick={handleGenerate}
                 disabled={loading}
                 className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                 {loading ? loadingText : "执行"}
              </button>
              
              {/* Dropdown Menu */}
              {showDropdown && filteredSkills.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
                  {filteredSkills.map((skill, index) => (
                    <button
                      key={index}
                      onClick={() => handleSkillSelect(skill)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-gray-300 transition-colors"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
           </div>

           {/* Verdict Card */}
           {reportData && (
              <IronCard className="border-cyan-500/30 bg-cyan-950/20">
                 <h2 className="text-lg font-bold text-cyan-400 mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    战略裁决
                 </h2>
                 <div className="text-gray-200 leading-relaxed font-light italic border-l-2 border-cyan-500 pl-4">
                    <div dangerouslySetInnerHTML={{ __html: (reportData?.verdict_text || "").replace(/\n/g, '<br/>') }} />
                 </div>
              </IronCard>
           )}

           {/* Logic Graph - MAIN STAGE */}
           <IronCard title="逻辑推演图谱" icon={TrendingUp} className="flex-1 min-h-[500px]">
              {reportData?.mermaid_code ? (
                 <LogicFlow code={reportData.mermaid_code} />
              ) : (
                 <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 animate-spin-slow" />
                    <p className="font-mono text-sm">等待目标分析...</p>
                 </div>
              )}
           </IronCard>

           {/* Debate Section */}
           {reportData && (
              <IronCard title="特工辩论日志" icon={Activity}>
                 <div className="prose prose-invert prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: (reportData?.debate_details || "").replace(/\n/g, '<br/>') }} />
                 </div>
              </IronCard>
           )}
        </div>

        {/* RIGHT COLUMN: LIVE DYNAMICS (Span 3) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar">
           <IronCard title="全球动态" icon={Globe} className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden">
                 <LiveGlobalFeed />
              </div>
           </IronCard>
        </div>

      </main>
    </div>
  )
}
