import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import HabitCard from '../components/HabitCard';
import ProgressRing from '../components/ProgressRing';
import BottomNav from '../components/BottomNav';
import { getDailyTip } from '../data/foodTips';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';

const encouragements = [
  'Un passo alla volta, con la gentilezza che meriti.',
  'Oggi basta un piccolo passo.',
  'Non serve perfezione, serve continuità.',
  'Hai già fatto tanto, continua con calma.',
  'Ogni giorno è un\'opportunità, non un obbligo.',
];

const HomePage = () => {
  const { user, weeklyHabits, toggleHabit, todayCheckedIn, badges, currentStreak, getStreakMilestone, weekLabel, weekNumber, totalWeeks } = useAppStore();
  const completedCount = weeklyHabits.filter((h) => h.completed).length;
  const progress = completedCount / weeklyHabits.length;
  const milestone = getStreakMilestone();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  const todayMessage = encouragements[new Date().getDay() % encouragements.length];
  const dailyTip = getDailyTip(user.objective, user.difficulty, user.intolerances);

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
          <p className="text-muted-foreground mt-2 text-sm italic font-display">
            "{todayMessage}"
          </p>
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

        {/* Check-in Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-8"
        >
          {todayCheckedIn ? (
            <div className="p-5 rounded-2xl bg-accent glass-border text-center">
              <p className="text-accent-foreground font-medium text-sm">
                ✨ Hai già fatto il check-in di oggi. Brava!
              </p>
            </div>
          ) : (
            <motion.a
              href="/checkin"
              whileTap={{ scale: 0.98 }}
              className="block p-5 rounded-2xl gradient-warm text-center shadow-soft"
            >
              <p className="btn-text text-sm text-secondary-foreground">FAI IL CHECK-IN DI OGGI</p>
              <p className="text-sm mt-1 text-secondary-foreground/70">Meno di 1 minuto ⏱️</p>
            </motion.a>
          )}
        </motion.div>

        {/* Weekly Check-in Prompt */}
        {new Date().getDay() === 0 || new Date().getDay() === 6 ? (
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
        ) : null}

        {/* Daily Food Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-5"
        >
          <Link to="/nutrition" className="block p-5 rounded-2xl glass glass-border hover:border-primary/20 transition-all duration-300">
            <p className="text-[10px] text-muted-foreground btn-text mb-2">💡 CONSIGLIO DEL GIORNO</p>
            <div className="flex items-start gap-3">
              <span className="text-xl">{dailyTip.icon}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{dailyTip.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{dailyTip.description}</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Together Card */}
        {user.mode === 'together' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="mt-5 p-6 rounded-2xl glass glass-border"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base text-foreground">
                Insieme a {user.partnerName || 'qualcuno di speciale'}
              </h3>
              <span className="animate-pulse-gentle text-secondary text-xl">❤️</span>
            </div>
            {badges.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {badges.slice(-3).map((badge, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-medium"
                  >
                    {badge.type}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;
