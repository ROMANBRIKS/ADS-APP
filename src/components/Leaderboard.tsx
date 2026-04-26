import { motion } from 'framer-motion';
import { Trophy, User, Zap, Star } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface LeaderboardProps {
  users: any[];
}

export function Leaderboard({ users }: LeaderboardProps) {
  return (
    <GlassCard className="w-full max-w-2xl p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold text-white tracking-tighter flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Hall of Fame
          </h3>
          <p className="text-xs text-white/30 font-bold uppercase tracking-[0.2em]">The Aura Elite</p>
        </div>
      </div>

      <div className="space-y-4">
        {users.map((user, index) => (
          <div
            key={user.uid}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.005] border border-white/[0.02]"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/[0.05]">
                <span className="text-xs font-bold text-white/20">{index + 1}</span>
              </div>
              
              <div className="space-y-0.5">
                <p className="text-lg font-bold text-white tracking-tight">{user.displayName || 'Anonymous'}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Level {user.level}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-white font-mono tracking-tighter">{user.points.toLocaleString()}</p>
              <p className="text-[8px] text-white/40 uppercase tracking-[0.1em] font-bold">AUR</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
