import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import BottomNav from '../components/BottomNav';
import { Utensils } from 'lucide-react';

interface FoodTip {
  title: string;
  description: string;
  icon: string;
  tags: string[];
}

const allTips: FoodTip[] = [
  {
    title: 'Inizia con un bicchiere d\'acqua tiepida',
    description: 'Al mattino, prima di colazione. Aiuta la digestione e riduce il gonfiore.',
    icon: '💧',
    tags: ['gonfiore', 'energia'],
  },
  {
    title: 'Spuntino anti-fame nervosa',
    description: 'Prova mandorle e un quadretto di cioccolato fondente. Sazia senza sensi di colpa.',
    icon: '🥜',
    tags: ['fame nervosa', 'dolci'],
  },
  {
    title: 'Aggiungi zenzero alla tua giornata',
    description: 'In tisana o grattugiato sui piatti. Ottimo per la digestione e contro il gonfiore.',
    icon: '🫚',
    tags: ['gonfiore'],
  },
  {
    title: 'La regola del piatto colorato',
    description: 'Più colori nel piatto = più nutrienti. Non serve contare nulla, basta guardare.',
    icon: '🌈',
    tags: ['energia', 'costante'],
  },
  {
    title: 'Camomilla dopo cena',
    description: 'Sostituisce il dolce serale e rilassa. Un piccolo rituale di cura.',
    icon: '🍵',
    tags: ['dolci', 'stress'],
  },
  {
    title: 'Prepara una bowl semplice',
    description: 'Riso, verdure di stagione, un filo d\'olio e semi. Veloce, leggera, buona.',
    icon: '🥗',
    tags: ['tempo', 'leggera'],
  },
  {
    title: 'Mastica lentamente',
    description: 'Posa la forchetta tra un boccone e l\'altro. La digestione inizia dalla bocca.',
    icon: '🧘‍♀️',
    tags: ['gonfiore', 'costante'],
  },
  {
    title: 'Smoothie energizzante',
    description: 'Banana, spinaci, latte vegetale e un cucchiaio di miele. Pronto in 3 minuti.',
    icon: '🥤',
    tags: ['energia', 'tempo'],
  },
  {
    title: 'Finocchio dopo i pasti',
    description: 'Crudo o in tisana. È il miglior alleato naturale contro il gonfiore.',
    icon: '🌿',
    tags: ['gonfiore'],
  },
  {
    title: 'Cena leggera entro le 20:30',
    description: 'Una zuppa calda o verdure grigliate. Il corpo ti ringrazierà al mattino.',
    icon: '🌙',
    tags: ['leggera', 'gonfiore'],
  },
];

const tipsByIntolerance: Record<string, FoodTip[]> = {
  'Lattosio': [
    {
      title: 'Alternative al latte',
      description: 'Latte d\'avena, mandorla o riso. Scegli quello che ti piace di più, senza pensarci troppo.',
      icon: '🥛',
      tags: ['lattosio'],
    },
    {
      title: 'Yogurt vegetale con frutta',
      description: 'Di cocco o soia, con frutta fresca e un po\' di granola. Una colazione dolce e gentile.',
      icon: '🫐',
      tags: ['lattosio'],
    },
  ],
  'Glutine': [
    {
      title: 'Cereali senza glutine',
      description: 'Riso, quinoa, grano saraceno, miglio. Tante opzioni buone e leggere.',
      icon: '🌾',
      tags: ['glutine'],
    },
    {
      title: 'Pasta di legumi',
      description: 'Pasta di lenticchie o ceci. Più proteine, senza glutine, e molto saporita.',
      icon: '🍝',
      tags: ['glutine'],
    },
  ],
  'Nichel': [
    {
      title: 'Verdure a basso nichel',
      description: 'Zucchine, carote, finocchi, peperoni. Leggere e sicure per te.',
      icon: '🥕',
      tags: ['nichel'],
    },
    {
      title: 'Proteine sicure',
      description: 'Pollo, tacchino, uova. Semplici e senza pensieri.',
      icon: '🍗',
      tags: ['nichel'],
    },
  ],
  'Fruttosio': [
    {
      title: 'Frutta a basso fruttosio',
      description: 'Banane, mirtilli, fragole, kiwi. Dolcezza senza fastidio.',
      icon: '🍓',
      tags: ['fruttosio'],
    },
  ],
};

export const getDailyTip = (objective: string, difficulty: string, intolerances: string[]): FoodTip => {
  // Filter tips relevant to user profile
  const relevant = allTips.filter((tip) => {
    const objTag = objective.toLowerCase().includes('gonfiore') ? 'gonfiore'
      : objective.toLowerCase().includes('energia') ? 'energia'
      : objective.toLowerCase().includes('leggera') ? 'leggera'
      : objective.toLowerCase().includes('costante') ? 'costante'
      : '';
    const diffTag = difficulty.toLowerCase().includes('fame') ? 'fame nervosa'
      : difficulty.toLowerCase().includes('dolci') ? 'dolci'
      : difficulty.toLowerCase().includes('tempo') ? 'tempo'
      : difficulty.toLowerCase().includes('stress') ? 'stress'
      : '';
    return tip.tags.includes(objTag) || tip.tags.includes(diffTag);
  });

  const pool = relevant.length > 0 ? relevant : allTips;
  const dayIndex = new Date().getDay() + new Date().getDate();
  return pool[dayIndex % pool.length];
};

export const getIntoleranceTips = (intolerances: string[]): FoodTip[] => {
  return intolerances.flatMap((i) => tipsByIntolerance[i] || []);
};

export const getAllRecipes = (): FoodTip[] => allTips;
