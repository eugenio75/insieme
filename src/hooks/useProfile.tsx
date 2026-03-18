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
          height: (data as any).height ? String((data as any).height) : '',
          workType: (data as any).work_type || '',
          bloodPressureSystolic: (data as any).blood_pressure_systolic ? String((data as any).blood_pressure_systolic) : '',
          bloodPressureDiastolic: (data as any).blood_pressure_diastolic ? String((data as any).blood_pressure_diastolic) : '',
          bodyFrame: (data as any).body_frame || '',
          region: (data as any).region || '',
          province: (data as any).province || '',
          city: (data as any).city || '',
          onboarded: !!(data.objective && data.name),
        });
        // Load streak from DB
        if (data.current_streak != null) {
          useAppStore.setState({
            currentStreak: data.current_streak,
            lastCheckInDate: data.last_check_in_date || null,
          });
        }
        // Load today's habit completions from DB and merge with localStorage
        const today = new Date().toISOString().split('T')[0];
        const { data: dbHabits } = await supabase
          .from('habit_completions')
          .select('habit_id')
          .eq('user_id', user.id)
          .eq('completed_at', today);
        if (dbHabits && dbHabits.length > 0) {
          const dbIds = dbHabits.map((h: any) => h.habit_id);
          const existing = JSON.parse(localStorage.getItem('completed_habits') || '{}');
          const existingIds: string[] = existing.date === today ? (existing.ids || []) : [];
          const merged = [...new Set([...existingIds, ...dbIds])];
          localStorage.setItem('completed_habits', JSON.stringify({ date: today, ids: merged }));
        }
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
        height: state.height ? parseFloat(state.height) : null,
        work_type: state.workType || '',
        blood_pressure_systolic: state.bloodPressureSystolic ? parseInt(state.bloodPressureSystolic) : null,
        blood_pressure_diastolic: state.bloodPressureDiastolic ? parseInt(state.bloodPressureDiastolic) : null,
        body_frame: state.bodyFrame || null,
        region: state.region || null,
        province: state.province || null,
        city: state.city || null,
      } as any)
      .eq('user_id', user.id);
  };

  return { saveProfile, profileLoading };
};
