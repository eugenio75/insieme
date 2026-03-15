import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { analyzeProgress, Adjustment } from '@/data/adaptationLogic';
import { useFasting } from '@/hooks/useFasting';
import { usePatternAnalysis } from '@/hooks/useFoodFindings';
import type { Pattern, FoodFinding, DietSuggestion } from '@/hooks/useFoodFindings';
import BottomNav from '@/components/BottomNav';
import AppHeader from '@/components/AppHeader';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface WeeklyData {
  week_number: number;
  weight: number | null;
  bloating: number;
  energy: number;
  created_at: string;
}


const ProgressPage = () => {
  const [data, setData] = useState<WeeklyData[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'charts' | 'adjustments' | 'scoperte' | 'digiuno'>('charts');
  const { analysis, loading: patternLoading, load: loadPatterns, loaded: patternsLoaded } = usePatternAnalysis();
  const { user: authUser } = useAuth();
  const { user } = useAppStore();
  const { config: fastingConfig, getStats: getFastingStats } = useFasting();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) { setLoading(false); return; }

    const load = async () => {
      const { data: rows } = await supabase
        .from('weekly_checkins')
        .select('*')
        .eq('user_id', authUser.id)
        .order('week_number', { ascending: true });

      if (rows && rows.length > 0) {
        const mapped = rows.map((r: any) => ({
          week_number: r.week_number,
          weight: r.weight ? Number(r.weight) : null,
          bloating: r.bloating,
          energy: r.energy,
          created_at: r.created_at,
        }));
        setData(mapped);
        setAdjustments(analyzeProgress(mapped, user.objective));
      }
      setLoading(false);
    };
    load();
  }, [authUser, user.objective]);

  // Load pattern analysis when tab is selected
  useEffect(() => {
    if (activeTab === 'scoperte' && !patternsLoaded) {
      loadPatterns();
    }
  }, [activeTab, patternsLoaded]);

  const chartData = data.map((d) => ({
    name: `S${d.week_number}`,
    peso: d.weight,
    gonfiore: d.bloating,
    energia: d.energy,
  }));

  const hasWeight = data.some((d) => d.weight !== null);
  const appliedAdjustments = adjustments.filter((a) => a.applied);
  const otherAdjustments = adjustments.filter((a) => !a.applied);

  const confidenceColor = (c: string) => {
    if (c === 'alta') return 'text-primary';
    if (c === 'media') return 'text-secondary';
    return 'text-muted-foreground';
  };

  const correlationBar = (value: number) => {
    const pct = Math.round(value * 100);
    const color = value >= 0.7 ? 'gradient-warm' : value >= 0.5 ? 'bg-secondary' : 'bg-muted';
    return (
      <div className="w-full h-2 rounded-full bg-muted/30 mt-2">
        <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  const issueLabel = (issue: string) => {
    switch (issue) {
      case 'gonfiore': return '🫧 Gonfiore';
      case 'energia_bassa': return '🔋 Energia bassa';
      case 'umore_basso': return '😔 Umore basso';
      default: return issue;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-6">
        <AppHeader />
        <div className="flex items-center justify-center pt-20">
          <motion.span className="text-4xl" animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>📊</motion.span>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-6">
        <AppHeader />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center pt-20">
          <motion.span className="text-6xl mb-6" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>📊</motion.span>
          <h1 className="font-display text-2xl text-foreground mb-3">Nessun dato ancora</h1>
          <p className="text-muted-foreground text-sm mb-8">Completa il tuo primo check-in settimanale per vedere i risultati.</p>
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate('/weekly-checkin')} className="px-8 py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm shadow-glow">
            PRIMO CHECK-IN SETTIMANALE
          </motion.button>
        </motion.div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-6">
      <AppHeader />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-2xl text-foreground mb-1">I tuoi risultati</h1>
        <p className="text-muted-foreground text-sm mb-6">
          {data.length} {data.length === 1 ? 'settimana' : 'settimane'} di dati
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([
            { key: 'charts' as const, label: '📈 Andamento' },
            { key: 'adjustments' as const, label: '🔧 Adattamenti', badge: appliedAdjustments.length },
            { key: 'scoperte' as const, label: '🔍 Scoperte' },
            ...(fastingConfig.enabled ? [{ key: 'digiuno' as const, label: '⏱️ Digiuno' }] : []),
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap relative
                ${activeTab === tab.key
                  ? 'gradient-primary text-primary-foreground shadow-glow'
                  : 'glass glass-border text-muted-foreground'
                }`}
            >
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-warm text-secondary-foreground text-xs flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'charts' && (
            <motion.div key="charts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* Energy chart */}
              <div className="p-5 rounded-2xl glass glass-border">
                <h3 className="font-display text-sm text-foreground mb-4">⚡ Energia nel tempo</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(20 10% 16%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(25 15% 55%)' }} stroke="hsl(20 10% 16%)" />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 12, fill: 'hsl(25 15% 55%)' }} stroke="hsl(20 10% 16%)" />
                    <Tooltip contentStyle={{ background: 'hsl(20 12% 9%)', border: '1px solid hsl(20 10% 16%)', borderRadius: '12px', fontSize: '12px', color: 'hsl(35 30% 92%)' }} />
                    <Line type="monotone" dataKey="energia" stroke="hsl(158 60% 52%)" strokeWidth={2.5} dot={{ fill: 'hsl(158 60% 52%)', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bloating chart */}
              <div className="p-5 rounded-2xl glass glass-border">
                <h3 className="font-display text-sm text-foreground mb-4">🫧 Gonfiore nel tempo</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(20 10% 16%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(25 15% 55%)' }} stroke="hsl(20 10% 16%)" />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 12, fill: 'hsl(25 15% 55%)' }} stroke="hsl(20 10% 16%)" />
                    <Tooltip contentStyle={{ background: 'hsl(20 12% 9%)', border: '1px solid hsl(20 10% 16%)', borderRadius: '12px', fontSize: '12px', color: 'hsl(35 30% 92%)' }} />
                    <Line type="monotone" dataKey="gonfiore" stroke="hsl(25 80% 60%)" strokeWidth={2.5} dot={{ fill: 'hsl(25 80% 60%)', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">Più basso = meglio</p>
              </div>

              {/* Weight chart */}
              {hasWeight && (
                <div className="p-5 rounded-2xl glass glass-border">
                  <h3 className="font-display text-sm text-foreground mb-4">⚖️ Peso nel tempo</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData.filter((d) => d.peso !== null)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(20 10% 16%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(25 15% 55%)' }} stroke="hsl(20 10% 16%)" />
                      <YAxis tick={{ fontSize: 12, fill: 'hsl(25 15% 55%)' }} stroke="hsl(20 10% 16%)" domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ background: 'hsl(20 12% 9%)', border: '1px solid hsl(20 10% 16%)', borderRadius: '12px', fontSize: '12px', color: 'hsl(35 30% 92%)' }} formatter={(value: number) => [`${value} kg`, 'Peso']} />
                      <Line type="monotone" dataKey="peso" stroke="hsl(35 30% 92%)" strokeWidth={2.5} dot={{ fill: 'hsl(35 30% 92%)', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Quick summary */}
              {data.length >= 2 && (
                <div className="p-5 rounded-2xl bg-accent glass-border">
                  <h3 className="font-display text-sm text-accent-foreground mb-3">Questa settimana vs la scorsa</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <ComparisonBadge label="Energia" current={data[data.length - 1].energy} previous={data[data.length - 2].energy} higherIsBetter />
                    <ComparisonBadge label="Gonfiore" current={data[data.length - 1].bloating} previous={data[data.length - 2].bloating} higherIsBetter={false} />
                    {hasWeight && data[data.length - 1].weight && data[data.length - 2].weight && (
                      <ComparisonBadge label="Peso" current={data[data.length - 1].weight!} previous={data[data.length - 2].weight!} higherIsBetter={false} suffix="kg" />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'adjustments' && (
            <motion.div key="adjustments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {adjustments.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">📋</span>
                  <p className="text-muted-foreground text-sm">Servono almeno 2 settimane di dati per generare suggerimenti.</p>
                </div>
              ) : (
                <>
                  {appliedAdjustments.length > 0 && (
                    <>
                      <p className="text-xs btn-text text-primary mb-2">🔄 MODIFICHE APPLICATE AUTOMATICAMENTE</p>
                      {appliedAdjustments.map((adj, i) => <AdjustmentCard key={i} adjustment={adj} />)}
                    </>
                  )}
                  {otherAdjustments.length > 0 && (
                    <>
                      <p className="text-xs btn-text text-muted-foreground mb-2 mt-6">💡 OSSERVAZIONI</p>
                      {otherAdjustments.map((adj, i) => <AdjustmentCard key={i} adjustment={adj} />)}
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'scoperte' && (
            <motion.div key="scoperte" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Header explanation */}
              <div className="p-4 rounded-2xl bg-accent glass-border">
                <p className="text-sm text-accent-foreground/80 italic font-display">
                  "Analizziamo i tuoi dati per capire cosa funziona meglio per il tuo corpo." 🔬
                </p>
              </div>

              {patternLoading ? (
                <div className="flex flex-col items-center py-12">
                  <motion.span className="text-4xl mb-4" animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>🔍</motion.span>
                  <p className="text-sm text-muted-foreground">Analizzo i tuoi pattern...</p>
                </div>
              ) : analysis && (analysis.patterns.length > 0 || analysis.foodFindings.length > 0) ? (
                <>
                  {/* Confidence indicator */}
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-muted-foreground">
                      Basato su <span className="font-medium text-foreground">{analysis.dataPoints}</span> check-in
                    </p>
                    <span className={`text-xs font-medium ${confidenceColor(analysis.confidence)}`}>
                      Confidenza: {analysis.confidence}
                    </span>
                  </div>

                  {/* Behavioral patterns */}
                  {analysis.patterns.length > 0 && (
                    <>
                      <p className="text-[10px] btn-text text-primary mt-2 mb-1">🧠 PATTERN RILEVATI</p>
                      {analysis.patterns.map((pattern, i) => (
                        <PatternCard key={i} pattern={pattern} index={i} correlationBar={correlationBar} />
                      ))}
                    </>
                  )}

                  {/* Food findings */}
                  {analysis.foodFindings.length > 0 && (
                    <>
                      <p className="text-[10px] btn-text text-secondary mt-4 mb-1">🍽️ SENSIBILITÀ ALIMENTARI</p>
                      {analysis.foodFindings.map((finding, i) => (
                        <motion.div
                          key={finding.food}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="p-5 rounded-2xl glass glass-border"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">{finding.icon}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-foreground">{finding.food}</h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-muted text-muted-foreground">
                                  {issueLabel(finding.issue)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{finding.description}</p>
                              {correlationBar(finding.correlation)}
                              <p className="text-[10px] text-muted-foreground/60 mt-1">
                                Correlazione: {Math.round(finding.correlation * 100)}%
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  )}

                  {/* Diet suggestions */}
                  {analysis.dietSuggestions && analysis.dietSuggestions.length > 0 && (
                    <>
                      <p className="text-[10px] btn-text text-primary mt-4 mb-1">💡 SUGGERIMENTI PER IL TUO PIANO</p>
                      {analysis.dietSuggestions.map((sug, i) => (
                        <DietSuggestionCard key={i} suggestion={sug} index={i} />
                      ))}
                    </>
                  )}

                  <p className="text-xs text-muted-foreground text-center italic mt-4">
                    ⚠️ Queste sono osservazioni basate sui tuoi dati, non diagnosi mediche.
                    Consulta un professionista per allergie o intolleranze.
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center py-12">
                  <span className="text-4xl mb-4">🌱</span>
                  <p className="text-sm text-muted-foreground text-center px-4">
                    {analysis?.message || 'Nessun pattern significativo trovato ancora. Continua con i check-in giornalieri!'}
                  </p>
                  {analysis?.nextAnalysisIn && analysis.nextAnalysisIn > 0 && (
                    <p className="text-xs text-primary mt-3">
                      Ancora {analysis.nextAnalysisIn} check-in per la prima analisi
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'digiuno' && (
            <motion.div key="digiuno" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <FastingReport getStats={getFastingStats} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <BottomNav />
    </div>
  );
};

const ComparisonBadge = ({ label, current, previous, higherIsBetter, suffix }: {
  label: string; current: number; previous: number; higherIsBetter: boolean; suffix?: string;
}) => {
  const diff = current - previous;
  const improved = higherIsBetter ? diff > 0 : diff < 0;
  const same = diff === 0;
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-semibold text-foreground">{suffix ? `${current} ${suffix}` : current}/5</p>
      <p className={`text-xs font-medium ${same ? 'text-muted-foreground' : improved ? 'text-primary' : 'text-secondary'}`}>
        {same ? '=' : improved ? '↑ meglio' : '↓ peggio'}
      </p>
    </div>
  );
};

const AdjustmentCard = ({ adjustment }: { adjustment: Adjustment }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className={`p-5 rounded-2xl ${adjustment.applied ? 'bg-accent glass-border border-primary/20' : 'glass glass-border'}`}
  >
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
        <span className="text-xl">{adjustment.icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{adjustment.title}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{adjustment.description}</p>
        {adjustment.applied && (
          <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
            Applicato al tuo percorso
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

const FastingReport = ({ getStats }: { getStats: () => any }) => {
  const stats = getStats();

  return (
    <>
      <div className="p-4 rounded-2xl bg-accent glass-border">
        <p className="text-sm text-accent-foreground/80 italic font-display">
          "Il digiuno intermittente è un alleato, non un obbligo. Ascolta il tuo corpo." ⏱️
        </p>
      </div>

      {stats.totalSessions === 0 ? (
        <div className="flex flex-col items-center py-12">
          <span className="text-4xl mb-4">⏱️</span>
          <p className="text-sm text-muted-foreground text-center px-4">
            Non hai ancora completato sessioni di digiuno. Avvia il timer dalla Home!
          </p>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-5 rounded-2xl glass glass-border text-center">
              <p className="text-3xl font-bold text-gradient font-body">{stats.completedSessions}</p>
              <p className="text-xs text-muted-foreground mt-1">Sessioni completate</p>
            </div>
            <div className="p-5 rounded-2xl glass glass-border text-center">
              <p className="text-3xl font-bold text-gradient font-body">{Math.round(stats.completionRate * 100)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Tasso di completamento</p>
            </div>
            <div className="p-5 rounded-2xl glass glass-border text-center">
              <p className="text-3xl font-bold text-gradient font-body">{stats.avgFastingHours}h</p>
              <p className="text-xs text-muted-foreground mt-1">Media ore digiuno</p>
            </div>
            <div className="p-5 rounded-2xl glass glass-border text-center">
              <p className="text-3xl font-bold text-gradient font-body">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground mt-1">Giorni consecutivi</p>
            </div>
          </div>

          {/* Recent sessions */}
          <h3 className="font-display text-sm text-foreground mt-4 mb-2">Ultime sessioni</h3>
          {stats.sessions.slice(0, 7).map((s: any) => {
            const date = new Date(s.started_at);
            const hours = s.ended_at
              ? Math.round((new Date(s.ended_at).getTime() - date.getTime()) / 3600000 * 10) / 10
              : null;
            return (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl glass glass-border">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{s.completed ? '✅' : '⚪'}</span>
                  <div>
                    <p className="text-sm text-foreground">{date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    <p className="text-xs text-muted-foreground">{s.protocol}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {hours ? `${hours}h` : 'In corso...'}
                </span>
              </div>
            );
          })}
        </>
      )}
    </>
  );
};

const PatternCard = ({ pattern, index, correlationBar }: { pattern: Pattern; index: number; correlationBar: (v: number) => JSX.Element }) => {
  const typeIcon: Record<string, string> = {
    sleep_hunger: '😴→🍽️',
    sleep_energy: '😴→⚡',
    stress_eating: '😤→🍰',
    food_combo: '🍞+🍰',
    meal_timing: '⏰',
    stress_bloating: '😤→🫧',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="p-5 rounded-2xl glass glass-border"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{pattern.icon || typeIcon[pattern.type] || '🔍'}</span>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-foreground">{pattern.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{pattern.description}</p>
          {correlationBar(pattern.correlation)}
          {pattern.actionTip && (
            <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-primary font-medium">💡 {pattern.actionTip}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const DietSuggestionCard = ({ suggestion, index }: { suggestion: DietSuggestion; index: number }) => {
  const typeIcon = { add: '➕', reduce: '➖', replace: '🔄', timing: '⏰' };
  const priorityStyle = {
    alta: 'border-primary/30 bg-primary/5',
    media: 'border-secondary/30 bg-secondary/5',
    bassa: 'glass-border',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`p-4 rounded-2xl glass ${priorityStyle[suggestion.priority]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{typeIcon[suggestion.type]}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{suggestion.suggestion}</p>
          <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
          <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-lg ${
            suggestion.priority === 'alta' ? 'bg-primary/10 text-primary' :
            suggestion.priority === 'media' ? 'bg-secondary/10 text-secondary' :
            'bg-muted text-muted-foreground'
          }`}>
            Priorità {suggestion.priority}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressPage;
