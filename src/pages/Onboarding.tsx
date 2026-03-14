import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const steps = [
  {
    question: 'Qual è il tuo obiettivo principale?',
    key: 'objective',
    multiSelect: false,
    options: [
      { label: 'Sentirmi più leggera', icon: '🌿' },
      { label: 'Avere più energia', icon: '⚡' },
      { label: 'Ridurre il gonfiore', icon: '🫧' },
      { label: 'Essere più costante', icon: '🎯' },
      { label: 'Stare meglio nel mio corpo', icon: '💛' },
    ],
  },
  {
    question: 'Vuoi fare questo percorso da sola o con qualcuno?',
    key: 'mode',
    multiSelect: false,
    options: [
      { label: 'Da sola', icon: '🧘‍♀️', value: 'solo' },
      { label: 'Con un partner o una persona di supporto', icon: '🤝', value: 'together' },
    ],
  },
  {
    question: 'Che tipo di percorso preferisci?',
    key: 'pace',
    multiSelect: false,
    options: [
      { label: 'Molto gentile', icon: '🌸' },
      { label: 'Equilibrato', icon: '⚖️' },
      { label: 'Un po\' più strutturato', icon: '📋' },
    ],
  },
  {
    question: 'Quanto ti muovi durante il giorno?',
    key: 'activity',
    multiSelect: false,
    options: [
      { label: 'Poco', icon: '🛋️' },
      { label: 'Moderatamente', icon: '🚶‍♀️' },
      { label: 'Abbastanza', icon: '🏃‍♀️' },
    ],
  },
  {
    question: 'Qual è la difficoltà più grande per te?',
    key: 'difficulty',
    multiSelect: false,
    options: [
      { label: 'Fame nervosa', icon: '😰' },
      { label: 'Voglia di dolci', icon: '🍫' },
      { label: 'Mancanza di tempo', icon: '⏰' },
      { label: 'Stress', icon: '😮‍💨' },
      { label: 'Non riesco ad essere costante', icon: '🔄' },
    ],
  },
  {
    question: 'Hai intolleranze o sensibilità alimentari?',
    subtitle: 'Puoi selezionarne più di una. Questo ci aiuta a personalizzare i consigli.',
    key: 'intolerances',
    multiSelect: true,
    options: [
      { label: 'Lattosio', icon: '🥛' },
      { label: 'Glutine', icon: '🌾' },
      { label: 'Nichel', icon: '🔩' },
      { label: 'Fruttosio', icon: '🍎' },
      { label: 'Nessuna', icon: '✅' },
    ],
  },
];

const slideVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
};

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [showName, setShowName] = useState(true);
  const [selectedIntolerances, setSelectedIntolerances] = useState<string[]>([]);
  const { setUser, completeOnboarding } = useAppStore();
  const navigate = useNavigate();

  const handleNameSubmit = () => {
    if (name.trim()) {
      setUser({ name: name.trim() });
      setShowName(false);
    }
  };

  const handleSelect = (value: string) => {
    const currentStep = steps[step];

    if (currentStep.multiSelect) {
      // For multi-select (intolerances), toggle selection
      if (value === 'Nessuna') {
        setSelectedIntolerances(['Nessuna']);
      } else {
        setSelectedIntolerances((prev) => {
          const without = prev.filter((v) => v !== 'Nessuna');
          return without.includes(value)
            ? without.filter((v) => v !== value)
            : [...without, value];
        });
      }
      return;
    }

    const option = currentStep.options.find((o) => o.label === value);
    const val = (option as any)?.value || value;
    setUser({ [currentStep.key]: val });

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      navigate('/home');
    }
  };

  const handleMultiSelectConfirm = () => {
    const intolerances = selectedIntolerances.includes('Nessuna') ? [] : selectedIntolerances;
    setUser({ intolerances });

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      navigate('/home');
    }
  };

  const progress = showName ? 0 : ((step + 1) / (steps.length + 1)) * 100;
  const currentStep = steps[step];
  const isMultiSelect = currentStep?.multiSelect;

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-12">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </div>

      <AnimatePresence mode="wait">
        {showName ? (
          <motion.div
            key="name"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex-1 flex flex-col"
          >
            <h1 className="font-display text-3xl font-semibold text-foreground mb-3">
              Ciao! 👋
            </h1>
            <p className="text-muted-foreground text-lg mb-10">
              Come ti chiami?
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              placeholder="Il tuo nome..."
              className="w-full px-6 py-4 rounded-2xl bg-card border border-border text-foreground text-lg
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                transition-all duration-300 placeholder:text-muted-foreground/50"
              autoFocus
            />
            <div className="mt-auto pt-8">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleNameSubmit}
                disabled={!name.trim()}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground btn-text text-sm
                  disabled:opacity-40 transition-opacity duration-300 shadow-soft"
              >
                CONTINUA
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex-1 flex flex-col"
          >
            <h1 className="font-display text-2xl font-semibold text-foreground mb-2 leading-tight">
              {currentStep.question}
            </h1>
            {currentStep.subtitle && (
              <p className="text-muted-foreground text-sm mb-6">{currentStep.subtitle}</p>
            )}
            {!currentStep.subtitle && <div className="mb-6" />}
            <div className="flex flex-col gap-3">
              {currentStep.options.map((option, i) => {
                const isSelected = isMultiSelect && selectedIntolerances.includes(option.label);
                return (
                  <motion.button
                    key={option.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelect(option.label)}
                    className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] 
                      border text-left transition-all duration-300
                      ${isSelected 
                        ? 'bg-accent border-primary/40 shadow-card' 
                        : 'bg-card border-border hover:border-primary/30 hover:shadow-card active:bg-accent'
                      }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-base text-foreground font-medium flex-1">{option.label}</span>
                    {isMultiSelect && (
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                        ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                        {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {isMultiSelect && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMultiSelectConfirm}
                disabled={selectedIntolerances.length === 0}
                className="w-full mt-6 py-4 rounded-2xl bg-primary text-primary-foreground btn-text text-sm
                  disabled:opacity-40 transition-opacity duration-300 shadow-soft"
              >
                CONTINUA
              </motion.button>
            )}

            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="mt-4 text-muted-foreground text-sm btn-text self-center"
              >
                INDIETRO
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
