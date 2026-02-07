"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- DATA LISTS ---
const RED_OCEAN = [
  { label: "🎧 TWS Earbuds", value: "tws_earbuds" },
  { label: "📱 Phone Cases", value: "phone_cases" },
  { label: "🧘‍♀️ Yoga Wear", value: "yoga_activewear" },
  { label: "🍟 Air Fryers", value: "air_fryers" },
  { label: "💨 Humidifiers", value: "humidifiers" },
  { label: "💄 Makeup Tools", value: "makeup_brushes" },
  { label: "🔌 GaN Chargers", value: "gan_chargers" },
];

const BLUE_OCEAN = [
  { label: "💤 Smart Sleep", value: "smart_sleep_tech" },
  { label: "🐈 Smart Pet", value: "smart_pet_care" },
  { label: "🔋 Portable Power", value: "portable_energy" },
  { label: "🌿 Eco Kitchen", value: "eco_kitchen" },
  { label: "👶 AI Baby Monitor", value: "ai_baby_monitor" },
  { label: "💆‍♂️ WFH Ergo", value: "wfh_ergonomics" },
  { label: "🧶 DIY Kits", value: "adult_diy_kits" },
];

interface Props {
  onSelect: (value: string) => void;
}

export function CategorySelector({ onSelect }: Props) {
  const [activeTab, setActiveTab] = useState<"RED" | "BLUE">("RED");
  const [selectedPill, setSelectedPill] = useState("");

  const currentList = activeTab === "RED" ? RED_OCEAN : BLUE_OCEAN;

  return (
    <div className="w-full flex flex-col gap-3 mb-4">
      {/* 1. TAB SWITCHER */}
      <div className="flex gap-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("RED")}
          className={
            "text-sm font-bold tracking-wider transition-colors px-2 pb-1 relative " +
            (activeTab === "RED" ? "text-rose-400" : "text-slate-500 hover:text-slate-300")
          }
        >
          🔱 Red Ocean Titans
          {activeTab === "RED" && (
            <motion.div layoutId="tab-underline" className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-rose-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("BLUE")}
          className={
            "text-sm font-bold tracking-wider transition-colors px-2 pb-1 relative " +
            (activeTab === "BLUE" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300")
          }
        >
          🚀 Blue Ocean Alphas
          {activeTab === "BLUE" && (
            <motion.div layoutId="tab-underline" className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-cyan-500" />
          )}
        </button>
      </div>

      {/* 2. HORIZONTAL SCROLLABLE PILLS */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2 min-w-full"
          >
            {currentList.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setSelectedPill(item.value);
                  onSelect(item.label); // Pass label back to parent input
                }}
                className={
                  "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium border transition-all " +
                  (selectedPill === item.value
                    ? activeTab === "RED"
                      ? "bg-rose-900/40 border-rose-500 text-rose-100 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                      : "bg-cyan-900/40 border-cyan-500 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                    : "bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500")
                }
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}