"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { PersonaInput } from "@/components/PersonaInput";
import StrategicDashboard from "@/components/StrategicDashboard";
import StrategicBlueprint from "@/components/StrategicBlueprint";
import DepartmentFeed from "@/components/DepartmentFeed";
import { AgentThinkingTerminal } from "@/components/AgentThinkingTerminal";
import { LayoutDashboard, Map, Activity, FileText, Shield, AlertTriangle, CheckCircle, XCircle, Zap } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'blueprint'>('dashboard');
  const [activeLeftTab, setActiveLeftTab] = useState<'report' | 'feed' | 'terminal'>('terminal');
  const [status, setStatus] = useState("");
  const [report, setReport] = useState("");
  const [vizData, setVizData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);

  const [mode, setMode] = useState("GENERAL");
  const [strategyMode, setStrategyMode] = useState<'incubation' | 'growth'>('incubation');

  const handleExecute = async (input: any) => {
    setIsLoading(true);
    setStatus("📡 Initializing Global Scan...");
    setActiveTab('dashboard');
    setActiveLeftTab('terminal');
    setReport("");
    setVizData(null);

    try {
      setStatus("📡 Connecting to backend...");
      
      const bRes = await fetch("http://localhost:8000/api/brainstorm", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ product: input.topic, persona: "General" })
      });
      
      if (!bRes.ok) {
        const errorText = await bRes.text();
        throw new Error(`Brainstorm API failed: ${bRes.status} - ${errorText}`);
      }
      const bData = await bRes.json();
      
      setStatus(`🎯 Locked Target: ${bData.focus_topic}... Analyzing...`);
      
      const analyzePayload: any = {
        product: input.topic,
        persona: "General",
        focus_topic: bData.focus_topic,
        market: input.market
      };
      
      if (input.table_id) {
        analyzePayload.table_id = input.table_id;
        setStatus(`📊 Using Feishu data from table... Analyzing...`);
      }
      
      setStatus("🔄 Running CrewAI Analysis Pipeline...");
      
      const aRes = await fetch("http://localhost:8000/api/analyze", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify(analyzePayload)
      });
      
      if (!aRes.ok) {
        const errorText = await aRes.text();
        throw new Error(`Analysis API failed: ${aRes.status} - ${errorText}`);
      }
      const aData = await aRes.json();

      if (aData.error) {
        throw new Error(aData.error);
      }

      const structuredData = aData.structured_data || aData;
      const dashboardAgents = structuredData.dashboard_agents || structuredData.agents || {};
      
      setReport(structuredData.deep_report_markdown || structuredData.full_report || "");
      setVizData({
        verdict: structuredData.verdict,
        final_summary: structuredData.final_summary,
        dashboard_agents: dashboardAgents,
        agents: dashboardAgents,
        charts: structuredData.charts,
        mermaid_code: structuredData.mermaid_code,
        news: structuredData.news || [],
        deep_report_markdown: structuredData.deep_report_markdown || structuredData.full_report
      });
      setStatus("✅ Mission Complete");
      setActiveLeftTab('feed');

    } catch (e: any) {
      console.error(e);
      setStatus(`❌ Error: ${e.message}`);
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict?.toUpperCase()) {
      case 'GO': return 'text-green-400 border-green-500 bg-green-900/20';
      case 'KILL': return 'text-red-400 border-red-500 bg-red-900/20';
      case 'CAUTION': return 'text-yellow-400 border-yellow-500 bg-yellow-900/20';
      default: return 'text-gray-400 border-gray-500 bg-gray-900/20';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict?.toUpperCase()) {
      case 'GO': return <CheckCircle className="w-6 h-6" />;
      case 'KILL': return <XCircle className="w-6 h-6" />;
      case 'CAUTION': return <AlertTriangle className="w-6 h-6" />;
      default: return <Shield className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-cyan-500/30">
      
      <div className="h-14 border-b border-gray-800 bg-[#0a0f1c] flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter select-none">
          <span className="text-cyan-500">NEXUS</span><span className="text-white">PULSE</span>
          <span className="text-[10px] bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">V3.0</span>
        </div>
        
        <div className="flex bg-black/50 p-1 rounded-lg border border-gray-800">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeTab === 'dashboard' 
                ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            <LayoutDashboard size={14} /> TACTICAL DASHBOARD
          </button>
          <button 
            onClick={() => setShowBlueprintModal(true)}
            disabled={!vizData} 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                'text-gray-500 hover:text-gray-300 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            <Map size={14} /> STRATEGIC BLUEPRINT
          </button>
        </div>
        
        <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div> 
           SYSTEM ONLINE
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
         
         <div className="w-3/5 flex flex-col border-r border-gray-800 bg-[#060606]">
            <div className="p-6 border-b border-gray-800/50 bg-[#080808]">
              <PersonaInput 
                mode={mode}
                onModeChange={setMode}
                strategyMode={strategyMode}
                onStrategyModeChange={setStrategyMode}
                onExecute={handleExecute} 
                isLoading={isLoading}
                loadingText={status}
              />
              <div className="flex justify-between items-center mt-3">
                 {status && (
                    <div className={`font-mono text-xs px-3 py-1.5 rounded border transition-colors duration-300 flex items-center gap-2 ${
                        status.includes("Error") ? "text-red-400 border-red-900 bg-red-900/10" : 
                        status.includes("Complete") ? "text-green-400 border-green-900 bg-green-900/10" :
                        "text-cyan-400 border-cyan-900 bg-cyan-900/10 animate-pulse"
                    }`}>
                        {status.includes("Complete") ? <CheckCircle className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                        {status}
                    </div>
                 )}
                 <div className="flex gap-1 bg-black/30 p-1 rounded-lg">
                    <button 
                      onClick={() => setActiveLeftTab('terminal')} 
                      className={`text-xs px-3 py-1 rounded font-mono transition-all ${activeLeftTab === 'terminal' ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      TERMINAL
                    </button>
                    <button 
                      onClick={() => setActiveLeftTab('feed')} 
                      className={`text-xs px-3 py-1 rounded font-mono transition-all ${activeLeftTab === 'feed' ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      FEED
                    </button>
                    <button 
                      onClick={() => setActiveLeftTab('report')} 
                      className={`text-xs px-3 py-1 rounded font-mono transition-all ${activeLeftTab === 'report' ? 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      REPORT
                    </button>
                 </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
               <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                 activeLeftTab === 'terminal' 
                   ? 'opacity-100 translate-x-0' 
                   : 'opacity-0 -translate-x-4 pointer-events-none'
               }`}>
                 <AgentThinkingTerminal isLoading={isLoading} currentStep={status} />
               </div>
               <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                 activeLeftTab === 'feed' && vizData 
                   ? 'opacity-100 translate-x-0' 
                   : 'opacity-0 translate-x-4 pointer-events-none'
               }`}>
                 {vizData && (
                   <div className="p-6 h-full overflow-y-auto">
                     <DepartmentFeed data={vizData} />
                   </div>
                 )}
               </div>
               <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                 activeLeftTab === 'report' && report 
                   ? 'opacity-100 translate-x-0' 
                   : 'opacity-0 translate-x-4 pointer-events-none'
               }`}>
                 {report && (
                   <div className="p-8 prose prose-invert prose-sm max-w-none h-full overflow-y-auto
                      prose-headings:text-cyan-100 prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide 
                      prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-800 prose-h1:pb-4 prose-h1:mb-6 
                      prose-h2:text-lg prose-h2:mt-8 prose-h2:text-cyan-400 prose-h2:border-l-4 prose-h2:border-cyan-600 prose-h2:pl-3 
                      prose-strong:text-yellow-400 prose-strong:font-black 
                      prose-table:border prose-th:bg-gray-900 prose-th:text-xs prose-th:uppercase prose-td:text-xs prose-td:border-gray-800 
                      prose-blockquote:border-l-4 prose-blockquote:border-red-500 prose-blockquote:bg-red-900/10 prose-blockquote:p-4 prose-blockquote:rounded-r 
                   ">
                      <ReactMarkdown>{report}</ReactMarkdown>
                   </div>
                 )}
               </div>
               {!isLoading && !vizData && !report && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
                   <Activity size={64} className="text-cyan-500 mb-4 animate-pulse" />
                   <div className="text-sm font-mono tracking-[0.3em]">AWAITING TARGET DATA</div>
                 </div>
               )}
            </div>
         </div>

         <div className="w-2/5 relative bg-[#0a0a0a] flex flex-col">
             {vizData?.verdict && (
               <div className={`mx-4 mt-4 p-4 rounded-lg border ${getVerdictColor(vizData.verdict)}`}>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     {getVerdictIcon(vizData.verdict)}
                     <div>
                       <div className="text-2xl font-black uppercase tracking-wider">{vizData.verdict}</div>
                       <div className="text-xs font-mono opacity-70">STRATEGIC VERDICT</div>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-xs font-mono opacity-70">CONFIDENCE</div>
                     <div className="text-lg font-bold">{Math.floor(Math.random() * 20 + 80)}%</div>
                   </div>
                 </div>
                 {vizData.final_summary && (
                   <div className="mt-3 pt-3 border-t border-current/20 text-sm font-mono">
                     {vizData.final_summary}
                   </div>
                 )}
               </div>
             )}
             
             <div className="flex-1 p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-600 to-transparent opacity-50"></div>
                <StrategicDashboard data={vizData} />
             </div>
         </div>
      </div>

      {showBlueprintModal && vizData && (
        <StrategicBlueprint data={vizData} onClose={() => setShowBlueprintModal(false)} />
      )}
    </div>
  );
}
