import React, { useState } from 'react';
import { Target, Globe, Users, ShieldAlert, ShoppingBag, TrendingUp, CheckCircle, XCircle, AlertTriangle, FileText, Send, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DepartmentFeed({ data }: { data: any }) {
  if (!data || !data.agents) return null;
  
  const [showReport, setShowReport] = useState(false);

  const agents = [
    { id: 'selection', icon: Target, label: 'SNIPER // SELECTION', color: 'blue', ...data.agents.selection },
    { id: 'culture', icon: Globe, label: 'LOCALIZER // CULTURE', color: 'purple', ...data.agents.culture },
    { id: 'pain', icon: Users, label: 'PAIN KILLER // DEMAND', color: 'orange', ...data.agents.pain },
    { id: 'compliance', icon: ShieldAlert, label: 'GATEKEEPER // RISK', color: 'red', ...data.agents.compliance },
    { id: 'supply', icon: ShoppingBag, label: 'CFO // SUPPLY CHAIN', color: 'yellow', ...data.agents.supply },
    { id: 'growth', icon: TrendingUp, label: 'HACKER // GROWTH', color: 'green', ...data.agents.growth },
  ];

  const VerdictIcon = data.verdict === 'GO' ? CheckCircle : (data.verdict === 'KILL' ? XCircle : AlertTriangle);
  const vColor = data.verdict === 'GO' ? 'text-green-400' : (data.verdict === 'KILL' ? 'text-red-500' : 'text-yellow-400');
  const vBorder = data.verdict === 'GO' ? 'border-green-500/50' : (data.verdict === 'KILL' ? 'border-red-500/50' : 'border-yellow-500/50');

  return (
    <div className="space-y-8 pb-20 relative px-2">
      
      {/* 1. CEO VERDICT CARD */}
      <div className={`relative overflow-hidden rounded-xl border ${vBorder} bg-opacity-10 bg-gray-900 p-6 backdrop-blur-md shadow-2xl`}>
        <div className="flex items-center gap-3 mb-3">
             <div className={`p-2 rounded-lg bg-black/40 border border-white/10 ${vColor}`}><VerdictIcon size={20} /></div>
             <h2 className="text-xs font-mono text-gray-400 tracking-[0.2em] uppercase">Strategic Verdict</h2>
        </div>
        <div className={`text-4xl font-black ${vColor} tracking-tighter mb-4`}>{data.verdict}</div>
        <p className="text-gray-200 text-sm leading-relaxed border-l-2 border-white/20 pl-4 italic">"{data.final_summary}"</p>
        
        {/* GLOBAL ACTIONS */}
        <div className="mt-6 flex gap-3">
            <button
                onClick={() => setShowReport(true)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
                <FileText size={14} />
                阅读完整研报 (FULL REPORT)
            </button>
            <button
                onClick={() => alert("Simulating: Connecting to Feishu Open Platform...\n\n✅ Data Pushed to: 'NexusPulse_Daily_Briefing.bitable'")}
                className="flex-1 py-2 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/30 rounded text-xs font-bold text-cyan-400 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
                <Send size={14} />
                推送至飞书 (SYNC LARK)
            </button>
        </div>
      </div>

      {/* 2. AGENT TIMELINE */}
      <div className="relative border-l border-gray-800 ml-4 space-y-8">
        {agents.map((ag) => (
          <div key={ag.id} className="relative pl-8 group">
            <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-2 border-[#0a0a0a] bg-${ag.color}-900 group-hover:bg-${ag.color}-500 transition-colors shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></div>
            
            <div className={`bg-[#0a0f1c] border border-gray-800/60 p-5 rounded-lg hover:border-${ag.color}-500/50 transition-all duration-300 shadow-lg`}>
              <div className="flex justify-between items-start mb-3 border-b border-gray-800/50 pb-3">
                 <div className="flex items-center gap-3">
                   <div className={`p-1.5 rounded bg-${ag.color}-500/10 text-${ag.color}-400 shadow-[0_0_10px_rgba(0,0,0,0.2)]`}><ag.icon size={16} /></div>
                   <div>
                     <div className={`text-[10px] font-bold text-${ag.color}-500 tracking-widest uppercase font-mono`}>{ag.label}</div>
                     <div className="text-[10px] text-gray-500 font-mono">{ag.title}</div>
                   </div>
                 </div>
                 <div className={`text-2xl font-black text-white font-mono leading-none`}>
                    {ag.score || ag.prob || ag.risk || ag.urgency || ag.dos}
                    <span className="text-[10px] text-gray-500 ml-1 font-sans font-normal">
                        {ag.id === 'supply' ? 'DAYS' : (ag.id === 'compliance' ? '/10' : '%')}
                    </span>
                 </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed font-sans mb-4">{ag.analysis}</p>
              
              {/* Micro Action Bar */}
              <div className="flex items-center justify-between border-t border-gray-800/50 pt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                 <div className="flex gap-3">
                    <button onClick={() => setShowReport(true)} className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 transition-colors"><FileText size={10}/> Deep Dive</button>
                    <button onClick={() => alert("Synced to Department Base")} className="text-[10px] text-gray-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"><Send size={10}/> Push Data</button>
                 </div>
                 <div className="text-[9px] text-gray-600 font-mono">API: AGENT_{ag.id.toUpperCase()}_V1</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. REPORT VIEWER MODAL */}
      {showReport && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-end animate-in slide-in-from-right duration-300">
           <div className="w-full md:w-[800px] h-full bg-[#0a0a0a] border-l border-gray-800 overflow-y-auto p-8 md:p-12 custom-scrollbar shadow-2xl relative">
              <button
                onClick={() => setShowReport(false)}
                className="absolute top-6 right-6 p-2 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors border border-gray-700 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="mb-8 border-b border-gray-800 pb-6">
                 <div className="text-xs font-mono text-cyan-500 mb-2">NEXUS_PULSE // DEEP_RESEARCH_MODULE</div>
                 <h1 className="text-3xl font-bold text-white tracking-tight">STRATEGIC FEASIBILITY STUDY</h1>
              </div>
              
              <div className="prose prose-invert prose-sm max-w-none
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
                    prose-h1:text-2xl prose-h1:text-cyan-400 prose-h1:mt-8 prose-h1:mb-4
                    prose-h2:text-lg prose-h2:text-gray-200 prose-h2:mt-8 prose-h2:border-l-4 prose-h2:border-cyan-500 prose-h2:pl-4
                    prose-p:text-gray-400 prose-p:leading-relaxed
                    prose-strong:text-cyan-300 prose-li:text-gray-400
                    prose-blockquote:border-l-2 prose-blockquote:border-gray-700 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-500
                    prose-code:text-yellow-500 prose-code:bg-gray-900 prose-code:px-1 prose-code:rounded
              ">
                  <ReactMarkdown>{data.full_report || "## Generating Report...\n\nSystem is synthesizing gathered intelligence. Please wait for the next analysis cycle."}</ReactMarkdown>
              </div>
              
              <div className="h-24 flex items-center justify-center mt-12 border-t border-gray-800">
                  <span className="text-xs font-mono text-gray-600">END OF REPORT // GENERATED BY NEXUS PULSE AI</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
