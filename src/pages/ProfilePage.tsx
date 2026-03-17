import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useProfile } from '@/hooks/useProfile';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import { useAuth } from '@/hooks/useAuth';
import { Plus, X, LogOut, ChevronRight } from 'lucide-react';
import FastingSettings from '@/components/FastingSettings';

const allIntolerances = ['Lattosio', 'Glutine', 'Nichel', 'Fruttosio'];

const objectiveOptions = [
  { label: 'Sentirmi più leggera', icon: '🌿' },
  { label: 'Avere più energia', icon: '⚡' },
  { label: 'Perdere peso', icon: '⚖️' },
  { label: 'Ridurre il gonfiore', icon: '🫧' },
  { label: 'Essere più costante', icon: '🎯' },
  { label: 'Stare meglio nel mio corpo', icon: '💛' },
];

const paceOptions = [
  { label: 'Molto gentile', icon: '🌸' },
  { label: 'Equilibrato', icon: '⚖️' },
  { label: 'Un po\' più strutturato', icon: '📋' },
];

const activityOptions = [
  { label: 'Poco', icon: '🛋️' },
  { label: 'Moderatamente', icon: '🚶‍♀️' },
  { label: 'Abbastanza', icon: '🏃‍♀️' },
];

const difficultyOptions = [
  { label: 'Fame nervosa', icon: '😰' },
  { label: 'Voglia di dolci', icon: '🍫' },
  { label: 'Mancanza di tempo', icon: '⏰' },
  { label: 'Stress', icon: '😮‍💨' },
  { label: 'Non riesco ad essere costante', icon: '🔄' },
];

const sexOptions = [
  { label: 'Donna', icon: '👩' },
  { label: 'Uomo', icon: '👨' },
  { label: 'Preferisco non dirlo', icon: '🤍' },
];

const workTypeOptions = [
  { label: 'Sedentario (ufficio, smart working)', icon: '💻' },
  { label: 'In piedi (negozio, ospedale, scuola)', icon: '🧑‍⚕️' },
  { label: 'Fisico (manuale, sport, cantiere)', icon: '🔨' },
  { label: 'Misto', icon: '🔄' },
];

const modeOptions = [
  { label: 'Da sola', icon: '🧘‍♀️', value: 'solo' },
  { label: 'Con un partner', icon: '🤝', value: 'together' },
];

type EditingField = null | 'objective' | 'pace' | 'activity' | 'difficulty' | 'sex' | 'weight' | 'age' | 'workType' | 'mode';

