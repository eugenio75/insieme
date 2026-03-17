import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import HabitCard from '../components/HabitCard';
import BottomNav from '../components/BottomNav';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { PenLine, Bot, ChevronRight, Sparkles, TrendingUp, Moon, Flame, MessageCircle } from 'lucide-react';
import FastingTimer from '@/components/FastingTimer';

const fallbackMessages = [
  'Ascolta il tuo corpo. Vivi meglio. 🌿',
  'Oggi basta un piccolo passo. Sei già abbastanza.',
  'Non serve perfezione, serve continuità.',
  'Ogni giorno è un\'opportunità, non un obbligo.',
  'Hai già fatto tanto, continua con calma 💛',
];

const HomePage = () => {
  const { user, weeklyHabits, toggleHabit, currentStreak, getStreakMilestone, weekLabel, weekNumber, totalWeeks, refreshWeeklyHabits } = useAppStore();
  const { user: authUser } = useAuth();
  useProfile();
  const navigate = useNavigate();
  const completedCount = weeklyHabits.filter((h) => h.completed).length;
  const progress = completedCount / weeklyHabits.length;
  const milestone = getStreakMilestone();

  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(true);
  const [lastCheckin, setLastCheckin] = useState<{ mood: number; energy: number; bloating: number; stress: number | null } | null>(null);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [proactiveCoach, setProactiveCoach] = useState<{ title: string; message: string; tips: string[]; category: string } | null>(null);
  const [smartInsight, setSmartInsight] = useState<{ type: 'tip' | 'fasting' | 'motivation'; icon: string; label: string; title: string; desc: string } | null>(null);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  // Fetch last check-in + determine if done today
  useEffect(() => {
    if (!authUser) return;
    const fetchCheckin = async () => {
      const { data } = await supabase
        .from('daily_checkins')
        .select('mood, energy, bloating, stress, created_at')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        const c = data[0];
        setLastCheckin({ mood: c.mood, energy: c.energy, bloating: c.bloating, stress: c.stress });
        const today = new Date().toDateString();
        const checkinDate = new Date(c.created_at).toDateString();
        setCheckedInToday(today === checkinDate);
      }
    };
    fetchCheckin();
  }, [authUser]);

  // Fetch check-in signals for habit refresh
  useEffect(() => {
    if (!authUser) return;
    const fetchSignals = async () => {
      const since = new Date(Date.now() - 3 * 86400000).toISOString();
      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('mood, energy, bloating')
        .eq('user_id', authUser.id)
        .gte('created_at', since);
      if (checkins && checkins.length > 0) {
        const signals = {
          avgMood: checkins.reduce((s, c) => s + c.mood, 0) / checkins.length,
          avgEnergy: checkins.reduce((s, c) => s + c.energy, 0) / checkins.length,
          avgBloating: checkins.reduce((s, c) => s + c.bloating, 0) / checkins.length,
        };
        refreshWeeklyHabits(signals);
      }
    };
    fetchSignals();
  }, [authUser, refreshWeeklyHabits]);

  // Fetch AI motivational message
  useEffect(() => {
    const fetchMessage = async () => {
      if (!authUser) { setLoadingMessage(false); return; }
      try {
        const { data, error } = await supabase.functions.invoke('motivational-message');
        if (error) throw error;
        if (data?.message) setAiMessage(data.message);
      } catch (e) {
        console.error('Error fetching motivational message:', e);
      } finally {
        setLoadingMessage(false);
      }
    };
    fetchMessage();
  }, [authUser]);

  // Fetch proactive AI coach insight
  useEffect(() => {
    const fetchCoachInsight = async () => {
      if (!authUser) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach-chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ mode: 'proactive' }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data?.message) setProactiveCoach(data);
        }
      } catch (e) {
        console.error('Error fetching coach insight:', e);
      }
    };
    fetchCoachInsight();
  }, [authUser]);

  // Determine smart insight based on check-in data (soft, encouraging tone)
  useEffect(() => {
    if (!lastCheckin) {
      setSmartInsight({
        type: 'motivation',
        icon: '🌿',
        label: 'PER TE',
        title: 'Prenditi un momento',
        desc: 'Fai il check-in quando vuoi, senza fretta 🌱',
      });
      return;
    }
    const { mood, energy, bloating, stress } = lastCheckin;
    if (energy <= 2) {
      setSmartInsight({
        type: 'tip',
        icon: '🍌',
        label: 'UN PICCOLO AIUTO',
        title: 'Una merenda può fare la differenza',
        desc: 'Frutta secca o una banana sono perfetti per ricaricarti',
      });
    } else if (bloating >= 4) {
      setSmartInsight({
        type: 'tip',
        icon: '🫖',
        label: 'CONSIGLIO GENTILE',
        title: 'Una tisana può aiutarti',
        desc: 'Zenzero o finocchio sono ottimi alleati naturali',
      });
    } else if (stress && stress >= 4) {
      setSmartInsight({
        type: 'tip',
        icon: '🌬️',
        label: 'RESPIRA',
        title: 'Prova 3 respiri profondi',
        desc: 'Anche solo un minuto di calma fa bene al corpo',
      });
    } else if (mood <= 2) {
      setSmartInsight({
        type: 'motivation',
        icon: '💛',
        label: 'CON TE',
        title: 'Va bene anche così',
        desc: 'Non ogni giorno deve essere perfetto. Sei qui, è già tanto',
      });
    } else {
      setSmartInsight({
        type: 'motivation',
        icon: '✨',
        label: 'BENE COSÌ',
        title: 'Stai andando alla grande',
        desc: 'Continua con il tuo ritmo, senza pressioni',
      });
    }
  }, [lastCheckin]);

  const displayMessage = aiMessage || fallbackMessages[new Date().getDay() % fallbackMessages.length];

  // Status indicators from last check-in
  const statusIndicators = useMemo(() => {
    if (!lastCheckin) return null;
    const items = [
      { label: 'Umore', value: lastCheckin.mood, icon: ['😢', '😕', '😐', '🙂', '😄'][lastCheckin.mood - 1] || '😐' },
      { label: 'Energia', value: lastCheckin.energy, icon: ['🪫', '🔋', '⚡', '💪', '🚀'][lastCheckin.energy - 1] || '⚡' },
      { label: 'Gonfiore', value: lastCheckin.bloating, icon: lastCheckin.bloating <= 2 ? '✅' : lastCheckin.bloating <= 3 ? '⚠️' : '🔴' },
    ];
    if (lastCheckin.stress !== null) {
      items.push({ label: 'Stress', value: lastCheckin.stress!, icon: lastCheckin.stress! <= 2 ? '😌' : lastCheckin.stress! <= 3 ? '😤' : '🫨' });
    }
    return items;
  }, [lastCheckin]);

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto">
      <div className="px-5 pt-6">
        <AppHeader />

        {/* ═══════════════════════════════════════════
            BLOCCO 1: CRUSCOTTO STATO DEL GIORNO
        ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-2"
        >
          {/* Greeting + AI message */}
          <div className="relative overflow-hidden rounded-2xl gradient-primary p-5 shadow-glow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-4" />
            <div className="relative">
              <h1 className="font-display text-2xl text-primary-foreground leading-tight">
                {greeting()}{user.name ? `, ${['maschio', 'male', 'm', 'uomo'].includes((user.sex || '').toLowerCase()) ? 'caro' : 'cara'} ${user.name}` : ''} ☀️
              </h1>
              <AnimatePresence mode="wait">
                {loadingMessage ? (
                  <motion.p
                    key="loading"
                    className="text-sm text-primary-foreground/60 italic font-display mt-2"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Sto pensando a qualcosa per te...
                  </motion.p>
                ) : (
                  <motion.p
                    key="message"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-primary-foreground/85 font-display mt-2 leading-relaxed"
                  >
                    {displayMessage}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Status row: streak + progress + last check-in indicators */}
          <div className="mt-4 flex items-center gap-3">
            {/* Streak + Progress compact */}
            <div className="flex-1 p-3.5 rounded-2xl glass glass-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <span className="text-lg">{milestone?.icon || '🔥'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-gradient font-body">{currentStreak}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {currentStreak === 1 ? 'giorno' : 'giorni'}
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gradient-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {completedCount}/{weeklyHabits.length} passi • {weekLabel || `Sett. ${weekNumber}`}
                </p>
              </div>
            </div>

            {/* Check-in status / CTA */}
            {!checkedInToday ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/checkin')}
                className="p-3.5 rounded-2xl gradient-warm shadow-soft flex flex-col items-center justify-center gap-1 min-w-[90px]"
              >
                <PenLine className="w-5 h-5 text-secondary-foreground" />
                <span className="text-[10px] btn-text text-secondary-foreground">CHECK-IN</span>
              </motion.button>
            ) : (
              <div className="p-3.5 rounded-2xl glass glass-border flex flex-col items-center justify-center gap-1 min-w-[90px]">
                <span className="text-lg">✅</span>
                <span className="text-[10px] btn-text text-muted-foreground">FATTO OGGI</span>
              </div>
            )}
          </div>

          {/* Status indicators from last check-in */}
          {statusIndicators && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-3 flex gap-2"
            >
              {statusIndicators.map((s) => (
                <div
                  key={s.label}
                  className="flex-1 p-2.5 rounded-xl glass glass-border flex flex-col items-center gap-1"
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="text-[9px] text-muted-foreground btn-text">{s.label.toUpperCase()}</span>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* ═══════════════════════════════════════════
            COACH AI + INSIGHT UNIFICATO
        ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-5"
        >
          <Link to="/coach" className="block">
            <div className="relative overflow-hidden p-4 rounded-2xl glass glass-border hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  {proactiveCoach ? (
                    <span className="text-lg">{smartInsight?.icon || '🤖'}</span>
                  ) : (
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {proactiveCoach ? (
                    <>
                      <p className="text-[10px] text-primary btn-text mb-1">
                        {smartInsight?.label ? `💡 ${smartInsight.label}` : '🤖 IL TUO COACH AI'}
                      </p>
                      <p className="text-sm font-medium text-foreground">{proactiveCoach.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proactiveCoach.message}</p>
                      {proactiveCoach.tips?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {proactiveCoach.tips.slice(0, 2).map((tip, i) => (
                            <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {tip.length > 40 ? tip.slice(0, 37) + '...' : tip}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : smartInsight ? (
                    <>
                      <p className="text-[10px] text-primary btn-text mb-1">💡 {smartInsight.label}</p>
                      <p className="text-sm font-medium text-foreground">{smartInsight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{smartInsight.desc}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-primary btn-text mb-1">🤖 IL TUO COACH AI</p>
                      <p className="text-sm font-medium text-foreground">Chiedimi qualsiasi cosa</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Conosco le tue analisi, la tua dieta e i tuoi progressi
                      </p>
                    </>
                  )}
                  <p className="text-[10px] text-primary mt-2 btn-text flex items-center gap-1">
                    Chatta col coach <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ═══════════════════════════════════════════
            I TUOI PASSI DI OGGI
        ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h2 className="font-display text-lg text-foreground mb-3">I tuoi passi di oggi</h2>
          <div className="flex flex-col gap-2.5">
            {weeklyHabits.map((habit, i) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <HabitCard
                  title={habit.title}
                  icon={habit.icon}
                  completed={habit.completed}
                  onToggle={() => toggleHabit(habit.id)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Fasting Timer (only if enabled) */}
        <FastingTimer />

        {/* Together Card */}
        {user.mode === 'together' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-5"
          >
            <Link to="/together" className="block p-4 rounded-2xl glass glass-border">
              <div className="flex items-center gap-3">
                <span className="text-xl animate-pulse-gentle">❤️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Insieme a {user.partnerName || 'qualcuno di speciale'}
                  </p>
                  <p className="text-xs text-muted-foreground">Tocca per inviare supporto</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
