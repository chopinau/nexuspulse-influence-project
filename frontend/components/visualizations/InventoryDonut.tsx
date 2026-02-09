import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface InventoryDonutProps {
  data: { name: string; value: number; fill: string }[];
}

export function InventoryDonut({ data }: InventoryDonutProps) {
  // Data safety check
  if (!data || data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wider">
            Inventory Health
          </h3>
          <div className="px-2 py-1 bg-cyan-900/30 border border-cyan-700/50 rounded-full">
            <span className="text-xs font-mono text-cyan-400">Real-time</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-48">
          <div className="w-48 h-48 flex items-center justify-center text-gray-400">
            No Data Available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wider">
          Inventory Health
        </h3>
        <div className="px-2 py-1 bg-cyan-900/30 border border-cyan-700/50 rounded-full">
          <span className="text-xs font-mono text-cyan-400">Real-time</span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryDonut;