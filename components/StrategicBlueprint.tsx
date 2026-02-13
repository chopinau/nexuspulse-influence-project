import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { X } from 'lucide-react';

export default function StrategicBlueprint({ data, onClose }: { data: any, onClose: () => void }) {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data?.mermaid_code && mermaidRef.current) {
      mermaid.initialize({ startOnLoad: true, theme: 'base', securityLevel: 'loose', themeVariables: { primaryColor: '#000', lineColor: '#0f0' } });
      mermaid.render('blueprintFull' + Date.now(), data.mermaid_code).then((res) => {
        if(mermaidRef.current) mermaidRef.current.innerHTML = res.svg;
      });
    }
  }, [data]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
      <div className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#0a0f1c]">
        <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-[0.2em]">Strategic Blueprint // L4</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
      </div>
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
         <div ref={mermaidRef} className="transform scale-125 transition-transform duration-700" />
      </div>
    </div>
  );
}
