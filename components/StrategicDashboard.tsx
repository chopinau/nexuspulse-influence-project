import React from 'react';
import { ShieldCheck, Target, Globe, Users, ShieldAlert, ShoppingBag, TrendingUp, Activity, AlertTriangle, Radio } from 'lucide-react';

export default function StrategicDashboard({ data }: { data: any }) {
  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50 bg-[#050505]">
        <div className="w-16 h-16 border-t-2 border-b-2 border-cyan-500 rounded-full animate-spin"></div>
        <div className="text-cyan-500 font-mono text-xs animate-pulse tracking-widest">INITIALIZING STRATEGIC LINK...</div>
    </div>
  );
  
  const ag = data.agents || data.dashboard_agents;

  return (
    <div className="flex flex-col h-full gap-4 p-2 bg-[#050505]">
      
      {/* 1. AGENT INSTRUMENT PANELS (The Pro Grid) */}
      <div className="grid grid-cols-2 gap-3">
         
         {/* COMPLIANCE (Risk Gauge) */}
         <ProCard label="COMPLIANCE" id="AG-04" color="red" icon={ShieldAlert}>
            <div className="flex justify-between items-end mb-2">
                <div className="text-3xl font-black text-red-500 font-mono">{ag.compliance.risk}<span className="text-sm text-gray-500">/10</span></div>
                <div className="text-[10px] text-red-400 font-bold bg-red-900/20 px-1 rounded animate-pulse">
                    {ag.compliance.risk > 5 ? 'CRITICAL' : 'STABLE'}
                </div>
            </div>
            {/* Segmented Bar */}
            <div className="flex gap-0.5 h-1.5 mb-1">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${i < ag.compliance.risk ? 'bg-red-500' : 'bg-gray-800'}`}></div>
                ))}
            </div>
            <div className="text-[9px] text-gray-500 font-mono flex justify-between">
                <span>RED LINES: {ag.compliance.red_lines}</span>
                <span>FIX: {ag.compliance.fix_cost || '$0'}</span>
            </div>
         </ProCard>

         {/* SUPPLY (Inventory Flow) */}
         <ProCard label="SUPPLY CHAIN" id="AG-05" color="yellow" icon={ShoppingBag}>
            <div className="flex justify-between items-end mb-2">
                <div className="text-3xl font-black text-yellow-500 font-mono">{ag.supply.dos}<span className="text-sm text-gray-500">d</span></div>
                <div className="text-[10px] text-yellow-600 font-mono">DOS</div>
            </div>
            {/* Progress Line */}
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-yellow-500" style={{width: `${Math.min(ag.supply.dos, 100)}%`}}></div>
            </div>
            <div className="text-[9px] text-gray-500 font-mono truncate">
                RISK: {ag.supply.cliff_risk || 'ANALYZING...'}
            </div>
         </ProCard>

         {/* GROWTH (Signal Strength) */}
         <ProCard label="GROWTH" id="AG-06" color="green" icon={TrendingUp}>
            <div className="flex justify-between items-end mb-2">
                <div className="text-3xl font-black text-green-500 font-mono">{ag.growth.prob}<span className="text-sm text-gray-500">%</span></div>
                <div className="text-[10px] text-green-400 font-mono">VIRAL</div>
            </div>
            {/* Signal Bars */}
            <div className="flex items-end gap-1 h-3 mb-1">
                <div className={`w-1/5 h-[20%] ${ag.growth.prob > 20 ? 'bg-green-500' : 'bg-gray-800'} rounded-sm`}></div>
                <div className={`w-1/5 h-[40%] ${ag.growth.prob > 40 ? 'bg-green-500' : 'bg-gray-800'} rounded-sm`}></div>
                <div className={`w-1/5 h-[60%] ${ag.growth.prob > 60 ? 'bg-green-500' : 'bg-gray-800'} rounded-sm`}></div>
                <div className={`w-1/5 h-[80%] ${ag.growth.prob > 80 ? 'bg-green-500' : 'bg-gray-800'} rounded-sm`}></div>
                <div className={`w-1/5 h-[100%] ${ag.growth.prob > 90 ? 'bg-green-500' : 'bg-gray-800'} rounded-sm`}></div>
            </div>
            <div className="text-[9px] text-gray-500 font-mono">ROI: 1:{ag.growth.roi || '?'}</div>
         </ProCard>

         {/* PAIN (Urgency Meter) */}
         <ProCard label="DEMAND" id="AG-03" color="orange" icon={Users}>
             <div className="flex justify-between items-end mb-2">
                <div className="text-3xl font-black text-orange-500 font-mono">{ag.pain.urgency}<span className="text-sm text-gray-500">/10</span></div>
                <Activity size={12} className="text-orange-500 animate-pulse" />
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-1 relative">
                <div className="absolute top-0 left-0 h-full bg-orange-500/30 w-full"></div>
                <div className="h-full bg-orange-500 relative z-10" style={{width: `${ag.pain.solution_rate || 50}%`}}></div>
            </div>
            <div className="text-[9px] text-gray-500 font-mono">SOLVES: {ag.pain.solution_rate}%</div>
         </ProCard>

         {/* CULTURE (Radar Sim) */}
         <ProCard label="CULTURE" id="AG-02" color="purple" icon={Globe}>
            <div className="flex justify-between items-end mb-2">
                <div className="text-3xl font-black text-purple-500 font-mono">{ag.culture.score}<span className="text-sm text-gray-500">%</span></div>
                <div className="text-[9px] text-purple-400 font-mono">FIT</div>
            </div>
             <div className="text-[9px] text-gray-500 font-mono border-t border-gray-800 pt-1 mt-auto">
                TABOO: <span className={ag.culture.taboo_risk !== 'Low' ? 'text-red-400' : 'text-gray-400'}>{ag.culture.taboo_risk || 'None'}</span>
            </div>
         </ProCard>

         {/* SELECTION (Target) */}
         <ProCard label="SELECTION" id="AG-01" color="blue" icon={Target}>
            <div className="flex justify-between items-end mb-2">
                <div className="text-3xl font-black text-blue-500 font-mono">{ag.selection.score}<span className="text-sm text-gray-500">/10</span></div>
                <Target size={12} className="text-blue-500" />
            </div>
            <div className="text-[9px] text-gray-400 font-mono leading-tight truncate">
                {ag.selection.product_name || 'Analyzing...'}
            </div>
         </ProCard>
      </div>

      {/* 2. INTEL STREAM (Terminal Style) */}
      <div className="flex-1 border border-gray-800 bg-[#0a0a0a] rounded-lg flex flex-col overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
         {/* Scan Line Animation */}
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
            {data.news?.map((n: any, i: number) => {
               const url = n.url.toLowerCase();
               let tag = "RAW", color = "text-gray-500";
               if (url.includes('.gov')) { tag="GOV"; color="text-blue-400"; }
               else if (url.includes('reddit')) { tag="HUMAN"; color="text-orange-400"; }
               else if (url.includes('amazon')) { tag="DATA"; color="text-green-400"; }
               
               return (
                 <a key={i} href={n.url} target="_blank" className="flex items-start gap-2 p-1.5 hover:bg-white/5 border-l-2 border-transparent hover:border-cyan-500/50 transition-all group">
                    <span className={`text-[9px] font-mono ${color} w-8 shrink-0 opacity-70`}>{tag}</span>
                    <span className="text-[10px] text-gray-400 font-mono leading-tight group-hover:text-cyan-100 transition-colors line-clamp-1">
                        {n.title}
                    </span>
                 </a>
               )
            })}
         </div>
      </div>

      {/* 3. COMPETITOR TICKER */}
      <div className="border border-gray-800 bg-gray-900/40 rounded p-2">
         <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono mb-1 px-1">
            <span>DETECTED ENTITIES</span>
            <span>PRICE</span>
         </div>
         {data.competitors?.slice(0,2).map((c: any, i: number) => (
            <div key={i} className="flex justify-between items-center text-[10px] px-1 py-1 border-t border-gray-800/50 font-mono text-gray-300">
               <span className="truncate w-2/3">{c.name}</span>
               <span className="text-red-400">{c.price}</span>
            </div>
         ))}
      </div>

    </div>
  );
}

function ProCard({label, id, color, icon: Icon, children}: any) {
    return (
        <div className={`bg-[#080808] border border-gray-800 hover:border-${color}-900/80 p-3 rounded-lg relative overflow-hidden group transition-all`}>
            {/* Tech Decoration: Corner Markers */}
            <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}-900/50 group-hover:border-${color}-500/50`}></div>
            <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}-900/50 group-hover:border-${color}-500/50`}></div>
            <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}-900/50 group-hover:border-${color}-500/50`}></div>
            <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}-900/50 group-hover:border-${color}-500/50`}></div>
            
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-1.5">
                    <Icon size={10} className={`text-${color}-500`} />
                    <span className={`text-[9px] font-bold text-gray-500 group-hover:text-${color}-400 transition-colors tracking-widest`}>{label}</span>
                </div>
                <span className="text-[8px] text-gray-700 font-mono">{id}</span>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}
