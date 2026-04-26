import { motion } from 'framer-motion';

interface XPProgressBarProps {
  currentXP: number;
  level: number;
}

export function XPProgressBar({ currentXP, level }: XPProgressBarProps) {
  const xpRequired = level * 1000;
  const progress = Math.min((currentXP / xpRequired) * 100, 100);

  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Level {level}</p>
          <p className="text-2xl font-bold text-white tracking-tight">Elite Tier</p>
        </div>
        <p className="text-sm font-mono text-white/60">
          {currentXP.toLocaleString()} / {xpRequired.toLocaleString()} XP
        </p>
      </div>
      <div className="h-4 w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/20 relative backdrop-blur-md shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className="h-full bg-white/30 relative shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        />
      </div>
    </div>
  );
}
