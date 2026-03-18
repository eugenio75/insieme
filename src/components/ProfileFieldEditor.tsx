import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useProfile } from '@/hooks/useProfile';

type FieldConfig = {
  key: string;
  label: string;
  type: 'select' | 'multiSelect' | 'number';
  options?: { label: string; icon: string; value?: string }[];
  unit?: string;
  placeholder?: string;
  step?: string;
  min?: string;
  max?: string;
};

const fieldConfigs: FieldConfig[] = [
  {
    key: 'objective',
    label: 'Obiettivo',
    type: 'multiSelect',
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
    key: 'mode',
    label: 'Modalità',
    type: 'select',
    options: [
      { label: 'Da sola', icon: '🧘‍♀️', value: 'solo' },
      { label: 'Con un partner o una persona di supporto', icon: '🤝', value: 'together' },
    ],
  },
  {
    key: 'height',
    label: 'Altezza',
    type: 'number',
    unit: 'cm',
    placeholder: 'Es: 165',
    min: '100',
    max: '220',
  },
  {
    key: 'weight',
    label: 'Peso',
    type: 'number',
    unit: 'kg',
    placeholder: 'Es: 65.5',
    step: '0.1',
  },
  {
    key: 'bodyFrame',
    label: 'Struttura corporea',
    type: 'select',
    options: [
      { label: 'Esile', icon: '🦴', value: 'esile' },
      { label: 'Media', icon: '🧍', value: 'media' },
      { label: 'Robusta', icon: '💪', value: 'robusta' },
    ],
  },
  {
    key: 'age',
    label: 'Età',
    type: 'number',
    unit: 'anni',
    placeholder: 'Es: 32',
    min: '14',
    max: '100',
  },
  {
    key: 'workType',
    label: 'Lavoro',
    type: 'select',
    options: [
      { label: 'Sedentario (ufficio, smart working)', icon: '💻' },
      { label: 'In piedi (negozio, ospedale, scuola)', icon: '🧑‍⚕️' },
      { label: 'Fisico (manuale, sport, cantiere)', icon: '🔨' },
      { label: 'Misto', icon: '🔄' },
    ],
  },
  {
    key: 'pace',
    label: 'Ritmo',
    type: 'select',
    options: [
      { label: 'Molto gentile', icon: '🌸' },
      { label: 'Equilibrato', icon: '⚖️' },
      { label: 'Un po\' più strutturato', icon: '📋' },
    ],
  },
  {
    key: 'activity',
    label: 'Attività',
    type: 'select',
    options: [
      { label: 'Poco', icon: '🛋️' },
      { label: 'Moderatamente', icon: '🚶‍♀️' },
      { label: 'Abbastanza', icon: '🏃‍♀️' },
    ],
  },
  {
    key: 'difficulty',
    label: 'Difficoltà principale',
    type: 'multiSelect',
    options: [
      { label: 'Fame nervosa', icon: '😰' },
      { label: 'Voglia di dolci', icon: '🍫' },
      { label: 'Mancanza di tempo', icon: '⏰' },
      { label: 'Stress', icon: '😮‍💨' },
      { label: 'Non riesco ad essere costante', icon: '🔄' },
    ],
  },
  {
    key: 'sex',
    label: 'Genere',
    type: 'select',
    options: [
      { label: 'Donna', icon: '👩' },
      { label: 'Uomo', icon: '👨' },
      { label: 'Preferisco non dirlo', icon: '🤍' },
    ],
  },
  {
    key: 'bloodPressureSystolic',
    label: 'Pressione massima (sistolica)',
    type: 'number',
    unit: 'mmHg',
    placeholder: 'Es: 120',
    min: '70',
    max: '220',
  },
  {
    key: 'bloodPressureDiastolic',
    label: 'Pressione minima (diastolica)',
    type: 'number',
    unit: 'mmHg',
    placeholder: 'Es: 80',
    min: '40',
    max: '140',
  },
];

