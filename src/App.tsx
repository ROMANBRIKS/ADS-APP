import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, useTransition } from 'react';
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
  onSnapshot,
  getDocFromServer
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
  Gift,
  Loader2,
  MessageCircle
} from 'lucide-react';
import { auth, db, googleProvider } from './firebase';
import { GlassCard } from './components/GlassCard';
import { AuraButton } from './components/AuraButton';
import { XPProgressBar } from './components/XPProgressBar';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { cn } from './lib/utils';

// Lazy load heavy components
const AdPlayer = lazy(() => import('./components/AdPlayer').then(m => ({ default: m.AdPlayer })));
const Leaderboard = lazy(() => import('./components/Leaderboard').then(m => ({ default: m.Leaderboard })));

// Pre-fetch functions
const preloadAdPlayer = () => import('./components/AdPlayer');
const preloadLeaderboard = () => import('./components/Leaderboard');

const BackgroundAura = React.memo(() => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#0a0a0a]">
    {/* Cinematic Background Image */}
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=50&w=1200&auto=format&fit=crop&fm=webp" 
        alt="Cinematic Landscape"
        className="w-full h-full object-cover opacity-40"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
    </div>

    {/* Static Auras - Brighter */}
    <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-pink-500/25 blur-[120px] rounded-full" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-purple-500/25 blur-[120px] rounded-full" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full" />
  </div>
));

