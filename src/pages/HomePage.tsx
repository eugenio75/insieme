import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import HabitCard from '../components/HabitCard';
import ProgressRing from '../components/ProgressRing';
import BottomNav from '../components/BottomNav';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const fallbackMessages = [
  'Un passo alla volta, con la gentilezza che meriti. 🌿',
  'Oggi basta un piccolo passo. Sei già abbastanza.',
  'Non serve perfezione, serve continuità.',
  'Ogni giorno è un\'opportunità, non un obbligo.',
  'Hai già fatto tanto, continua con calma 💛',
];

const HomePage = () => {
  const { user, weeklyHabits, toggleHabit, currentStreak, getStreakMilestone, weekLabel, weekNumber, totalWeeks } = useAppStore();
  const { user: authUser } = useAuth();
  const completedCount = weeklyHabits.filter((h) => h.completed).length;
  const progress = completedCount / weeklyHabits.length;
  const milestone = getStreakMilestone();

  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(true);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  // Fetch AI motivational message
  useEffect(() => {
    const fetchMessage = async () => {
      if (!authUser) {
        setLoadingMessage(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('motivational-message');
        if (error) throw error;
        if (data?.message) {
          setAiMessage(data.message);
        }
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
          <motion.p
            className="text-muted-foreground mt-2 text-sm italic font-display min-h-[2.5rem]"
            animate={{ opacity: loadingMessage ? 0.5 : 1 }}
          >
            {loadingMessage ? '✨ Sto pensando a qualcosa per te...' : `"${displayMessage}"`}
          </motion.p>
        </motion.div>

        {/* Progress Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex justify-center my-10"
        >
          <ProgressRing progress={progress} />
        </motion.div>

        {/* Streak Counter */}
        {currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mb-8 p-4 rounded-2xl glass glass-border flex items-center gap-4"
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
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-lg text-foreground">
              I tuoi 3 passi
            </h2>
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
          <Link to="/checkin">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="p-5 rounded-2xl gradient-warm text-center shadow-soft"
            >
              <p className="btn-text text-sm text-secondary-foreground">COME TI SENTI ORA?</p>
              <p className="text-sm mt-1 text-secondary-foreground/70">3 domande veloci ⏱️</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Weekly Check-in Prompt */}
        {(new Date().getDay() === 0 || new Date().getDay() === 6) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.4 }}
            className="mt-5"
          >
            <Link
              to="/weekly-checkin"
              className="block p-5 rounded-2xl glass glass-border border-primary/10 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Check-in settimanale</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Com'è andata questa settimana? Peso, energia, gonfiore.
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Together Card */}
        {user.mode === 'together' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.4 }}
            className="mt-5 p-5 rounded-2xl glass glass-border"
          >
            <Link to="/together" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl animate-pulse-gentle">❤️</span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Insieme a {user.partnerName || 'qualcuno di speciale'}
                  </p>
                  <p className="text-xs text-muted-foreground">Tocca per inviare supporto</p>
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
