import React from 'react';
import { ShieldCheck, Target, Globe, Users, ShieldAlert, ShoppingBag, TrendingUp, Activity, AlertTriangle, Radio } from 'lucide-react';

interface AgentData {
  score: number;
  title: string;
  analysis: string;
}

interface DashboardData {
  verdict?: string;
  final_summary?: string;
  dashboard_agents?: Record<string, AgentData>;
  agents?: Record<string, AgentData>;
  charts?: {
    monthly_sentiment?: Array<{ month: string; sentiment: number }>;
    competitor_radar?: Array<{ subject: string; A: number; B: number; fullMark: number }>;
    pain_distribution?: Array<{ name: string; value: number }>;
  };
  news?: Array<{ url: string; title: string }>;
  competitors?: Array<{ name: string; price: string }>;
}

export default function StrategicDashboard({ data }: { data: DashboardData | null }) {
  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50 bg-[#050505]">
        <div className="w-16 h-16 border-t-2 border-b-2 border-cyan-500 rounded-full animate-spin"></div>
        <div className="text-cyan-500 font-mono text-xs animate-pulse tracking-widest">INITIALIZING STRATEGIC LINK...</div>
    </div>
  );
  
  const agents = data.dashboard_agents || data.agents || {};
  
  const getAgentScore = (key: string): number => {
    const agent = agents[key];
    return agent?.score ?? 50;
  };
  
  const getAgentTitle = (key: string): string => {
    const agent = agents[key];
    return agent?.title || 'Analyzing...';
  };
  
  const getAgentAnalysis = (key: string): string => {
    const agent = agents[key];
    return agent?.analysis || '';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]';
    if (score >= 50) return 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]';
    return 'text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getScoreStatus = (score: number): string => {
    if (score >= 80) return 'STABLE';
    if (score >= 50) return 'CAUTION';
    return 'CRITICAL';
  };

  return (
    <div className="flex flex-col h-full gap-4 p-2 bg-[#050505]">
      
      <div className="grid grid-cols-2 gap-3">
         
         <ProCard label="COMPLIANCE" id="AG-04" color="red" icon={ShieldAlert} score={getAgentScore('compliance')}>
            <div className="flex justify-between items-end mb-2">
                <div className={`text-3xl font-black font-mono ${getScoreColor(getAgentScore('compliance'))}`}>{getAgentScore('compliance')}<span className="text-sm text-gray-500">/100</span></div>
                <div className={`text-[10px] font-bold px-1 rounded animate-pulse ${
                  getAgentScore('compliance') < 40 ? 'text-red-400 bg-red-900/20' : 
                  getAgentScore('compliance') < 70 ? 'text-orange-400 bg-orange-900/20' : 
                  'text-green-400 bg-green-900/20'
                }`}>
                    {getScoreStatus(getAgentScore('compliance'))}
                </div>
            </div>
            <div className="flex gap-0.5 h-1.5 mb-1">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${i < getAgentScore('compliance') / 10 ? getScoreBgColor(getAgentScore('compliance')) : 'bg-gray-800'}`}></div>
                ))}
            </div>
            <div className="text-[9px] text-gray-500 font-mono truncate">
                {getAgentAnalysis('compliance') || 'Analyzing compliance risks...'}
            </div>
         </ProCard>

         <ProCard label="SUPPLY CHAIN" id="AG-05" color="yellow" icon={ShoppingBag} score={getAgentScore('supply')}>
            <div className="flex justify-between items-end mb-2">
                <div className={`text-3xl font-black font-mono ${getScoreColor(getAgentScore('supply'))}`}>{getAgentScore('supply')}<span className="text-sm text-gray-500">/100</span></div>
                <div className={`text-[10px] font-mono ${
                  getAgentScore('supply') >= 80 ? 'text-green-400' : 
                  getAgentScore('supply') >= 50 ? 'text-orange-400' : 
                  'text-red-400'
                }`}>HEALTH</div>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-1">
                <div className={`h-full ${getScoreBgColor(getAgentScore('supply'))}`} style={{width: `${getAgentScore('supply')}%`}}></div>
            </div>
            <div className="text-[9px] text-gray-500 font-mono truncate">
                {getAgentAnalysis('supply') || 'Analyzing supply chain...'}
            </div>
         </ProCard>

         <ProCard label="GROWTH" id="AG-06" color="green" icon={TrendingUp} score={getAgentScore('growth')}>
            <div className="flex justify-between items-end mb-2">
                <div className={`text-3xl font-black font-mono ${getScoreColor(getAgentScore('growth'))}`}>{getAgentScore('growth')}<span className="text-sm text-gray-500">/100</span></div>
                <div className={`text-[10px] font-mono ${
                  getAgentScore('growth') >= 80 ? 'text-green-400' : 
                  getAgentScore('growth') >= 50 ? 'text-orange-400' : 
                  'text-red-400'
                }`}>POTENTIAL</div>
            </div>
            <div className="flex items-end gap-1 h-3 mb-1">
                <div className={`w-1/5 h-[20%] ${getAgentScore('growth') > 20 ? getScoreBgColor(getAgentScore('growth')) : 'bg-gray-800'} rounded-sm`}></div>
                <div className={`w-1/5 h-[40%] ${getAgentScore('growth') > 40 ? getScoreBgColor(getAgentScore('growth')) : 'bg-gray-800'} rounded-sm`}></div>
                <div className={`w-1/5 h-[60%] ${getAgentScore('growth') > 60 ? getScoreBgColor(getAgentScore('growth')) : 'bg-gray-800'} rounded-sm`}></div>
                <div className={`w-1/5 h-[80%] ${getAgentScore('growth') > 80 ? getScoreBgColor(getAgentScore('growth')) : 'bg-gray-800'} rounded-sm`}></div>
                <div className={`w-1/5 h-[100%] ${getAgentScore('growth') > 90 ? getScoreBgColor(getAgentScore('growth')) : 'bg-gray-800'} rounded-sm`}></div>
            </div>
            <div className="text-[9px] text-gray-500 font-mono truncate">
                {getAgentAnalysis('growth') || 'Analyzing growth potential...'}
            </div>
         </ProCard>

         <ProCard label="DEMAND" id="AG-03" color="orange" icon={Users} score={getAgentScore('pain')}>
             <div className="flex justify-between items-end mb-2">
                <div className={`text-3xl font-black font-mono ${getScoreColor(getAgentScore('pain'))}`}>{getAgentScore('pain')}<span className="text-sm text-gray-500">/100</span></div>
                <Activity size={12} className={`${
                  getAgentScore('pain') >= 80 ? 'text-green-500' : 
                  getAgentScore('pain') >= 50 ? 'text-orange-500' : 
                  'text-red-500'
                } animate-pulse`} />
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-1 relative">
                <div className="absolute top-0 left-0 h-full bg-orange-500/30 w-full"></div>
                <div className={`h-full ${getScoreBgColor(getAgentScore('pain'))} relative z-10`} style={{width: `${getAgentScore('pain')}%`}}></div>
            </div>
            <div className="text-[9px] text-gray-500 font-mono truncate">
                {getAgentAnalysis('pain') || 'Analyzing market demand...'}
            </div>
         </ProCard>

         <ProCard label="CULTURE" id="AG-02" color="purple" icon={Globe} score={getAgentScore('culture')}>
            <div className="flex justify-between items-end mb-2">
                <div className={`text-3xl font-black font-mono ${getScoreColor(getAgentScore('culture'))}`}>{getAgentScore('culture')}<span className="text-sm text-gray-500">/100</span></div>
                <div className={`text-[9px] font-mono ${
                  getAgentScore('culture') >= 80 ? 'text-green-400' : 
                  getAgentScore('culture') >= 50 ? 'text-orange-400' : 
                  'text-red-400'
                }`}>FIT</div>
            </div>
            <div className="text-[9px] text-gray-500 font-mono truncate">
                {getAgentAnalysis('culture') || 'Analyzing cultural fit...'}
            </div>
         </ProCard>

         <ProCard label="SELECTION" id="AG-01" color="blue" icon={Target} score={getAgentScore('selection')}>
            <div className="flex justify-between items-end mb-2">
                <div className={`text-3xl font-black font-mono ${getScoreColor(getAgentScore('selection'))}`}>{getAgentScore('selection')}<span className="text-sm text-gray-500">/100</span></div>
                <Target size={12} className={`${
                  getAgentScore('selection') >= 80 ? 'text-green-500' : 
                  getAgentScore('selection') >= 50 ? 'text-orange-500' : 
                  'text-red-500'
                }`} />
            </div>
            <div className="text-[9px] text-gray-400 font-mono leading-tight truncate">
                {getAgentTitle('selection') || 'Analyzing product selection...'}
            </div>
         </ProCard>
      </div>

      <div className="flex-1 border border-gray-800 bg-[#0a0a0a] rounded-lg flex flex-col overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
         <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-4 animate-scan opacity-30"></div>
         
         <div className="bg-[#111] border-b border-gray-800 px-3 py-2 flex justify-between items-center z-10">
             <div className="text-[10px] text-cyan-500 font-bold font-mono flex items-center gap-2">
                <Radio size={12} className="text-cyan-400" /> INTELLIGENCE_UPLINK
             </div>
             <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-green-900"></div>
             </div>
         </div>
         
         <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar z-10">
            {data.charts?.pain_distribution?.length > 0 ? (
              data.charts.pain_distribution.map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-1.5 hover:bg-white/5 border-l-2 border-transparent hover:border-cyan-500/50 transition-all group">
                   <span className="text-[9px] font-mono text-orange-400 w-8 shrink-0 opacity-70">PAIN</span>
                   <span className="text-[10px] text-gray-400 font-mono leading-tight group-hover:text-cyan-100 transition-colors">
                       {item.name}: ${item.value?.toLocaleString() || 0}
                   </span>
                </div>
              ))
            ) : data.news?.length > 0 ? (
              data.news.map((n, i) => {
                 const url = (n.url || '').toLowerCase();
                 let tag = "RAW", color = "text-gray-500";
                 if (url.includes('.gov')) { tag="GOV"; color="text-blue-400"; }
                 else if (url.includes('reddit')) { tag="HUMAN"; color="text-orange-400"; }
                 else if (url.includes('amazon')) { tag="DATA"; color="text-green-400"; }
                 
                 return (
                   <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 p-1.5 hover:bg-white/5 border-l-2 border-transparent hover:border-cyan-500/50 transition-all group">
                      <span className={`text-[9px] font-mono ${color} w-8 shrink-0 opacity-70`}>{tag}</span>
                      <span className="text-[10px] text-gray-400 font-mono leading-tight group-hover:text-cyan-100 transition-colors line-clamp-1">
                          {n.title}
                      </span>
                   </a>
                 )
              })
            ) : (
              <div className="text-gray-600 text-xs font-mono text-center py-4">
                No intelligence data available
              </div>
            )}
         </div>
      </div>

      <div className="border border-gray-800 bg-gray-900/40 rounded p-2">
         <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono mb-1 px-1">
            <span>COMPETITOR RADAR</span>
            <span>SCORE</span>
         </div>
         {data.charts?.competitor_radar?.slice(0,3).map((c, i) => (
            <div key={i} className="flex justify-between items-center text-[10px] px-1 py-1 border-t border-gray-800/50 font-mono text-gray-300">
               <span className="truncate w-2/3">{c.subject}</span>
               <span className="text-cyan-400">{c.A || 0} vs {c.B || 0}</span>
            </div>
         )) || data.competitors?.slice(0,2).map((c, i) => (
            <div key={i} className="flex justify-between items-center text-[10px] px-1 py-1 border-t border-gray-800/50 font-mono text-gray-300">
               <span className="truncate w-2/3">{c.name}</span>
               <span className="text-red-400">{c.price}</span>
            </div>
         )) || (
           <div className="text-gray-600 text-xs font-mono text-center py-2">
             No competitor data
           </div>
         )}
      </div>

    </div>
  );
}

function ProCard({label, id, color, icon: Icon, score, children}: any) {
    return (
        <div className={`bg-[#080808] border border-gray-800 hover:border-${color}-900/80 p-3 rounded-lg relative overflow-hidden group transition-all`}>
            <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}-900/50 group-hover:border-${color}-500/50`}></div>
            <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}-900/50 group-hover:border-${color}-500/50`}></div>
            <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}-900/50 group-hover:border-${color}-500/50`}></div>
            <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}-900/50 group-hover:border-${color}-500/50`}></div>
            
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-1.5">
                    <Icon size={10} className={`text-${color}-500`} />
                    <span className={`text-[9px] font-bold text-gray-500 group-hover:text-${color}-400 transition-colors tracking-widest`}>{label}</span>
                </div>
                <span className="text-[8px] text-gray-700 font-mono">{id}</span>
            </div>
            
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}
