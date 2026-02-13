import React from 'react';
import { Target, Globe, Users, ShieldAlert, ShoppingBag, TrendingUp, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function DepartmentFeed({ data }: { data: any }) {
  if (!data || !data.agents) return null;

  const agents = [
    { id: 'selection', icon: Target, label: 'SELECTION', color: 'blue', ...data.agents.selection },
    { id: 'culture', icon: Globe, label: 'CULTURE', color: 'purple', ...data.agents.culture },
    { id: 'pain', icon: Users, label: 'PAIN', color: 'orange', ...data.agents.pain },
    { id: 'compliance', icon: ShieldAlert, label: 'COMPLIANCE', color: 'red', ...data.agents.compliance },
    { id: 'supply', icon: ShoppingBag, label: 'SUPPLY', color: 'yellow', ...data.agents.supply },
    { id: 'growth', icon: TrendingUp, label: 'GROWTH', color: 'green', ...data.agents.growth },
  ];

  const VerdictIcon = data.verdict === 'GO' ? CheckCircle : (data.verdict === 'KILL' ? XCircle : AlertTriangle);
  const vColor = data.verdict === 'GO' ? 'text-green-500' : (data.verdict === 'KILL' ? 'text-red-500' : 'text-yellow-500');

  // Helper for dynamic colors
  const getColorClasses = (color: string) => {
    const maps: any = {
      blue: { bg: 'bg-blue-900/20', text: 'text-blue-400', title: 'text-blue-500' },
      purple: { bg: 'bg-purple-900/20', text: 'text-purple-400', title: 'text-purple-500' },
      orange: { bg: 'bg-orange-900/20', text: 'text-orange-400', title: 'text-orange-500' },
      red: { bg: 'bg-red-900/20', text: 'text-red-400', title: 'text-red-500' },
      yellow: { bg: 'bg-yellow-900/20', text: 'text-yellow-400', title: 'text-yellow-500' },
      green: { bg: 'bg-green-900/20', text: 'text-green-400', title: 'text-green-500' },
    };
    return maps[color] || maps.blue;
  };

  return (
    <div className="relative pl-6 space-y-8 pb-20">
      {/* VERTICAL TIMELINE LINE */}
      <div className="absolute left-6 top-4 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-gray-800 to-transparent"></div>

      {/* CEO Verdict */}
      <div className="relative">
        {/* Timeline Node */}
        <div className={`absolute -left-[34px] top-4 w-4 h-4 rounded-full border-2 border-black ${data.verdict === 'GO' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]'}`}></div>
        
        <div className="bg-gray-900/40 border border-gray-700/50 rounded-xl p-5 backdrop-blur-md shadow-xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
           <div className="flex items-center gap-3 mb-2">
               <VerdictIcon className={vColor} size={28} />
               <div>
                   <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Strategic Verdict</div>
                   <div className={`text-3xl font-black ${vColor} tracking-tighter leading-none`}>{data.verdict}</div>
               </div>
           </div>
           <p className="text-gray-300 text-sm italic border-t border-gray-800/50 pt-3 mt-2 leading-relaxed">
               "{data.final_summary}"
           </p>
        </div>
      </div>

      {/* Agent Cards Flow */}
      <div className="space-y-6">
        {agents.map((ag, idx) => {
          const colors = getColorClasses(ag.color);
          return (
            <div key={ag.id} className="relative group">
              {/* Timeline Dot */}
              <div className={`absolute -left-[31px] top-5 w-2.5 h-2.5 rounded-full bg-gray-800 border border-gray-600 group-hover:bg-${ag.color}-500 group-hover:border-${ag.color}-400 transition-colors z-10`}></div>
              
              <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 hover:border-gray-600 hover:translate-x-1 transition-all duration-300 shadow-lg">
                <div className="flex justify-between items-start mb-3 border-b border-gray-800/50 pb-2">
                   <div className="flex items-center gap-2">
                     <div className={`p-1 rounded ${colors.bg} ${colors.text}`}><ag.icon size={12} /></div>
                     <span className={`text-[10px] font-black ${colors.title} font-mono tracking-widest uppercase`}>
                        AGENT_{String(idx+1).padStart(2, '0')} // {ag.label}
                     </span>
                   </div>
                   <div className={`text-sm font-bold ${colors.text} font-mono bg-black/30 px-2 py-0.5 rounded border border-white/5`}>
                     {ag.score || ag.prob || ag.risk || ag.urgency || ag.dos}
                   </div>
                </div>
                
                {/* Key Insight Highlight */}
                {ag.key_insight && (
                    <div className="mb-2 text-xs font-bold text-gray-200 flex items-center gap-2">
                        <span className="w-1 h-1 bg-white rounded-full"></span>
                        {ag.key_insight}
                    </div>
                )}

                <div className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-wide opacity-70">{ag.title} Analysis</div>
                <p className="text-xs text-gray-400 leading-relaxed font-sans opacity-90">{ag.analysis}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