const ProfileFieldEditor = () => {
  const { user, setUser } = useAppStore();
  const { saveProfile } = useProfile();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [multiSelections, setMultiSelections] = useState<string[]>([]);

  const getDisplayValue = (config: FieldConfig): string => {
    const val = (user as any)[config.key];
    if (!val) return '—';
    if (config.key === 'mode') return val === 'together' ? 'Insieme' : 'Da sola';
    if (config.key === 'height') return `${val} cm`;
    if (config.key === 'weight') return `${val} kg`;
    if (config.key === 'age') return `${val} anni`;
    if (config.key === 'bloodPressureSystolic' || config.key === 'bloodPressureDiastolic') return `${val} mmHg`;
    return val;
  };

  const openEditor = (config: FieldConfig) => {
    const val = (user as any)[config.key] || '';
    if (config.type === 'number') {
      setInputValue(val);
    } else if (config.type === 'multiSelect') {
      // Split comma-separated values back into array
      setMultiSelections(val ? val.split(', ').filter(Boolean) : []);
    }
    setEditingField(config.key);
  };

  const handleSelectSave = (config: FieldConfig, value: string) => {
    const option = config.options?.find((o) => o.label === value);
    const saveVal = (option as any)?.value || value;
    setUser({ [config.key]: saveVal });
    saveProfile();
    setEditingField(null);
  };

  const handleMultiSelectToggle = (value: string) => {
    setMultiSelections((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleMultiSelectSave = (config: FieldConfig) => {
    setUser({ [config.key]: multiSelections.join(', ') });
    saveProfile();
    setEditingField(null);
  };

  const handleNumberSave = (config: FieldConfig) => {
    if (config.key === 'weight' || config.key === 'height') {
      setUser({ [config.key]: inputValue || undefined });
    } else {
      setUser({ [config.key]: inputValue.trim() || undefined });
    }
    saveProfile();
    setEditingField(null);
  };

  const calcBMI = () => {
    const w = parseFloat((user as any).weight || '');
    const h = parseFloat((user as any).height || '');
    if (!w || !h || h < 100) return null;
    const hm = h / 100;
    const bmi = w / (hm * hm);
    let category: string;
    let emoji: string;
    if (bmi < 18.5) { category = 'Sottopeso'; emoji = '⚠️'; }
    else if (bmi < 25) { category = 'Normopeso'; emoji = '✅'; }
    else if (bmi < 30) { category = 'Sovrappeso'; emoji = '⚡'; }
    else { category = 'Obesità'; emoji = '🔴'; }
    return { bmi: Math.round(bmi * 10) / 10, category, emoji };
  };

  const bmiData = calcBMI();

  return (
    <div className="space-y-2">
      {fieldConfigs.map((config, index) => (
        <div key={config.key}>
          <div
            onClick={() => openEditor(config)}
            className="flex items-center justify-between p-4 rounded-2xl glass glass-border cursor-pointer hover:border-primary/20 transition-all duration-300"
          >
            <span className="text-sm text-muted-foreground">{config.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{getDisplayValue(config)}</span>
              <span className="text-xs text-primary">✏️</span>
            </div>
          </div>

          {/* Show "Struttura corporea" after weight field */}
          {config.key === 'weight' && bmiData && (
            <div className="flex items-center justify-between p-4 rounded-2xl glass glass-border mt-2">
              <span className="text-sm text-muted-foreground">Struttura corporea</span>
              <span className="text-sm font-medium text-foreground">
                {bmiData.emoji} {bmiData.category} (BMI {bmiData.bmi})
              </span>
            </div>
          )}

          <AnimatePresence>
            {editingField === config.key && config.type === 'number' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-2 p-5 rounded-2xl glass glass-border border-primary/20"
              >
                <p className="text-sm font-medium text-foreground mb-3">
                  Aggiorna: {config.label.toLowerCase()}
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="number"
                    step={config.step}
                    min={config.min}
                    max={config.max}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={config.placeholder}
                    className="flex-1 px-5 py-3 rounded-xl bg-muted border border-border text-foreground
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                      transition-all duration-300 placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                  {config.unit && <span className="text-muted-foreground">{config.unit}</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNumberSave(config)}
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

            {editingField === config.key && config.type === 'select' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-2 p-5 rounded-2xl glass glass-border border-primary/20"
              >
                <p className="text-sm font-medium text-foreground mb-3">
                  Aggiorna: {config.label.toLowerCase()}
                </p>
                <div className="space-y-2">
                  {config.options?.map((opt) => {
                    const currentVal = (user as any)[config.key];
                    const optVal = (opt as any).value || opt.label;
                    const isActive = currentVal === optVal;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleSelectSave(config, opt.label)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-300
                          ${isActive
                            ? 'glass glass-border border-primary/30'
                            : 'glass glass-border hover:border-primary/20'}`}
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className="text-sm text-foreground">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setEditingField(null)}
                  className="mt-3 w-full px-4 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium"
                >
                  Annulla
                </button>
              </motion.div>
            )}

            {editingField === config.key && config.type === 'multiSelect' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-2 p-5 rounded-2xl glass glass-border border-primary/20"
              >
                <p className="text-sm font-medium text-foreground mb-3">
                  Aggiorna: {config.label.toLowerCase()} (puoi sceglierne più di una)
                </p>
                <div className="space-y-2">
                  {config.options?.map((opt) => {
                    const isSelected = multiSelections.includes(opt.label);
                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleMultiSelectToggle(opt.label)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-300
                          ${isSelected
                            ? 'glass glass-border border-primary/30'
                            : 'glass glass-border hover:border-primary/20'}`}
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className="text-sm text-foreground flex-1 text-left">{opt.label}</span>
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                          ${isSelected ? 'gradient-primary border-transparent' : 'border-muted-foreground/20'}`}>
                          {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleMultiSelectSave(config)}
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
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default ProfileFieldEditor;
