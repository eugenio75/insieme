import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FastingSession {
  id: string;
  started_at: string;
  target_hours: number;
  ended_at: string | null;
  completed: boolean;
  protocol: string;
}

export interface FastingConfig {
  enabled: boolean;
  protocol: string;
  startHour: number;
  fastingHours: number;
}

export interface FastingStatus {
  isActive: boolean;
  isFasting: boolean;
  currentSession: FastingSession | null;
  elapsedMinutes: number;
  remainingMinutes: number;
  targetMinutes: number;
  eatingWindowStart: number;
  eatingWindowEnd: number;
  progress: number;
}

const PROTOCOLS: Record<string, { fasting: number; eating: number }> = {
  '16:8': { fasting: 16, eating: 8 },
  '18:6': { fasting: 18, eating: 6 },
  '20:4': { fasting: 20, eating: 4 },
  'custom': { fasting: 16, eating: 8 },
};

export const getProtocolOptions = () => [
  { value: '16:8', label: '16:8', desc: '16h digiuno, 8h alimentazione' },
  { value: '18:6', label: '18:6', desc: '18h digiuno, 6h alimentazione' },
  { value: '20:4', label: '20:4', desc: '20h digiuno, 4h alimentazione' },
  { value: 'custom', label: 'Personalizzato', desc: 'Imposta le tue ore' },
];

export const useFasting = () => {
  const { user: authUser } = useAuth();
  const [config, setConfig] = useState<FastingConfig>({
    enabled: false,
    protocol: '16:8',
    startHour: 20,
    fastingHours: 16,
  });
  const [activeSession, setActiveSession] = useState<FastingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<FastingSession[]>([]);

  // Load config from profile
  useEffect(() => {
    if (!authUser) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('fasting_enabled, fasting_protocol, fasting_start_hour, fasting_hours')
        .eq('user_id', authUser.id)
        .single();
      if (data) {
        setConfig({
          enabled: (data as any).fasting_enabled ?? false,
          protocol: (data as any).fasting_protocol ?? '16:8',
          startHour: (data as any).fasting_start_hour ?? 20,
          fastingHours: (data as any).fasting_hours ?? 16,
        });
      }
      // Load active session (started today, not ended)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data: sessionData } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', authUser.id)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1);
      if (sessionData && sessionData.length > 0) {
        setActiveSession(sessionData[0] as any);
      }
      // Load all sessions for stats
      const { data: allSessions } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('started_at', { ascending: false })
        .limit(60);
      if (allSessions) setSessions(allSessions as any);
      setLoading(false);
    };
    load();
  }, [authUser]);

  const saveConfig = useCallback(async (newConfig: Partial<FastingConfig>) => {
    if (!authUser) return;
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    await supabase
      .from('profiles')
      .update({
        fasting_enabled: updated.enabled,
        fasting_protocol: updated.protocol,
        fasting_start_hour: updated.startHour,
        fasting_hours: updated.fastingHours,
      } as any)
      .eq('user_id', authUser.id);
  }, [authUser, config]);

  const startSession = useCallback(async () => {
    if (!authUser) return;
    const { data } = await supabase
      .from('fasting_sessions')
      .insert({
        user_id: authUser.id,
        target_hours: config.fastingHours,
        protocol: config.protocol,
      } as any)
      .select()
      .single();
    if (data) setActiveSession(data as any);
  }, [authUser, config]);

  const endSession = useCallback(async (forcedCompleted?: boolean) => {
    if (!authUser || !activeSession) return;

    const endedAt = new Date();
    const startedAt = new Date(activeSession.started_at);
    const elapsedHours = (endedAt.getTime() - startedAt.getTime()) / 3600000;
    const meetsTarget = elapsedHours >= activeSession.target_hours;
    const completed = typeof forcedCompleted === 'boolean' ? forcedCompleted : meetsTarget;

    await supabase
      .from('fasting_sessions')
      .update({ ended_at: endedAt.toISOString(), completed } as any)
      .eq('id', activeSession.id);
    setActiveSession(null);
    // Refresh sessions
    const { data } = await supabase
      .from('fasting_sessions')
      .select('*')
      .eq('user_id', authUser.id)
      .order('started_at', { ascending: false })
      .limit(60);
    if (data) setSessions(data as any);
  }, [authUser, activeSession]);

  const getStatus = useCallback((): FastingStatus => {
    const eatingHours = 24 - config.fastingHours;
    const eatingStart = (config.startHour + config.fastingHours) % 24;
    const eatingEnd = config.startHour; // eating ends when fasting starts

    if (!activeSession) {
      return {
        isActive: false,
        isFasting: false,
        currentSession: null,
        elapsedMinutes: 0,
        remainingMinutes: 0,
        targetMinutes: config.fastingHours * 60,
        eatingWindowStart: eatingStart,
        eatingWindowEnd: eatingEnd,
        progress: 0,
      };
    }

    // Determine current phase based on clock time relative to config
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const fastingStartMin = config.startHour * 60;
    const fastingDurationMin = config.fastingHours * 60;
    const eatingDurationMin = eatingHours * 60;

    // Minutes since fasting start (handles midnight wrap)
    let minSinceFastingStart = currentMinutes - fastingStartMin;
    if (minSinceFastingStart < 0) minSinceFastingStart += 1440;

    let inFasting: boolean;
    let remainingMin: number;
    let totalPhaseMin: number;
    let elapsedMin: number;

    if (minSinceFastingStart < fastingDurationMin) {
      // Currently in fasting phase
      inFasting = true;
      elapsedMin = minSinceFastingStart;
      remainingMin = fastingDurationMin - minSinceFastingStart;
      totalPhaseMin = fastingDurationMin;
    } else {
      // Currently in eating phase
      inFasting = false;
      const minSinceEatingStart = minSinceFastingStart - fastingDurationMin;
      elapsedMin = minSinceEatingStart;
      remainingMin = eatingDurationMin - minSinceEatingStart;
      totalPhaseMin = eatingDurationMin;
    }

    const progress = Math.min(1, elapsedMin / totalPhaseMin);

    return {
      isActive: true,
      isFasting: inFasting,
      currentSession: activeSession,
      elapsedMinutes: elapsedMin,
      remainingMinutes: Math.max(0, remainingMin),
      targetMinutes: totalPhaseMin,
      eatingWindowStart: eatingStart,
      eatingWindowEnd: eatingEnd,
      progress,
    };
  }, [activeSession, config]);

  // Stats for report
  const getStats = useCallback(() => {
    const completed = sessions.filter(s => s.completed);
    const total = sessions.length;
    const completionRate = total > 0 ? completed.length / total : 0;
    
    const avgHours = completed.length > 0
      ? completed.reduce((sum, s) => {
          const start = new Date(s.started_at).getTime();
          const end = new Date(s.ended_at!).getTime();
          return sum + (end - start) / 3600000;
        }, 0) / completed.length
      : 0;

    // Streak — group completed sessions by completion date (ended_at), then count consecutive days
    let streak = 0;
    const completedDates = new Set(
      completed.map(s => {
        const d = new Date(s.ended_at || s.started_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Start from today and go backwards
    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(today.getTime() - i * 86400000);
      if (completedDates.has(checkDate.getTime())) {
        streak++;
      } else {
        break;
      }
    }

    return {
      totalSessions: total,
      completedSessions: completed.length,
      completionRate,
      avgFastingHours: Math.round(avgHours * 10) / 10,
      currentStreak: streak,
      sessions,
    };
  }, [sessions]);

  return {
    config,
    saveConfig,
    activeSession,
    startSession,
    endSession,
    getStatus,
    getStats,
    loading,
  };
};
