"use client"

import { Archive } from "lucide-react"

// Mock data for archives
const mockArchives = [
  { id: 1, date: "2024-03-20", topic: "NVIDIA AI Chip Demand", mode: "TIKTOK_MARKETING", risk: 8, verdict: "Buy Aggressively" },
  { id: 2, date: "2024-03-19", topic: "Tesla Supply Chain", mode: "CROSS_BORDER_CFO", risk: 4, verdict: "Hold / Wait" },
  { id: 3, date: "2024-03-18", topic: "Shein Summer Collection", mode: "BRAND_ARCHITECT", risk: 6, verdict: "Monitor Closely" },
]

export default function ArchivesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Archive className="w-8 h-8 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white">Intel Archives</h1>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-900 border-b border-slate-800">
            <tr>
              <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Topic</th>
              <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Mode</th>
              <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Risk Score</th>
              <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Verdict</th>
              <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {mockArchives.map((row) => (
              <tr key={row.id} className="hover:bg-slate-800/50 transition-colors group cursor-pointer">
                <td className="p-4 text-sm text-slate-300 font-mono">{row.date}</td>
                <td className="p-4 text-sm text-white font-medium">{row.topic}</td>
                <td className="p-4 text-sm">
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700">
                    {row.mode}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${row.risk > 6 ? 'bg-red-500' : row.risk > 3 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <span className="text-sm font-bold text-slate-200">{row.risk}/10</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-cyan-400 font-medium">{row.verdict}</td>
                <td className="p-4">
                  <button className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                    View Report &rarr;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
