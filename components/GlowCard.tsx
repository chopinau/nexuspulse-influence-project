// @ts-nocheck
'use client';

import { motion } from 'framer-motion';
import { ReactNode, Key } from 'react';

interface GlowCardProps {
  children?: ReactNode;
  className?: string;
  delay?: number;
  key?: Key | null | undefined;
}

export default function GlowCard({ children, className = '', delay = 0 }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0, 243, 255, 0.2)" }}
      className={`relative overflow-hidden bg-cyber-panel backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl transition-colors hover:border-cyber-neon/30 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-neon/5 to-cyber-purple/5 pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}