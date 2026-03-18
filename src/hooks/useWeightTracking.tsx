import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';

export interface WeightEntry {
  id: string;
  weight: number;
  logged_at: string;
}

export interface WeightTrend {
  currentWeight: number | null;
  startWeight: number | null;
  totalChange: number | null;
  lastTwoWeeksChange: number | null;
  trend: 'losing' | 'gaining' | 'stable' | 'unknown';
  entries: WeightEntry[];
}

export const useWeightTracking = () => {
  const { user: authUser } = useAuth();
  const { setUser } = useAppStore();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    if (!authUser) return;
    const { data } = await supabase
      .from('weight_logs')
      .select('id, weight, logged_at')
      .eq('user_id', authUser.id)
      .order('logged_at', { ascending: false })
      .limit(90); // ~3 months of daily logs

    if (data) {
      setEntries(data.map(d => ({ id: d.id, weight: Number(d.weight), logged_at: d.logged_at })));
    }
    setLoading(false);
  }, [authUser]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const logWeight = async (weight: number) => {
    if (!authUser) return;

    // Check if already logged today
    const today = new Date().toISOString().split('T')[0];
    const existingToday = entries.find(e => e.logged_at.split('T')[0] === today);

    if (existingToday) {
      // Update today's entry
      await supabase
        .from('weight_logs')
        .update({ weight } as any)
        .eq('id', existingToday.id);
    } else {
      await supabase
        .from('weight_logs')
        .insert({ user_id: authUser.id, weight } as any);
    }

    // Also update profile weight
    await supabase
      .from('profiles')
      .update({ weight } as any)
      .eq('user_id', authUser.id);
    
    setUser({ weight: String(weight) });
    await loadEntries();
    toast.success('Peso registrato! ⚖️');
  };

  const deleteEntry = async (id: string) => {
    await supabase.from('weight_logs').delete().eq('id', id);
    await loadEntries();
  };

  const getTrend = (): WeightTrend => {
    if (entries.length === 0) {
      return { currentWeight: null, startWeight: null, totalChange: null, lastTwoWeeksChange: null, trend: 'unknown', entries };
    }

    const sorted = [...entries].sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
    const currentWeight = sorted[sorted.length - 1].weight;
    const startWeight = sorted[0].weight;
    const totalChange = currentWeight - startWeight;

    // Last 2 weeks change
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const olderEntries = sorted.filter(e => new Date(e.logged_at) <= twoWeeksAgo);
    const refWeight = olderEntries.length > 0 ? olderEntries[olderEntries.length - 1].weight : null;
    const lastTwoWeeksChange = refWeight !== null ? currentWeight - refWeight : null;

    let trend: WeightTrend['trend'] = 'unknown';
    if (lastTwoWeeksChange !== null) {
      if (lastTwoWeeksChange < -0.3) trend = 'losing';
      else if (lastTwoWeeksChange > 0.3) trend = 'gaining';
      else trend = 'stable';
    } else if (entries.length >= 2) {
      const diff = currentWeight - sorted[sorted.length - 2].weight;
      if (diff < -0.3) trend = 'losing';
      else if (diff > 0.3) trend = 'gaining';
      else trend = 'stable';
    }

    return { currentWeight, startWeight, totalChange, lastTwoWeeksChange, trend, entries: sorted };
  };

  return { entries, loading, logWeight, deleteEntry, getTrend };
};
