import { useState, useEffect } from 'react';
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
  { label: 'Affamata', icon: '🍽️', value: 2 },
  { label: 'Assonnata', icon: '😴', value: 2 },
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

const stressLevels = [
  { label: 'Molto rilassata', icon: '🧘', value: 1 },
  { label: 'Tranquilla', icon: '😌', value: 2 },
  { label: 'Un po\' stressata', icon: '😤', value: 3 },
  { label: 'Molto stressata', icon: '🤯', value: 4 },
];

const sleepOptions = [
  { label: 'Meno di 5 ore', icon: '😵', value: 4 },
  { label: '5-6 ore', icon: '😪', value: 5.5 },
  { label: '6-7 ore', icon: '🙂', value: 6.5 },
  { label: '7-8 ore', icon: '😊', value: 7.5 },
  { label: 'Più di 8 ore', icon: '😴', value: 9 },
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

const TOTAL_PHASES = 6; // mood, energy, bloating, stress, sleep (morning only), food

const CheckIn = () => {
  const [phase, setPhase] = useState(0);
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [bloating, setBloating] = useState(0);
  const [stress, setStress] = useState(0);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [alreadyLoggedSleep, setAlreadyLoggedSleep] = useState(false);
  const [coachMessage, setCoachMessage] = useState<{ message: string; actionTips: string[]; tone: string } | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const { addCheckIn, currentStreak, user } = useAppStore();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const time = getTimeOfDay();
  const isMorning = new Date().getHours() < 12;

  // Check if sleep was already logged today
  useEffect(() => {
    if (!authUser) return;
    const checkSleep = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_checkins')
        .select('sleep_hours')
        .eq('user_id', authUser.id)
        .gte('created_at', `${today}T00:00:00`)
        .not('sleep_hours', 'is', null)
        .limit(1);
      if (data && data.length > 0) setAlreadyLoggedSleep(true);
    };
    checkSleep();
  }, [authUser]);

  const showSleepPhase = isMorning && !alreadyLoggedSleep;

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

  const fetchCoachMessage = async (m: number, e: number, s: number, sleep: number | null, b: number) => {
    setCoachLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { trigger: 'checkin_critical', mood: m, energy: e, stress: s, sleepHours: sleep, bloating: b },
      });
      if (!error && data?.message) setCoachMessage(data);
    } catch (err) {
      console.error('Coach message error:', err);
    } finally {
      setCoachLoading(false);
    }
  };

  const saveCheckIn = async (foods: string[]) => {
    setSaving(true);
    try {
      if (authUser) {
        const insertData: any = {
          user_id: authUser.id,
          mood,
          energy,
          bloating,
          foods_eaten: foods,
          stress,
        };
        if (sleepHours !== null) insertData.sleep_hours = sleepHours;

        const { error } = await supabase.from('daily_checkins').insert(insertData);
        if (error) console.error('Error saving check-in:', error);

        // Check if critical — trigger AI coach
        const isCritical = mood <= 2 || energy <= 2 || stress >= 3 || (sleepHours !== null && sleepHours < 6);
        if (isCritical) {
          fetchCoachMessage(mood, energy, stress, sleepHours, bloating);
        }
      }
      addCheckIn({
        date: new Date().toISOString(),
        mood,
        energy,
        bloating,
        habitsCompleted: [],
      });
      setPhase(99); // done
    } catch (e) {
      toast.error('Errore nel salvataggio');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Dynamic phases based on time of day
  const getPhaseConfig = () => {
    // Phase 0: mood, 1: energy, 2: bloating, 3: stress, 4: sleep (optional), 5: food
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
      {
        title: 'Quanto sei stressata?',
        subtitle: 'Lo stress influenza digestione e fame',
        options: stressLevels,
        onSelect: (v: number) => {
          setStress(v);
          setPhase(showSleepPhase ? 4 : 5);
        },
      },
    ];

    if (showSleepPhase) {
      phases.push({
        title: 'Come hai dormito?',
        subtitle: 'Il sonno influenza tutto il resto',
        options: sleepOptions,
        onSelect: (v: number) => { setSleepHours(v); setPhase(5); },
      });
    }

    return phases;
  };

  const phases = getPhaseConfig();
  const totalDots = phases.length + 1; // +1 for food phase
  const isFoodPhase = phase === 5;
  const isDone = phase === 99;
  const isOptionPhase = phase < phases.length;

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-6">
      <AppHeader />
      <AnimatePresence mode="wait">
        {isOptionPhase ? (
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
            <ProgressDots current={phase} total={totalDots} />
          </motion.div>

        ) : isFoodPhase ? (
          <FoodPhase
            planFoods={planFoods}
            selectedFoods={selectedFoods}
            toggleFood={toggleFood}
            saving={saving}
            onSkip={() => saveCheckIn([])}
            onComplete={() => saveCheckIn(selectedFoods)}
            totalDots={totalDots}
          />

        ) : isDone ? (
          <DonePhase
            currentStreak={currentStreak}
            coachMessage={coachMessage}
            coachLoading={coachLoading}
            onNewCheckIn={() => {
              setPhase(0);
              setMood(0);
              setEnergy(0);
              setBloating(0);
              setStress(0);
              setSleepHours(null);
              setSelectedFoods([]);
              setCoachMessage(null);
            }}
            onGoHome={() => navigate('/home')}
          />
        ) : null}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
};

