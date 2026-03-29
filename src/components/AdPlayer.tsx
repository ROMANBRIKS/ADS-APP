import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, X, Volume2, Maximize2, SkipForward } from 'lucide-react';
import { AuraButton } from './AuraButton';
import { GlassCard } from './GlassCard';

interface AdPlayerProps {
  onComplete: () => void;
  onClose: () => void;
}

export function AdPlayer({ onComplete, onClose }: AdPlayerProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setIsFinished(true);
    }
  }, [timeLeft]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4"
    >
      <div className="w-full max-w-5xl aspect-video relative group">
        {/* Cinematic Background Glow */}
        <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full opacity-50 pointer-events-none" />
        
        <GlassCard hover={false} className="w-full h-full p-0 overflow-hidden border-white/10 flex flex-col">
          {/* Video Placeholder Area */}
          <div className="flex-1 bg-black/40 relative flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {!isFinished ? (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-center space-y-8 relative z-10">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl"
                    >
                      <Play className="w-10 h-10 text-white fill-white" />
                    </motion.div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold tracking-tighter uppercase italic">Cinematic Experience</h3>
                      <p className="text-sm text-white/30 font-bold uppercase tracking-[0.3em]">Streaming High Fidelity Content</p>
                    </div>
                  </div>
                  
                  {/* Abstract Visualizer */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 p-8 opacity-20">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [20, Math.random() * 80 + 20, 20] }}
                        transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                        className="w-1 bg-white rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="finished"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-8"
                >
                  <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.4)]">
                    <CheckCircle2 className="w-16 h-16 text-black" />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-4xl font-bold tracking-tighter">Engagement Verified</h3>
                    <p className="text-white/40 font-bold uppercase tracking-[0.3em]">Reward Protocol Initialized</p>
                  </div>
                  <AuraButton onClick={onComplete} size="xl" className="rounded-3xl">
                    Claim +10 AUR
                  </AuraButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Media Controls Bar */}
          <div className="h-24 bg-black/60 backdrop-blur-2xl border-t border-white/5 px-8 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <Volume2 className="w-5 h-5 text-white/40" />
                <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-white/40" />
                </div>
              </div>
              <div className="h-4 w-[1px] bg-white/10" />
              <p className="text-xs font-mono text-white/40 tracking-widest uppercase">4K • HDR • 60FPS</p>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Time Remaining</p>
                <p className="text-lg font-bold font-mono text-white/80">00:{timeLeft.toString().padStart(2, '0')}</p>
              </div>
              <Maximize2 className="w-5 h-5 text-white/40" />
              <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                <X className="w-6 h-6 text-white/60" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-24 left-0 right-0 h-[2px] bg-white/5">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${(1 - timeLeft / 15) * 100}%` }}
              className="h-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            />
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
