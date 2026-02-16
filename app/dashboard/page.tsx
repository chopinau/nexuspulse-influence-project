"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { PersonaInput } from "@/components/PersonaInput";
import StrategicDashboard from "@/components/StrategicDashboard";
import StrategicBlueprint from "@/components/StrategicBlueprint";
import DepartmentFeed from "@/components/DepartmentFeed"; // Import the new component
import { LayoutDashboard, Map, Activity, FileText } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'blueprint'>('dashboard');
  const [activeLeftTab, setActiveLeftTab] = useState<'report' | 'feed'>('feed'); // New State for Left Panel
  const [status, setStatus] = useState("");
  const [report, setReport] = useState("");
  const [vizData, setVizData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false); // For Modal

  // State for PersonaInput compatibility
  const [mode, setMode] = useState("GENERAL");
  const [strategyMode, setStrategyMode] = useState<'incubation' | 'growth'>('incubation');

  const handleExecute = async (input: any) => {
    setIsLoading(true);
    setStatus("📡 Initializing Global Scan...");
    setActiveTab('dashboard'); 
    setActiveLeftTab('feed'); // Default to Feed view on new search
    setReport(""); setVizData(null);

    try {
      // Step 1: Brainstorm
      const bRes = await fetch("http://localhost:8001/api/brainstorm", {
          method: "POST", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ product: input.topic, persona: "General" })
      });
      if (!bRes.ok) throw new Error("Brainstorm API failed");
      const bData = await bRes.json();
      
      // Step 2: Analyze
      setStatus(`🎯 Locked Target: ${bData.focus_topic}... Analyzing...`);
      const aRes = await fetch("http://localhost:8001/api/analyze", {
          method: "POST", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ 
            product: input.topic, 
            persona: "General", 
            focus_topic: bData.focus_topic,
            market: input.market // Pass market from input
          })
      });
      if (!aRes.ok) throw new Error("Analysis API failed");
      const aData = await aRes.json();

      setReport(aData.markdown_report);
      setVizData(aData.structured_data);
      setStatus("✅ Mission Complete");

    } catch (e: any) {
      console.error(e);
      setStatus("❌ Error: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* 1. Top Navigation Bar */}
      <div className="h-14 border-b border-gray-800 bg-[#0a0f1c] flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter select-none">
          <span className="text-cyan-500">NEXUS</span><span className="text-white">PULSE</span>
          <span className="text-[10px] bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">V3.0</span>
        </div>
        
        {/* RIGHT TAB SWITCHER */}
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
            onClick={() => setShowBlueprintModal(true)} // Open Modal
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

      {/* 2. Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
         
         {/* === LEFT COLUMN: Input + Feed/Report === */}
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
                    <div className={`font-mono text-xs px-2 py-1 rounded border transition-colors duration-300 ${
                        status.includes("Error") ? "text-red-400 border-red-900 bg-red-900/10" : "text-cyan-400 border-cyan-900 bg-cyan-900/10 animate-pulse"
                    }`}>
                        {status}
                    </div>
                 )}
                 {/* Left Panel Tab Switcher */}
                 <div className="flex gap-2">
                    <button onClick={() => setActiveLeftTab('feed')} className={`text-xs px-2 py-1 rounded ${activeLeftTab === 'feed' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>FEED</button>
                    <button onClick={() => setActiveLeftTab('report')} className={`text-xs px-2 py-1 rounded ${activeLeftTab === 'report' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>REPORT</button>
                 </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative scrollbar-thin scrollbar-thumb-gray-800">
               {activeLeftTab === 'feed' && vizData ? (
                  <DepartmentFeed data={vizData} />
               ) : report ? (
                 <div className="prose prose-invert prose-sm max-w-none 
                    prose-headings:text-cyan-100 prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide 
                    prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-800 prose-h1:pb-4 prose-h1:mb-6 
                    prose-h2:text-lg prose-h2:mt-8 prose-h2:text-cyan-400 prose-h2:border-l-4 prose-h2:border-cyan-600 prose-h2:pl-3 
                    prose-strong:text-yellow-400 prose-strong:font-black 
                    prose-table:border prose-th:bg-gray-900 prose-th:text-xs prose-th:uppercase prose-td:text-xs prose-td:border-gray-800 
                    prose-blockquote:border-l-4 prose-blockquote:border-red-500 prose-blockquote:bg-red-900/10 prose-blockquote:p-4 prose-blockquote:rounded-r 
                 ">
                    <ReactMarkdown>{report}</ReactMarkdown>
                 </div>
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
                   <Activity size={64} className="text-cyan-500 mb-4 animate-pulse" />
                   <div className="text-sm font-mono tracking-[0.3em]">AWAITING TARGET DATA</div>
                 </div>
               )}
            </div>
         </div>

         {/* === RIGHT COLUMN: Dashboard Only (Blueprint is Modal) === */}
         <div className="w-2/5 relative bg-[#0a0a0a]">
             <div className="h-full p-4 relative">
                {/* Subtle gradient line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-600 to-transparent opacity-50"></div>
                <StrategicDashboard data={vizData} />
             </div>
         </div>
      </div>

      {/* MODAL: Strategic Blueprint */}
      {showBlueprintModal && vizData && (
        <StrategicBlueprint data={vizData} onClose={() => setShowBlueprintModal(false)} />
      )}
    </div>
  );
}