/* Sub-components */

const ProgressDots = ({ current, total }: { current: number; total: number }) => (
  <div className="flex gap-2 justify-center mt-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          i <= current ? 'w-6 gradient-primary' : 'w-1.5 bg-muted'
        }`}
      />
    ))}
  </div>
);

const FoodPhase = ({
  planFoods,
  selectedFoods,
  toggleFood,
  saving,
  onSkip,
  onComplete,
  totalDots,
}: {
  planFoods: { label: string; icon: string }[];
  selectedFoods: string[];
  toggleFood: (f: string) => void;
  saving: boolean;
  onSkip: () => void;
  onComplete: () => void;
  totalDots: number;
}) => (
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
        onClick={onSkip}
        disabled={saving}
        className="flex-1 py-4 rounded-2xl glass glass-border text-muted-foreground btn-text text-sm disabled:opacity-50"
      >
        SALTA
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onComplete}
        disabled={saving}
        className="flex-1 py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm shadow-glow disabled:opacity-50"
      >
        {saving ? 'SALVO...' : 'COMPLETA'}
      </motion.button>
    </div>

    <div className="flex gap-2 justify-center mt-6">
      {Array.from({ length: totalDots }).map((_, i) => (
        <div key={i} className="w-6 h-1.5 rounded-full gradient-primary" />
      ))}
    </div>
  </motion.div>
);

const DonePhase = ({
  currentStreak,
  coachMessage,
  coachLoading,
  onNewCheckIn,
  onGoHome,
}: {
  currentStreak: number;
  coachMessage: { message: string; actionTips: string[]; tone: string } | null;
  coachLoading: boolean;
  onNewCheckIn: () => void;
  onGoHome: () => void;
}) => (
  <motion.div
    key="done"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    className="flex-1 flex flex-col items-center justify-center text-center pt-12"
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

    {/* AI Coach Message */}
    {(coachLoading || coachMessage) && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full mt-4 mb-4"
      >
        <div className={`p-5 rounded-2xl text-left ${
          coachMessage?.tone === 'comforting' ? 'bg-accent glass-border' :
          coachMessage?.tone === 'encouraging' ? 'bg-primary/5 border border-primary/10' :
          'bg-accent glass-border'
        }`}>
          {coachLoading ? (
            <motion.p
              className="text-sm text-muted-foreground italic"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Sto pensando a come aiutarti...
            </motion.p>
          ) : coachMessage && (
            <>
              <p className="text-[10px] btn-text text-primary mb-2">💛 IL TUO COACH</p>
              <p className="text-sm text-foreground leading-relaxed mb-3">{coachMessage.message}</p>
              {coachMessage.actionTips && coachMessage.actionTips.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] btn-text text-muted-foreground">PROVA ADESSO:</p>
                  {coachMessage.actionTips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                      <span className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] flex-shrink-0">
                        {i + 1}
                      </span>
                      {tip}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    )}

    {!coachMessage && (
      <p className="text-sm text-muted-foreground mb-6">
        Puoi fare un altro check-in più tardi per tenere traccia dei cambiamenti.
      </p>
    )}

    {currentStreak > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-6 px-6 py-4 rounded-2xl bg-accent glass-border"
      >
        <p className="text-accent-foreground font-medium text-lg">
          🔥 {currentStreak} {currentStreak === 1 ? 'giorno' : 'giorni'} di fila!
        </p>
      </motion.div>
    )}

    <div className="flex gap-3">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onNewCheckIn}
        className="px-6 py-4 rounded-2xl glass glass-border text-foreground btn-text text-sm"
      >
        NUOVO CHECK-IN
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onGoHome}
        className="px-6 py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm shadow-glow"
      >
        TORNA ALLA HOME
      </motion.button>
    </div>
  </motion.div>
);

export default CheckIn;
