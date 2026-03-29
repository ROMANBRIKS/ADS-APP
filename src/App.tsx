import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Zap, 
  Trophy, 
  Play, 
  LogOut, 
  TrendingUp, 
  Flame, 
  Sparkles,
  Wallet,
  LayoutDashboard,
  Users,
  User,
  Settings,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Clock,
  Gift
} from 'lucide-react';
import { auth, db, googleProvider } from './firebase';
import { GlassCard } from './components/GlassCard';
import { AuraButton } from './components/AuraButton';
import { XPProgressBar } from './components/XPProgressBar';
import { AdPlayer } from './components/AdPlayer';
import { Leaderboard } from './components/Leaderboard';
import { cn } from './lib/utils';

const BackgroundAura = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 100, 0],
        y: [0, 50, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"
    />
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        x: [0, -80, 0],
        y: [0, -40, 0],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full"
    />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
  </div>
);

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await syncUserProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(5));
    const unsubscribeLeaderboard = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data());
      setTopUsers(users);
    });

    return () => {
      unsubscribe();
      unsubscribeLeaderboard();
    };
  }, []);

  const syncUserProfile = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newProfile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        points: 0,
        xp: 0,
        level: 1,
        streak: 1,
        totalAdsWatched: 0,
        lastAdWatchedAt: serverTimestamp(),
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      };
      await setDoc(userRef, newProfile);
      setProfile(newProfile);
    } else {
      setProfile(userSnap.data());
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleAdComplete = async () => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const logRef = doc(collection(db, 'adLogs'));

    const pointsEarned = 10;
    const xpEarned = 50;

    const newXP = (profile?.xp || 0) + xpEarned;
    const currentLevel = profile?.level || 1;
    const xpRequired = currentLevel * 1000;
    const newLevel = newXP >= xpRequired ? currentLevel + 1 : currentLevel;

    await updateDoc(userRef, {
      points: increment(pointsEarned),
      xp: increment(xpEarned),
      level: newLevel,
      totalAdsWatched: increment(1),
      lastAdWatchedAt: serverTimestamp(),
    });

    await setDoc(logRef, {
      userId: user.uid,
      adId: `ad_${Date.now()}`,
      timestamp: serverTimestamp(),
      pointsEarned,
    });

    setIsAdPlaying(false);
    setProfile((prev: any) => ({
      ...prev,
      points: prev.points + pointsEarned,
      xp: prev.xp + xpEarned,
      level: newLevel,
      totalAdsWatched: prev.totalAdsWatched + 1,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center"
        >
          <Zap className="w-8 h-8 text-white" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020202] text-white selection:bg-white/20 overflow-hidden flex flex-col font-sans">
        <BackgroundAura />

        <nav className="fixed top-0 w-full p-8 flex justify-between items-center z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tighter">AURA</span>
          </div>
          <AuraButton variant="secondary" size="sm" onClick={handleLogin}>
            Sign In
          </AuraButton>
        </nav>

        <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-4xl w-full space-y-16 text-center">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-bold tracking-[0.3em] uppercase text-white/40"
              >
                <ShieldCheck className="w-3 h-3" />
                Verified Ecosystem
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-7xl md:text-[10rem] font-bold tracking-tighter leading-[0.85] text-white"
              >
                EARN <br /> <span className="text-white/20">BEYOND</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl text-white/40 font-medium max-w-2xl mx-auto leading-relaxed"
              >
                The world's first luxury reward platform. <br className="hidden md:block" /> 
                High-yield engagement, cinematic experience.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col md:flex-row items-center justify-center gap-6"
            >
              <AuraButton onClick={handleLogin} size="xl" className="w-full md:w-auto min-w-[280px]">
                Get Started
                <ArrowUpRight className="w-5 h-5" />
              </AuraButton>
              <AuraButton variant="ghost" size="xl" className="w-full md:w-auto">
                Learn More
              </AuraButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/5"
            >
              <FeatureMini icon={<Star />} label="Premium Ads" />
              <FeatureMini icon={<TrendingUp />} label="High Yield" />
              <FeatureMini icon={<ShieldCheck />} label="Secure" />
              <FeatureMini icon={<Zap />} label="Instant" />
            </motion.div>
          </div>
        </main>

        <footer className="p-12 text-center relative z-10">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent mb-8" />
          <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-bold">
            Redefining Digital Value • Aura 2026
          </p>
        </footer>
      </div>
    );
  }

  const renderSettings = () => (
    <div className="space-y-12 max-w-4xl mx-auto pb-24">
      <div className="space-y-2">
        <h2 className="text-5xl font-bold text-white tracking-tighter">Settings</h2>
        <p className="text-sm text-white/30 font-bold uppercase tracking-[0.3em]">Configure your experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GlassCard className="p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <User className="w-6 h-6 text-white/60" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Account</h3>
              <p className="text-xs text-white/40 font-medium uppercase tracking-widest">Personal Identity</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Display Name</label>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-white/60 font-medium">
                {profile?.displayName || 'Anonymous'}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Email Address</label>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-white/60 font-medium">
                {auth.currentUser?.email}
              </div>
            </div>
            <div className="pt-4">
              <AuraButton 
                variant="ghost" 
                className="w-full border border-red-500/20 text-red-500/60 hover:bg-red-500/10 hover:text-red-500"
                onClick={() => auth.signOut()}
              >
                Terminate Session
              </AuraButton>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <Settings className="w-6 h-6 text-white/60" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Preferences</h3>
              <p className="text-xs text-white/40 font-medium uppercase tracking-widest">App Configuration</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-white">Haptic Feedback</p>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Tactile Response</p>
              </div>
              <div className="w-12 h-6 rounded-full bg-white/10 border border-white/10 relative">
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white/40" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-white">Auto-Play Ads</p>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Continuous Stream</p>
              </div>
              <div className="w-12 h-6 rounded-full bg-white/10 border border-white/10 relative">
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white/40" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-white">High Fidelity UI</p>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Max Performance</p>
              </div>
              <div className="w-12 h-6 rounded-full bg-white/10 border border-white/10 relative">
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-8 border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">Aura Rewards Protocol</p>
            <p className="text-xs text-white/40">Version 1.0.4-beta • Build 2026.03.29</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[10px] font-bold text-white/20 uppercase tracking-widest hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="text-[10px] font-bold text-white/20 uppercase tracking-widest hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="text-[10px] font-bold text-white/20 uppercase tracking-widest hover:text-white/60 transition-colors">Support</a>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-white/20 flex flex-col md:flex-row font-sans">
      <BackgroundAura />

      {/* Sidebar Navigation */}
      <nav className="w-full md:w-28 border-b md:border-b-0 md:border-r border-white/[0.05] bg-black/40 backdrop-blur-3xl flex md:flex-col items-center justify-between p-6 md:py-12 z-30">
        <div className="flex md:flex-col items-center gap-12">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <Zap className="w-7 h-7 text-black" />
          </div>
          <div className="flex md:flex-col items-center gap-8">
            <NavIcon active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} />
            <NavIcon active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Users />} />
            <NavIcon active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings />} />
          </div>
        </div>
        <button onClick={handleLogout} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-white/30 hover:text-white group">
          <LogOut className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-16 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Header */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                <Clock className="w-3 h-3" />
                Session Active
              </div>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter leading-none">
                Bonjour, <span className="text-white/20">{user.displayName?.split(' ')[0]}</span>
              </h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
              <GlassCard hover={false} className="p-4 px-8 flex items-center gap-6 border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-1">Available Balance</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono tracking-tighter">{profile?.points?.toLocaleString() || 0}</span>
                    <span className="text-xs font-bold text-white/20 uppercase tracking-widest">AUR</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 xl:grid-cols-3 gap-10"
              >
                {/* Main Action Card */}
                <GlassCard className="xl:col-span-2 flex flex-col justify-between min-h-[500px] relative group overflow-hidden border-white/10">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full group-hover:bg-blue-600/10 transition-all duration-1000" />
                  
                  <div className="space-y-12 relative z-10">
                    <XPProgressBar currentXP={profile?.xp || 0} level={profile?.level || 1} />
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                      <StatItem label="Ads Watched" value={profile?.totalAdsWatched || 0} icon={<Play className="w-4 h-4" />} />
                      <StatItem label="Streak" value={profile?.streak || 1} icon={<Flame className="w-4 h-4 text-orange-500" />} />
                      <StatItem label="Tier" value="Elite" icon={<ShieldCheck className="w-4 h-4 text-blue-400" />} />
                      <StatItem label="Yield" value="1.5x" icon={<TrendingUp className="w-4 h-4 text-green-400" />} />
                    </div>
                  </div>

                  <div className="pt-16 relative z-10">
                    <AuraButton 
                      onClick={() => setIsAdPlaying(true)} 
                      size="xl" 
                      className="w-full py-10 text-2xl group rounded-[2rem]"
                    >
                      <span className="flex items-center gap-4">
                        Launch Premium Ad
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                      </span>
                    </AuraButton>
                    <p className="text-center mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                      Guaranteed +10 AUR • +50 XP per session
                    </p>
                  </div>
                </GlassCard>

                {/* Side Info */}
                <div className="space-y-10">
                  <GlassCard className="bg-gradient-to-br from-white/5 to-transparent border-white/10">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Active Quests</h4>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <div className="space-y-8">
                      <ChallengeItem label="Daily Watch" progress={profile?.totalAdsWatched % 10} total={10} />
                      <ChallengeItem label="Point Harvest" progress={profile?.points % 100} total={100} />
                    </div>
                  </GlassCard>

                  <GlassCard className="border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="flex items-center gap-5 mb-6 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                        <Gift className="w-6 h-6 text-purple-400" />
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Referral Program</h4>
                    </div>
                    <p className="text-xs text-white/40 mb-8 leading-relaxed relative z-10">
                      Expand the Aura. Earn a permanent 20% commission on all referred user rewards.
                    </p>
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between relative z-10">
                      <code className="text-sm font-mono text-white/80 font-bold">{profile?.referralCode}</code>
                      <button className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">Copy Link</button>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-center"
              >
                <Leaderboard users={topUsers} />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {renderSettings()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Ad Player Modal */}
      <AnimatePresence>
        {isAdPlaying && (
          <AdPlayer 
            onComplete={handleAdComplete} 
            onClose={() => setIsAdPlaying(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavIcon({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl transition-all duration-500 relative group",
        active ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)]" : "text-white/20 hover:text-white hover:bg-white/5"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
      {active && (
        <motion.div
          layoutId="nav-glow"
          className="absolute inset-0 rounded-2xl bg-white/20 blur-xl -z-10"
        />
      )}
    </button>
  );
}

function StatItem({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
        {icon}
        {label}
      </div>
      <p className="text-3xl font-bold font-mono text-white tracking-tighter">{value}</p>
    </div>
  );
}

function ChallengeItem({ label, progress, total }: { label: string, progress: number, total: number }) {
  const percent = (progress / total) * 100;
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.3em]">
        <span className="text-white/40">{label}</span>
        <span className="text-white/20">{progress}/{total}</span>
      </div>
      <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className="h-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
        />
      </div>
    </div>
  );
}

function FeatureMini({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/40">
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{label}</span>
    </div>
  );
}
