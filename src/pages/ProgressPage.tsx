import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { analyzeProgress, Adjustment } from '@/data/adaptationLogic';
import BottomNav from '@/components/BottomNav';
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
  const [activeTab, setActiveTab] = useState<'charts' | 'adjustments'>('charts');
  const { user: authUser } = useAuth();
  const { user } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }

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

  const chartData = data.map((d) => ({
    name: `S${d.week_number}`,
    peso: d.weight,
    gonfiore: d.bloating,
    energia: d.energy,
  }));

  const hasWeight = data.some((d) => d.weight !== null);
  const appliedAdjustments = adjustments.filter((a) => a.applied);
  const otherAdjustments = adjustments.filter((a) => !a.applied);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto px-6 pt-10 flex items-center justify-center">
        <p className="text-muted-foreground">Caricamento...</p>
        <BottomNav />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto px-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center pt-20"
        >
          <span className="text-6xl mb-6">📊</span>
          <h1 className="font-display text-2xl font-semibold text-foreground mb-3">
            Nessun dato ancora
          </h1>
          <p className="text-muted-foreground mb-8">
            Completa il tuo primo check-in settimanale per vedere i risultati.
          </p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/weekly-checkin')}
            className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground btn-text text-sm shadow-soft"
          >
            PRIMO CHECK-IN SETTIMANALE
          </motion.button>
        </motion.div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto px-6 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-2xl font-semibold text-foreground mb-1">
          I tuoi risultati
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          {data.length} {data.length === 1 ? 'settimana' : 'settimane'} di dati
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all duration-300
              ${activeTab === 'charts'
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'bg-card border border-border text-muted-foreground'
              }`}
          >
            📈 Andamento
          </button>
          <button
            onClick={() => setActiveTab('adjustments')}
            className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-all duration-300 relative
              ${activeTab === 'adjustments'
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'bg-card border border-border text-muted-foreground'
              }`}
          >
            🔧 Adattamenti
            {appliedAdjustments.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center">
                {appliedAdjustments.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Energy chart */}
            <div className="p-5 rounded-[24px] bg-card border border-border shadow-card">
              <h3 className="font-display text-sm font-medium text-foreground mb-4">
                ⚡ Energia nel tempo
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="energia"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bloating chart */}
            <div className="p-5 rounded-[24px] bg-card border border-border shadow-card">
              <h3 className="font-display text-sm font-medium text-foreground mb-4">
                🫧 Gonfiore nel tempo
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gonfiore"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2.5}
                    dot={{ fill: 'hsl(var(--secondary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2">Più basso = meglio</p>
            </div>

            {/* Weight chart (only if data exists) */}
            {hasWeight && (
              <div className="p-5 rounded-[24px] bg-card border border-border shadow-card">
                <h3 className="font-display text-sm font-medium text-foreground mb-4">
                  ⚖️ Peso nel tempo
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData.filter((d) => d.peso !== null)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value} kg`, 'Peso']}
                    />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke="hsl(var(--foreground))"
                      strokeWidth={2.5}
                      dot={{ fill: 'hsl(var(--foreground))', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Quick summary */}
            {data.length >= 2 && (
              <div className="p-5 rounded-[24px] bg-accent border border-transparent">
                <h3 className="font-display text-sm font-medium text-accent-foreground mb-3">
                  Questa settimana vs la scorsa
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <ComparisonBadge
                    label="Energia"
                    current={data[data.length - 1].energy}
                    previous={data[data.length - 2].energy}
                    higherIsBetter
                  />
                  <ComparisonBadge
                    label="Gonfiore"
                    current={data[data.length - 1].bloating}
                    previous={data[data.length - 2].bloating}
                    higherIsBetter={false}
                  />
                  {hasWeight && data[data.length - 1].weight && data[data.length - 2].weight && (
                    <ComparisonBadge
                      label="Peso"
                      current={data[data.length - 1].weight!}
                      previous={data[data.length - 2].weight!}
                      higherIsBetter={false}
                      suffix="kg"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'adjustments' && (
          <div className="space-y-4">
            {adjustments.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">📋</span>
                <p className="text-muted-foreground">
                  Servono almeno 2 settimane di dati per generare suggerimenti.
                </p>
              </div>
            ) : (
              <>
                {appliedAdjustments.length > 0 && (
                  <>
                    <p className="text-xs btn-text text-primary mb-2">
                      🔄 MODIFICHE APPLICATE AUTOMATICAMENTE
                    </p>
                    {appliedAdjustments.map((adj, i) => (
                      <AdjustmentCard key={i} adjustment={adj} />
                    ))}
                  </>
                )}

                {otherAdjustments.length > 0 && (
                  <>
                    <p className="text-xs btn-text text-muted-foreground mb-2 mt-6">
                      💡 OSSERVAZIONI
                    </p>
                    {otherAdjustments.map((adj, i) => (
                      <AdjustmentCard key={i} adjustment={adj} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </motion.div>

      <BottomNav />
    </div>
  );
};

const ComparisonBadge = ({
  label,
  current,
  previous,
  higherIsBetter,
  suffix,
}: {
  label: string;
  current: number;
  previous: number;
  higherIsBetter: boolean;
  suffix?: string;
}) => {
  const diff = current - previous;
  const improved = higherIsBetter ? diff > 0 : diff < 0;
  const same = diff === 0;

  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-semibold text-foreground">
        {suffix ? `${current} ${suffix}` : current}/5
      </p>
      <p className={`text-xs font-medium ${same ? 'text-muted-foreground' : improved ? 'text-primary' : 'text-secondary'}`}>
        {same ? '=' : improved ? '↑ meglio' : '↓ peggio'}
      </p>
    </div>
  );
};

const AdjustmentCard = ({ adjustment }: { adjustment: Adjustment }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-5 rounded-[24px] border shadow-card ${
      adjustment.applied
        ? 'bg-accent border-primary/20'
        : 'bg-card border-border'
    }`}
  >
    <div className="flex items-start gap-3">
      <span className="text-2xl">{adjustment.icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{adjustment.title}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {adjustment.description}
        </p>
        {adjustment.applied && (
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            Applicato al tuo percorso
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

export default ProgressPage;