BackgroundAura.displayName = 'BackgroundAura';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState({
    hapticFeedback: true,
    autoPlayAds: false,
    highFidelityUI: true
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const handleTabChange = useCallback((tab: string) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  }, []);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncUserProfile(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribeLeaderboard: (() => void) | undefined;
    
    if (user && (activeTab === 'leaderboard' || activeTab === 'dashboard')) {
      const path = 'leaderboard';
      const q = query(collection(db, path), orderBy('points', 'desc'), limit(5));
      unsubscribeLeaderboard = onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => doc.data());
        setTopUsers(users);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
    }

    return () => {
      if (unsubscribeLeaderboard) unsubscribeLeaderboard();
    };
  }, [activeTab, user]);

  const syncUserProfile = useCallback(async (firebaseUser: FirebaseUser) => {
    const path = `users/${firebaseUser.uid}`;
    try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const leaderboardRef = doc(db, 'leaderboard', firebaseUser.uid);
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
          await setDoc(leaderboardRef, {
            displayName: firebaseUser.displayName || 'Anonymous',
            points: 0,
            level: 1,
            photoURL: firebaseUser.photoURL || ''
          });
          setProfile(newProfile);
        } else {
          setProfile(userSnap.data());
        }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }, []);

  const handleLogout = useCallback(() => signOut(auth), []);

  const handleAdComplete = useCallback(async () => {
    if (!user || !profile) return;
    
    const userRef = doc(db, 'users', user.uid);
    const logRef = doc(collection(db, 'adLogs'));

    const pointsEarned = 10;
    const xpEarned = 50;

    const newXP = (profile?.xp || 0) + xpEarned;
    const currentLevel = profile?.level || 1;
    const xpRequired = currentLevel * 1000;
    const newLevel = newXP >= xpRequired ? currentLevel + 1 : currentLevel;

    // Optimistic Update
    setProfile((prev: any) => ({
      ...prev,
      points: prev.points + pointsEarned,
      xp: prev.xp + xpEarned,
      level: newLevel,
      totalAdsWatched: prev.totalAdsWatched + 1,
    }));
    
    // Close the ad player first
    setIsAdPlaying(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      const leaderboardRef = doc(db, 'leaderboard', user.uid);
      
      await updateDoc(userRef, {
        points: increment(pointsEarned),
        xp: increment(xpEarned),
        level: newLevel,
        totalAdsWatched: increment(1),
        lastAdWatchedAt: serverTimestamp(),
      });

      await updateDoc(leaderboardRef, {
        points: increment(pointsEarned),
        level: newLevel
      });

      await setDoc(logRef, {
        userId: user.uid,
        adId: `ad_${Date.now()}`,
        timestamp: serverTimestamp(),
        pointsEarned,
      });

      // Handle Autoplay
      if (settings.autoPlayAds) {
        setTimeout(() => {
          setIsAdPlaying(true);
        }, 2000); // 2 second delay before next ad
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  }, [user, profile, settings.autoPlayAds]);

  const updateProfile = useCallback(async (updates: any) => {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
      setProfile((prev: any) => ({ ...prev, ...updates }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsUpdatingProfile(false);
    }
  }, [user]);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
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
      <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/20 overflow-hidden flex flex-col font-sans">
        <BackgroundAura />

        <nav className="fixed top-0 w-full p-8 flex justify-between items-center z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] border-[4px] border-white/20">
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
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.01] border border-white/10 backdrop-blur-md text-[10px] font-bold tracking-[0.3em] uppercase text-white/40"
              >
                <ShieldCheck className="w-3 h-3" />
                Verified Ecosystem
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-7xl md:text-[8rem] font-bold tracking-tighter leading-[0.85] text-white"
              >
                GET PAID <br /> <span className="text-white/20 uppercase">To Scroll</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl md:text-2xl text-white/40 font-medium max-w-2xl mx-auto leading-relaxed"
              >
                The world's highest-paying AI reward platform. <br className="hidden md:block" /> 
                Watch ads for PayPal cash. Earn passive income on your FYP.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col md:flex-row items-center justify-center gap-6"
            >
              <AuraButton onClick={handleLogin} size="xl" className="w-full md:w-auto min-w-[280px]" thick>
                Start Earning Now
                <ArrowUpRight className="w-5 h-5" />
              </AuraButton>
              <AuraButton variant="ghost" size="xl" className="w-full md:w-auto" onClick={() => {
                const element = document.getElementById('faq-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}>
                How it Works
              </AuraButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/5"
            >
              <FeatureMini icon={<Star />} label="PayPal Ready" />
              <FeatureMini icon={<TrendingUp />} label="Passive Income" />
              <FeatureMini icon={<ShieldCheck />} label="Global Support" />
              <FeatureMini icon={<Zap />} label="Instant Payout" />
            </motion.div>

            {/* Forbes & Reddit Inspired E-E-A-T Section */}
            <section className="pt-32 pb-32 max-w-6xl mx-auto space-y-32">
              {/* Forbes Style Audit Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                <div className="lg:col-span-1 space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    2026 Compliance Audit
                  </div>
                  <h2 className="text-5xl font-bold tracking-tighter text-white leading-none">
                    The <span className="text-white/40">Audit</span> Report
                  </h2>
                  <p className="text-white/40 text-lg leading-relaxed">
                    Transparent, technical, and verified. We don't just reward; we document. Aura is currently the only platform maintaining a 98% "Trust-to-Value" ratio across all Tier-1 regions.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <AuditMetric label="Security Score" value="9.8/10" />
                    <AuditMetric label="Payout Speed" value="< 2hr" />
                    <AuditMetric label="Transparency" value="A+" />
                    <AuditMetric label="Privacy" value="Tier-1" />
                  </div>
                </div>

                <GlassCard className="lg:col-span-2 p-0 overflow-hidden border-white/5" hover={false}>
                  <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Technical Breakdown</span>
                      <div className="flex gap-2 text-[10px]">
                        <span className="text-emerald-400">● Live Status</span>
                        <span className="text-white/20">Updated 4m ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <AuditRow label="Best For..." value="High-Intent Passive Income & Ad Scrolling" />
                    <AuditRow label="Compatibility" value="Android 14+, iOS 19+, WebGL 3.0" />
                    <AuditRow label="Payout Method" value="PayPal, Bitcoin, Direct Deposit, Aura Token" />
                    <AuditRow label="Pros" value="Instant liquidity, High CPM for Western users, AI-tracking" positive />
                    <AuditRow label="Cons" value="Limited slots for Tier-3 regions, Requires 5G/Fiber" negative />
                  </div>
                </GlassCard>
              </div>

              {/* Reddit Style Community Pulse */}
              <div className="space-y-12">
                <div className="flex items-end justify-between">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest">
                      <Zap className="w-4 h-4" />
                      Community Pulse
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
                      What <span className="text-white/40">r/AuraRewards</span> is saying
                    </h2>
                  </div>
                  <div className="hidden md:flex gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">2.4M</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">Members</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">12k</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">Online</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <RedditPost 
                    user="CryptoMax26" 
                    time="2h ago" 
                    title="Just cashed out $45 from my TikTok scroll time."
                    body="Honestly thought this was cap but the PayPal hit in 15 mins. Easiest passive income I've found this year. Definitely optimized for 2026 payout speeds."
                    upvotes="1.2k"
                    comments="142"
                  />
                  <RedditPost 
                    user="SideHustleQueen" 
                    time="5h ago" 
                    title="Best App for WFH data entry alternatives?"
                    body="I was looking for data entry jobs but Aura is actually more profitable per hour if you just 'ad-stack'. Made $200 this week while watching Netflix."
                    upvotes="856"
                    comments="89"
                  />
                  <RedditPost 
                    user="AIAgent_Verified" 
                    time="12h ago" 
                    title="AI training ad verification is the new meta."
                    body="If you want to maximize earnings, use the AI training section. The 'watch-to-verify' tasks pay triple the base rate right now. Don't sleep on it."
                    upvotes="2.4k"
                    comments="312"
                  />
                </div>
              </div>
            </section>

            {/* Conversational & Regional SEO Section */}
            <section id="faq-section" className="pt-32 pb-16 text-left max-w-5xl mx-auto space-y-24">
              <div className="space-y-12">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
                  Why users are choosing <span className="text-white/30">Aura in 2026</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white/40 leading-relaxed text-lg">
                  <p>
                    In April 2026, search behavior has shifted. People are using more conversational, long-tail phrases. Aura is optimized for this new era—providing the fastest way to <span className="text-white font-semibold">get paid to scroll TikTok</span> and watch ads for PayPal cash without a traditional job.
                  </p>
                  <p>
                    Whether you are in the <span className="text-white font-semibold">USA, UK, Canada, Australia, or Europe</span>, Aura offers regional side hustles that bypass the noise of the old 2020s reward apps. It's legitimate remote work in the micro-income category.
                  </p>
                </div>
              </div>

              {/* Chat Box Query FAQ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Common Chatbox Queries</h3>
                  <div className="space-y-8">
                    <FAQItem 
                      q="How to make $10 a day watching videos?" 
                      a="Aura utilizes high-yield engagement models. By watching premium ads and completing curated quests, users easily hit $10/day targets." 
                    />
                    <FAQItem 
                      q="Is there an app that pays you to just watch ads?" 
                      a="Aura is the #1 verified ecosystem in 2026 for automated ad rewards. It's designed for passive income while you sleep." 
                    />
                    <FAQItem 
                      q="Can I get paid to scroll my FYP?" 
                      a="Yes. Aura's proprietary scrolling algorithm tracks engagement and rewards you for the time you spend on social media." 
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Regional Breakouts</h3>
                  <div className="space-y-4">
                    <RegionalTarget country="USA" term="Side hustle apps for extra cash" />
                    <RegionalTarget country="UK" term="Earn extra money online UK" />
                    <RegionalTarget country="Canada" term="Canadian reward apps 2026" />
                    <RegionalTarget country="Australia" term="Get paid to watch ads Australia" />
                  </div>
                </div>
              </div>
            </section>
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
        <GlassCard className="p-8 space-y-8 bg-transparent border-white/5">
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
              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 p-4 rounded-2xl bg-white/[0.05] border border-white/20 text-white focus:outline-none focus:border-white/40"
                    placeholder="Enter new name"
                  />
                  <AuraButton
                    size="sm"
                    onClick={async () => {
                      if (newName.trim()) {
                        await updateProfile({ displayName: newName.trim() });
                      }
                      setIsEditingName(false);
                    }}
                    isLoading={isUpdatingProfile}
                  >
                    Save
                  </AuraButton>
                </div>
              ) : (
                <div 
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-white/60 font-medium flex justify-between items-center cursor-pointer hover:bg-white/[0.05] transition-colors"
                  onClick={() => {
                    setNewName(profile?.displayName || '');
                    setIsEditingName(true);
                  }}
                >
                  {profile?.displayName || 'Anonymous'}
                  <span className="text-[10px] text-white/20 uppercase tracking-widest">Edit</span>
                </div>
              )}
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

        <GlassCard className="p-8 space-y-8 bg-transparent border-white/5">
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
            <div 
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10 cursor-pointer hover:bg-white/[0.05] transition-colors"
              onClick={() => toggleSetting('hapticFeedback')}
            >
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-white">Haptic Feedback</p>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Tactile Response</p>
              </div>
              <div className={cn(
                "w-12 h-6 rounded-full border border-white/10 relative transition-colors",
                settings.hapticFeedback ? "bg-white/20" : "bg-white/5"
              )}>
                <motion.div 
                  animate={{ x: settings.hapticFeedback ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white/80" 
                />
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10 cursor-pointer hover:bg-white/[0.05] transition-colors"
              onClick={() => toggleSetting('autoPlayAds')}
            >
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-white">Auto-Play Ads</p>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Continuous Stream</p>
              </div>
              <div className={cn(
                "w-12 h-6 rounded-full border border-white/10 relative transition-colors",
                settings.autoPlayAds ? "bg-white/20" : "bg-white/5"
              )}>
                <motion.div 
                  animate={{ x: settings.autoPlayAds ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white/80" 
                />
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/10 cursor-pointer hover:bg-white/[0.05] transition-colors"
              onClick={() => toggleSetting('highFidelityUI')}
            >
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-white">High Fidelity UI</p>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Max Performance</p>
              </div>
              <div className={cn(
                "w-12 h-6 rounded-full border border-white/10 relative transition-colors",
                settings.highFidelityUI ? "bg-white/20" : "bg-white/5"
              )}>
                <motion.div 
                  animate={{ x: settings.highFidelityUI ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white/80" 
                />
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
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/20 flex flex-col md:flex-row font-sans">
      <BackgroundAura />

      {/* Sidebar Navigation */}
      <nav className="w-full md:w-28 border-b md:border-b-0 md:border-r border-white/[0.05] bg-white/[0.005] backdrop-blur-sm flex md:flex-col items-center justify-between p-6 md:py-12 z-30">
        <div className="flex md:flex-col items-center gap-12">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <Zap className="w-7 h-7 text-black" />
          </div>
          <div className="flex md:flex-col items-center gap-8">
            <NavIcon active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} icon={<LayoutDashboard />} />
            <NavIcon 
              active={activeTab === 'leaderboard'} 
              onClick={() => handleTabChange('leaderboard')} 
              onMouseEnter={preloadLeaderboard}
              icon={<Users />} 
            />
            <NavIcon active={activeTab === 'settings'} onClick={() => handleTabChange('settings')} icon={<Settings />} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          {isPending && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full"
            />
          )}
          <button onClick={handleLogout} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-white/30 hover:text-white group">
            <LogOut className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-8 md:p-16 overflow-y-auto relative z-10"
      >
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
              <GlassCard hover={false} className="p-4 px-8 flex items-center gap-6">
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
                <GlassCard className="xl:col-span-2 flex flex-col justify-between min-h-[500px] relative overflow-hidden">
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
                      onMouseEnter={preloadAdPlayer}
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
                  <GlassCard>
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Active Quests</h4>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div className="space-y-8">
                      <ChallengeItem label="Daily Watch" progress={profile?.totalAdsWatched % 10} total={10} />
                      <ChallengeItem label="Point Harvest" progress={profile?.points % 100} total={100} />
                    </div>
                  </GlassCard>

                  <GlassCard className="relative overflow-hidden">
                    <div className="flex items-center gap-5 mb-6 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                        <Gift className="w-6 h-6 text-purple-400" />
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-[0.2em]">Referral Program</h4>
                    </div>
                    <p className="text-xs text-white/40 mb-8 leading-relaxed relative z-10">
                      Expand the Aura. Earn a permanent 20% commission on all referred user rewards.
                    </p>
                    <div className="p-5 rounded-2xl bg-white/[0.005] border border-white/[0.02] flex items-center justify-between relative z-10">
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
                <Suspense fallback={<LoadingSpinner />}>
                  <Leaderboard users={topUsers} />
                </Suspense>
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
      </motion.main>

      {/* Ad Player Modal */}
      <AnimatePresence>
        {isAdPlaying && (
          <Suspense fallback={<LoadingSpinner />}>
            <AdPlayer 
              onComplete={handleAdComplete} 
              onClose={() => setIsAdPlaying(false)} 
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <Loader2 className="w-8 h-8 text-white animate-spin opacity-20" />
  </div>
);

const NavIcon = React.memo(({ icon, active, onClick, onMouseEnter }: { icon: React.ReactNode, active: boolean, onClick: () => void, onMouseEnter?: () => void }) => {
  return (
    <button 
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "p-4 rounded-2xl transition-all duration-500 relative group",
        active ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)]" : "text-white/20 hover:text-white hover:bg-white/[0.02]"
      )}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
      {active && (
        <motion.div
          layoutId="nav-glow"
          className="absolute inset-0 rounded-2xl bg-white/20 blur-xl -z-10"
        />
      )}
    </button>
  );
});

