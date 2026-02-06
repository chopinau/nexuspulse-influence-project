"use client"

import React from 'react';

interface RiskGaugeProps {
  score: number; // 0-10
}

export default function RiskGauge({ score }: RiskGaugeProps) {
  // Normalize score to 0-100 for calculations
  const percentage = Math.min(Math.max(score * 10, 0), 100);
  
  // Color logic
  let color = "#10b981"; // Green (0-40)
  if (percentage > 40) color = "#f59e0b"; // Yellow (41-70)
  if (percentage > 70) color = "#ef4444"; // Red (71-100)

  // SVG Configuration
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * (circumference / 2); // Only half circle
  
  // Rotation for semi-circle (start from left)
  // Full circle is 360. Semi circle is 180.
  // We want to map 0% to -180deg (left) and 100% to 0deg (right)?
  // Actually easiest is to draw a strokeDasharray for half circle.
  
  // Alternative: Simple CSS semi-circle using conic-gradient or SVG path.
  // SVG Path is cleaner.
  // Describe an arc.
  
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // 0 score = 0 degrees (left)
  // 10 score = 180 degrees (right)
  const angle = (score / 10) * 180;

  return (
    <div className="relative flex flex-col items-center justify-center">
       {/* Gauge SVG */}
       <svg width="200" height="120" viewBox="0 0 200 120" className="overflow-visible">
          {/* Background Arc */}
          <path 
             d={describeArc(100, 100, 80, 0, 180)} 
             fill="none" 
             stroke="#334155" 
             strokeWidth="15" 
             strokeLinecap="round"
          />
          
          {/* Progress Arc */}
          <path 
             d={describeArc(100, 100, 80, 0, angle)} 
             fill="none" 
             stroke={color} 
             strokeWidth="15" 
             strokeLinecap="round"
             className="transition-all duration-1000 ease-out"
          />
          
          {/* Needle/Text */}
          <text x="100" y="90" textAnchor="middle" fill="white" className="text-4xl font-bold font-mono">
             {score}
          </text>
          <text x="100" y="115" textAnchor="middle" fill={color} className="text-xs font-bold uppercase tracking-widest">
             RISK LEVEL
          </text>
       </svg>
    </div>
  );
}
