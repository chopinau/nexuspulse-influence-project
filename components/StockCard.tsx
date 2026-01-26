'use client';

import React from 'react';
import useSWR from 'swr';
import { Line } from 'react-chartjs-2';
import { useTranslations } from '@/lib/i18nMock';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';

// Register specific components to ensure this isolated component works
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

interface StockCardProps {
  symbol: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StockCard({ symbol }: StockCardProps) {
  const t = useTranslations('stock');
  const { data, error, isLoading } = useSWR(`/api/stock/${symbol}`, fetcher, {
    refreshInterval: 600000, // 10 minutes
    revalidateOnFocus: false
  });

  if (error) return (
    <div className="p-4 rounded-2xl bg-cyber-panel border border-red-500/30 text-red-400 text-xs">
      {t('unavailable')}
    </div>
  );

  if (isLoading || !data?.chart?.result?.[0]) {
    return (
      <div className="p-6 rounded-2xl bg-cyber-panel border border-white/10 animate-pulse h-40 w-full flex flex-col justify-between">
         <div className="h-4 w-1/3 bg-white/10 rounded"></div>
         <div className="h-8 w-1/2 bg-white/10 rounded"></div>
         <div className="h-12 w-full bg-white/5 rounded mt-2"></div>
      </div>
    );
  }

  const result = data.chart.result[0];
  const meta = result.meta;
  const quote = result.indicators.quote[0];
  const prices = quote.close || [];
  const timestamps = result.timestamp || [];

  // Filter out nulls
  const validData = prices.map((price: number, i: number) => ({
    price,
    time: timestamps[i]
  })).filter((d: any) => d.price !== null);

  const currentPrice = meta.regularMarketPrice;
  const prevClose = meta.chartPreviousClose;
  const change = currentPrice - prevClose;
  const percentChange = (change / prevClose) * 100;
  const isPositive = change >= 0;

  // Chart Data Configuration
  // We take the last 7 entries for the mini chart
  const slicedData = validData.slice(-7);
  
  const chartData = {
    labels: slicedData.map((d: any) => new Date(d.time * 1000).toLocaleDateString()),
    datasets: [
      {
        data: slicedData.map((d: any) => d.price),
        borderColor: isPositive ? '#00ff9d' : '#ef4444',
        borderWidth: 2,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 100);
          gradient.addColorStop(0, isPositive ? 'rgba(0, 255, 157, 0.2)' : 'rgba(239, 68, 68, 0.2)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          return gradient;
        },
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(2, 6, 23, 0.9)',
        titleColor: '#94a3b8',
        bodyColor: '#fff',
        displayColors: false,
        callbacks: {
          label: (ctx: any) => `$${ctx.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      x: { display: false },
      y: { display: false, min: Math.min(...slicedData.map((d:any) => d.price)) * 0.99 }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="bg-cyber-panel backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${isPositive ? 'from-cyber-green/10' : 'from-red-500/10'} to-transparent rounded-bl-full -mr-4 -mt-4 transition-opacity group-hover:opacity-100 opacity-50`} />
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h3 className="text-gray-400 text-xs font-bold tracking-wider uppercase">{t('symbol')}: {symbol}</h3>
          <div className="text-3xl font-mono font-bold text-white mt-1">
            ${currentPrice.toFixed(2)}
          </div>
        </div>
        <div className={`text-right ${isPositive ? 'text-cyber-green' : 'text-red-500'}`}>
          <div className="text-sm font-bold flex items-center justify-end gap-1">
            {isPositive ? '▲' : '▼'} {Math.abs(percentChange).toFixed(2)}%
          </div>
          <div className="text-xs opacity-70">
            {change > 0 ? '+' : ''}{change.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="h-16 w-full mt-2 relative z-10 opacity-80 hover:opacity-100 transition-opacity">
        <Line options={options} data={chartData} />
      </div>

      <div className="text-[10px] text-gray-600 mt-2 text-right">
        {t('delayed')}
      </div>
    </div>
  );
}