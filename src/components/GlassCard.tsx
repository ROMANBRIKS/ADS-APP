import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function GlassCard({ children, className, delay = 0, hover = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={hover ? { y: -4, scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.05)" } : {}}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.16, 1, 0.3, 1],
        backgroundColor: { duration: 0.3 }
      }}
      className={cn(
        "glass-panel relative rounded-[2.5rem] p-8",
        className
      )}
    >
      {/* Subtle Inner Glow */}
      <div className="absolute inset-0 rounded-[2.5rem] border border-white/[0.05] pointer-events-none" />
      
      {/* Top Edge Highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
