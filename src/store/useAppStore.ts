import { create } from 'zustand';
import { getWeeklyHabitsForUser } from '@/data/weeklyHabits';

interface UserProfile {
  name: string;
  objective: string;
  mode: 'solo' | 'together';
  pace: string;
  activity: string;
  difficulty: string;
  onboarded: boolean;
  partnerName?: string;
  intolerances: string[];
  customIntolerances: string[];
  age?: string;
  sex?: string;
  weight?: string;
  height?: string;
  workType?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
  bodyFrame?: string;
  region?: string;
  province?: string;
  city?: string;
}

interface Habit {
  id: string;
  title: string;
  completed: boolean;
  icon: string;
}

interface CheckInData {
  date: string;
  mood: number;
  energy: number;
  bloating: number;
  habitsCompleted: string[];
}

interface StreakMilestone {
  days: number;
  message: string;
  icon: string;
}

interface AppState {
  user: UserProfile;
  weeklyHabits: Habit[];
  weekLabel: string;
  weekNumber: number;
  totalWeeks: number;
  checkIns: CheckInData[];
  todayCheckedIn: boolean;
  currentStreak: number;
  lastCheckInDate: string | null;
  badges: { from: string; type: string; date: string }[];
  setUser: (u: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  toggleHabit: (id: string) => void;
  addCheckIn: (data: CheckInData) => void;
  setWeeklyHabits: (habits: Habit[]) => void;
  refreshWeeklyHabits: (signals?: { avgMood?: number; avgEnergy?: number; avgBloating?: number }) => void;
  addBadge: (badge: { from: string; type: string; date: string }) => void;
  toggleIntolerance: (intolerance: string) => void;
  addCustomIntolerance: (intolerance: string) => void;
  removeCustomIntolerance: (intolerance: string) => void;
  getStreakMilestone: () => StreakMilestone | null;
}

const getInitialHabits = (objective: string, startDate?: string, signals?: { avgMood?: number; avgEnergy?: number; avgBloating?: number }) => {
  const { weekLevel, weekNumber, totalWeeks } = getWeeklyHabitsForUser(objective, startDate, signals);
  return {
    habits: weekLevel.habits.map(h => ({ ...h, completed: false })),
    weekLabel: weekLevel.label,
    weekNumber,
    totalWeeks,
  };
};

const streakMilestones: StreakMilestone[] = [
  { days: 3, message: 'Stai creando un\'abitudine 🌱', icon: '🌱' },
  { days: 7, message: 'Una settimana intera! Sei fantastica ✨', icon: '✨' },
  { days: 14, message: 'Due settimane di costanza. Che forza! 💪', icon: '💪' },
  { days: 21, message: '21 giorni: è ufficialmente un\'abitudine! 🦋', icon: '🦋' },
  { days: 30, message: 'Un mese intero. Incredibile! 🌟', icon: '🌟' },
  { days: 60, message: '60 giorni di cura di te. Sei un esempio 🌺', icon: '🌺' },
  { days: 90, message: '90 giorni! Hai trasformato la tua vita 👑', icon: '👑' },
];

const getDateStr = (d: Date) => d.toISOString().split('T')[0];

const COMPLETED_HABITS_KEY = 'completed_habits';

const getSavedCompletedHabits = (): string[] => {
  try {
    const raw = localStorage.getItem(COMPLETED_HABITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed.date === getDateStr(new Date())) {
      return parsed.ids || [];
    }
    localStorage.removeItem(COMPLETED_HABITS_KEY);
    return [];
  } catch { return []; }
};

const saveCompletedHabits = (ids: string[]) => {
  localStorage.setItem(COMPLETED_HABITS_KEY, JSON.stringify({ date: getDateStr(new Date()), ids }));
};

const calcStreak = (lastDate: string | null, currentStreak: number): number => {
  if (!lastDate) return 1;
  const today = getDateStr(new Date());
  const yesterday = getDateStr(new Date(Date.now() - 86400000));
  if (lastDate === today) return currentStreak; // already checked in today
  if (lastDate === yesterday) return currentStreak + 1; // consecutive
  return 1; // streak broken, restart
};

export const useAppStore = create<AppState>((set, get) => {
  const initial = getInitialHabits('');
  return {
    user: {
      name: '',
      objective: '',
      mode: 'solo',
      pace: '',
      activity: '',
      difficulty: '',
      onboarded: false,
      intolerances: [],
      customIntolerances: [],
    },
    weeklyHabits: initial.habits,
    weekLabel: initial.weekLabel,
    weekNumber: initial.weekNumber,
    totalWeeks: initial.totalWeeks,
    checkIns: [],
    todayCheckedIn: false,
    currentStreak: 0,
    lastCheckInDate: null,
    badges: [],
    setUser: (u) => set((s) => ({ user: { ...s.user, ...u } })),
    completeOnboarding: () => {
      set((s) => ({ user: { ...s.user, onboarded: true } }));
      get().refreshWeeklyHabits();
    },
    toggleHabit: (id) =>
      set((s) => {
        const updated = s.weeklyHabits.map((h) =>
          h.id === id ? { ...h, completed: !h.completed } : h
        );
        saveCompletedHabits(updated.filter(h => h.completed).map(h => h.id));
        return { weeklyHabits: updated };
      }),
    addCheckIn: (data) =>
      set((s) => {
        const newStreak = calcStreak(s.lastCheckInDate, s.currentStreak);
        return {
          checkIns: [...s.checkIns, data],
          todayCheckedIn: true,
          currentStreak: newStreak,
          lastCheckInDate: getDateStr(new Date()),
        };
      }),
    getStreakMilestone: () => {
      const { currentStreak } = get();
      const milestone = [...streakMilestones].reverse().find(m => currentStreak >= m.days);
      return milestone || null;
    },
    setWeeklyHabits: (habits) => set({ weeklyHabits: habits }),
    refreshWeeklyHabits: (signals) => {
      const { user } = get();
      const startDate = undefined;
      const result = getInitialHabits(user.objective, startDate, signals);
      const savedIds = getSavedCompletedHabits();
      set({
        weeklyHabits: result.habits.map(h => ({
          ...h,
          completed: savedIds.includes(h.id),
        })),
        weekLabel: result.weekLabel,
        weekNumber: result.weekNumber,
        totalWeeks: result.totalWeeks,
      });
    },
    addBadge: (badge) => set((s) => ({ badges: [...s.badges, badge] })),
  toggleIntolerance: (intolerance) =>
    set((s) => ({
      user: {
        ...s.user,
        intolerances: s.user.intolerances.includes(intolerance)
          ? s.user.intolerances.filter((i) => i !== intolerance)
          : [...s.user.intolerances, intolerance],
      },
    })),
  addCustomIntolerance: (intolerance) =>
    set((s) => ({
      user: {
        ...s.user,
        customIntolerances: s.user.customIntolerances.includes(intolerance)
          ? s.user.customIntolerances
          : [...s.user.customIntolerances, intolerance],
      },
    })),
  removeCustomIntolerance: (intolerance) =>
    set((s) => ({
      user: {
        ...s.user,
        customIntolerances: s.user.customIntolerances.filter((i) => i !== intolerance),
      },
    })),
  };
});
