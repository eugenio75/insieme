import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAppStore } from '@/store/useAppStore';

export const useProfile = () => {
  const { user } = useAuth();
  const { setUser, refreshWeeklyHabits } = useAppStore();
  const [profileLoading, setProfileLoading] = useState(true);

  // Load profile from DB on auth
  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    const loadProfile = async () => {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setUser({
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
          weight: (data as any).weight ? String((data as any).weight) : '',
          workType: (data as any).work_type || '',
          bloodPressureSystolic: (data as any).blood_pressure_systolic ? String((data as any).blood_pressure_systolic) : '',
          bloodPressureDiastolic: (data as any).blood_pressure_diastolic ? String((data as any).blood_pressure_diastolic) : '',
          onboarded: !!(data.objective && data.name),
        });
        setTimeout(() => refreshWeeklyHabits(), 0);
      }
      setProfileLoading(false);
    };

    loadProfile();
  }, [user, setUser]);

  // Save profile to DB
  const saveProfile = async () => {
    if (!user) return;
    const state = useAppStore.getState().user;

    await supabase
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
  };

  return { saveProfile, profileLoading };
};
