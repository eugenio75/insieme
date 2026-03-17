import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAppStore } from '@/store/useAppStore';

const PROFILE_CACHE_KEY = 'insieme_profile_cache_v1';

type CachedProfile = {
  userId: string;
  profile: {
    name: string;
    objective: string;
    mode: 'solo' | 'together';
    pace: string;
    activity: string;
    difficulty: string;
    intolerances: string[];
    customIntolerances: string[];
    age: string;
    sex: string;
    partnerName: string;
    weight: string;
    workType: string;
    onboarded: boolean;
  };
};

const mapDbProfileToStore = (data: any) => ({
  name: data.name || '',
  objective: data.objective || '',
  mode: (data.mode as 'solo' | 'together') || 'solo',
  pace: data.pace || '',
  activity: data.activity || '',
  difficulty: data.difficulty || '',
  intolerances: data.intolerances || [],
  customIntolerances: data.custom_intolerances || [],
  age: data.age || '',
  sex: data.sex || '',
  partnerName: data.partner_name || '',
  weight: data.weight ? String(data.weight) : '',
  workType: data.work_type || '',
  onboarded: !!(data.objective && data.name),
});

const writeProfileCache = (userId: string, profile: CachedProfile['profile']) => {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ userId, profile }));
  } catch {
    // ignore cache write errors
  }
};

const readProfileCache = (userId: string): CachedProfile['profile'] | null => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedProfile;
    if (parsed?.userId !== userId || !parsed?.profile) return null;
    return parsed.profile;
  } catch {
    return null;
  }
};

export const useProfile = () => {
  const { user } = useAuth();
  const { setUser, refreshWeeklyHabits } = useAppStore();
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retryProfileLoad = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  // Load profile from DB on auth (with retry + cache fallback)
  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      setProfileError(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError(false);

      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (cancelled) return;

        if (data && !error) {
          const mapped = mapDbProfileToStore(data);
          setUser(mapped);
          writeProfileCache(user.id, mapped);
          setTimeout(() => refreshWeeklyHabits(), 0);
          setProfileLoading(false);
          setProfileError(false);
          return;
        }

        const isNetworkOrTimeout =
          !!error && /timeout|fetch|network|gateway|upstream/i.test(error.message || '');

        if (!isNetworkOrTimeout || attempt === 2) break;
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      }

      const cached = readProfileCache(user.id);
      if (cached) {
        setUser(cached);
        setTimeout(() => refreshWeeklyHabits(), 0);
      }

      setProfileLoading(false);
      setProfileError(true);
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, setUser, refreshWeeklyHabits, reloadKey]);

  // Save profile to DB
  const saveProfile = async () => {
    if (!user) return;
    const state = useAppStore.getState().user;

    const { error } = await supabase
      .from('profiles')
      .update({
        name: state.name,
        objective: state.objective,
        mode: state.mode,
        pace: state.pace,
        activity: state.activity,
        difficulty: state.difficulty,
        intolerances: state.intolerances,
        custom_intolerances: state.customIntolerances,
        age: state.age,
        sex: state.sex,
        partner_name: state.partnerName || '',
        weight: state.weight ? parseFloat(state.weight) : null,
        work_type: state.workType || '',
      } as any)
      .eq('user_id', user.id);

    if (!error) {
      writeProfileCache(user.id, {
        name: state.name,
        objective: state.objective,
        mode: state.mode,
        pace: state.pace,
        activity: state.activity,
        difficulty: state.difficulty,
        intolerances: state.intolerances,
        customIntolerances: state.customIntolerances,
        age: state.age || '',
        sex: state.sex || '',
        partnerName: state.partnerName || '',
        weight: state.weight || '',
        workType: state.workType || '',
        onboarded: !!(state.objective && state.name),
      });
    }
  };

  return { saveProfile, profileLoading, profileError, retryProfileLoad };
};
