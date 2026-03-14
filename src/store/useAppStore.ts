import { create } from 'zustand';

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
  addBadge: (badge: { from: string; type: string; date: string }) => void;
  toggleIntolerance: (intolerance: string) => void;
  addCustomIntolerance: (intolerance: string) => void;
  removeCustomIntolerance: (intolerance: string) => void;
  getStreakMilestone: () => StreakMilestone | null;
}

const defaultHabits: Habit[] = [
  { id: '1', title: 'Camminare 20 minuti', completed: false, icon: '🚶‍♀️' },
  { id: '2', title: 'Bere 1.5 litri di acqua', completed: false, icon: '💧' },
  { id: '3', title: 'Niente dolci dopo cena', completed: false, icon: '🌙' },
];

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

const calcStreak = (lastDate: string | null, currentStreak: number): number => {
  if (!lastDate) return 1;
  const today = getDateStr(new Date());
  const yesterday = getDateStr(new Date(Date.now() - 86400000));
  if (lastDate === today) return currentStreak; // already checked in today
  if (lastDate === yesterday) return currentStreak + 1; // consecutive
  return 1; // streak broken, restart
};

export const useAppStore = create<AppState>((set, get) => ({
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
  weeklyHabits: defaultHabits,
  checkIns: [],
  todayCheckedIn: false,
  currentStreak: 0,
  lastCheckInDate: null,
  badges: [
    { from: 'Sara', type: 'Brava!', date: new Date().toISOString() },
  ],
  setUser: (u) => set((s) => ({ user: { ...s.user, ...u } })),
  completeOnboarding: () => set((s) => ({ user: { ...s.user, onboarded: true } })),
  toggleHabit: (id) =>
    set((s) => ({
      weeklyHabits: s.weeklyHabits.map((h) =>
        h.id === id ? { ...h, completed: !h.completed } : h
      ),
    })),
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
    // Find the highest milestone reached
    const milestone = [...streakMilestones].reverse().find(m => currentStreak >= m.days);
    return milestone || null;
  },
  setWeeklyHabits: (habits) => set({ weeklyHabits: habits }),
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
}));