const ProfilePage = () => {
  const { user, checkIns, weeklyHabits, setUser } = useAppStore();
  const { saveProfile } = useProfile();
  const { signOut } = useAuth();
  const completedHabits = weeklyHabits.filter((h) => h.completed).length;
  const [editingIntolerances, setEditingIntolerances] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [weightInput, setWeightInput] = useState(user.weight || '');
  const [ageInput, setAgeInput] = useState(user.age || '');
  // For multi-select fields (objective, difficulty)
  const [multiSelections, setMultiSelections] = useState<string[]>([]);

  const allUserIntolerances = [...user.intolerances, ...user.customIntolerances];

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || user.customIntolerances.includes(trimmed) || user.intolerances.includes(trimmed)) return;

    const nextCustomIntolerances = [...user.customIntolerances, trimmed];
    setUser({ customIntolerances: nextCustomIntolerances });
    void saveProfile({ customIntolerances: nextCustomIntolerances });
    setCustomInput('');
    setShowCustomInput(false);
  };

  const openEditor = (field: EditingField) => {
    if (field === 'objective') {
      setMultiSelections(user.objective ? user.objective.split(', ') : []);
    } else if (field === 'difficulty') {
      setMultiSelections(user.difficulty ? user.difficulty.split(', ') : []);
    } else if (field === 'weight') {
      setWeightInput(user.weight || '');
    } else if (field === 'age') {
      setAgeInput(user.age || '');
    }
    setEditingField(field);
  };

  const handleSingleSelect = (field: string, value: string, storeValue?: string) => {
    const nextValue = storeValue || value;
    const patch = { [field]: nextValue } as any;
    setUser(patch);
    void saveProfile(patch);
    setEditingField(null);
  };

  const handleMultiSelectSave = (field: string) => {
    const patch = { [field]: multiSelections.join(', ') } as any;
    setUser(patch);
    void saveProfile(patch);
    setEditingField(null);
  };

  const toggleMultiSelection = (value: string) => {
    setMultiSelections(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const renderSingleSelectEditor = (options: { label: string; icon: string; value?: string }[], field: string) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="mt-4 p-5 rounded-2xl glass glass-border border-primary/20 space-y-2"
    >
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => handleSingleSelect(field, opt.label, opt.value)}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-300
            ${(opt.value ? user[field as keyof typeof user] === opt.value : user[field as keyof typeof user] === opt.label)
              ? 'glass glass-border border-primary/30'
              : 'glass glass-border hover:border-primary/20'}`}
        >
          <span className="text-lg">{opt.icon}</span>
          <span className="text-sm text-foreground">{opt.label}</span>
        </button>
      ))}
      <button
        onClick={() => setEditingField(null)}
        className="w-full mt-2 px-4 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium"
      >
        Annulla
      </button>
    </motion.div>
  );

  const renderMultiSelectEditor = (options: { label: string; icon: string }[], field: string) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="mt-4 p-5 rounded-2xl glass glass-border border-primary/20 space-y-2"
    >
      {options.map((opt) => {
        const isSelected = multiSelections.includes(opt.label);
        return (
          <button
            key={opt.label}
            onClick={() => toggleMultiSelection(opt.label)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300
              ${isSelected ? 'glass glass-border border-primary/30' : 'glass glass-border hover:border-primary/20'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{opt.icon}</span>
              <span className="text-sm text-foreground">{opt.label}</span>
            </div>
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
              ${isSelected ? 'gradient-primary border-transparent' : 'border-muted-foreground/20'}`}>
              {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
            </div>
          </button>
        );
      })}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => handleMultiSelectSave(field)}
          disabled={multiSelections.length === 0}
          className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
        >
          Salva
        </button>
        <button
          onClick={() => setEditingField(null)}
          className="px-4 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium"
        >
          Annulla
        </button>
      </div>
    </motion.div>
  );

  const profileFields = [
    { label: 'Obiettivo', value: user.objective || '—', editKey: 'objective' as EditingField },
    { label: 'Modalità', value: user.mode === 'together' ? 'Insieme' : 'Da sola', editKey: 'mode' as EditingField },
    { label: 'Genere', value: user.sex || '—', editKey: 'sex' as EditingField },
    { label: 'Età', value: user.age ? `${user.age} anni` : '—', editKey: 'age' as EditingField },
    { label: 'Peso', value: user.weight ? `${user.weight} kg` : '—', editKey: 'weight' as EditingField },
    { label: 'Lavoro', value: user.workType || '—', editKey: 'workType' as EditingField },
    { label: 'Ritmo', value: user.pace || '—', editKey: 'pace' as EditingField },
    { label: 'Attività', value: user.activity || '—', editKey: 'activity' as EditingField },
    { label: 'Difficoltà principale', value: user.difficulty || '—', editKey: 'difficulty' as EditingField },
  ];

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-6">
      <AppHeader showBack />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <h1 className="font-display text-2xl text-foreground mb-2">
          Profilo
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Ciao, {user.name || 'cara'} 💛
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="p-5 rounded-2xl glass glass-border text-center">
            <p className="text-3xl font-bold text-gradient font-body">{checkIns.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Momenti di cura</p>
          </div>
          <div className="p-5 rounded-2xl glass glass-border text-center">
            <p className="text-3xl font-bold text-gradient font-body">{completedHabits}</p>
            <p className="text-xs text-muted-foreground mt-1">Abitudini completate</p>
          </div>
        </div>

        {/* Settings */}
        <h2 className="font-display text-lg text-foreground mb-4">
          Il tuo percorso
        </h2>
        <div className="space-y-2">
          {profileFields.map((item) => (
            <div key={item.label}>
              <div
                onClick={() => openEditor(item.editKey)}
                className="flex items-center justify-between p-4 rounded-2xl glass glass-border cursor-pointer hover:border-primary/20 transition-all"
              >
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground max-w-[180px] truncate">{item.value}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>

              {/* Inline editors */}
              <AnimatePresence>
                {editingField === 'objective' && item.editKey === 'objective' && renderMultiSelectEditor(objectiveOptions, 'objective')}
                {editingField === 'difficulty' && item.editKey === 'difficulty' && renderMultiSelectEditor(difficultyOptions, 'difficulty')}
                {editingField === 'pace' && item.editKey === 'pace' && renderSingleSelectEditor(paceOptions, 'pace')}
                {editingField === 'activity' && item.editKey === 'activity' && renderSingleSelectEditor(activityOptions, 'activity')}
                {editingField === 'sex' && item.editKey === 'sex' && renderSingleSelectEditor(sexOptions, 'sex')}
                {editingField === 'mode' && item.editKey === 'mode' && renderSingleSelectEditor(modeOptions, 'mode')}
                {editingField === 'workType' && item.editKey === 'workType' && renderSingleSelectEditor(workTypeOptions, 'workType')}

                {editingField === 'weight' && item.editKey === 'weight' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-5 rounded-2xl glass glass-border border-primary/20"
                  >
                    <p className="text-sm font-medium text-foreground mb-3">Aggiorna il tuo peso</p>
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="number"
                        step="0.1"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        placeholder="Es: 65.5"
                        className="flex-1 px-5 py-3 rounded-xl bg-muted border border-border text-foreground
                          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                          transition-all duration-300 placeholder:text-muted-foreground/50"
                        autoFocus
                      />
                      <span className="text-muted-foreground">kg</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setUser({ weight: weightInput || undefined });
                          void saveProfile({ weight: weightInput || undefined });
                          setEditingField(null);
                        }}
                        className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-medium"
                      >
                        Salva
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="px-4 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium"
                      >
                        Annulla
                      </button>
                    </div>
                  </motion.div>
                )}

                {editingField === 'age' && item.editKey === 'age' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-5 rounded-2xl glass glass-border border-primary/20"
                  >
                    <p className="text-sm font-medium text-foreground mb-3">Aggiorna la tua età</p>
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="number"
                        min="14"
                        max="100"
                        value={ageInput}
                        onChange={(e) => setAgeInput(e.target.value)}
                        placeholder="Es: 32"
                        className="flex-1 px-5 py-3 rounded-xl bg-muted border border-border text-foreground
                          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                          transition-all duration-300 placeholder:text-muted-foreground/50"
                        autoFocus
                      />
                      <span className="text-muted-foreground">anni</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (ageInput.trim()) {
                            setUser({ age: ageInput.trim() });
                            void saveProfile({ age: ageInput.trim() });
                          }
                          setEditingField(null);
                        }}
                        className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-medium"
                      >
                        Salva
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="px-4 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium"
                      >
                        Annulla
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Intolerances */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-foreground">
              Intolleranze alimentari
            </h2>
            <button
              onClick={() => setEditingIntolerances(!editingIntolerances)}
              className="text-sm text-primary font-medium"
            >
              {editingIntolerances ? 'Fatto' : 'Modifica'}
            </button>
          </div>

          {allUserIntolerances.length > 0 && !editingIntolerances ? (
            <div className="flex gap-2 flex-wrap">
              {allUserIntolerances.map((intolerance) => (
                <span
                  key={intolerance}
                  className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium"
                >
                  {intolerance}
                </span>
              ))}
            </div>
          ) : !editingIntolerances ? (
            <p className="text-sm text-muted-foreground">
              Nessuna intolleranza indicata. Tocca "Modifica" per aggiungerne.
            </p>
          ) : null}

          <AnimatePresence>
            {editingIntolerances && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {allIntolerances.map((intolerance) => {
                  const isSelected = user.intolerances.includes(intolerance);
                  return (
                    <motion.button
                      key={intolerance}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const nextIntolerances = isSelected
                          ? user.intolerances.filter((i) => i !== intolerance)
                          : [...user.intolerances, intolerance];
                        setUser({ intolerances: nextIntolerances });
                        void saveProfile({ intolerances: nextIntolerances });
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300
                        ${isSelected ? 'glass glass-border border-primary/30' : 'glass glass-border'}`}
                    >
                      <span className="text-sm font-medium text-foreground">{intolerance}</span>
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                        ${isSelected ? 'gradient-primary border-transparent' : 'border-muted-foreground/20'}`}>
                        {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                      </div>
                    </motion.button>
                  );
                })}

                {user.customIntolerances.map((ci) => (
                  <div
                    key={ci}
                    className="w-full flex items-center justify-between p-4 rounded-2xl glass glass-border border-primary/30"
                  >
                    <span className="text-sm font-medium text-foreground">⚠️ {ci}</span>
                    <button
                      onClick={() => { removeCustomIntolerance(ci); setTimeout(() => saveProfile(), 100); }}
                      className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                ))}

                {showCustomInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                      placeholder="Es: Soia, Uova..."
                      className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm
                        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                        transition-all duration-300 placeholder:text-muted-foreground/50"
                      autoFocus
                    />
                    <button
                      onClick={() => { handleAddCustom(); setTimeout(() => saveProfile(), 200); }}
                      disabled={!customInput.trim()}
                      className="px-4 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-medium
                        disabled:opacity-40 transition-opacity"
                    >
                      Aggiungi
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl 
                      border border-dashed border-muted-foreground/20 text-muted-foreground
                      hover:border-primary/30 hover:text-foreground transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Aggiungi altra sensibilità</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fasting Settings */}
        <FastingSettings />

        {/* Privacy mode */}
        <div className="mt-8 p-6 rounded-2xl bg-accent glass-border">
          <h3 className="font-display text-base text-accent-foreground mb-2">
            🔒 Supporto Gentile
          </h3>
          <p className="text-sm text-accent-foreground/80">
            La tua privacy è al sicuro. Chi ti supporta può vedere solo il progresso generale, 
            mai i dati personali o le note emotive.
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={signOut}
          className="mt-6 w-full p-4 rounded-2xl glass glass-border text-destructive text-sm font-medium flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Esci dall'account
        </button>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
