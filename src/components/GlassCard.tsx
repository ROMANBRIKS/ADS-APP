import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  thick?: boolean;
}

export function GlassCard({ children, className, delay = 0, hover = true, thick = false }: GlassCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: hover ? rotateX : 0,
        rotateY: hover ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        thick ? "glass-panel-thick" : "glass-panel",
        "relative rounded-[2rem] p-8 transition-shadow duration-500",
        hover && "hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {thick ? (
        <>
          {/* Massive Glass Thickness Simulation (30x) */}
          <div 
            className="absolute inset-0 rounded-[2rem] border-[30px] border-cyan-500/10 pointer-events-none"
            style={{ transform: "translateZ(-150px)" }}
          />
          <div 
            className="absolute inset-0 rounded-[2rem] border-[20px] border-white/5 pointer-events-none"
            style={{ transform: "translateZ(-100px)" }}
          />
          <div 
            className="absolute inset-0 rounded-[2rem] border-[10px] border-white/10 pointer-events-none"
            style={{ transform: "translateZ(-50px)" }}
          />
          <div 
            className="absolute inset-0 rounded-[2rem] border-[1px] border-white/40 pointer-events-none"
            style={{ transform: "translateZ(150px)" }}
          />
        </>
      ) : (
        <>
          {/* Glass Thickness Effect (Subtle Cyan Tint on Edges) */}
          <div 
            className="absolute inset-0 rounded-[2rem] border-[8px] border-cyan-500/5 pointer-events-none"
            style={{ transform: "translateZ(-15px)" }}
          />
          <div 
            className="absolute inset-0 rounded-[2rem] border-[1px] border-white/30 pointer-events-none"
            style={{ transform: "translateZ(15px)" }}
          />
        </>
      )}

      {/* Dynamic Specular Glint */}
      {hover && (
        <motion.div
          style={{
            background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 100%)",
            x: useTransform(mouseXSpring, [-0.5, 0.5], ["-50%", "50%"]),
            y: useTransform(mouseYSpring, [-0.5, 0.5], ["-50%", "50%"]),
            translateZ: thick ? 160 : 0,
          }}
          className="absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay"
        />
      )}
      
      <div 
        style={{ transform: thick ? "translateZ(300px)" : "translateZ(80px)" }}
        className="relative z-10"
      >
        {children}
      </div>
    </motion.div>
  );
}
