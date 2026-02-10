import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import KeyInsightCards from './visualizations/KeyInsightCards';
import StrategicRadar from './visualizations/StrategicRadar';
import InventoryDonut from './visualizations/InventoryDonut';
import LogicFlow from '../../components/LogicFlow';

interface ReportViewProps {
  report: any;
}

function StrategyContextCard({ report }: { report: any }) {
  const mode = report?.structured_data?.sop_name || 'GENERAL';
  const strategyMode = report?.metadata?.strategy_mode || 'incubation';
  const painPoint = report?.metadata?.pain_point;

  const roleDisplay = {
    'TIKTOK_MARKETING': 'Viral Content Director',
    'CROSS_BORDER_CFO': 'Ruthless CFO',
    'TIKTOK_RISK': 'Compliance Lawyer',
    'BRAND_ARCHITECT': 'Ogilvy Creative Director',
    'AMAZON_SEO': 'A9 Algorithm Expert',
    'GENERAL': 'McKinsey Consultant'
  }[mode] || 'Strategic Consultant';

  const strategyDisplay = strategyMode === 'incubation' ? 'Safety First' : 'Profit First';
  const painPointDisplay = painPoint || '🔍 Auto-Detected from Trends';

  return (
    <div className="bg-gray-900/30 rounded-lg p-4 mb-6 border border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">Mission Briefing</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-400 block">🤖 Expert Role</span>
          <span className="text-white font-mono">{roleDisplay}</span>
        </div>
        <div>
          <span className="text-gray-400 block">⚖️ Strategy</span>
          <span className="text-white font-mono">{strategyDisplay}</span>
        </div>
        <div>
          <span className="text-gray-400 block">🎯 Pain Point</span>
          <span className="text-white font-mono">{painPointDisplay}</span>
        </div>
      </div>
    </div>
  );
}

export default function ReportView({ report }: ReportViewProps) {
  // Data extraction with safety checks
  const vizData = report?.visualization_data || {};
  const structData = report?.structured_data || {};
  
  // State management for tabbed interface
  const [activeView, setActiveView] = useState<'dashboard' | 'logs'>('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Strategic Intelligence Report
          </h1>
          <p className="text-gray-400 mt-2">
            {report?.report_title || 'Comprehensive Market Analysis'}
          </p>
        </div>

        {/* Strategy Context Card */}
        <StrategyContextCard report={report} />

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-4 py-2 font-medium transition-colors ${activeView === 'dashboard' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
          >
            📊 Strategic Dashboard
          </button>
          <button
            onClick={() => setActiveView('logs')}
            className={`px-4 py-2 font-medium transition-colors ${activeView === 'logs' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-gray-200'}`}
          >
            📜 Agent Debate Logs
          </button>
        </div>

        {/* View Rendering */}
        {activeView === 'dashboard' ? (
          /* Tab 1: Strategic Dashboard */
          <div className="space-y-6">
            {/* Top Section: Key Insight Cards */}
            <section>
              <KeyInsightCards
                riskScore={structData.risk_score || 0}
                heatIndex={structData.heat_index || 0}
                impactScore={structData.impact_score || 0}
              />
            </section>

            {/* Middle Section: Visualization Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
              <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5 backdrop-blur-sm h-[400px]">
                <StrategicRadar data={vizData.radar_data || []} />
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5 backdrop-blur-sm h-[400px]">
                <InventoryDonut data={vizData.inventory_mix || []} />
              </div>
            </section>
          </div>
        ) : (
          /* Tab 2: Agent Debate Logs */
          <div className="space-y-6">
            {/* Bottom Section: Logic Flow and Full Report */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5 backdrop-blur-sm min-h-[400px]">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Logic Flow</h3>
                {report?.mermaid_code ? (
                  <LogicFlow code={report.mermaid_code} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>Logic flow diagram will appear here...</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-4 border border-white/5 backdrop-blur-sm min-h-[400px]">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Strategic Verdict</h3>
                {report?.verdict_text ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {report.verdict_text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>Strategic verdict will appear here...</p>
                  </div>
                )}
              </div>
            </section>

            {/* Full Report Section */}
            {report?.full_markdown_report && (
              <section className="bg-gray-900/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Full Intelligence Report</h3>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {report.full_markdown_report}
                  </ReactMarkdown>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}