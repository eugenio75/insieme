import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAppStore } from '@/store/useAppStore';

type StoreProfile = {
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

type ProfilePatch = Partial<Omit<StoreProfile, 'onboarded'>>;

type CachedProfile = {
  userId: string;
  profile: StoreProfile;
};

const PROFILE_CACHE_KEY = 'insieme_profile_cache_v2';

const mapDbProfileToStore = (data: any): StoreProfile => ({
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

const mapStoreToDb = (state: Omit<StoreProfile, 'onboarded'>) => ({
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
});

const mapPatchToDb = (patch: ProfilePatch) => {
  const payload: Record<string, unknown> = {};

  if ('name' in patch) payload.name = patch.name || '';
  if ('objective' in patch) payload.objective = patch.objective || '';
  if ('mode' in patch) payload.mode = patch.mode || 'solo';
  if ('pace' in patch) payload.pace = patch.pace || '';
  if ('activity' in patch) payload.activity = patch.activity || '';
  if ('difficulty' in patch) payload.difficulty = patch.difficulty || '';
  if ('intolerances' in patch) payload.intolerances = patch.intolerances || [];
  if ('customIntolerances' in patch) payload.custom_intolerances = patch.customIntolerances || [];
  if ('age' in patch) payload.age = patch.age || '';
  if ('sex' in patch) payload.sex = patch.sex || '';
  if ('partnerName' in patch) payload.partner_name = patch.partnerName || '';
  if ('weight' in patch) payload.weight = patch.weight ? parseFloat(patch.weight) : null;
  if ('workType' in patch) payload.work_type = patch.workType || '';

  return payload;
};

const writeProfileCache = (userId: string, profile: StoreProfile) => {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ userId, profile }));
  } catch {
    // ignore cache errors
  }
};

const readProfileCache = (userId: string): StoreProfile | null => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedProfile;
    if (!parsed?.userId || parsed.userId !== userId || !parsed?.profile) return null;
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

      const cached = readProfileCache(user.id);
      if (cached) {
        setUser(cached);
        setTimeout(() => refreshWeeklyHabits(), 0);
      }

      let loadedFromBackend = false;

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
          loadedFromBackend = true;
          break;
        }

        const isRetryable = !!error && /timeout|fetch|network|gateway|upstream/i.test(error.message || '');
        if (!isRetryable || attempt === 2) break;
        await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }

      if (!cancelled) {
        setProfileLoading(false);
        setProfileError(!loadedFromBackend && !cached);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, setUser, refreshWeeklyHabits, reloadKey]);

  const saveProfile = useCallback(async (patch?: ProfilePatch) => {
    if (!user) return;

    const state = useAppStore.getState().user;
    const fullProfile: StoreProfile = {
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
    };

    const dbPayload = patch
      ? mapPatchToDb(patch)
      : mapStoreToDb({
          name: fullProfile.name,
          objective: fullProfile.objective,
          mode: fullProfile.mode,
          pace: fullProfile.pace,
          activity: fullProfile.activity,
          difficulty: fullProfile.difficulty,
          intolerances: fullProfile.intolerances,
          customIntolerances: fullProfile.customIntolerances,
          age: fullProfile.age,
          sex: fullProfile.sex,
          partnerName: fullProfile.partnerName,
          weight: fullProfile.weight,
          workType: fullProfile.workType,
        });

    if (Object.keys(dbPayload).length === 0) return;

    const { error } = await supabase
      .from('profiles')
      .update(dbPayload as any)
      .eq('user_id', user.id);

    if (!error) {
      writeProfileCache(user.id, fullProfile);
      setProfileError(false);
    }
  }, [user]);

  return { saveProfile, profileLoading, profileError, retryProfileLoad };
};