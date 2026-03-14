import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import BottomNav from '@/components/BottomNav';
import AppHeader from '@/components/AppHeader';

const bloatingOptions = [
  { label: 'Nessuno', icon: '🌿', value: 1 },
  { label: 'Leggero', icon: '🫧', value: 2 },
  { label: 'Moderato', icon: '💨', value: 3 },
  { label: 'Forte', icon: '😣', value: 4 },
  { label: 'Molto forte', icon: '😫', value: 5 },
];

const energyOptions = [
  { label: 'Molto alta', icon: '🔥', value: 5 },
  { label: 'Buona', icon: '⚡', value: 4 },
  { label: 'Nella media', icon: '➡️', value: 3 },
  { label: 'Bassa', icon: '🔋', value: 2 },
  { label: 'Molto bassa', icon: '😴', value: 1 },
];

const WeeklyCheckIn = () => {
  const [phase, setPhase] = useState(0);
  const [weight, setWeight] = useState('');
  const [bloating, setBloating] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const { user: authUser } = useAuth();
  const { weekNumber } = useAppStore();
  const navigate = useNavigate();

  const handleSave = async (finalEnergy: number) => {
    setSaving(true);
    setEnergy(finalEnergy);

    if (authUser) {
      const payload = {
        user_id: authUser.id,
        week_number: weekNumber,
        weight: weight ? parseFloat(weight) : null,
        bloating,
        energy: finalEnergy,
      };

      await supabase
        .from('weekly_checkins')
        .upsert(payload, { onConflict: 'user_id,week_number' });
    }

    setSaving(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-6">
        <AppHeader />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex flex-col items-center justify-center text-center pt-20"
        >
          <motion.span 
            className="text-6xl mb-6"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            📊
          </motion.span>
          <h1 className="font-display text-2xl text-foreground mb-3">
            Check-in settimanale salvato!
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Vai ai risultati per vedere come stai andando.
          </p>
          <div className="flex flex-col gap-3 w-full">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/progress')}
              className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm shadow-glow"
            >
              VEDI I RISULTATI
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/home')}
              className="w-full py-4 rounded-2xl glass glass-border text-foreground btn-text text-sm"
            >
              TORNA ALLA HOME
            </motion.button>
          </div>
        </motion.div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-10">
      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.div
            key="weight"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h1 className="font-display text-2xl text-foreground mb-2">
              Riepilogo settimana {weekNumber}
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Come è andata questa settimana? 
            </p>

            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Peso (opzionale)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Es: 65.5"
                  className="flex-1 px-6 py-4 rounded-xl bg-muted border border-border text-foreground text-lg
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                    transition-all duration-300 placeholder:text-muted-foreground/50"
                />
                <span className="text-muted-foreground font-medium">kg</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Non è obbligatorio. Pesati sempre alla stessa ora per dati più precisi.
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setPhase(1)}
              className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm shadow-glow"
            >
              {weight ? 'CONTINUA' : 'SALTA E CONTINUA'}
            </motion.button>
          </motion.div>
        )}

        {phase === 1 && (
          <motion.div
            key="bloating"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h1 className="font-display text-2xl text-foreground mb-2">
              Gonfiore questa settimana
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              In generale, come ti sei sentita?
            </p>
            <div className="flex flex-col gap-3">
              {bloatingOptions.map((opt, i) => (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setBloating(opt.value); setPhase(2); }}
                  className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl glass glass-border 
                    text-left transition-all duration-300
                    hover:border-primary/30 active:bg-accent"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-base font-medium text-foreground">{opt.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div
            key="energy"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <h1 className="font-display text-2xl text-foreground mb-2">
              Energia media questa settimana
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Come ti sei sentita in generale?
            </p>
            <div className="flex flex-col gap-3">
              {energyOptions.map((opt, i) => (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setEnergy(opt.value); handleSave(opt.value); }}
                  className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl glass glass-border 
                    text-left transition-all duration-300
                    hover:border-primary/30 active:bg-accent"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-base font-medium text-foreground">{opt.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      {!done && (
        <div className="flex gap-2 justify-center mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= phase ? 'w-6 gradient-primary' : 'w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default WeeklyCheckIn;
