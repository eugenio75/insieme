import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';

const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const WeekPage = () => {
  const { weeklyHabits, checkIns } = useAppStore();
  const completedCount = weeklyHabits.filter((h) => h.completed).length;

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <h1 className="font-display text-2xl text-foreground mb-2">
          La tua settimana
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Ancora {7 - checkIns.length} opportunità questa settimana
        </p>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-2 mb-10">
          {days.map((day, i) => {
            const hasCheckIn = i < checkIns.length;
            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-xs text-muted-foreground font-semibold">{day}</span>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    hasCheckIn
                      ? 'gradient-primary shadow-glow'
                      : i === checkIns.length
                      ? 'gradient-warm'
                      : 'bg-muted'
                  }`}
                >
                  {hasCheckIn && <span className="text-primary-foreground text-xs">✓</span>}
                  {i === checkIns.length && <span className="text-secondary-foreground text-xs">•</span>}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Habits summary */}
        <h2 className="font-display text-lg text-foreground mb-4">
          Abitudini della settimana
        </h2>
        <div className="space-y-3">
          {weeklyHabits.map((habit) => (
            <div
              key={habit.id}
              className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-500
                ${habit.completed ? 'glass glass-border border-primary/20' : 'glass glass-border'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                habit.completed ? 'bg-primary/20' : 'bg-muted'
              }`}>
                <span className="text-xl">{habit.icon}</span>
              </div>
              <span className={`text-sm font-medium text-foreground flex-1 ${habit.completed ? 'line-through opacity-50' : ''}`}>
                {habit.title}
              </span>
              <span className={`text-xs font-medium ${habit.completed ? 'text-primary' : 'text-muted-foreground'}`}>
                {habit.completed ? 'Fatto' : 'In corso'}
              </span>
            </div>
          ))}
        </div>

        {/* Weekly insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 rounded-2xl glass glass-border"
        >
          <h3 className="font-display text-base text-foreground mb-2">
            💡 Suggerimento della settimana
          </h3>
          <p className="text-muted-foreground text-sm">
            Hai completato {completedCount} su {weeklyHabits.length} abitudini. 
            {completedCount === weeklyHabits.length
              ? ' Fantastico! Hai seminato bene questa settimana.'
              : ' Ogni piccolo passo conta. Continua con calma.'}
          </p>
        </motion.div>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default WeekPage;
