import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface StrategicRadarProps {
  data: { subject: string; A: number; fullMark: number }[];
}

export function StrategicRadar({ data }: StrategicRadarProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wider">
          Strategic Positioning
        </h3>
        <div className="px-2 py-1 bg-purple-900/30 border border-purple-700/50 rounded-full">
          <span className="text-xs font-mono text-purple-400">Strategic</span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 10 }} />
            <Radar
              name="Strategy"
              dataKey="A"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        {data.map((item, index) => (
          <div key={index} className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">{item.subject}</div>
            <div className="text-lg font-bold text-white">{item.A}/10</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StrategicRadar;