"use client"

import { useState, useEffect } from "react"
import { Settings, Save, Key, Bell, User } from "lucide-react"
import { toast } from "sonner"

const SettingCard = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 flex items-center gap-3">
      <Icon className="w-5 h-5 text-cyan-400" />
      <h3 className="font-bold text-white">{title}</h3>
    </div>
    <div className="p-6 space-y-4">
      {children}
    </div>
  </div>
)

export default function SettingsPage() {
  const [keys, setKeys] = useState({
    tavily: "",
    deepseek: "",
    feishu: ""
  })

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("nexus_config")
    if (saved) setKeys(JSON.parse(saved))
  }, [])

  const handleSave = () => {
    localStorage.setItem("nexus_config", JSON.stringify(keys))
    toast.success("Configuration Saved Successfully")
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-cyan-400" />
          <h1 className="text-2xl font-bold text-white">System Configuration</h1>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid gap-6">
        {/* API Gateway */}
        <SettingCard title="API Gateway (BYOK)" icon={Key}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Tavily Search API Key</label>
              <input 
                type="password" 
                value={keys.tavily}
                onChange={(e) => setKeys({...keys, tavily: e.target.value})}
                placeholder="tvly-xxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg font-mono text-sm focus:border-cyan-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">DeepSeek / LLM API Key</label>
              <input 
                type="password" 
                value={keys.deepseek}
                onChange={(e) => setKeys({...keys, deepseek: e.target.value})}
                placeholder="sk-xxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-lg font-mono text-sm focus:border-cyan-500 outline-none transition-colors"
              />
            </div>
          </div>
        </SettingCard>

        {/* Notifications */}
        <SettingCard title="Notification Channels" icon={Bell}>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Feishu / Lark Webhook URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={keys.feishu}
                onChange={(e) => setKeys({...keys, feishu: e.target.value})}
                placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."
                className="flex-1 bg-slate-950 border border-slate-800 text-white p-3 rounded-lg font-mono text-sm focus:border-cyan-500 outline-none transition-colors"
              />
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg font-bold text-xs">
                Test Ping
              </button>
            </div>
          </div>
        </SettingCard>

        {/* Active Personas */}
        <SettingCard title="Active Expert Personas" icon={User}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {["General Strategy", "TikTok Viral Marketing", "TikTok Risk/Compliance", "Cross-Border CFO", "Brand Architect"].map((p) => (
                <div key={p} className="flex items-center gap-2 p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-slate-300">{p}</span>
                </div>
              ))}
           </div>
        </SettingCard>
      </div>
    </div>
  )
}
