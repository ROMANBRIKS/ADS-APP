import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/utils';

interface AuraButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export function AuraButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  ...props
}: AuraButtonProps) {
  const variants = {
    primary: "bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10 backdrop-blur-xl",
    accent: "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)]",
    ghost: "bg-transparent text-white/50 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-xs font-bold uppercase tracking-widest",
    md: "px-8 py-4 text-sm font-bold uppercase tracking-widest",
    lg: "px-10 py-5 text-base font-bold uppercase tracking-widest",
    xl: "px-12 py-6 text-lg font-bold uppercase tracking-widest",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative flex items-center justify-center rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Liquid Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shine_1.5s_infinite] pointer-events-none" />
      
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <span className="relative z-10 flex items-center gap-3">{children}</span>
      )}
    </motion.button>
  );
}
