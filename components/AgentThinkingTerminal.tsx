"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Cpu, Database, Shield, TrendingUp, Users, Globe, Target, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface AgentStep {
  agent: string;
  action: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  timestamp?: string;
}

interface AgentThinkingTerminalProps {
  isLoading: boolean;
  currentStep?: string;
}

const AGENT_SEQUENCE: AgentStep[] = [
  { agent: "INTEL_OFFICER", action: "正在提取全球市场数据...", status: "pending" },
  { agent: "DATA_ENGINEER", action: "正在清洗和结构化数据...", status: "pending" },
  { agent: "COMPLIANCE_OFFICER", action: "正在交叉比对合规风险...", status: "pending" },
  { agent: "SUPPLY_CFO", action: "正在分析供应链健康度...", status: "pending" },
  { agent: "GROWTH_HACKER", action: "正在评估增长潜力...", status: "pending" },
  { agent: "CULTURE_ANALYST", action: "正在检测本土化风险...", status: "pending" },
  { agent: "STRATEGIC_JUDGE", action: "正在生成最终裁决...", status: "pending" },
];

const AGENT_CONFIG: Record<string, { icon: any; color: string; name: string }> = {
  INTEL_OFFICER: { icon: Database, color: "cyan", name: "情报官" },
  DATA_ENGINEER: { icon: Cpu, color: "blue", name: "数据工程师" },
  COMPLIANCE_OFFICER: { icon: Shield, color: "red", name: "合规官" },
  SUPPLY_CFO: { icon: TrendingUp, color: "yellow", name: "供应链CFO" },
  GROWTH_HACKER: { icon: Target, color: "green", name: "增长黑客" },
  CULTURE_ANALYST: { icon: Globe, color: "purple", name: "文化分析师" },
  STRATEGIC_JUDGE: { icon: Users, color: "orange", name: "战略裁判官" },
};

export function AgentThinkingTerminal({ isLoading, currentStep }: AgentThinkingTerminalProps) {
  const [steps, setSteps] = useState<AgentStep[]>(AGENT_SEQUENCE);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      setSteps(AGENT_SEQUENCE.map(s => ({ ...s, status: 'pending' })));
      setActiveIndex(-1);
      setLogs([]);
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex(prev => {
        const next = prev + 1;
        if (next < AGENT_SEQUENCE.length) {
          setSteps(prevSteps => {
            const newSteps = [...prevSteps];
            if (prev >= 0) {
              newSteps[prev].status = 'complete';
            }
            newSteps[next].status = 'active';
            return newSteps;
          });
          
          const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
          setLogs(prevLogs => [
            ...prevLogs,
            `[${timestamp}] [${AGENT_SEQUENCE[next].agent}] ${AGENT_SEQUENCE[next].action}`
          ]);
        }
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (!isLoading && activeIndex >= 0) {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        newSteps.forEach((s, i) => {
          if (i <= activeIndex) {
            s.status = 'complete';
          }
        });
        return newSteps;
      });
    }
  }, [isLoading, activeIndex]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-400" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-700" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-gray-800 rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-10 z-50"></div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-8 animate-scanline opacity-30 z-40"></div>
      
      <div className="flex items-center justify-between px-4 py-2 bg-[#111] border-b border-gray-800 relative z-10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider drop-shadow-[0_0_4px_rgba(34,211,238,0.3)]">Agent Command Center</span>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-green-400">ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        <div className="w-1/3 border-r border-gray-800 p-3 overflow-y-auto bg-black/30">
          <div className="text-[10px] font-mono text-gray-500 uppercase mb-2">Agent Pipeline</div>
          <div className="space-y-1">
            {steps.map((step, index) => {
              const config = AGENT_CONFIG[step.agent];
              const Icon = config?.icon || Cpu;
              const color = config?.color || 'gray';
              
              return (
                <div 
                  key={step.agent}
                  className={`flex items-center gap-2 p-2 rounded transition-all duration-300 ${
                    step.status === 'active' 
                      ? `bg-${color}-900/30 border border-${color}-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]` 
                      : step.status === 'complete'
                      ? 'bg-gray-900/30'
                      : 'opacity-50'
                  }`}
                >
                  {getStatusIcon(step.status)}
                  <Icon className={`w-3 h-3 text-${color}-400`} />
                  <span className={`text-[10px] font-mono transition-colors duration-300 ${
                    step.status === 'active' 
                      ? `text-${color}-300 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]` 
                      : 'text-gray-500'
                  }`}>
                    {config?.name || step.agent}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 p-3 overflow-y-auto bg-black/50 relative" ref={logContainerRef}>
          <div className="text-[10px] font-mono text-gray-500 uppercase mb-2">Execution Log</div>
          <div className="space-y-1 font-mono text-[11px]">
            {logs.length === 0 ? (
              <div className="text-gray-600 italic">Waiting for execution...</div>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index} 
                  className="text-cyan-400/80 animate-in fade-in slide-in-from-left-1 duration-300 drop-shadow-[0_0_2px_rgba(34,211,238,0.3)]"
                >
                  <span className="text-gray-500">{log.split(']')[0]}]</span>
                  <span className="text-cyan-300">{log.split(']')[1]}</span>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-1 text-cyan-400">
                <span className="animate-blink">▌</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {currentStep && (
        <div className="px-4 py-2 bg-cyan-900/20 border-t border-cyan-800/50 relative z-10">
          <div className="text-[10px] font-mono text-cyan-400 truncate drop-shadow-[0_0_4px_rgba(34,211,238,0.3)]">
            ▶ {currentStep}
          </div>
        </div>
      )}
    </div>
  );
}
