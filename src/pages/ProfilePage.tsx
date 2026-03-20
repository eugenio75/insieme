import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useProfile } from '@/hooks/useProfile';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import { useAuth } from '@/hooks/useAuth';
import { Plus, X, LogOut, TrendingDown, TrendingUp, Minus, Scale } from 'lucide-react';
import FastingSettings from '@/components/FastingSettings';
import ProfileFieldEditor from '@/components/ProfileFieldEditor';
import { useWeightTracking } from '@/hooks/useWeightTracking';
import HouseholdSection from '@/components/HouseholdSection';

const allIntolerances = ['Lattosio', 'Glutine', 'Nichel', 'Fruttosio'];

const calcBMI = (weightKg?: string, heightCm?: string) => {
  const w = parseFloat(weightKg || '');
  const h = parseFloat(heightCm || '');
  if (!w || !h || h < 100) return null;
  const hm = h / 100;
  const bmi = w / (hm * hm);
  let category: string;
  let emoji: string;
  let color: string;
  if (bmi < 18.5) { category = 'Sottopeso'; emoji = '⚠️'; color = 'text-yellow-600 dark:text-yellow-400'; }
  else if (bmi < 25) { category = 'Normopeso'; emoji = '✅'; color = 'text-green-600 dark:text-green-400'; }
  else if (bmi < 30) { category = 'Sovrappeso'; emoji = '⚡'; color = 'text-secondary'; }
  else { category = 'Obesità'; emoji = '🔴'; color = 'text-destructive'; }
  return { bmi: Math.round(bmi * 10) / 10, category, emoji, color };
};

