import { useState, useEffect, useMemo } from 'react';
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
  BarChart,
  Bar,
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface DailyCheckin {
  mood: number;
  energy: number;
  bloating: number;
  stress: number | null;
  sleep_hours: number | null;
  foods_eaten: string[] | null;
  created_at: string;
}

interface WeightLog {
  weight: number;
  logged_at: string;
}

interface ProfileData {
  weight: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  current_streak: number | null;
  objective: string | null;
  height: number | null;
  sex: string | null;
  age: string | null;
}

interface WeeklyData {
  week_number: number;
  weight: number | null;
  bloating: number;
  energy: number;
  created_at: string;
}

const ProgressPage = () => {
  const [dailyCheckins, setDailyCheckins] = useState<DailyCheckin[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'report' | 'trend' | 'scoperte' | 'digiuno'>('report');
  const { analysis, loading: patternLoading, load: loadPatterns, loaded: patternsLoaded } = usePatternAnalysis();
  const { user: authUser } = useAuth();
  const { user } = useAppStore();
  const { config: fastingConfig, getStats: getFastingStats } = useFasting();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) { setLoading(false); return; }

    const load = async () => {
      const [checkinsRes, weightsRes, profileRes, weeklyRes] = await Promise.all([
        supabase
          .from('daily_checkins')
          .select('mood, energy, bloating, stress, sleep_hours, foods_eaten, created_at')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('weight_logs')
          .select('weight, logged_at')
          .eq('user_id', authUser.id)
          .order('logged_at', { ascending: false })
          .limit(90),
        supabase
          .from('profiles')
          .select('weight, blood_pressure_systolic, blood_pressure_diastolic, current_streak, objective, height, sex, age')
          .eq('user_id', authUser.id)
          .single(),
        supabase
          .from('weekly_checkins')
          .select('*')
          .eq('user_id', authUser.id)
          .order('week_number', { ascending: true }),
      ]);

      setDailyCheckins(checkinsRes.data || []);
      setWeightLogs((weightsRes.data || []).map((w: any) => ({ weight: Number(w.weight), logged_at: w.logged_at })));
      if (profileRes.data) {
        setProfile({
          ...profileRes.data,
          weight: profileRes.data.weight ? Number(profileRes.data.weight) : null,
          height: profileRes.data.height ? Number(profileRes.data.height) : null,
        });
      }

      if (weeklyRes.data && weeklyRes.data.length > 0) {
        const mapped = weeklyRes.data.map((r: any) => ({
          week_number: r.week_number,
          weight: r.weight ? Number(r.weight) : null,
          bloating: r.bloating,
          energy: r.energy,
          created_at: r.created_at,
        }));
        setWeeklyData(mapped);
        setAdjustments(analyzeProgress(mapped, user.objective));
      }

      setLoading(false);
    };
    load();
  }, [authUser, user.objective]);

  useEffect(() => {
    if (activeTab === 'scoperte' && !patternsLoaded) {
      loadPatterns();
    }
  }, [activeTab, patternsLoaded]);

  // Compute this week's checkins
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const thisWeekCheckins = useMemo(() =>
    dailyCheckins.filter(c => {
      const d = parseISO(c.created_at);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    }),
    [dailyCheckins, weekStart.toISOString()]
  );

  const lastWeekStart = subDays(weekStart, 7);
  const lastWeekEnd = subDays(weekStart, 1);
  const lastWeekCheckins = useMemo(() =>
    dailyCheckins.filter(c => {
      const d = parseISO(c.created_at);
      return isWithinInterval(d, { start: lastWeekStart, end: lastWeekEnd });
    }),
    [dailyCheckins, lastWeekStart.toISOString()]
  );

  const avg = (arr: number[]) => arr.length ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10 : null;

  const thisWeekAvg = useMemo(() => ({
    mood: avg(thisWeekCheckins.map(c => c.mood)),
    energy: avg(thisWeekCheckins.map(c => c.energy)),
    bloating: avg(thisWeekCheckins.map(c => c.bloating)),
    stress: avg(thisWeekCheckins.filter(c => c.stress !== null).map(c => c.stress!)),
    sleep: avg(thisWeekCheckins.filter(c => c.sleep_hours !== null).map(c => c.sleep_hours!)),
    count: thisWeekCheckins.length,
  }), [thisWeekCheckins]);

  const lastWeekAvg = useMemo(() => ({
    mood: avg(lastWeekCheckins.map(c => c.mood)),
    energy: avg(lastWeekCheckins.map(c => c.energy)),
    bloating: avg(lastWeekCheckins.map(c => c.bloating)),
    stress: avg(lastWeekCheckins.filter(c => c.stress !== null).map(c => c.stress!)),
    sleep: avg(lastWeekCheckins.filter(c => c.sleep_hours !== null).map(c => c.sleep_hours!)),
  }), [lastWeekCheckins]);

  // Weight trend
  const latestWeight = weightLogs.length > 0 ? weightLogs[0].weight : profile?.weight || null;
  const previousWeight = weightLogs.length > 1 ? weightLogs[weightLogs.length > 7 ? 6 : weightLogs.length - 1].weight : null;
  const weightDiff = latestWeight && previousWeight ? latestWeight - previousWeight : null;

  // BMI
  const bmi = latestWeight && profile?.height
    ? Math.round((latestWeight / ((profile.height / 100) ** 2)) * 10) / 10
    : null;

  // Daily trend chart data (last 7 days)
  const dailyTrendData = useMemo(() => {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const day = subDays(now, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayCheckins = dailyCheckins.filter(c => c.created_at.startsWith(dayStr));
      last7.push({
        name: format(day, 'EEE', { locale: it }),
        energia: dayCheckins.length ? avg(dayCheckins.map(c => c.energy)) : null,
        umore: dayCheckins.length ? avg(dayCheckins.map(c => c.mood)) : null,
        gonfiore: dayCheckins.length ? avg(dayCheckins.map(c => c.bloating)) : null,
      });
    }
    return last7;
  }, [dailyCheckins]);

  const hasAnyData = dailyCheckins.length > 0 || weightLogs.length > 0;

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

  if (!hasAnyData) {
    return (
      <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-6">
        <AppHeader />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center pt-20">
          <motion.span className="text-6xl mb-6" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>📊</motion.span>
          <h1 className="font-display text-2xl text-foreground mb-3">Nessun dato ancora</h1>
          <p className="text-muted-foreground text-sm mb-8">Completa il tuo primo check-in giornaliero dalla Home per vedere il report.</p>
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate('/home')} className="px-8 py-4 rounded-2xl gradient-primary text-primary-foreground btn-text text-sm shadow-glow">
            VAI ALLA HOME
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
        <h1 className="font-display text-2xl text-foreground mb-1">Il tuo report</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Settimana del {format(weekStart, 'd MMM', { locale: it })} — {thisWeekAvg.count} check-in questa settimana
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([
            { key: 'report' as const, label: '📋 Report' },
            { key: 'trend' as const, label: '📈 Andamento' },
            { key: 'scoperte' as const, label: '🔍 Scoperte' },
            ...(fastingConfig.enabled || getFastingStats().totalSessions > 0 ? [{ key: 'digiuno' as const, label: '⏱️ Digiuno' }] : []),
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap
                ${activeTab === tab.key
                  ? 'gradient-primary text-primary-foreground shadow-glow'
                  : 'glass glass-border text-muted-foreground'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'report' && (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              
              {/* Body stats card */}
              <div className="p-5 rounded-2xl glass glass-border">
                <h3 className="font-display text-sm text-foreground mb-4">🏋️ Corpo</h3>
                <div className="grid grid-cols-2 gap-4">
                  {latestWeight && (
                    <div>
                      <p className="text-xs text-muted-foreground">Peso attuale</p>
                      <p className="text-2xl font-bold text-foreground">{latestWeight} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                      {weightDiff !== null && (
                        <p className={`text-xs font-medium ${weightDiff < 0 ? 'text-primary' : weightDiff > 0 ? 'text-secondary' : 'text-muted-foreground'}`}>
                          {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                        </p>
                      )}
                    </div>
                  )}
                  {bmi && (
                    <div>
                      <p className="text-xs text-muted-foreground">BMI</p>
                      <p className="text-2xl font-bold text-foreground">{bmi}</p>
                      <p className="text-xs text-muted-foreground">
                        {bmi < 18.5 ? 'Sottopeso' : bmi < 25 ? 'Normopeso' : bmi < 30 ? 'Sovrappeso' : 'Obesità'}
                      </p>
                    </div>
                  )}
                  {profile?.blood_pressure_systolic && profile?.blood_pressure_diastolic && (
                    <div>
                      <p className="text-xs text-muted-foreground">Pressione</p>
                      <p className="text-2xl font-bold text-foreground">
                        {profile.blood_pressure_systolic}<span className="text-sm font-normal text-muted-foreground">/{profile.blood_pressure_diastolic}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">mmHg</p>
                    </div>
                  )}
                  {profile?.current_streak !== null && profile?.current_streak !== undefined && profile.current_streak > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Streak</p>
                      <p className="text-2xl font-bold text-foreground">🔥 {profile.current_streak}</p>
                      <p className="text-xs text-muted-foreground">giorni</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly averages card */}
              {thisWeekAvg.count > 0 && (
                <div className="p-5 rounded-2xl glass glass-border">
                  <h3 className="font-display text-sm text-foreground mb-4">📊 Media settimanale</h3>
                  <div className="space-y-3">
                    <MetricRow label="Umore" icon="😊" current={thisWeekAvg.mood} previous={lastWeekAvg.mood} higherIsBetter />
                    <MetricRow label="Energia" icon="⚡" current={thisWeekAvg.energy} previous={lastWeekAvg.energy} higherIsBetter />
                    <MetricRow label="Gonfiore" icon="🫧" current={thisWeekAvg.bloating} previous={lastWeekAvg.bloating} higherIsBetter={false} />
                    {thisWeekAvg.stress !== null && (
                      <MetricRow label="Stress" icon="😤" current={thisWeekAvg.stress} previous={lastWeekAvg.stress} higherIsBetter={false} />
                    )}
                    {thisWeekAvg.sleep !== null && (
                      <MetricRow label="Sonno" icon="😴" current={thisWeekAvg.sleep} previous={lastWeekAvg.sleep} higherIsBetter suffix="h" />
                    )}
                  </div>
                </div>
              )}

              {/* Comparison vs last week */}
              {thisWeekAvg.count > 0 && lastWeekAvg.mood !== null && (
                <div className="p-5 rounded-2xl bg-accent glass-border">
                  <h3 className="font-display text-sm text-accent-foreground mb-3">📅 Questa settimana vs la scorsa</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <ComparisonBadge label="Umore" current={thisWeekAvg.mood!} previous={lastWeekAvg.mood!} higherIsBetter />
                    <ComparisonBadge label="Energia" current={thisWeekAvg.energy!} previous={lastWeekAvg.energy!} higherIsBetter />
                    <ComparisonBadge label="Gonfiore" current={thisWeekAvg.bloating!} previous={lastWeekAvg.bloating!} higherIsBetter={false} />
                  </div>
                </div>
              )}

              {/* Adjustments if any */}
              {adjustments.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs btn-text text-primary">🔧 ADATTAMENTI</p>
                  {adjustments.slice(0, 3).map((adj, i) => <AdjustmentCard key={i} adjustment={adj} />)}
                </div>
              )}

              {/* Most eaten foods */}
              {dailyCheckins.some(c => c.foods_eaten && c.foods_eaten.length > 0) && (
                <div className="p-5 rounded-2xl glass glass-border">
                  <h3 className="font-display text-sm text-foreground mb-3">🍽️ Cibi più frequenti</h3>
                  <TopFoods checkins={thisWeekCheckins.length > 0 ? thisWeekCheckins : dailyCheckins.slice(0, 30)} />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'trend' && (
            <motion.div key="trend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {/* 7-day daily trend */}
              <div className="p-5 rounded-2xl glass glass-border">
                <h3 className="font-display text-sm text-foreground mb-4">⚡ Energia & Umore — ultimi 7 giorni</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px', color: 'hsl(var(--foreground))' }} />
                    <Line type="monotone" dataKey="energia" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 4 }} connectNulls />
                    <Line type="monotone" dataKey="umore" stroke="hsl(var(--secondary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--secondary))', r: 4 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 justify-center">
                  <span className="text-xs text-primary">● Energia</span>
                  <span className="text-xs text-secondary">● Umore</span>
                </div>
              </div>

              {/* Bloating trend */}
              <div className="p-5 rounded-2xl glass glass-border">
                <h3 className="font-display text-sm text-foreground mb-4">🫧 Gonfiore — ultimi 7 giorni</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px', color: 'hsl(var(--foreground))' }} />
                    <Bar dataKey="gonfiore" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">Più basso = meglio</p>
              </div>

              {/* Weight over time */}
              {weightLogs.length > 1 && (
                <div className="p-5 rounded-2xl glass glass-border">
                  <h3 className="font-display text-sm text-foreground mb-4">⚖️ Peso nel tempo</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={[...weightLogs].reverse().map(w => ({
                      name: format(parseISO(w.logged_at), 'd/M', { locale: it }),
                      peso: w.weight,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                      <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px', color: 'hsl(var(--foreground))' }} formatter={(value: number) => [`${value} kg`, 'Peso']} />
                      <Line type="monotone" dataKey="peso" stroke="hsl(var(--foreground))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--foreground))', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Weekly history if available */}
              {weeklyData.length >= 2 && (
                <div className="p-5 rounded-2xl bg-accent glass-border">
                  <h3 className="font-display text-sm text-accent-foreground mb-3">Storico settimanale</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <ComparisonBadge label="Energia" current={weeklyData[weeklyData.length - 1].energy} previous={weeklyData[weeklyData.length - 2].energy} higherIsBetter />
                    <ComparisonBadge label="Gonfiore" current={weeklyData[weeklyData.length - 1].bloating} previous={weeklyData[weeklyData.length - 2].bloating} higherIsBetter={false} />
                    {weeklyData[weeklyData.length - 1].weight && weeklyData[weeklyData.length - 2].weight && (
                      <ComparisonBadge label="Peso" current={weeklyData[weeklyData.length - 1].weight!} previous={weeklyData[weeklyData.length - 2].weight!} higherIsBetter={false} suffix="kg" />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'scoperte' && (
            <motion.div key="scoperte" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
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
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-muted-foreground">
                      Basato su <span className="font-medium text-foreground">{analysis.dataPoints}</span> check-in
                    </p>
                    <span className={`text-xs font-medium ${confidenceColor(analysis.confidence)}`}>
                      Confidenza: {analysis.confidence}
                    </span>
                  </div>

                  {analysis.patterns.length > 0 && (
                    <>
                      <p className="text-[10px] btn-text text-primary mt-2 mb-1">🧠 PATTERN RILEVATI</p>
                      {analysis.patterns.map((pattern, i) => (
                        <PatternCard key={i} pattern={pattern} index={i} correlationBar={correlationBar} />
                      ))}
                    </>
                  )}

                  {analysis.foodFindings.length > 0 && (
                    <>
                      <p className="text-[10px] btn-text text-secondary mt-4 mb-1">🍽️ SENSIBILITÀ ALIMENTARI</p>
                      {analysis.foodFindings.map((finding, i) => (
                        <motion.div key={finding.food} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="p-5 rounded-2xl glass glass-border">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">{finding.icon}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-foreground">{finding.food}</h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-muted text-muted-foreground">{issueLabel(finding.issue)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{finding.description}</p>
                              {correlationBar(finding.correlation)}
                              <p className="text-[10px] text-muted-foreground/60 mt-1">Correlazione: {Math.round(finding.correlation * 100)}%</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  )}

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

// --- Sub-components ---

const MetricRow = ({ label, icon, current, previous, higherIsBetter, suffix }: {
  label: string; icon: string; current: number | null; previous: number | null; higherIsBetter: boolean; suffix?: string;
}) => {
  if (current === null) return null;
  const diff = previous !== null ? current - previous : null;
  const improved = diff !== null ? (higherIsBetter ? diff > 0 : diff < 0) : null;
  const same = diff !== null && Math.abs(diff) < 0.1;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">
          {current.toFixed(1)}{suffix ? ` ${suffix}` : '/5'}
        </span>
        {diff !== null && !same && (
          <span className={`text-xs font-medium ${improved ? 'text-primary' : 'text-secondary'}`}>
            {improved ? '↑' : '↓'}
          </span>
        )}
      </div>
    </div>
  );
};

const TopFoods = ({ checkins }: { checkins: DailyCheckin[] }) => {
  const foodCounts: Record<string, number> = {};
  checkins.forEach(c => {
    (c.foods_eaten || []).forEach(f => {
      foodCounts[f] = (foodCounts[f] || 0) + 1;
    });
  });
  const sorted = Object.entries(foodCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (sorted.length === 0) return <p className="text-xs text-muted-foreground">Nessun cibo registrato</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map(([food, count]) => (
        <span key={food} className="px-3 py-1.5 rounded-xl bg-muted text-xs text-foreground">
          {food} <span className="text-muted-foreground">×{count}</span>
        </span>
      ))}
    </div>
  );
};

const ComparisonBadge = ({ label, current, previous, higherIsBetter, suffix }: {
  label: string; current: number; previous: number; higherIsBetter: boolean; suffix?: string;
}) => {
  const diff = current - previous;
  const improved = higherIsBetter ? diff > 0 : diff < 0;
  const same = Math.abs(diff) < 0.1;
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-semibold text-foreground">{suffix ? `${current} ${suffix}` : typeof current === 'number' && current % 1 !== 0 ? current.toFixed(1) : current}{!suffix && '/5'}</p>
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
          <h3 className="font-display text-sm text-foreground mt-4 mb-2">Ultime sessioni</h3>
          {stats.sessions.slice(0, 7).map((s: any) => {
            const date = new Date(s.started_at);
            const hours = s.ended_at ? Math.round((new Date(s.ended_at).getTime() - date.getTime()) / 3600000 * 10) / 10 : null;
            return (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl glass glass-border">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{s.completed ? '✅' : '⚪'}</span>
                  <div>
                    <p className="text-sm text-foreground">{date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    <p className="text-xs text-muted-foreground">{s.protocol}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">{hours ? `${hours}h` : 'In corso...'}</span>
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
    sleep_hunger: '😴→🍽️', sleep_energy: '😴→⚡', stress_eating: '😤→🍰',
    food_combo: '🍞+🍰', meal_timing: '⏰', stress_bloating: '😤→🫧',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="p-5 rounded-2xl glass glass-border">
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className={`p-4 rounded-2xl glass ${priorityStyle[suggestion.priority]}`}>
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
