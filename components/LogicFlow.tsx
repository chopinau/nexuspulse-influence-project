"use client"; 
 
 import React, { useEffect, useRef, useState } from "react"; 
 import mermaid from "mermaid"; 
 import { Maximize2, GitGraph, Share2 } from "lucide-react"; 
 
const LogicFlow = ({ code }: { code?: string }) => { 
 const chartRef = useRef<HTMLDivElement>(null); 
 const [isExpanded, setIsExpanded] = useState(false); 
 const [renderError, setRenderError] = useState<string | null>(null);

  // Default fallback graph if no code provided
  const defaultGraph = ` 
    graph TD 
    %% 样式定义 
    classDef risk fill:#ef4444,stroke:#7f1d1d,color:white; 
    classDef opportunity fill:#10b981,stroke:#047857,color:white; 
    classDef neutral fill:#3b82f6,stroke:#1d4ed8,color:white; 
    
    Start((🚀 市场信号监测)) --> Analyze{AI 深度研判} 
    Analyze -->|负面情绪| Risk[🔴 供应链风险预警] 
    Analyze -->|正面情绪| Opp[🟢 品牌出海机会] 
    Risk -->|原材料上涨| Cost(成本压力 +15%) 
    Risk -->|物流延误| Stock(建议库存: 3个月) 
    Opp -->|流量红利| Ads(建议增加 TikTok 投放) 
    Opp -->|竞品空缺| Product(建议新品: 环保系列) 
    Cost :::risk 
    Stock :::neutral 
    Ads :::opportunity 
    Product :::opportunity 
  `; 

  const cleanMermaidCode = (code: string) => {
    return code.replace(/^```mermaid\n/, '').replace(/\n```$/, '').trim();
  };

  // Ensure we always have a valid graph to render
  const graphToRender = (() => {
    if (code && typeof code === 'string') {
      const cleaned = cleanMermaidCode(code);
      return cleaned || defaultGraph;
    }
    return defaultGraph;
  })();

  useEffect(() => { 
    console.log("LogicFlow received code:", code);
    setRenderError(null);
    if (chartRef.current) { 
      chartRef.current.innerHTML = '';
      
      mermaid.initialize({ 
        startOnLoad: false, // Changed to false for manual control
        theme: "base", // Using base theme for better custom control
        themeVariables: {
          darkMode: true,
          background: '#18181b', // zinc-900
          primaryColor: "#06b6d4", // cyan-500
          primaryTextColor: "#ffffff",
          primaryBorderColor: "#06b6d4",
          lineColor: "#e4e4e7", // zinc-200 (Bright lines)
          secondaryColor: "#3b82f6", // blue-500
          tertiaryColor: "#10b981", // emerald-500
          mainBkg: "#27272a", // zinc-800
          nodeBorder: "#52525b", // zinc-600
          clusterBkg: "#27272a",
          clusterBorder: "#52525b",
          defaultLinkColor: "#e4e4e7", // zinc-200
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: "14px",
        },
        securityLevel: "loose", 
      }); 
      
      // 手动渲染 
      const renderChart = async () => { 
        try { 
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, graphToRender); 
          if (chartRef.current) {
             chartRef.current.innerHTML = svg;
             const svgElement = chartRef.current.querySelector('svg');
             if (svgElement) {
                svgElement.style.maxWidth = '100%';
                svgElement.style.height = 'auto';
             }
          }
        } catch (error) { 
          console.error("Mermaid 渲染失败:", error); 
          setRenderError('render');
        } 
      }; 

      renderChart(); 
    } 
  }, [graphToRender]); 
 
   return ( 
     <div className={`relative flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-500 ${isExpanded ? 'fixed inset-4 z-50 bg-zinc-950/95 border-zinc-700' : 'h-full'}`}> 
       
       {/* 头部标题栏 */} 
       <div className="flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-900/80 backdrop-blur-sm"> 
         <div className="flex items-center gap-2"> 
           <GitGraph className="w-5 h-5 text-purple-400" /> 
           <h3 className="text-sm font-semibold text-zinc-100 tracking-wide"> 
             STRATEGIC DEDUCTION <span className="text-xs text-zinc-500 font-normal ml-2">// AI 战略推演图谱</span> 
           </h3> 
         </div> 
         <div className="flex gap-2"> 
            <button className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 transition-colors"> 
             <Share2 className="w-4 h-4" /> 
           </button> 
           <button 
             onClick={() => setIsExpanded(!isExpanded)} 
             className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 transition-colors" 
           > 
             <Maximize2 className="w-4 h-4" /> 
           </button> 
         </div> 
       </div> 
 
       {/* 图表渲染区 */}
      <div className="flex-1 p-6 overflow-hidden flex justify-center items-center h-[500px] w-full">
        {renderError ? (
          <div className="text-muted-foreground text-sm">
            ⚠️ Graph data invalid, showing text report...
            <pre className="mt-2 whitespace-pre-wrap text-xs opacity-80">{(code || '').trim()}</pre>
          </div>
        ) : (
          <div ref={chartRef} className="w-full h-full flex justify-center items-center opacity-90 hover:opacity-100 transition-opacity [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-none" />
        )}
      </div> 
 
       {/* 底部 AI 旁白 */} 
       <div className="p-3 bg-purple-900/10 border-t border-purple-500/20 text-xs text-purple-200 font-mono flex items-center gap-2"> 
         <span className="relative flex h-2 w-2"> 
           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span> 
           <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span> 
         </span> 
         AI INSIGHT: 检测到供应链波动风险，建议立即启动备选方案 B。 
       </div> 
     </div> 
   ); 
 }; 
 
 export default LogicFlow;