const WeightTracker = () => {
  const { entries, loading, logWeight, getTrend } = useWeightTracking();
  const [weightInput, setWeightInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const trend = getTrend();

  const handleLog = () => {
    const w = parseFloat(weightInput);
    if (w && w > 20 && w < 300) {
      logWeight(w);
      setWeightInput('');
    }
  };

  const trendIcon = trend.trend === 'losing' ? '📉' : trend.trend === 'gaining' ? '📈' : trend.trend === 'stable' ? '➡️' : '⚖️';
  const trendLabel = trend.trend === 'losing' ? 'In calo' : trend.trend === 'gaining' ? 'In aumento' : trend.trend === 'stable' ? 'Stabile' : '';
  const trendColor = trend.trend === 'losing' ? 'text-green-600 dark:text-green-400' : trend.trend === 'gaining' ? 'text-secondary' : 'text-muted-foreground';

  return (
    <div className="mt-8">
      <h2 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
        <Scale className="w-5 h-5 text-primary" />
        Traccia il peso
      </h2>

      {/* Current weight & trend */}
      {trend.currentWeight !== null && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 p-4 rounded-2xl glass glass-border text-center">
            <p className="text-2xl font-bold text-gradient font-body">{trend.currentWeight.toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Peso attuale (kg)</p>
          </div>
          {trend.lastTwoWeeksChange !== null && (
            <div className="flex-1 p-4 rounded-2xl glass glass-border text-center">
              <p className={`text-2xl font-bold font-body ${trendColor}`}>
                {trend.lastTwoWeeksChange > 0 ? '+' : ''}{trend.lastTwoWeeksChange.toFixed(1)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Ultime 2 settimane</p>
            </div>
          )}
          {trend.totalChange !== null && entries.length >= 3 && (
            <div className="flex-1 p-4 rounded-2xl glass glass-border text-center">
              <p className={`text-2xl font-bold font-body ${trend.totalChange <= 0 ? 'text-green-600 dark:text-green-400' : 'text-secondary'}`}>
                {trend.totalChange > 0 ? '+' : ''}{trend.totalChange.toFixed(1)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Totale</p>
            </div>
          )}
        </div>
      )}

      {/* Trend badge */}
      {trend.trend !== 'unknown' && (
        <div className={`mb-4 px-4 py-2.5 rounded-xl ${
          trend.trend === 'losing' ? 'bg-green-500/10 border border-green-500/20' :
          trend.trend === 'gaining' ? 'bg-secondary/10 border border-secondary/20' :
          'bg-muted/60 border border-border'
        }`}>
          <p className="text-xs">
            <span className="mr-1.5">{trendIcon}</span>
            <span className={`font-medium ${trendColor}`}>{trendLabel}</span>
            <span className="text-muted-foreground ml-1">
              {trend.trend === 'losing' ? '— Il piano sta funzionando!' :
               trend.trend === 'gaining' ? '— Il piano verrà adattato automaticamente.' :
               '— Il peso è stabile.'}
            </span>
          </p>
        </div>
      )}

      {/* Log weight input */}
      <div className="flex gap-2 mb-3">
        <input
          type="number"
          step="0.1"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          placeholder={trend.currentWeight ? `Ultimo: ${trend.currentWeight.toFixed(1)} kg` : 'Es: 65.5'}
          onKeyDown={(e) => e.key === 'Enter' && handleLog()}
          className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            transition-all duration-300 placeholder:text-muted-foreground/50"
        />
        <button
          onClick={handleLog}
          disabled={!weightInput.trim()}
          className="px-5 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-medium
            disabled:opacity-40 transition-opacity"
        >
          Salva
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground/60 px-1 mb-3">
        Pesati alla stessa ora per dati più precisi. Puoi registrare il peso ogni giorno.
      </p>

      {/* History toggle */}
      {entries.length > 0 && (
        <>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-primary font-medium mb-2"
          >
            {showHistory ? 'Nascondi storico' : `Vedi storico (${entries.length} registrazioni)`}
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {entries.slice(0, 20).map((entry, i) => {
                    const prev = i < entries.length - 1 ? entries[i + 1] : null;
                    const diff = prev ? entry.weight - prev.weight : null;
                    const date = new Date(entry.logged_at);
                    return (
                      <div key={entry.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40 text-xs">
                        <span className="text-muted-foreground">
                          {date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{entry.weight.toFixed(1)} kg</span>
                          {diff !== null && (
                            <span className={`text-[10px] ${diff < 0 ? 'text-green-600 dark:text-green-400' : diff > 0 ? 'text-secondary' : 'text-muted-foreground'}`}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const { user, checkIns, weeklyHabits, toggleIntolerance, addCustomIntolerance, removeCustomIntolerance, setUser } = useAppStore();
  const { saveProfile } = useProfile();
  const { signOut } = useAuth();
  const completedHabits = weeklyHabits.filter((h) => h.completed).length;
  const [editingIntolerances, setEditingIntolerances] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const allUserIntolerances = [...user.intolerances, ...user.customIntolerances];

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !user.customIntolerances.includes(trimmed) && !user.intolerances.includes(trimmed)) {
      addCustomIntolerance(trimmed);
      setCustomInput('');
      setShowCustomInput(false);
    }
  };

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
          Ciao, {user.name || (['maschio', 'male', 'm', 'uomo'].includes((user.sex || '').toLowerCase()) ? 'caro' : 'cara')} 💛
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

        {/* Settings - All fields editable */}
        <h2 className="font-display text-lg text-foreground mb-4">
          Il tuo percorso
        </h2>
        <ProfileFieldEditor />

        {/* Blood Pressure indicator */}
        {(() => {
          const sys = parseInt(user.bloodPressureSystolic || '');
          const dia = parseInt(user.bloodPressureDiastolic || '');
          if (!sys || !dia) return null;

          let category: string;
          let emoji: string;
          let color: string;
          let bgColor: string;
          let desc: string;

          if (sys < 90 || dia < 60) {
            category = 'Ipotensione'; emoji = '💙'; color = 'text-blue-600 dark:text-blue-400'; bgColor = 'bg-blue-500/10';
            desc = 'Pressione bassa. Il piano include alimenti che supportano la circolazione.';
          } else if (sys <= 120 && dia <= 80) {
            category = 'Ottimale'; emoji = '✅'; color = 'text-green-600 dark:text-green-400'; bgColor = 'bg-green-500/10';
            desc = 'La tua pressione è nella norma. Continua così!';
          } else if (sys <= 129 && dia <= 84) {
            category = 'Normale'; emoji = '👍'; color = 'text-green-600 dark:text-green-400'; bgColor = 'bg-green-500/10';
            desc = 'Pressione nella norma. Un buon equilibrio alimentare aiuta a mantenerla.';
          } else if (sys <= 139 || dia <= 89) {
            category = 'Normale-alta'; emoji = '⚠️'; color = 'text-yellow-600 dark:text-yellow-400'; bgColor = 'bg-yellow-500/10';
            desc = 'Leggermente alta. Il piano limita il sodio e favorisce potassio e magnesio.';
          } else if (sys <= 159 || dia <= 99) {
            category = 'Ipertensione grado 1'; emoji = '🟠'; color = 'text-secondary'; bgColor = 'bg-secondary/10';
            desc = 'Pressione alta. Il piano riduce sale e cibi processati, aumenta verdure e omega-3.';
          } else {
            category = 'Ipertensione grado 2'; emoji = '🔴'; color = 'text-destructive'; bgColor = 'bg-destructive/10';
            desc = 'Pressione alta. Il piano è calibrato per supportarti, ma consulta il tuo medico.';
          }

          return (
            <div className="mt-4 mb-2 p-4 rounded-2xl glass glass-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pressione arteriosa</p>
                  <p className="text-2xl font-bold text-gradient font-body">{sys}/{dia}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl ${bgColor}`}>
                  <span className={`text-sm font-medium ${color}`}>
                    {emoji} {category}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{desc}</p>
            </div>
          );
        })()}

        {/* BMI indicator */}
        {(() => {
          const bmiData = calcBMI(user.weight, user.height);
          if (!bmiData) return null;
          return (
            <div className="mt-3 mb-2 p-4 rounded-2xl glass glass-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Indice di Massa Corporea (BMI)</p>
                  <p className="text-2xl font-bold text-gradient font-body">{bmiData.bmi}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl ${
                  bmiData.category === 'Normopeso' ? 'bg-green-500/10' :
                  bmiData.category === 'Sovrappeso' ? 'bg-secondary/10' :
                  bmiData.category === 'Obesità' ? 'bg-destructive/10' :
                  'bg-yellow-500/10'
                }`}>
                  <span className={`text-sm font-medium ${bmiData.color}`}>
                    {bmiData.emoji} {bmiData.category}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                {bmiData.category === 'Normopeso' 
                  ? 'Il tuo peso è nella norma. Il piano punta al benessere generale.'
                  : bmiData.category === 'Sovrappeso'
                  ? 'Il piano è adattato per favorire un calo graduale e sostenibile.'
                  : bmiData.category === 'Obesità'
                  ? 'Il piano è calibrato per un percorso sicuro e progressivo.'
                  : 'Il piano include un supporto per raggiungere un peso sano.'}
              </p>
            </div>
          );
        })()}

        {/* Weight Tracker */}
        <WeightTracker />

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
                      onClick={() => toggleIntolerance(intolerance)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300
                        ${isSelected
                          ? 'glass glass-border border-primary/30'
                          : 'glass glass-border'
                        }`}
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
                      onClick={() => removeCustomIntolerance(ci)}
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
                      onClick={handleAddCustom}
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
