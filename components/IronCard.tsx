import React from "react"

// Iron Man Style Card Component
export default function IronCard({ children, className = "", title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any }) {
  return (
    <div className={`bg-black/40 border border-white/10 backdrop-blur-md rounded-xl overflow-hidden relative group ${className}`}>
      {/* Tech borders */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50 rounded-tl-md" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50 rounded-tr-md" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50 rounded-bl-md" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50 rounded-br-md" />
      
      {title && (
        <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
          <h3 className="text-sm font-bold text-cyan-100 uppercase tracking-wider">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
