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

interface AppState {
  user: UserProfile;
  weeklyHabits: Habit[];
  checkIns: CheckInData[];
  todayCheckedIn: boolean;
  badges: { from: string; type: string; date: string }[];
  setUser: (u: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  toggleHabit: (id: string) => void;
  addCheckIn: (data: CheckInData) => void;
  setWeeklyHabits: (habits: Habit[]) => void;
  addBadge: (badge: { from: string; type: string; date: string }) => void;
  toggleIntolerance: (intolerance: string) => void;
}

const defaultHabits: Habit[] = [
  { id: '1', title: 'Camminare 20 minuti', completed: false, icon: '🚶‍♀️' },
  { id: '2', title: 'Bere 1.5 litri di acqua', completed: false, icon: '💧' },
  { id: '3', title: 'Niente dolci dopo cena', completed: false, icon: '🌙' },
];

export const useAppStore = create<AppState>((set) => ({
  user: {
    name: '',
    objective: '',
    mode: 'solo',
    pace: '',
    activity: '',
    difficulty: '',
    onboarded: false,
    intolerances: [],
  },
  weeklyHabits: defaultHabits,
  checkIns: [],
  todayCheckedIn: false,
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
    set((s) => ({ checkIns: [...s.checkIns, data], todayCheckedIn: true })),
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
}));
