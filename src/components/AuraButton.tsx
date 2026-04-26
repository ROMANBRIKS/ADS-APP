import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/utils';

interface AuraButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  thick?: boolean;
}

export function AuraButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  thick = false,
  ...props
}: AuraButtonProps) {
  const variants = {
    primary: "bg-white text-black",
    secondary: cn(
      thick ? "glass-panel-thick" : "glass-panel",
      "text-white hover:bg-white/[0.05] hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)]"
    ),
    accent: "bg-blue-600 text-white hover:bg-blue-500",
    ghost: "bg-transparent text-white/50 hover:text-white hover:bg-white/[0.02]",
  };

  const sizes = {
    sm: "px-5 py-2 text-xs font-bold uppercase tracking-widest",
    md: "px-8 py-3 text-sm font-bold uppercase tracking-widest",
    lg: "px-10 py-4 text-base font-bold uppercase tracking-widest",
    xl: "px-12 py-5 text-lg font-bold uppercase tracking-widest",
  };

  return (
    <motion.button
      className={cn(
        "relative flex items-center justify-center rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ transformStyle: thick ? "preserve-3d" : "flat" }}
      {...props}
    >
      {variant === 'secondary' && thick && (
        <>
          <div 
            className="absolute inset-0 rounded-xl border-[4px] border-white/5 pointer-events-none"
            style={{ transform: "translateZ(-10px)" }}
          />
          <div 
            className="absolute inset-0 rounded-xl border-[1px] border-white/20 pointer-events-none"
            style={{ transform: "translateZ(10px)" }}
          />
        </>
      )}
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <span className="relative z-10 flex items-center gap-3" style={{ transform: thick ? "translateZ(20px)" : "none" }}>{children}</span>
      )}
    </motion.button>
  );
}
