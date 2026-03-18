import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Plus, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

const steps = [
  {
    question: 'Come ti identifichi?',
    subtitle: 'Ci aiuta a personalizzare il piano alimentare.',
    key: 'sex',
    multiSelect: false,
    options: [
      { label: 'Donna', icon: '👩' },
      { label: 'Uomo', icon: '👨' },
      { label: 'Preferisco non dirlo', icon: '🤍' },
    ],
  },
  {
    question: 'Quali sono i tuoi obiettivi?',
    subtitle: 'Puoi sceglierne più di uno.',
    key: 'objective',
    multiSelect: true,
    options: [
      { label: 'Sentirmi più leggera', icon: '🌿' },
      { label: 'Avere più energia', icon: '⚡' },
      { label: 'Perdere peso', icon: '⚖️' },
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
    question: 'Quanti anni hai?',
    subtitle: 'Ci aiuta ad adattare i consigli alle tue esigenze.',
    key: 'age',
    multiSelect: false,
    isAgeInput: true,
    options: [],
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
    question: 'Che tipo di lavoro fai?',
    subtitle: 'Ci aiuta a calibrare il piano alimentare.',
    key: 'workType',
    multiSelect: false,
    options: [
      { label: 'Sedentario (ufficio, smart working)', icon: '💻' },
      { label: 'In piedi (negozio, ospedale, scuola)', icon: '🧑‍⚕️' },
      { label: 'Fisico (manuale, sport, cantiere)', icon: '🔨' },
      { label: 'Misto', icon: '🔄' },
    ],
  },
  {
    question: 'Qual è la difficoltà più grande per te?',
    subtitle: 'Puoi sceglierne più di una, ci aiuta a tarare obiettivi e dieta.',
    key: 'difficulty',
    multiSelect: true,
    options: [
      { label: 'Fame nervosa', icon: '😰' },
      { label: 'Voglia di dolci', icon: '🍫' },
      { label: 'Mancanza di tempo', icon: '⏰' },
      { label: 'Stress', icon: '😮‍💨' },
      { label: 'Non riesco ad essere costante', icon: '🔄' },
    ],
  },
  {
    question: 'Quanto sei alta/o?',
    subtitle: 'Ci aiuta a calcolare il tuo indice di massa corporea.',
    key: 'height',
    multiSelect: false,
    isHeightInput: true,
    options: [],
  },
  {
    question: 'Qual è il tuo peso attuale?',
    subtitle: 'Opzionale. Ci aiuta a monitorare i tuoi progressi.',
    key: 'weight',
    multiSelect: false,
    isWeightInput: true,
    options: [],
  },
  {
    question: 'Hai intolleranze o sensibilità alimentari?',
    subtitle: 'Puoi selezionarne più di una. Aggiungi le tue se non le trovi in lista.',
    key: 'intolerances',
    multiSelect: true,
    hasCustomInput: true,
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
  const [multiSelections, setMultiSelections] = useState<Record<string, string[]>>({});
  const [customIntolerances, setCustomIntolerances] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const { setUser, completeOnboarding } = useAppStore();
  const { saveProfile } = useProfile();
  const navigate = useNavigate();

  const getSelections = (key: string) => multiSelections[key] || [];
  const setSelections = (key: string, values: string[]) =>
    setMultiSelections((prev) => ({ ...prev, [key]: values }));

  const handleNameSubmit = () => {
    if (name.trim()) {
      setUser({ name: name.trim() });
      setShowName(false);
    }
  };

  const handleAddCustomIntolerance = () => {
    const trimmed = customInput.trim();
    const selected = getSelections('intolerances');
    if (trimmed && !customIntolerances.includes(trimmed) && !selected.includes(trimmed)) {
      setCustomIntolerances((prev) => [...prev, trimmed]);
      setSelections('intolerances', [...selected.filter((v) => v !== 'Nessuna'), trimmed]);
      setCustomInput('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveCustomIntolerance = (intolerance: string) => {
    setCustomIntolerances((prev) => prev.filter((i) => i !== intolerance));
    setSelections('intolerances', getSelections('intolerances').filter((i) => i !== intolerance));
  };

  const handleSelect = async (value: string) => {
    const currentStep = steps[step];

    if (currentStep.multiSelect) {
      const key = currentStep.key;
      const selected = getSelections(key);
      if (value === 'Nessuna') {
        setSelections(key, ['Nessuna']);
        if (key === 'intolerances') setCustomIntolerances([]);
      } else {
        const without = selected.filter((v) => v !== 'Nessuna');
        setSelections(
          key,
          without.includes(value)
            ? without.filter((v) => v !== value)
            : [...without, value]
        );
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
      await saveProfile();
      navigate('/home');
    }
  };

  const handleMultiSelectConfirm = async () => {
    const currentStep = steps[step];
    const key = currentStep.key;
    const selected = getSelections(key);

    if (key === 'intolerances') {
      const standardIntolerances = selected.includes('Nessuna')
        ? []
        : selected.filter((i) => !customIntolerances.includes(i));
      const customs = selected.includes('Nessuna') ? [] : customIntolerances;
      setUser({ intolerances: standardIntolerances, customIntolerances: customs });
      // Also ensure custom intolerances are in selections for the check
      if (standardIntolerances.length === 0 && customs.length === 0 && selected.length === 0) return;
    } else if (key === 'objective') {
      setUser({ objective: selected.join(', ') });
    } else if (key === 'difficulty') {
      setUser({ difficulty: selected.join(', ') });
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      await saveProfile();
      navigate('/home');
    }
  };

  const progress = showName ? 0 : ((step + 1) / (steps.length + 1)) * 100;
  const currentStep = steps[step];
  const isMultiSelect = currentStep?.multiSelect;
  const hasCustomInput = (currentStep as any)?.hasCustomInput;
  const isWeightInput = (currentStep as any)?.isWeightInput;
  const isHeightInput = (currentStep as any)?.isHeightInput;
  const isAgeInput = (currentStep as any)?.isAgeInput;

  const handleAgeSubmit = async () => {
    if (!ageInput.trim()) return;
    setUser({ age: ageInput.trim() });
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      await saveProfile();
      navigate('/home');
    }
  };

  const handleHeightSubmit = async () => {
    if (!heightInput.trim()) return;
    setUser({ height: heightInput.trim() });
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      await saveProfile();
      navigate('/home');
    }
  };

  const handleWeightSubmit = async () => {
    setUser({ weight: weightInput || undefined });
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      await saveProfile();
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 max-w-lg mx-auto relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[100px]" />
      
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-12 relative z-10">
        <motion.div
          className="h-full gradient-primary rounded-full"
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
            className="flex-1 flex flex-col relative z-10"
          >
            <h1 className="font-display text-3xl text-foreground mb-3">
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
              className="w-full px-6 py-4 rounded-xl bg-muted border border-border text-foreground text-lg
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                transition-all duration-300 placeholder:text-muted-foreground/50"
              autoFocus
            />
            <div className="mt-auto pt-8">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleNameSubmit}
                disabled={!name.trim()}
                className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm
                  disabled:opacity-40 transition-opacity duration-300 shadow-glow"
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
            className="flex-1 flex flex-col relative z-10 overflow-y-auto min-h-0"
          >
            <h1 className="font-display text-2xl text-foreground mb-2 leading-tight">
              {currentStep.question}
            </h1>
            {currentStep.subtitle && (
              <p className="text-muted-foreground text-sm mb-6">{currentStep.subtitle}</p>
            )}
            {!currentStep.subtitle && <div className="mb-6" />}

            {isAgeInput ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={ageInput}
                    onChange={(e) => setAgeInput(e.target.value)}
                    placeholder="Es: 32"
                    className="flex-1 px-6 py-4 rounded-xl bg-muted border border-border text-foreground text-lg
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                      transition-all duration-300 placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                  <span className="text-muted-foreground font-medium text-lg">anni</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAgeSubmit}
                  disabled={!ageInput.trim()}
                  className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm
                    shadow-glow disabled:opacity-40 transition-opacity"
                >
                  CONTINUA
                </motion.button>
              </div>
            ) : isWeightInput ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="number"
                    step="0.1"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder="Es: 65.5"
                    className="flex-1 px-6 py-4 rounded-xl bg-muted border border-border text-foreground text-lg
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                      transition-all duration-300 placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                  <span className="text-muted-foreground font-medium text-lg">kg</span>
                </div>
                <p className="text-xs text-muted-foreground mb-8">
                  Non è obbligatorio. Puoi sempre modificarlo dal profilo.
                </p>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWeightSubmit}
                  className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm
                    shadow-glow"
                >
                  {weightInput ? 'CONTINUA' : 'SALTA E CONTINUA'}
                </motion.button>
              </div>
            ) : (
            <div className="flex flex-col gap-3">
              {currentStep.options.map((option, i) => {
                const isSelected = isMultiSelect && getSelections(currentStep.key).includes(option.label);
                return (
                  <motion.button
                    key={option.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelect(option.label)}
                    className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl 
                      border text-left transition-all duration-300
                      ${isSelected 
                        ? 'glass glass-border border-primary/30 shadow-glow' 
                        : 'glass glass-border hover:border-primary/20'
                      }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-base text-foreground font-medium flex-1">{option.label}</span>
                    {isMultiSelect && (
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300
                        ${isSelected ? 'gradient-primary border-transparent' : 'border-muted-foreground/20'}`}>
                        {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                      </div>
                    )}
                  </motion.button>
                );
              })}

              {/* Custom intolerances */}
              {hasCustomInput && (
                <>
                  {customIntolerances.map((ci) => {
                    const isSelected = getSelections('intolerances').includes(ci);
                    return (
                      <motion.div
                        key={ci}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl 
                          border transition-all duration-300
                          ${isSelected
                            ? 'glass glass-border border-primary/30'
                            : 'glass glass-border'
                          }`}
                      >
                        <span className="text-2xl">⚠️</span>
                        <button
                          onClick={() => handleSelect(ci)}
                          className="text-base text-foreground font-medium flex-1 text-left"
                        >
                          {ci}
                        </button>
                        <button
                          onClick={() => handleRemoveCustomIntolerance(ci)}
                          className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </motion.div>
                    );
                  })}

                  {showCustomInput ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomIntolerance()}
                        placeholder="Es: Soia, Uova, Pesce..."
                        className="flex-1 px-5 py-4 rounded-xl bg-muted border border-border text-foreground text-sm
                          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                          transition-all duration-300 placeholder:text-muted-foreground/50"
                        autoFocus
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddCustomIntolerance}
                        disabled={!customInput.trim()}
                        className="px-5 py-4 rounded-xl gradient-primary text-primary-foreground text-sm font-medium
                          disabled:opacity-40 transition-opacity"
                      >
                        Aggiungi
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowCustomInput(true)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl 
                        border border-dashed border-muted-foreground/20 text-muted-foreground
                        hover:border-primary/30 hover:text-foreground transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">Aggiungi altra sensibilità</span>
                    </motion.button>
                  )}
                </>
              )}
            </div>
            )}

            {isMultiSelect && (
              <div className="sticky bottom-0 pt-4 pb-2 bg-background/90 backdrop-blur-sm -mx-6 px-6 mt-auto">
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMultiSelectConfirm}
                  disabled={getSelections(currentStep.key).length === 0 && !(currentStep.key === 'intolerances' && customIntolerances.length > 0)}
                  className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm
                    disabled:opacity-40 transition-opacity duration-300 shadow-glow"
                >
                  CONTINUA
                </motion.button>
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="mt-3 w-full text-muted-foreground text-sm btn-text"
                  >
                    INDIETRO
                  </button>
                )}
              </div>
            )}

            {!isMultiSelect && step > 0 && (
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
