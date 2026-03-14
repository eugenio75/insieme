/**
 * Progressive weekly habits system.
 * Habits grow in difficulty week by week, based on the user's objective.
 * Each "week level" has 3 micro-goals.
 */

export interface HabitTemplate {
  id: string;
  title: string;
  icon: string;
}

export interface WeekLevel {
  week: number;
  label: string;
  habits: HabitTemplate[];
}

// ── Sgonfiarsi / Leggerezza ──
const lightHabits: WeekLevel[] = [
  {
    week: 1, label: 'Settimana 1 – Le basi',
    habits: [
      { id: 'l1-1', title: 'Camminare 10 minuti', icon: '🚶‍♀️' },
      { id: 'l1-2', title: 'Bere 1 litro di acqua', icon: '💧' },
      { id: 'l1-3', title: 'Niente dolci dopo cena', icon: '🌙' },
    ],
  },
  {
    week: 2, label: 'Settimana 2 – Un po\' di più',
    habits: [
      { id: 'l2-1', title: 'Camminare 15 minuti', icon: '🚶‍♀️' },
      { id: 'l2-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'l2-3', title: 'Mangiare lentamente a pranzo', icon: '🍽️' },
    ],
  },
  {
    week: 3, label: 'Settimana 3 – Cresci',
    habits: [
      { id: 'l3-1', title: 'Camminare 20 minuti', icon: '🚶‍♀️' },
      { id: 'l3-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'l3-3', title: 'Una porzione di verdura a cena', icon: '🥗' },
    ],
  },
  {
    week: 4, label: 'Settimana 4 – Costanza',
    habits: [
      { id: 'l4-1', title: 'Camminare 25 minuti', icon: '🚶‍♀️' },
      { id: 'l4-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'l4-3', title: 'Niente bibite zuccherate', icon: '🚫' },
    ],
  },
  {
    week: 5, label: 'Settimana 5 – Abitudine',
    habits: [
      { id: 'l5-1', title: 'Camminare 30 minuti', icon: '🚶‍♀️' },
      { id: 'l5-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'l5-3', title: 'Verdure a pranzo e cena', icon: '🥬' },
    ],
  },
  {
    week: 6, label: 'Settimana 6 – Forza',
    habits: [
      { id: 'l6-1', title: 'Camminare 30 minuti + stretching', icon: '🧘‍♀️' },
      { id: 'l6-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'l6-3', title: 'Pasto leggero la sera', icon: '🌙' },
    ],
  },
];

// ── Energia ──
const energyHabits: WeekLevel[] = [
  {
    week: 1, label: 'Settimana 1 – Svegliati',
    habits: [
      { id: 'e1-1', title: 'Colazione entro 1 ora dal risveglio', icon: '🌅' },
      { id: 'e1-2', title: 'Bere 1 litro di acqua', icon: '💧' },
      { id: 'e1-3', title: 'Andare a letto entro mezzanotte', icon: '😴' },
    ],
  },
  {
    week: 2, label: 'Settimana 2 – Ritmo',
    habits: [
      { id: 'e2-1', title: 'Colazione con proteine', icon: '🥚' },
      { id: 'e2-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'e2-3', title: '10 minuti di movimento', icon: '🏃‍♀️' },
    ],
  },
  {
    week: 3, label: 'Settimana 3 – Slancio',
    habits: [
      { id: 'e3-1', title: 'Spuntino sano a metà mattina', icon: '🍎' },
      { id: 'e3-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'e3-3', title: '15 minuti di movimento', icon: '🏃‍♀️' },
    ],
  },
  {
    week: 4, label: 'Settimana 4 – Costanza',
    habits: [
      { id: 'e4-1', title: 'Niente zuccheri dopo le 18', icon: '🚫' },
      { id: 'e4-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'e4-3', title: '20 minuti di movimento', icon: '🏃‍♀️' },
    ],
  },
  {
    week: 5, label: 'Settimana 5 – Potenza',
    habits: [
      { id: 'e5-1', title: '5 porzioni frutta/verdura al giorno', icon: '🥦' },
      { id: 'e5-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'e5-3', title: '25 minuti di movimento', icon: '💪' },
    ],
  },
  {
    week: 6, label: 'Settimana 6 – Energia piena',
    habits: [
      { id: 'e6-1', title: 'Pasti regolari (colazione, pranzo, cena)', icon: '🍽️' },
      { id: 'e6-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'e6-3', title: '30 minuti di attività', icon: '🔥' },
    ],
  },
];

// ── Benessere generale (default) ──
const wellnessHabits: WeekLevel[] = [
  {
    week: 1, label: 'Settimana 1 – Primi passi',
    habits: [
      { id: 'w1-1', title: 'Camminare 10 minuti', icon: '🚶‍♀️' },
      { id: 'w1-2', title: 'Bere 1 litro di acqua', icon: '💧' },
      { id: 'w1-3', title: 'Mangiare un frutto al giorno', icon: '🍎' },
    ],
  },
  {
    week: 2, label: 'Settimana 2 – Cresci piano',
    habits: [
      { id: 'w2-1', title: 'Camminare 15 minuti', icon: '🚶‍♀️' },
      { id: 'w2-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'w2-3', title: 'Una verdura in più al giorno', icon: '🥗' },
    ],
  },
  {
    week: 3, label: 'Settimana 3 – Nuove abitudini',
    habits: [
      { id: 'w3-1', title: 'Camminare 20 minuti', icon: '🚶‍♀️' },
      { id: 'w3-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'w3-3', title: 'Niente dolci dopo cena', icon: '🌙' },
    ],
  },
  {
    week: 4, label: 'Settimana 4 – Costanza',
    habits: [
      { id: 'w4-1', title: 'Camminare 25 minuti', icon: '🚶‍♀️' },
      { id: 'w4-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'w4-3', title: 'Mangiare lentamente', icon: '🍽️' },
    ],
  },
  {
    week: 5, label: 'Settimana 5 – Equilibrio',
    habits: [
      { id: 'w5-1', title: 'Camminare 30 minuti', icon: '🚶‍♀️' },
      { id: 'w5-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'w5-3', title: 'Verdure a ogni pasto principale', icon: '🥬' },
    ],
  },
  {
    week: 6, label: 'Settimana 6 – Sei forte',
    habits: [
      { id: 'w6-1', title: '30 minuti di attività a scelta', icon: '🧘‍♀️' },
      { id: 'w6-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'w6-3', title: 'Pasto bilanciato sera', icon: '🌙' },
    ],
  },
];

const habitsByObjective: Record<string, WeekLevel[]> = {
  light: lightHabits,
  energy: energyHabits,
  wellness: wellnessHabits,
};

/**
 * Maps the user's objective string to a habit track key.
 */
const resolveTrack = (objective: string): string => {
  const lower = objective.toLowerCase();
  if (lower.includes('sgonfi') || lower.includes('legger') || lower.includes('gonfi') || lower.includes('pancia')) return 'light';
  if (lower.includes('energi') || lower.includes('stanche') || lower.includes('stanca') || lower.includes('vitalit')) return 'energy';
  return 'wellness';
};

/**
 * Returns the current week level (1-based) from the user's start date.
 * Caps at the max available week.
 */
export const getCurrentWeekNumber = (startDate?: string): number => {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diffWeeks + 1); // 1-based
};

/**
 * Gets the habits for the current week based on objective and start date.
 */
export const getWeeklyHabitsForUser = (
  objective: string,
  startDate?: string,
): { weekLevel: WeekLevel; weekNumber: number; totalWeeks: number } => {
  const track = resolveTrack(objective);
  const levels = habitsByObjective[track] || wellnessHabits;
  const rawWeek = getCurrentWeekNumber(startDate);
  // Clamp to available weeks, cycling after completing all
  const weekIndex = ((rawWeek - 1) % levels.length);
  const weekLevel = levels[weekIndex];
  return {
    weekLevel,
    weekNumber: rawWeek,
    totalWeeks: levels.length,
  };
};
