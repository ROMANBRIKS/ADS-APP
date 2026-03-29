import { motion } from 'framer-motion';
import { Trophy, User, Zap, Star } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface LeaderboardProps {
  users: any[];
}

export function Leaderboard({ users }: LeaderboardProps) {
  return (
    <GlassCard className="w-full max-w-2xl border-white/10 p-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="space-y-2">
          <h3 className="text-4xl font-bold text-white tracking-tighter flex items-center gap-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Hall of Fame
          </h3>
          <p className="text-sm text-white/30 font-bold uppercase tracking-[0.3em]">The Aura Elite</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Season 01</span>
        </div>
      </div>

      <div className="space-y-6">
        {users.map((user, index) => (
          <motion.div
            key={user.uid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500">
              <div className="flex items-center gap-8">
                <div className="relative">
                  <span className="absolute -top-2 -left-2 text-4xl font-black italic text-white/5 group-hover:text-white/10 transition-colors">
                    {index + 1}
                  </span>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/10 relative z-10">
                    <User className="w-8 h-8 text-white/40" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xl font-bold text-white tracking-tight">{user.displayName || 'Anonymous'}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Level {user.level}</span>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">{user.totalAdsWatched} Sessions</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-baseline justify-end gap-2">
                  <p className="text-3xl font-bold text-white font-mono tracking-tighter">{user.points.toLocaleString()}</p>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">AUR</span>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-1">Total Yield</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
