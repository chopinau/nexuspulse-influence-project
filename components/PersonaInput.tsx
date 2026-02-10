"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface PersonaInputProps {
  mode: string;
  onModeChange: (mode: string) => void;
  strategyMode: 'incubation' | 'growth';
  onStrategyModeChange: (mode: 'incubation' | 'growth') => void;
  onExecute: (data: any) => void;
  isLoading: boolean;
  loadingText: string;
}

export function PersonaInput({ mode, onModeChange, strategyMode, onStrategyModeChange, onExecute, isLoading, loadingText }: PersonaInputProps) {
  // Common State
  const [topic, setTopic] = useState("");

  // CFO State
  const [inventory, setInventory] = useState(5000);
  const [sales, setSales] = useState(10);

  // Lawyer State
  const [listingText, setListingText] = useState("");

  // Marketer State
  const [painPoint, setPainPoint] = useState("");

  // Reset fields when mode changes (optional, but good UX)
  useEffect(() => {
    // We could reset state here, but maybe user wants to persist data while switching
  }, [mode]);

  const handleSubmit = () => {
    if (!topic.trim()) return; // Topic is always required

    const payload: any = {
      topic: topic,
      mode: mode,
      strategy_mode: strategyMode
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
    <div className="flex flex-col gap-4 w-full bg-black/40 border border-white/10 backdrop-blur-md rounded-xl p-4 sticky top-0 z-20 transition-all duration-300">
      
      {/* 1. TOP BAR: Mode Selector & Main Topic */}
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        
        {/* Persona Selector */}
        <select
          value={mode}
          onChange={(e) => onModeChange(e.target.value)}
          className="shrink-0 bg-blue-900/50 border border-cyan-500/30 text-white px-2 h-10 rounded-lg text-sm outline-none focus:border-cyan-500 transition-colors min-w-[190px] cursor-pointer"
        >
          <option value="GENERAL" className="bg-black">👔 General Strategy</option>
          <option value="TIKTOK_MARKETING" className="bg-black">🔥 TikTok Viral</option>
          <option value="TIKTOK_RISK" className="bg-black">⚖️ TikTok Risk</option>
          <option value="CROSS_BORDER_CFO" className="bg-black">💰 CFO Audit</option>
          <option value="BRAND_ARCHITECT" className="bg-black">🎨 Brand Story</option>
        </select>

        {/* Strategy Mode Selector */}
        <select
          value={strategyMode}
          onChange={(e) => onStrategyModeChange(e.target.value as 'incubation' | 'growth')}
          className={`shrink-0 border text-white px-2 h-10 rounded-lg text-sm outline-none transition-colors min-w-[180px] cursor-pointer ${
            strategyMode === 'incubation' 
              ? 'bg-teal-900/50 border-teal-500/30 focus:border-teal-500' 
              : 'bg-violet-900/50 border-violet-500/30 focus:border-violet-500'
          }`}
          title={strategyMode === 'incubation' ? "Focus on Compliance, Brand Story & Safety" : "Focus on ROI, Efficiency & Competitor Attack"}
        >
          <option value="incubation" className="bg-black">🔰 Brand Incubation (0-1)</option>
          <option value="growth" className="bg-black">🚀 Aggressive Growth (1-100)</option>
        </select>

        {/* Topic Input (Always Visible) */}
        <input 
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => !isLoading && e.key === 'Enter' && handleSubmit()}
          placeholder={mode === "CROSS_BORDER_CFO" ? "Enter SKU/Product Name..." : "Enter Topic or Brand..."}
          className="flex-1 bg-transparent border-b border-white/10 text-white h-10 px-2 placeholder:text-gray-600 font-mono focus:border-cyan-500 focus:outline-none transition-colors"
        />

        <button 
           onClick={handleSubmit}
           disabled={isLoading}
           className={`shrink-0 text-white px-6 h-10 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider ${
             strategyMode === 'incubation'
               ? 'bg-teal-600 hover:bg-teal-500'
               : 'bg-violet-600 hover:bg-violet-500'
           }`}
        >
           {isLoading ? loadingText.split(':')[0] : "EXECUTE"}
        </button>
      </div>

      {/* 2. DYNAMIC FIELDS (Expands based on Mode) */}
      
      {/* CFO FORM */}
      {mode === "CROSS_BORDER_CFO" && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
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

      {/* LAWYER/RISK FORM */}
      {mode === "TIKTOK_RISK" && (
        <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
          <label className="text-xs text-red-400 font-mono">PASTE LISTING COPY / AD SCRIPT FOR COMPLIANCE CHECK</label>
          <textarea 
            value={listingText}
            onChange={(e) => setListingText(e.target.value)}
            placeholder="e.g. This antibacterial cream cures all skin diseases instantly..."
            className="bg-white/5 border border-white/10 rounded p-2 text-white font-mono text-xs h-20 focus:border-red-500 outline-none resize-none"
          />
        </div>
      )}

      {/* MARKETER FORM */}
      {mode === "TIKTOK_MARKETING" && (
        <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
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
