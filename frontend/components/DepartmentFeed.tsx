import React, { useState } from 'react';
import { Target, Globe, Users, ShieldAlert, ShoppingBag, TrendingUp, CheckCircle, XCircle, AlertTriangle, FileText, Send, X, Activity, TrendingDown, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';

export default function DepartmentFeed({ data }: { data: any }) {
  if (!data || !data.agents) return null;
  const [showReport, setShowReport] = useState(false);
  
  // 1. Safe Data Access for Charts (Handling potential missing data gracefully)
  const charts = data.charts || {};
  const sentimentData = charts.monthly_sentiment || [];
  const radarData = charts.competitor_radar || [];
  const painData = charts.pain_distribution || [];

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
      
      {/* CEO VERDICT CARD */}
      <div className={`relative overflow-hidden rounded-xl border ${vBorder} bg-opacity-10 bg-gray-900 p-6 backdrop-blur-md shadow-2xl group`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><VerdictIcon size={120} /></div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-black/40 border border-white/10 ${vColor}`}><VerdictIcon size={20} /></div>
                <h2 className="text-xs font-mono text-gray-400 tracking-[0.2em] uppercase">Strategic Verdict</h2>
            </div>
            <div className={`text-4xl font-black ${vColor} tracking-tighter mb-4`}>{data.verdict}</div>
            <p className="text-gray-200 text-sm leading-relaxed border-l-2 border-white/20 pl-4 italic">"{data.final_summary}"</p>
            
            <div className="mt-6 flex gap-3">
                <button onClick={() => setShowReport(true)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] uppercase tracking-wide">
                    <FileText size={14} /> View McKinsey Report
                </button>
                <button onClick={() => alert("✅ Data Pushed to Feishu: 'NexusPulse_Strategy_Q1.bitable'")} className="flex-1 py-3 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-500/30 rounded text-xs font-bold text-cyan-400 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] uppercase tracking-wide">
                    <Send size={14} /> Sync to Feishu
                </button>
            </div>
        </div>
      </div>

      {/* AGENT TIMELINE (Standard Feed) */}
      <div className="relative border-l border-gray-800 ml-4 space-y-8">
        {agents.map((ag) => (
          <div key={ag.id} className="relative pl-8 group">
            <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-2 border-[#0a0a0a] bg-${ag.color}-900 group-hover:bg-${ag.color}-500 transition-colors shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></div>
            <div className={`bg-[#0a0f1c] border border-gray-800/60 p-5 rounded-lg hover:border-${ag.color}-500/50 transition-all duration-300 shadow-lg`}>
              <div className="flex justify-between items-start mb-3 border-b border-gray-800/50 pb-3">
                 <div className="flex items-center gap-3">
                   <div className={`p-1.5 rounded bg-${ag.color}-500/10 text-${ag.color}-400`}><ag.icon size={16} /></div>
                   <div><div className={`text-[10px] font-bold text-${ag.color}-500 uppercase font-mono`}>{ag.label}</div><div className="text-[10px] text-gray-500 font-mono">{ag.title}</div></div>
                 </div>
                 <div className={`text-2xl font-black text-white font-mono`}>{ag.score || ag.prob || ag.risk || ag.urgency || ag.dos}<span className="text-[10px] text-gray-500 ml-1">{ag.id==='supply'?'DAYS':(ag.id==='compliance'?'/10':'%')}</span></div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed font-sans mb-4">{ag.analysis}</p>
            </div>
          </div>
        ))}
      </div>

      {/* === MCKINSEY VISUAL DASHBOARD MODAL === */}
      {showReport && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex justify-center animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
           <div className="w-full max-w-6xl my-4 md:my-10 bg-[#0a0a0a] border border-gray-800 rounded-xl shadow-2xl overflow-hidden relative flex flex-col">
              
              {/* Header */}
              <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0a0a0a]/95 backdrop-blur border-b border-gray-800">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-900/20 rounded border border-cyan-500/30 text-cyan-400"><Activity size={18} /></div>
                      <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">STRATEGIC FEASIBILITY STUDY</h1>
                        <div className="text-[10px] text-gray-500 font-mono">GENERATED BY NEXUS_PULSE // MCKINSEY MODEL</div>
                      </div>
                  </div>
                  <button onClick={() => setShowReport(false)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6 md:p-10 space-y-12">
                  
                  {/* SECTION 1: VISUAL DATA DECK */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Chart A: Sentiment Trend */}
                      <div className="bg-[#111] border border-gray-800 rounded-lg p-5 flex flex-col">
                          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-4 flex items-center gap-2 tracking-widest"><TrendingUp size={12}/> 6-Month Projection</h3>
                          <div className="flex-1 h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={sentimentData}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                      <XAxis dataKey="month" tick={{fontSize: 10, fill:'#555'}} axisLine={false} tickLine={false} />
                                      <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} itemStyle={{fontSize:'12px'}} />
                                      <Line type="monotone" dataKey="sentiment" stroke="#06b6d4" strokeWidth={3} dot={{r: 4, fill:'#06b6d4', strokeWidth:0}} activeDot={{r: 6}} />
                                  </LineChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      {/* Chart B: Competitor Radar */}
                      <div className="bg-[#111] border border-gray-800 rounded-lg p-5 flex flex-col">
                          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-4 flex items-center gap-2 tracking-widest"><Zap size={12}/> Competitive Landscape</h3>
                          <div className="flex-1 h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                      <PolarGrid stroke="#333" />
                                      <PolarAngleAxis dataKey="subject" tick={{fontSize: 9, fill: '#666'}} />
                                      <Radar name="Us" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                                      <Radar name="Them" dataKey="B" stroke="#444" fill="#444" fillOpacity={0.2} />
                                      <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                                  </RadarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      {/* Chart C: Pain Distribution */}
                      <div className="bg-[#111] border border-gray-800 rounded-lg p-5 flex flex-col">
                          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-4 flex items-center gap-2 tracking-widest"><TrendingDown size={12}/> Critical Friction Points</h3>
                          <div className="flex-1 h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={painData} layout="vertical">
                                      <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                                      <XAxis type="number" hide />
                                      <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fill:'#888'}} axisLine={false} tickLine={false} />
                                      <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                                      <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>
                  </div>

                  {/* SECTION 2: DEEP TEXT ANALYSIS (SCQA CONTENT) */}
                  <div className="max-w-4xl mx-auto">
                      <div className="prose prose-invert prose-sm md:prose-base max-w-none
                            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
                            prose-h1:text-3xl prose-h1:text-cyan-400 prose-h1:mb-8 prose-h1:border-b prose-h1:border-gray-800 prose-h1:pb-4
                            prose-h2:text-xl prose-h2:text-gray-200 prose-h2:mt-10 prose-h2:mb-4 prose-h2:flex prose-h2:items-center prose-h2:gap-2
                            prose-p:text-gray-400 prose-p:leading-relaxed prose-p:mb-6
                            prose-li:text-gray-400 prose-strong:text-cyan-300
                            prose-blockquote:border-l-4 prose-blockquote:border-cyan-900 prose-blockquote:bg-gray-900/50 prose-blockquote:p-4 prose-blockquote:rounded-r prose-blockquote:italic
                      ">
                          <ReactMarkdown>{data.full_report || "## Report Generation in Progress...\n\nSynthesizing global intelligence nodes. Please wait."}</ReactMarkdown>
                      </div>
                  </div>
              </div>
              
              <div className="py-6 border-t border-gray-800 bg-[#080808] text-center">
                  <span className="text-[10px] font-mono text-gray-600">CONFIDENTIAL // NEXUS PULSE STRATEGIC OUTPUT</span>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
