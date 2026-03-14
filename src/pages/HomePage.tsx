import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import HabitCard from '../components/HabitCard';
import ProgressRing from '../components/ProgressRing';
import BottomNav from '../components/BottomNav';
import { getDailyTip } from '../data/foodTips';
import { Link } from 'react-router-dom';

const encouragements = [
  'Un passo alla volta, con la gentilezza che meriti.',
  'Oggi basta un piccolo passo.',
  'Non serve perfezione, serve continuità.',
  'Hai già fatto tanto, continua con calma.',
  'Ogni giorno è un\'opportunità, non un obbligo.',
];

const HomePage = () => {
  const { user, weeklyHabits, toggleHabit, todayCheckedIn, badges, currentStreak, getStreakMilestone } = useAppStore();
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
    <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto">
      <div className="px-6 pt-10">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h1 className="font-display text-3xl font-semibold text-foreground">
            {greeting()}, {user.name || 'cara'} ☀️
          </h1>
          <p className="text-muted-foreground mt-2 text-base italic font-display">
            "{todayMessage}"
          </p>
        </motion.div>

        {/* Progress Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex justify-center my-8"
        >
          <ProgressRing progress={progress} />
        </motion.div>

        {/* Weekly Habits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display text-lg font-medium text-foreground mb-4">
            I tuoi 3 passi di questa settimana
          </h2>
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
            <div className="p-5 rounded-[24px] bg-accent border border-transparent text-center">
              <p className="text-accent-foreground font-medium">
                ✨ Hai già fatto il check-in di oggi. Brava!
              </p>
            </div>
          ) : (
            <motion.a
              href="/checkin"
              whileTap={{ scale: 0.98 }}
              className="block p-5 rounded-[24px] bg-secondary text-secondary-foreground text-center shadow-soft"
            >
              <p className="btn-text text-sm">FAI IL CHECK-IN DI OGGI</p>
              <p className="text-sm mt-1 opacity-80">Meno di 1 minuto ⏱️</p>
            </motion.a>
          )}
        </motion.div>

        {/* Daily Food Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-6"
        >
          <Link to="/nutrition" className="block p-5 rounded-[24px] bg-card border border-border shadow-card hover:shadow-soft transition-shadow duration-300">
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
            className="mt-6 p-6 rounded-[32px] bg-card border border-border shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-medium text-foreground">
                Insieme a {user.partnerName || 'qualcuno di speciale'}
              </h3>
              <span className="animate-pulse-gentle text-secondary text-xl">❤️</span>
            </div>
            {badges.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {badges.slice(-3).map((badge, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium"
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
