"use client";

import { useState, useEffect } from "react";
import { Search, Database, ChevronDown, Zap, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface FeishuTable {
  table_id: string;
  name: string;
}

interface PersonaInputProps {
  mode: string;
  onModeChange: (mode: string) => void;
  strategyMode: 'incubation' | 'growth';
  onStrategyModeChange: (mode: 'incubation' | 'growth') => void;
  category?: string;
  onExecute: (data: any) => void;
  isLoading: boolean;
  loadingText: string;
}

export function PersonaInput({ mode, onModeChange, strategyMode, onStrategyModeChange, category, onExecute, isLoading, loadingText }: PersonaInputProps) {
  const [topic, setTopic] = useState("");
  const [market, setMarket] = useState("US");
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [feishuTables, setFeishuTables] = useState<FeishuTable[]>([]);
  const [feishuLoading, setFeishuLoading] = useState(false);
  const [feishuError, setFeishuError] = useState<string | null>(null);
  const [feishuEnabled, setFeishuEnabled] = useState(false);

  const [inventory, setInventory] = useState(5000);
  const [sales, setSales] = useState(10);
  const [listingText, setListingText] = useState("");
  const [painPoint, setPainPoint] = useState("");

  useEffect(() => {
    const fetchFeishuStatus = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/feishu/status");
        const data = await res.json();
        setFeishuEnabled(data.feishu_enabled);
        
        if (data.feishu_enabled) {
          fetchFeishuTables();
        }
      } catch (e) {
        console.error("Failed to check Feishu status:", e);
      }
    };
    
    fetchFeishuStatus();
  }, []);

  const fetchFeishuTables = async () => {
    setFeishuLoading(true);
    setFeishuError(null);
    
    try {
      const res = await fetch("http://localhost:8000/api/feishu/tables");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to fetch tables");
      }
      const data = await res.json();
      setFeishuTables(data.tables || []);
    } catch (e: any) {
      console.error("Failed to fetch Feishu tables:", e);
      setFeishuError(e.message);
    } finally {
      setFeishuLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!topic.trim()) return;

    const payload: any = {
      topic: topic,
      market: market,
      mode: mode,
      strategy_mode: strategyMode,
      category: category || "",
      table_id: selectedTableId || undefined
    };

    if (mode === "CROSS_BORDER_CFO") {
      payload.inventory = inventory;
      payload.daily_sales = sales;
    } else if (mode === "TIKTOK_RISK") {
      payload.listing_text = listingText;
    } else if (mode === "TIKTOK_MARKETING") {
      payload.pain_point = painPoint;
    }

    onExecute(payload);
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-gradient-to-b from-black/60 to-black/40 border border-cyan-900/30 backdrop-blur-md rounded-xl p-5 sticky top-0 z-20 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-5 h-5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => !isLoading && e.key === 'Enter' && handleSubmit()}
            placeholder="输入目标产品 / ASIN / 查询关键词..."
            className="w-[400px] bg-black/60 border border-cyan-800/50 text-white h-12 pl-10 pr-4 rounded-lg placeholder:text-gray-500 font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>

        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value)}
          className="shrink-0 bg-black/60 border border-cyan-800/50 text-white px-3 h-12 rounded-lg text-sm outline-none focus:border-cyan-500 transition-colors min-w-[160px] cursor-pointer"
        >
          <option value="GENERAL" className="bg-black">👔 General Strategy</option>
          <option value="TIKTOK_MARKETING" className="bg-black">🔥 TikTok Viral</option>
          <option value="TIKTOK_RISK" className="bg-black">⚖️ TikTok Risk</option>
          <option value="CROSS_BORDER_CFO" className="bg-black">💰 CFO Audit</option>
          <option value="BRAND_ARCHITECT" className="bg-black">🎨 Brand Story</option>
        </select>

        <select
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          className="shrink-0 bg-black/60 border border-gray-700/50 text-white px-3 h-12 rounded-lg text-sm outline-none focus:border-gray-500 transition-colors cursor-pointer"
        >
          <option value="US" className="bg-black">🇺🇸 US</option>
          <option value="EU" className="bg-black">🇪🇺 EU</option>
          <option value="SEA" className="bg-black">🌏 SEA</option>
        </select>

        <button 
           onClick={handleSubmit}
           disabled={isLoading || !topic.trim()}
           className={`shrink-0 text-white px-8 h-12 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center gap-2 ${
             strategyMode === 'incubation'
               ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.4)]'
               : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]'
           }`}
        >
           {isLoading ? (
             <>
               <Loader2 className="w-4 h-4 animate-spin" />
               <span>EXECUTING...</span>
             </>
           ) : (
             <>
               <Zap className="w-4 h-4" />
               <span>EXECUTE 推演</span>
             </>
           )}
        </button>
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-gray-800/50">
        <div className="flex items-center gap-2">
          <Database className={`w-4 h-4 ${feishuEnabled ? 'text-green-400' : 'text-gray-600'}`} />
          <span className="text-xs text-gray-400 font-mono">FEISHU DATA SOURCE:</span>
        </div>
        
        {feishuLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-mono">Loading tables...</span>
          </div>
        ) : feishuError ? (
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-mono">{feishuError}</span>
          </div>
        ) : feishuTables.length > 0 ? (
          <div className="flex items-center gap-2 flex-1">
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="flex-1 max-w-[300px] bg-black/40 border border-gray-700/50 text-white px-3 h-9 rounded-lg text-xs outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="" className="bg-black">-- 不使用飞书数据 (默认) --</option>
              {feishuTables.map((table) => (
                <option key={table.table_id} value={table.table_id} className="bg-black">
                  {table.name}
                </option>
              ))}
            </select>
            {selectedTableId && (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            )}
          </div>
        ) : feishuEnabled ? (
          <span className="text-xs text-gray-500 font-mono">No tables found</span>
        ) : (
          <span className="text-xs text-gray-600 font-mono">Feishu not configured</span>
        )}
        
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-500 font-mono">STRATEGY:</span>
          <div className="flex bg-black/40 rounded-lg p-1 border border-gray-800">
            <button
              onClick={() => onStrategyModeChange('incubation')}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                strategyMode === 'incubation' 
                  ? 'bg-teal-600/30 text-teal-400 border border-teal-500/50' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              INCUBATION
            </button>
            <button
              onClick={() => onStrategyModeChange('growth')}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                strategyMode === 'growth' 
                  ? 'bg-violet-600/30 text-violet-400 border border-violet-500/50' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              GROWTH
            </button>
          </div>
        </div>
      </div>

      {mode === "CROSS_BORDER_CFO" && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-gray-800/50">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-cyan-400 font-mono">CURRENT INVENTORY (UNITS)</label>
            <input 
              type="number" 
              value={inventory}
              onChange={(e) => setInventory(parseInt(e.target.value))}
              className="bg-white/5 border border-white/10 rounded p-2 text-white font-mono focus:border-cyan-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-cyan-400 font-mono">DAILY SALES VELOCITY</label>
            <input 
              type="number" 
              value={sales}
              onChange={(e) => setSales(parseInt(e.target.value))}
              className="bg-white/5 border border-white/10 rounded p-2 text-white font-mono focus:border-cyan-500 outline-none"
            />
          </div>
        </div>
      )}

      {mode === "TIKTOK_RISK" && (
        <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-gray-800/50">
          <label className="text-xs text-red-400 font-mono">PASTE LISTING COPY / AD SCRIPT FOR COMPLIANCE CHECK</label>
          <textarea 
            value={listingText}
            onChange={(e) => setListingText(e.target.value)}
            placeholder="e.g. This antibacterial cream cures all skin diseases instantly..."
            className="bg-white/5 border border-white/10 rounded p-2 text-white font-mono text-xs h-20 focus:border-red-500 outline-none resize-none"
          />
        </div>
      )}

      {mode === "TIKTOK_MARKETING" && (
        <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-gray-800/50">
          <label className="text-xs text-pink-400 font-mono">TARGET AUDIENCE PAIN POINT</label>
          <input 
            type="text"
            value={painPoint}
            onChange={(e) => setPainPoint(e.target.value)}
            placeholder="e.g. Back pain from sitting too long..."
            className="bg-white/5 border border-white/10 rounded p-2 text-white font-mono focus:border-pink-500 outline-none"
          />
        </div>
      )}
    </div>
  );
}
