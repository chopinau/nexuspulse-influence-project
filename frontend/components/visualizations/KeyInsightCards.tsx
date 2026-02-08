import React from 'react';
import { ShieldAlert, Activity, TrendingUp } from 'lucide-react';

interface KeyInsightCardsProps {
  riskScore: number;
  heatIndex: number;
  impactScore: number;
}

const getRiskColor = (score: number) => {
  if (score > 7) return 'text-red-400 bg-red-900/20 border-red-700/50';
  if (score > 4) return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/50';
  return 'text-green-400 bg-green-900/20 border-green-700/50';
};

const getHeatColor = (score: number) => {
  if (score > 7) return 'text-orange-400 bg-orange-900/20 border-orange-700/50';
  if (score > 4) return 'text-blue-400 bg-blue-900/20 border-blue-700/50';
  return 'text-purple-400 bg-purple-900/20 border-purple-700/50';
};

const getImpactColor = (score: number) => {
  if (score > 7) return 'text-pink-400 bg-pink-900/20 border-pink-700/50';
  if (score > 4) return 'text-cyan-400 bg-cyan-900/20 border-cyan-700/50';
  return 'text-indigo-400 bg-indigo-900/20 border-indigo-700/50';
};

export function KeyInsightCards({ riskScore, heatIndex, impactScore }: KeyInsightCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Risk Score Card */}
      <div className={`rounded-xl p-4 border ${getRiskColor(riskScore)}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Risk Score
          </h3>
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-white">{riskScore}</span>
          <span className="text-sm text-gray-400 mb-1">/10</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {riskScore > 7 ? 'High Risk' : riskScore > 4 ? 'Medium Risk' : 'Low Risk'}
        </div>
      </div>
      
      {/* Heat Index Card */}
      <div className={`rounded-xl p-4 border ${getHeatColor(heatIndex)}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Heat Index
          </h3>
          <Activity className="w-4 h-4" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-white">{heatIndex}</span>
          <span className="text-sm text-gray-400 mb-1">/10</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {heatIndex > 7 ? 'High Activity' : heatIndex > 4 ? 'Medium Activity' : 'Low Activity'}
        </div>
      </div>
      
      {/* Impact Score Card */}
      <div className={`rounded-xl p-4 border ${getImpactColor(impactScore)}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Impact Score
          </h3>
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-white">{impactScore}</span>
          <span className="text-sm text-gray-400 mb-1">/10</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {impactScore > 7 ? 'High Impact' : impactScore > 4 ? 'Medium Impact' : 'Low Impact'}
        </div>
      </div>
    </div>
  );
}

export default KeyInsightCards;