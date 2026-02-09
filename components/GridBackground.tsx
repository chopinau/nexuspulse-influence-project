"use client"

import { motion } from "framer-motion"

export default function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #22d3ee 1px, transparent 1px),
            linear-gradient(to bottom, #22d3ee 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />
      
      {/* Radial overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, #000 80%)"
        }}
      />
      
      {/* Scan line effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 50%)",
          backgroundSize: "100% 4px"
        }}
      />
    </div>
  );
}