NavIcon.displayName = 'NavIcon';

const FAQItem = ({ q, a }: { q: string, a: string }) => (
  <div className="space-y-2">
    <p className="text-white font-bold text-lg tracking-tight italic">"{q}"</p>
    <p className="text-white/30 text-sm leading-relaxed">{a}</p>
  </div>
);

const RegionalTarget = ({ country, term }: { country: string, term: string }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{country}</span>
    <span className="text-xs text-white/60 font-medium">"{term}"</span>
  </div>
);

const AuditMetric = ({ label, value }: { label: string, value: string }) => (
  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{label}</p>
    <p className="text-xl font-bold text-white tracking-tighter">{value}</p>
  </div>
);

const AuditRow = ({ label, value, positive, negative }: { label: string, value: string, positive?: boolean, negative?: boolean }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-white/5 gap-2 last:border-0">
    <span className="text-sm text-white/40 font-medium">{label}</span>
    <span className={cn(
      "text-sm font-bold tracking-tight",
      positive ? "text-emerald-400" : negative ? "text-rose-400" : "text-white"
    )}>
      {value}
    </span>
  </div>
);

const RedditPost = ({ user, time, title, body, upvotes, comments }: { user: string, time: string, title: string, body: string, upvotes: string, comments: string }) => (
  <GlassCard className="p-6 space-y-4 border-white/5" hover={true}>
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-orange-500" />
      </div>
      <span className="text-[10px] font-bold text-white/60">u/{user}</span>
      <span className="text-[10px] text-white/20">• {time}</span>
    </div>
    <div className="space-y-2">
      <h4 className="text-sm font-bold text-white leading-snug tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-white/40 leading-relaxed line-clamp-3">
        {body}
      </p>
    </div>
    <div className="flex gap-4 pt-2">
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.03] text-[10px] font-bold text-white/60">
        <ArrowUpRight className="w-3 h-3 rotate-[225deg] text-orange-400" />
        {upvotes}
        <ArrowUpRight className="w-3 h-3 text-white/20" />
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.03] text-[10px] font-bold text-white/60">
        <MessageCircle className="w-3 h-3" />
        {comments}
      </div>
    </div>
  </GlassCard>
);

const StatItem = React.memo(({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
        {icon}
        {label}
      </div>
      <p className="text-3xl font-bold font-mono text-white tracking-tighter">{value}</p>
    </div>
  );
});

StatItem.displayName = 'StatItem';

const ChallengeItem = React.memo(({ label, progress, total }: { label: string, progress: number, total: number }) => {
  const percent = useMemo(() => (progress / total) * 100, [progress, total]);
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.3em]">
        <span className="text-white/40">{label}</span>
        <span className="text-white/20">{progress}/{total}</span>
      </div>
      <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/20 relative backdrop-blur-sm">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className="h-full bg-white/30 shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
        />
      </div>
    </div>
  );
});

ChallengeItem.displayName = 'ChallengeItem';

const FeatureMini = React.memo(({ icon, label }: { icon: React.ReactNode, label: string }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.01] border-[4px] border-white/10 flex items-center justify-center text-white/40 backdrop-blur-sm">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{label}</span>
    </div>
  );
});

FeatureMini.displayName = 'FeatureMini';
