/**
 * Progressive weekly habits system with DAILY rotation.
 * Each week has a pool of habits; 3 are selected per day.
 * Habits adapt based on recent check-in data (mood, energy, bloating).
 */

export interface HabitTemplate {
  id: string;
  title: string;
  icon: string;
  /** Optional: conditions where this habit gets prioritized */
  boost?: {
    lowEnergy?: boolean;    // Prioritize when energy ≤ 2
    highBloating?: boolean; // Prioritize when bloating ≥ 3
    lowMood?: boolean;      // Prioritize when mood ≤ 2
  };
}

export interface WeekLevel {
  week: number;
  label: string;
  habits: HabitTemplate[]; // Pool of 7+ habits to pick from daily
}

interface CheckInSignals {
  avgMood?: number;
  avgEnergy?: number;
  avgBloating?: number;
}

// ── Sgonfiarsi / Leggerezza ──
const lightHabits: WeekLevel[] = [
  {
    week: 1, label: 'Settimana 1 – Le basi',
    habits: [
      { id: 'l1-1', title: 'Camminare 10 minuti', icon: '🚶‍♀️' },
      { id: 'l1-2', title: 'Bere 1 litro di acqua', icon: '💧' },
      { id: 'l1-3', title: 'Niente dolci dopo cena', icon: '🌙' },
      { id: 'l1-4', title: 'Mangiare una porzione di verdura', icon: '🥗', boost: { highBloating: true } },
      { id: 'l1-5', title: 'Fare 5 respiri profondi', icon: '🧘‍♀️', boost: { lowMood: true } },
      { id: 'l1-6', title: 'Tisana al finocchio dopo cena', icon: '🌿', boost: { highBloating: true } },
      { id: 'l1-7', title: 'Andare a letto prima delle 23:30', icon: '😴', boost: { lowEnergy: true } },
    ],
  },
  {
    week: 2, label: 'Settimana 2 – Un po\' di più',
    habits: [
      { id: 'l2-1', title: 'Camminare 15 minuti', icon: '🚶‍♀️' },
      { id: 'l2-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'l2-3', title: 'Mangiare lentamente a pranzo', icon: '🍽️' },
      { id: 'l2-4', title: 'Evitare bevande gassate', icon: '🫧', boost: { highBloating: true } },
      { id: 'l2-5', title: '10 minuti di stretching', icon: '🧘‍♀️', boost: { lowEnergy: true } },
      { id: 'l2-6', title: 'Scrivere 3 cose belle di oggi', icon: '📝', boost: { lowMood: true } },
      { id: 'l2-7', title: 'Frutta fresca come spuntino', icon: '🍎' },
    ],
  },
  {
    week: 3, label: 'Settimana 3 – Cresci',
    habits: [
      { id: 'l3-1', title: 'Camminare 20 minuti', icon: '🚶‍♀️' },
      { id: 'l3-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'l3-3', title: 'Una porzione di verdura a cena', icon: '🥗' },
      { id: 'l3-4', title: 'Passeggiata dopo pranzo', icon: '🌳', boost: { highBloating: true } },
      { id: 'l3-5', title: 'Niente schermo 30 min prima di dormire', icon: '📵', boost: { lowEnergy: true } },
      { id: 'l3-6', title: 'Chiamare o scrivere a un\'amica', icon: '💛', boost: { lowMood: true } },
      { id: 'l3-7', title: 'Colazione con proteine', icon: '🥚' },
    ],
  },
  {
    week: 4, label: 'Settimana 4 – Costanza',
    habits: [
      { id: 'l4-1', title: 'Camminare 25 minuti', icon: '🚶‍♀️' },
      { id: 'l4-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'l4-3', title: 'Niente bibite zuccherate', icon: '🚫' },
      { id: 'l4-4', title: 'Masticare ogni boccone 20 volte', icon: '🍽️', boost: { highBloating: true } },
      { id: 'l4-5', title: 'Fare qualcosa che ti piace per 15 min', icon: '🎨', boost: { lowMood: true } },
      { id: 'l4-6', title: 'Spuntino energetico a metà mattina', icon: '🥜', boost: { lowEnergy: true } },
      { id: 'l4-7', title: 'Cena entro le 20:30', icon: '🌙' },
    ],
  },
  {
    week: 5, label: 'Settimana 5 – Abitudine',
    habits: [
      { id: 'l5-1', title: 'Camminare 30 minuti', icon: '🚶‍♀️' },
      { id: 'l5-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'l5-3', title: 'Verdure a pranzo e cena', icon: '🥬' },
      { id: 'l5-4', title: 'Zenzero fresco nel tè', icon: '🫚', boost: { highBloating: true } },
      { id: 'l5-5', title: '5 minuti di meditazione', icon: '🧘‍♀️', boost: { lowMood: true } },
      { id: 'l5-6', title: 'Fare le scale invece dell\'ascensore', icon: '🏃‍♀️', boost: { lowEnergy: true } },
      { id: 'l5-7', title: 'Preparare il pranzo la sera prima', icon: '🍱' },
    ],
  },
  {
    week: 6, label: 'Settimana 6 – Forza',
    habits: [
      { id: 'l6-1', title: 'Camminare 30 minuti + stretching', icon: '🧘‍♀️' },
      { id: 'l6-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'l6-3', title: 'Pasto leggero la sera', icon: '🌙' },
      { id: 'l6-4', title: 'Cucinare qualcosa di nuovo e sano', icon: '👩‍🍳', boost: { lowMood: true } },
      { id: 'l6-5', title: 'Evitare latticini a cena', icon: '🧀', boost: { highBloating: true } },
      { id: 'l6-6', title: 'Fare 20 minuti di yoga', icon: '🧘', boost: { lowEnergy: true } },
      { id: 'l6-7', title: 'Mangiare con calma senza distrazioni', icon: '🍽️' },
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
      { id: 'e1-4', title: '5 minuti di stretching al mattino', icon: '🧘‍♀️', boost: { lowEnergy: true } },
      { id: 'e1-5', title: 'Ascoltare una canzone che ti dà gioia', icon: '🎵', boost: { lowMood: true } },
      { id: 'e1-6', title: 'Tisana digestiva dopo pranzo', icon: '🌿', boost: { highBloating: true } },
      { id: 'e1-7', title: 'Spuntino con frutta secca', icon: '🥜' },
    ],
  },
  {
    week: 2, label: 'Settimana 2 – Ritmo',
    habits: [
      { id: 'e2-1', title: 'Colazione con proteine', icon: '🥚' },
      { id: 'e2-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'e2-3', title: '10 minuti di movimento', icon: '🏃‍♀️' },
      { id: 'e2-4', title: 'Pausa pranzo senza telefono', icon: '📵', boost: { lowMood: true } },
      { id: 'e2-5', title: 'Passeggiata post-pranzo', icon: '🌳', boost: { highBloating: true } },
      { id: 'e2-6', title: 'Power nap di 20 minuti', icon: '💤', boost: { lowEnergy: true } },
      { id: 'e2-7', title: 'Verdura cotta a cena', icon: '🥦' },
    ],
  },
  {
    week: 3, label: 'Settimana 3 – Slancio',
    habits: [
      { id: 'e3-1', title: 'Spuntino sano a metà mattina', icon: '🍎' },
      { id: 'e3-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'e3-3', title: '15 minuti di movimento', icon: '🏃‍♀️' },
      { id: 'e3-4', title: 'Esporsi al sole 10 minuti', icon: '☀️', boost: { lowEnergy: true } },
      { id: 'e3-5', title: 'Scrivere cosa ti ha fatto sorridere', icon: '😊', boost: { lowMood: true } },
      { id: 'e3-6', title: 'Mangiare lentamente', icon: '🍽️', boost: { highBloating: true } },
      { id: 'e3-7', title: 'Preparare un frullato energetico', icon: '🥤' },
    ],
  },
  {
    week: 4, label: 'Settimana 4 – Costanza',
    habits: [
      { id: 'e4-1', title: 'Niente zuccheri dopo le 18', icon: '🚫' },
      { id: 'e4-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'e4-3', title: '20 minuti di movimento', icon: '🏃‍♀️' },
      { id: 'e4-4', title: 'Dormire 30 min prima del solito', icon: '😴', boost: { lowEnergy: true } },
      { id: 'e4-5', title: 'Ringraziare qualcuno', icon: '💛', boost: { lowMood: true } },
      { id: 'e4-6', title: 'Evitare cibi fritti', icon: '🍳', boost: { highBloating: true } },
      { id: 'e4-7', title: 'Carboidrati integrali a pranzo', icon: '🍞' },
    ],
  },
  {
    week: 5, label: 'Settimana 5 – Potenza',
    habits: [
      { id: 'e5-1', title: '5 porzioni frutta/verdura al giorno', icon: '🥦' },
      { id: 'e5-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'e5-3', title: '25 minuti di movimento', icon: '💪' },
      { id: 'e5-4', title: 'Colazione entro 30 min dal risveglio', icon: '🌅', boost: { lowEnergy: true } },
      { id: 'e5-5', title: 'Fare qualcosa di creativo', icon: '🎨', boost: { lowMood: true } },
      { id: 'e5-6', title: 'Tisana allo zenzero', icon: '🫚', boost: { highBloating: true } },
      { id: 'e5-7', title: 'Mangiare pesce almeno una volta', icon: '🐟' },
    ],
  },
  {
    week: 6, label: 'Settimana 6 – Energia piena',
    habits: [
      { id: 'e6-1', title: 'Pasti regolari (colazione, pranzo, cena)', icon: '🍽️' },
      { id: 'e6-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'e6-3', title: '30 minuti di attività', icon: '🔥' },
      { id: 'e6-4', title: 'Yoga o stretching serale', icon: '🧘', boost: { lowEnergy: true } },
      { id: 'e6-5', title: 'Uscire all\'aria aperta', icon: '🌳', boost: { lowMood: true } },
      { id: 'e6-6', title: 'Cena leggera e anti-gonfiore', icon: '🌙', boost: { highBloating: true } },
      { id: 'e6-7', title: 'Preparare i pasti del giorno dopo', icon: '🍱' },
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
      { id: 'w1-4', title: 'Fare 5 respiri profondi', icon: '🧘‍♀️', boost: { lowMood: true } },
      { id: 'w1-5', title: 'Tisana rilassante la sera', icon: '🌿', boost: { highBloating: true } },
      { id: 'w1-6', title: 'Dormire almeno 7 ore', icon: '😴', boost: { lowEnergy: true } },
      { id: 'w1-7', title: 'Una porzione di verdura a pranzo', icon: '🥗' },
    ],
  },
  {
    week: 2, label: 'Settimana 2 – Cresci piano',
    habits: [
      { id: 'w2-1', title: 'Camminare 15 minuti', icon: '🚶‍♀️' },
      { id: 'w2-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'w2-3', title: 'Una verdura in più al giorno', icon: '🥗' },
      { id: 'w2-4', title: 'Ascoltare musica rilassante', icon: '🎵', boost: { lowMood: true } },
      { id: 'w2-5', title: 'Mangiare lentamente', icon: '🍽️', boost: { highBloating: true } },
      { id: 'w2-6', title: 'Pausa di 10 min durante la giornata', icon: '☕', boost: { lowEnergy: true } },
      { id: 'w2-7', title: 'Colazione completa', icon: '🌅' },
    ],
  },
  {
    week: 3, label: 'Settimana 3 – Nuove abitudini',
    habits: [
      { id: 'w3-1', title: 'Camminare 20 minuti', icon: '🚶‍♀️' },
      { id: 'w3-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'w3-3', title: 'Niente dolci dopo cena', icon: '🌙' },
      { id: 'w3-4', title: 'Scrivere 3 cose per cui sei grata', icon: '📝', boost: { lowMood: true } },
      { id: 'w3-5', title: 'Passeggiata dopo cena', icon: '🌳', boost: { highBloating: true } },
      { id: 'w3-6', title: 'Spuntino proteico', icon: '🥜', boost: { lowEnergy: true } },
      { id: 'w3-7', title: 'Cucinare un piatto nuovo', icon: '👩‍🍳' },
    ],
  },
  {
    week: 4, label: 'Settimana 4 – Costanza',
    habits: [
      { id: 'w4-1', title: 'Camminare 25 minuti', icon: '🚶‍♀️' },
      { id: 'w4-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'w4-3', title: 'Mangiare lentamente', icon: '🍽️' },
      { id: 'w4-4', title: 'Fare qualcosa solo per te', icon: '💛', boost: { lowMood: true } },
      { id: 'w4-5', title: 'Evitare bevande gassate', icon: '🫧', boost: { highBloating: true } },
      { id: 'w4-6', title: 'Stretching di 10 minuti', icon: '🧘‍♀️', boost: { lowEnergy: true } },
      { id: 'w4-7', title: 'Pesce o legumi a pranzo', icon: '🐟' },
    ],
  },
  {
    week: 5, label: 'Settimana 5 – Equilibrio',
    habits: [
      { id: 'w5-1', title: 'Camminare 30 minuti', icon: '🚶‍♀️' },
      { id: 'w5-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'w5-3', title: 'Verdure a ogni pasto principale', icon: '🥬' },
      { id: 'w5-4', title: 'Meditazione di 5 minuti', icon: '🧘', boost: { lowMood: true } },
      { id: 'w5-5', title: 'Cena leggera entro le 20', icon: '🌙', boost: { highBloating: true } },
      { id: 'w5-6', title: 'Colazione ricca di proteine', icon: '🥚', boost: { lowEnergy: true } },
      { id: 'w5-7', title: 'Limitare il caffè a 2 tazze', icon: '☕' },
    ],
  },
  {
    week: 6, label: 'Settimana 6 – Sei forte',
    habits: [
      { id: 'w6-1', title: '30 minuti di attività a scelta', icon: '🧘‍♀️' },
      { id: 'w6-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'w6-3', title: 'Pasto bilanciato sera', icon: '🌙' },
      { id: 'w6-4', title: 'Uscire con qualcuno che ami', icon: '❤️', boost: { lowMood: true } },
      { id: 'w6-5', title: 'Evitare latticini la sera', icon: '🧀', boost: { highBloating: true } },
      { id: 'w6-6', title: 'Yoga mattutino', icon: '🧘', boost: { lowEnergy: true } },
      { id: 'w6-7', title: 'Preparare i pasti della settimana', icon: '🍱' },
    ],
  },
];

// ── Perdere peso ──
const weightLossHabits: WeekLevel[] = [
  {
    week: 1, label: 'Settimana 1 – Consapevolezza',
    habits: [
      { id: 'p1-1', title: 'Camminare 15 minuti', icon: '🚶‍♀️' },
      { id: 'p1-2', title: 'Bere 1 litro di acqua', icon: '💧' },
      { id: 'p1-3', title: 'Niente spuntini dopo cena', icon: '🌙' },
      { id: 'p1-4', title: 'Fare stretching al mattino', icon: '🧘‍♀️', boost: { lowEnergy: true } },
      { id: 'p1-5', title: 'Respiro profondo prima dei pasti', icon: '🧘', boost: { lowMood: true } },
      { id: 'p1-6', title: 'Tisana al finocchio', icon: '🌿', boost: { highBloating: true } },
      { id: 'p1-7', title: 'Porzioni moderate', icon: '🍽️' },
    ],
  },
  {
    week: 2, label: 'Settimana 2 – Porzioni',
    habits: [
      { id: 'p2-1', title: 'Camminare 20 minuti', icon: '🚶‍♀️' },
      { id: 'p2-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'p2-3', title: 'Porzioni moderate a pranzo e cena', icon: '🍽️' },
      { id: 'p2-4', title: 'Dormire di più', icon: '😴', boost: { lowEnergy: true } },
      { id: 'p2-5', title: 'Scrivere cosa ti rende fiera', icon: '📝', boost: { lowMood: true } },
      { id: 'p2-6', title: 'Passeggiata digestiva', icon: '🌳', boost: { highBloating: true } },
      { id: 'p2-7', title: 'Frutta come dessert', icon: '🍎' },
    ],
  },
  {
    week: 3, label: 'Settimana 3 – Sostituzione',
    habits: [
      { id: 'p3-1', title: 'Camminare 25 minuti', icon: '🚶‍♀️' },
      { id: 'p3-2', title: 'Bere 1.5 litri di acqua', icon: '💧' },
      { id: 'p3-3', title: 'Sostituire un dolce con frutta', icon: '🍎' },
      { id: 'p3-4', title: 'Colazione proteica', icon: '🥚', boost: { lowEnergy: true } },
      { id: 'p3-5', title: 'Momento di relax senza cibo', icon: '🛀', boost: { lowMood: true } },
      { id: 'p3-6', title: 'Evitare cibi che gonfiano', icon: '🫧', boost: { highBloating: true } },
      { id: 'p3-7', title: 'Verdura come primo piatto', icon: '🥗' },
    ],
  },
  {
    week: 4, label: 'Settimana 4 – Movimento',
    habits: [
      { id: 'p4-1', title: 'Camminare 30 minuti', icon: '🚶‍♀️' },
      { id: 'p4-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'p4-3', title: 'Niente bibite zuccherate', icon: '🚫' },
      { id: 'p4-4', title: 'Fare le scale', icon: '🏃‍♀️', boost: { lowEnergy: true } },
      { id: 'p4-5', title: 'Coccolarti con qualcosa che non sia cibo', icon: '💛', boost: { lowMood: true } },
      { id: 'p4-6', title: 'Masticare lentamente ogni boccone', icon: '🍽️', boost: { highBloating: true } },
      { id: 'p4-7', title: 'Proteine a ogni pasto', icon: '🍗' },
    ],
  },
  {
    week: 5, label: 'Settimana 5 – Equilibrio',
    habits: [
      { id: 'p5-1', title: '30 minuti di attività', icon: '💪' },
      { id: 'p5-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'p5-3', title: 'Verdure a ogni pasto principale', icon: '🥬' },
      { id: 'p5-4', title: 'Yoga energizzante', icon: '🧘', boost: { lowEnergy: true } },
      { id: 'p5-5', title: 'Chiamare qualcuno che ti fa stare bene', icon: '📞', boost: { lowMood: true } },
      { id: 'p5-6', title: 'Cena entro le 20', icon: '🌙', boost: { highBloating: true } },
      { id: 'p5-7', title: 'Spuntino sano a metà pomeriggio', icon: '🥜' },
    ],
  },
  {
    week: 6, label: 'Settimana 6 – Nuova te',
    habits: [
      { id: 'p6-1', title: '30 minuti di attività + stretching', icon: '🧘‍♀️' },
      { id: 'p6-2', title: 'Bere 2 litri di acqua', icon: '💧' },
      { id: 'p6-3', title: 'Pasto bilanciato e leggero la sera', icon: '🌙' },
      { id: 'p6-4', title: 'Meditazione mattutina', icon: '🧘', boost: { lowEnergy: true } },
      { id: 'p6-5', title: 'Fare qualcosa di creativo', icon: '🎨', boost: { lowMood: true } },
      { id: 'p6-6', title: 'Evitare latticini e legumi a cena', icon: '🧀', boost: { highBloating: true } },
      { id: 'p6-7', title: 'Preparare i pasti della settimana', icon: '🍱' },
    ],
  },
];

const habitsByObjective: Record<string, WeekLevel[]> = {
  light: lightHabits,
  energy: energyHabits,
  weightloss: weightLossHabits,
  wellness: wellnessHabits,
};

const resolveTrack = (objective: string): string => {
  const lower = objective.toLowerCase();
  if (lower.includes('peso') || lower.includes('dimagri')) return 'weightloss';
  if (lower.includes('sgonfi') || lower.includes('legger') || lower.includes('gonfi') || lower.includes('pancia')) return 'light';
  if (lower.includes('energi') || lower.includes('stanche') || lower.includes('stanca') || lower.includes('vitalit')) return 'energy';
  return 'wellness';
};

export const getCurrentWeekNumber = (startDate?: string): number => {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diffWeeks + 1);
};

/** Fixed water habit — always present */
const WATER_HABIT: HabitTemplate = {
  id: 'fixed-water',
  title: 'Bere almeno 1.5 litri di acqua',
  icon: '💧',
};

/**
 * Selects 3 habits for today from the week's pool (excluding water).
 * Uses day-of-year for deterministic daily rotation.
 * Prioritizes habits that match recent check-in signals.
 */
const selectDailyHabits = (
  pool: HabitTemplate[],
  signals: CheckInSignals,
): HabitTemplate[] => {
  // Filter out water habits (water is always fixed as first)
  const filtered = pool.filter(h => !h.title.toLowerCase().includes('acqua'));

  if (filtered.length <= 3) return filtered;

  const boosted: HabitTemplate[] = [];
  const normal: HabitTemplate[] = [];

  for (const h of filtered) {
    let isBoosted = false;
    if (h.boost) {
      if (h.boost.lowEnergy && signals.avgEnergy !== undefined && signals.avgEnergy <= 2) isBoosted = true;
      if (h.boost.highBloating && signals.avgBloating !== undefined && signals.avgBloating >= 3) isBoosted = true;
      if (h.boost.lowMood && signals.avgMood !== undefined && signals.avgMood <= 2) isBoosted = true;
    }
    if (isBoosted) boosted.push(h);
    else normal.push(h);
  }

  const selected: HabitTemplate[] = [];

  if (boosted.length > 0) {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    selected.push(boosted[dayOfYear % boosted.length]);
  }

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const remaining = normal.filter(h => !selected.includes(h));
  
  while (selected.length < 3 && remaining.length > 0) {
    const idx = (dayOfYear + selected.length) % remaining.length;
    selected.push(remaining.splice(idx, 1)[0]);
  }

  const leftover = boosted.filter(h => !selected.includes(h));
  while (selected.length < 3 && leftover.length > 0) {
    selected.push(leftover.shift()!);
  }

  return selected;
};

/**
 * Gets 4 habits for TODAY: 1 fixed (water) + 3 adaptive from pool.
 */
export const getWeeklyHabitsForUser = (
  objective: string,
  startDate?: string,
  signals?: CheckInSignals,
): { weekLevel: WeekLevel; weekNumber: number; totalWeeks: number } => {
  const track = resolveTrack(objective);
  const levels = habitsByObjective[track] || wellnessHabits;
  const rawWeek = getCurrentWeekNumber(startDate);
  const weekIndex = ((rawWeek - 1) % levels.length);
  const weekLevel = levels[weekIndex];

  // Water first, then 3 adaptive habits
  const dailyHabits = [WATER_HABIT, ...selectDailyHabits(weekLevel.habits, signals || {})];

  return {
    weekLevel: { ...weekLevel, habits: dailyHabits },
    weekNumber: rawWeek,
    totalWeeks: levels.length,
  };
};
