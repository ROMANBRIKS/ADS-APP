import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, X, Volume2, Maximize2, SkipForward, Loader2 } from 'lucide-react';
import { AuraButton } from './AuraButton';
import { GlassCard } from './GlassCard';
import { cn } from '../lib/utils';

interface AdPlayerProps {
  onComplete: () => void;
  onClose: () => void;
}

const AD_SOURCES = [
  'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-4031-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-abstract-motion-of-colors-in-a-dark-background-4032-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-ocean-at-sunset-4033-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-4034-large.mp4',
];

export function AdPlayer({ onComplete, onClose }: AdPlayerProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adUrl] = useState(() => AD_SOURCES[Math.floor(Math.random() * AD_SOURCES.length)]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isLoading && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0) {
      setIsFinished(true);
    }
  }, [timeLeft, isLoading]);

  const handleVideoLoad = () => {
    setIsLoading(false);
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error("Autoplay blocked:", e));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
    >
      <div className="w-full max-w-5xl aspect-video relative">
        <GlassCard hover={false} className="w-full h-full p-0 overflow-hidden flex flex-col relative">
          {/* Video Player Area */}
          <div className="flex-1 bg-transparent relative flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src={adUrl}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-1000",
                isLoading ? "opacity-0" : "opacity-40"
              )}
              onLoadedData={handleVideoLoad}
              muted
              playsInline
            />

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
              </div>
            )}

            <AnimatePresence mode="wait">
              {!isFinished ? (
                !isLoading && (
                  <motion.div
                    key="playing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="text-center space-y-8">
                      <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                        <Play className="w-10 h-10 text-white fill-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-3xl font-bold tracking-widest uppercase text-white/90">AURA CINEMA</h3>
                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">Premium Stream</p>
                      </div>
                    </div>
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="finished"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/60 backdrop-blur-sm"
                >
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-12 h-12 text-black" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold tracking-tighter">Verified</h3>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Reward Ready</p>
                  </div>
                  <AuraButton onClick={onComplete} size="lg" className="rounded-2xl">
                    Claim +10 AUR
                  </AuraButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Media Controls Bar */}
          <div className="h-20 bg-white/[0.02] border-t border-white/5 px-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Volume2 className="w-5 h-5 text-white/40" />
              <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase">4K • 60FPS • LIVE</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-white/20">Remaining</p>
                <p className="text-base font-bold font-mono text-white/80">00:{timeLeft.toString().padStart(2, '0')}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-20 left-0 right-0 h-[2px] bg-white/5">
            <div
              style={{ width: `${(1 - timeLeft / 15) * 100}%` }}
              className="h-full bg-white/40 transition-all duration-1000 ease-linear"
            />
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
