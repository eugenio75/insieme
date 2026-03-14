import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import HabitCard from '../components/HabitCard';
import ProgressRing from '../components/ProgressRing';
import BottomNav from '../components/BottomNav';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getDailyTip } from '@/data/foodTips';
import { PenLine } from 'lucide-react';

const fallbackMessages = [
  'Un passo alla volta, con la gentilezza che meriti. 🌿',
  'Oggi basta un piccolo passo. Sei già abbastanza.',
  'Non serve perfezione, serve continuità.',
  'Ogni giorno è un\'opportunità, non un obbligo.',
  'Hai già fatto tanto, continua con calma 💛',
];

const HomePage = () => {
  const { user, weeklyHabits, toggleHabit, currentStreak, getStreakMilestone, weekLabel, weekNumber, totalWeeks, refreshWeeklyHabits } = useAppStore();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const completedCount = weeklyHabits.filter((h) => h.completed).length;
  const progress = completedCount / weeklyHabits.length;
  const milestone = getStreakMilestone();

  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(true);

  const dailyTip = getDailyTip(user.objective, user.difficulty, user.intolerances);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  // Fetch check-in signals and refresh habits accordingly
  useEffect(() => {
    if (!authUser) return;
    const fetchSignals = async () => {
      const since = new Date(Date.now() - 3 * 86400000).toISOString(); // last 3 days
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

  const displayMessage = aiMessage || fallbackMessages[new Date().getDay() % fallbackMessages.length];

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto">
      <div className="px-6 pt-6">
        <AppHeader />

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h1 className="font-display text-3xl text-foreground">
            {greeting()}, {user.name || 'cara'} ☀️
          </h1>
        </motion.div>

        {/* AI Motivational Message — prominent card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-5"
        >
          <div className="relative overflow-hidden rounded-2xl gradient-primary p-5 shadow-glow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-4" />
            <div className="relative">
              <p className="text-[10px] text-primary-foreground/60 btn-text mb-2">✨ PER TE OGGI</p>
              <AnimatePresence mode="wait">
                {loadingMessage ? (
                  <motion.p
                    key="loading"
                    className="text-sm text-primary-foreground/70 italic font-display"
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
                    className="text-sm text-primary-foreground font-display leading-relaxed"
                  >
                    {displayMessage}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Progress Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex justify-center my-8"
        >
          <ProgressRing progress={progress} />
        </motion.div>

        {/* Streak Counter */}
        {currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-6 p-4 rounded-2xl glass glass-border flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <span className="text-xl">{milestone?.icon || '🔥'}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gradient font-body">{currentStreak}</span>
                <span className="text-sm text-muted-foreground">
                  {currentStreak === 1 ? 'giorno' : 'giorni'} di fila
                </span>
              </div>
              {milestone && (
                <p className="text-xs text-primary mt-0.5 font-medium">{milestone.message}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Weekly Habits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-lg text-foreground">I tuoi 3 passi</h2>
            <span className="text-xs text-muted-foreground font-medium">
              {weekLabel || `Settimana ${weekNumber}`} {weekNumber <= totalWeeks ? '' : '🔄'}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {weeklyHabits.map((habit, i) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
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

        {/* Check-in CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-8"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/checkin')}
            className="w-full p-5 rounded-2xl gradient-warm shadow-soft flex items-center justify-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <PenLine className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="text-left">
              <p className="btn-text text-sm text-secondary-foreground">COME TI SENTI ORA?</p>
              <p className="text-xs mt-0.5 text-secondary-foreground/70">3 domande veloci ⏱️</p>
            </div>
          </motion.button>
        </motion.div>

        {/* Daily Food Tip — styled card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          className="mt-5"
        >
          <Link to="/nutrition" className="block">
            <div className="p-5 rounded-2xl bg-accent glass-border hover:border-primary/20 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{dailyTip.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-accent-foreground/50 btn-text mb-1">💡 CONSIGLIO DEL GIORNO</p>
                  <p className="text-sm font-medium text-accent-foreground">{dailyTip.title}</p>
                  <p className="text-xs text-accent-foreground/70 mt-1 line-clamp-2">{dailyTip.description}</p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>


        {/* Together Card */}
        {user.mode === 'together' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.4 }}
            className="mt-5"
          >
            <Link to="/together" className="block p-5 rounded-2xl glass glass-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl animate-pulse-gentle">❤️</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Insieme a {user.partnerName || 'qualcuno di speciale'}
                    </p>
                    <p className="text-xs text-muted-foreground">Tocca per inviare supporto</p>
                  </div>
                </div>
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
