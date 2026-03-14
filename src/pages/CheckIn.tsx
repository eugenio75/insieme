import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import { toast } from 'sonner';
import { getTodayPlan } from '@/data/mealPlans';

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

const commonFoods = [
  { label: 'Latticini', icon: '🧀' },
  { label: 'Pane/pasta', icon: '🍞' },
  { label: 'Verdure crude', icon: '🥗' },
  { label: 'Legumi', icon: '🫘' },
  { label: 'Frutta', icon: '🍎' },
  { label: 'Carne', icon: '🍗' },
  { label: 'Pesce', icon: '🐟' },
  { label: 'Uova', icon: '🥚' },
  { label: 'Dolci', icon: '🍰' },
  { label: 'Caffè', icon: '☕' },
  { label: 'Bevande gassate', icon: '🫧' },
  { label: 'Alcol', icon: '🍷' },
  { label: 'Cibi fritti', icon: '🍟' },
  { label: 'Riso', icon: '🍚' },
  { label: 'Yogurt', icon: '🥛' },
  { label: 'Cioccolato', icon: '🍫' },
];

const timeMessages = [
  { icon: '🌅', label: 'Mattina' },
  { icon: '☀️', label: 'Mezzogiorno' },
  { icon: '🌇', label: 'Pomeriggio' },
  { icon: '🌙', label: 'Sera' },
];

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return timeMessages[0];
  if (h < 14) return timeMessages[1];
  if (h < 18) return timeMessages[2];
  return timeMessages[3];
};

const CheckIn = () => {
  const [phase, setPhase] = useState(0);
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [bloating, setBloating] = useState(0);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { addCheckIn, currentStreak, user } = useAppStore();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const time = getTimeOfDay();

  // Get today's meal plan foods for quick selection
  const todayPlan = getTodayPlan(user.objective, user.activity, user.sex, user.age);
  const planFoods = todayPlan?.meals.map(m => ({
    label: m.title,
    icon: m.icon,
  })) || [];

  const toggleFood = (food: string) => {
    setSelectedFoods(prev =>
      prev.includes(food) ? prev.filter(f => f !== food) : [...prev, food]
    );
  };

  const saveCheckIn = async (foods: string[]) => {
    setSaving(true);
    try {
      if (authUser) {
        const { error } = await supabase.from('daily_checkins').insert({
          user_id: authUser.id,
          mood,
          energy,
          bloating,
          foods_eaten: foods,
        });
        if (error) console.error('Error saving check-in:', error);
      }
      addCheckIn({
        date: new Date().toISOString(),
        mood,
        energy,
        bloating,
        habitsCompleted: [],
      });
      setPhase(4); // done
    } catch (e) {
      toast.error('Errore nel salvataggio');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const phases = [
    {
      title: 'Come ti senti?',
      subtitle: `Check-in ${time.label.toLowerCase()} ${time.icon}`,
      options: moods,
      onSelect: (v: number) => { setMood(v); setPhase(1); },
    },
    {
      title: "Com'è la tua energia?",
      subtitle: 'Ascolta il tuo corpo',
      options: energyLevels,
      onSelect: (v: number) => { setEnergy(v); setPhase(2); },
    },
    {
      title: 'Hai avuto gonfiore?',
      subtitle: 'Non c\'è risposta sbagliata',
      options: bloatingLevels,
      onSelect: (v: number) => { setBloating(v); setPhase(3); },
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-6">
      <AppHeader />
      <AnimatePresence mode="wait">
        {phase < 3 ? (
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <p className="text-xs text-muted-foreground mb-1">{phases[phase].subtitle}</p>
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
                  disabled={saving}
                  className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl glass glass-border 
                    text-left transition-all duration-300
                    hover:border-primary/30 active:bg-accent disabled:opacity-50"
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
          /* Food tracking phase */
          <motion.div
            key="foods"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <p className="text-xs text-muted-foreground mb-1">Ci aiuta a capire cosa funziona per te</p>
            <h1 className="font-display text-2xl text-foreground mb-2">
              Cosa hai mangiato oggi?
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Tocca i cibi che hai consumato. Puoi saltare se preferisci.
            </p>

            {/* Plan foods */}
            {planFoods.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] text-muted-foreground/70 btn-text mb-2">📋 DAL TUO PIANO DI OGGI</p>
                <div className="flex flex-wrap gap-2">
                  {planFoods.map((food) => (
                    <button
                      key={food.label}
                      onClick={() => toggleFood(food.label)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200
                        ${selectedFoods.includes(food.label)
                          ? 'gradient-primary text-primary-foreground shadow-glow'
                          : 'glass glass-border text-foreground hover:border-primary/30'
                        }`}
                    >
                      <span>{food.icon}</span>
                      <span className="text-xs font-medium">{food.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Common foods grid */}
            <p className="text-[10px] text-muted-foreground/70 btn-text mb-2">🍽️ CIBI COMUNI</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {commonFoods.map((food) => (
                <button
                  key={food.label}
                  onClick={() => toggleFood(food.label)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-200
                    ${selectedFoods.includes(food.label)
                      ? 'gradient-primary text-primary-foreground shadow-glow'
                      : 'glass glass-border text-foreground hover:border-primary/30'
                    }`}
                >
                  <span>{food.icon}</span>
                  <span className="text-xs font-medium">{food.label}</span>
                </button>
              ))}
            </div>

            {selectedFoods.length > 0 && (
              <p className="text-xs text-primary mb-4">
                {selectedFoods.length} {selectedFoods.length === 1 ? 'cibo selezionato' : 'cibi selezionati'}
              </p>
            )}

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => saveCheckIn([])}
                disabled={saving}
                className="flex-1 py-4 rounded-2xl glass glass-border text-muted-foreground btn-text text-sm disabled:opacity-50"
              >
                SALTA
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => saveCheckIn(selectedFoods)}
                disabled={saving}
                className="flex-1 py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm shadow-glow disabled:opacity-50"
              >
                {saving ? 'SALVO...' : 'COMPLETA'}
              </motion.button>
            </div>

            <div className="flex gap-2 justify-center mt-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-1.5 rounded-full gradient-primary" />
              ))}
            </div>
          </motion.div>

        ) : (
          /* Done phase */
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
              Check-in registrato ✨
            </h1>
            <p className="font-display text-base text-muted-foreground italic mb-2">
              Grazie per aver ascoltato il tuo corpo.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Puoi fare un altro check-in più tardi per tenere traccia dei cambiamenti.
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
              </motion.div>
            )}

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => { setPhase(0); setMood(0); setEnergy(0); setBloating(0); setSelectedFoods([]); }}
                className="px-6 py-4 rounded-2xl glass glass-border text-foreground btn-text text-sm"
              >
                NUOVO CHECK-IN
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/home')}
                className="px-6 py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm shadow-glow"
              >
                TORNA ALLA HOME
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
};

export default CheckIn;
