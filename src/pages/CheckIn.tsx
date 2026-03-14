import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import BottomNav from '../components/BottomNav';

const moods = [
  { label: 'Serena', icon: '😊', value: 5 },
  { label: 'Calma', icon: '😌', value: 4 },
  { label: 'Così così', icon: '😐', value: 3 },
  { label: 'Stanca', icon: '😔', value: 2 },
  { label: 'Difficile', icon: '😢', value: 1 },
];

const energyLevels = [
  { label: 'Alta', icon: '⚡', value: 5 },
  { label: 'Buona', icon: '✨', value: 4 },
  { label: 'Nella media', icon: '➡️', value: 3 },
  { label: 'Bassa', icon: '🔋', value: 2 },
  { label: 'Molto bassa', icon: '😴', value: 1 },
];

const bloatingLevels = [
  { label: 'Nessuno', icon: '🌿', value: 1 },
  { label: 'Leggero', icon: '🫧', value: 2 },
  { label: 'Moderato', icon: '💨', value: 3 },
  { label: 'Forte', icon: '😣', value: 4 },
];

const CheckIn = () => {
  const [phase, setPhase] = useState(0);
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [bloating, setBloating] = useState(0);
  const { weeklyHabits, toggleHabit, addCheckIn, currentStreak } = useAppStore();
  const navigate = useNavigate();

  const handleComplete = () => {
    addCheckIn({
      date: new Date().toISOString(),
      mood,
      energy,
      bloating,
      habitsCompleted: weeklyHabits.filter((h) => h.completed).map((h) => h.id),
    });
    setPhase(4);
  };

  const phases = [
    {
      title: 'Come ti senti oggi?',
      options: moods,
      onSelect: (v: number) => { setMood(v); setPhase(1); },
    },
    {
      title: 'Com\'è la tua energia?',
      options: energyLevels,
      onSelect: (v: number) => { setEnergy(v); setPhase(2); },
    },
    {
      title: 'Hai avuto gonfiore?',
      options: bloatingLevels,
      onSelect: (v: number) => { setBloating(v); setPhase(3); },
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-10">
      <AnimatePresence mode="wait">
        {phase < 3 ? (
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h1 className="font-display text-2xl text-foreground mb-8">
              {phases[phase].title}
            </h1>
            <div className="flex flex-col gap-3">
              {phases[phase].options.map((opt, i) => (
                <motion.button
                  key={opt.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => phases[phase].onSelect(opt.value)}
                  className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl glass glass-border 
                    text-left transition-all duration-300
                    hover:border-primary/30 active:bg-accent"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-base font-medium text-foreground">{opt.label}</span>
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2 justify-center mt-8">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= phase ? 'w-6 gradient-primary' : 'w-1.5 bg-muted'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        ) : phase === 3 ? (
          <motion.div
            key="habits"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h1 className="font-display text-2xl text-foreground mb-3">
              Le tue abitudini di oggi
            </h1>
            <p className="text-muted-foreground mb-8 text-sm">Tocca per segnare quelle completate</p>
            <div className="flex flex-col gap-3">
              {weeklyHabits.map((habit, i) => (
                <motion.button
                  key={habit.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl 
                    border transition-all duration-500
                    ${habit.completed 
                      ? 'glass glass-border border-primary/20' 
                      : 'glass glass-border'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{habit.icon}</span>
                    <span className={`text-sm font-medium text-foreground ${habit.completed ? 'line-through opacity-50' : ''}`}>
                      {habit.title}
                    </span>
                  </div>
                  <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all
                    ${habit.completed ? 'gradient-primary border-transparent' : 'border-muted-foreground/20'}`}>
                    {habit.completed && <span className="text-primary-foreground text-xs">✓</span>}
                  </div>
                </motion.button>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="w-full mt-8 py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm shadow-glow"
            >
              COMPLETA IL CHECK-IN
            </motion.button>
            <div className="flex gap-2 justify-center mt-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-1.5 rounded-full gradient-primary" />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex-1 flex flex-col items-center justify-center text-center pt-20"
          >
            <motion.span 
              className="text-6xl mb-6"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🌿
            </motion.span>
            <h1 className="font-display text-2xl text-foreground mb-3">
              Hai fatto quello che potevi oggi.
            </h1>
            <p className="font-display text-lg text-muted-foreground italic mb-6">
              È abbastanza.
            </p>

            {currentStreak > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mb-8 px-6 py-4 rounded-2xl bg-accent glass-border"
              >
                <p className="text-accent-foreground font-medium text-lg">
                  🔥 {currentStreak} {currentStreak === 1 ? 'giorno' : 'giorni'} di fila!
                </p>
                {currentStreak === 3 && <p className="text-sm text-primary mt-1">Stai creando un'abitudine 🌱</p>}
                {currentStreak === 7 && <p className="text-sm text-primary mt-1">Una settimana intera! Sei fantastica ✨</p>}
                {currentStreak === 14 && <p className="text-sm text-primary mt-1">Due settimane di costanza. Che forza! 💪</p>}
                {currentStreak === 21 && <p className="text-sm text-primary mt-1">21 giorni: è ufficialmente un'abitudine! 🦋</p>}
                {currentStreak === 30 && <p className="text-sm text-primary mt-1">Un mese intero. Incredibile! 🌟</p>}
              </motion.div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/home')}
              className="px-8 py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm shadow-glow"
            >
              TORNA ALLA HOME
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
};

export default CheckIn;
