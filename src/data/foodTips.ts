export interface Ingredient {
  name: string;
  substitutes: string[];
}

export interface FoodTip {
  title: string;
  description: string;
  icon: string;
  tags: string[];
  ingredients?: Ingredient[];
  simpleVariant?: {
    title: string;
    description: string;
  };
}

const allTips: FoodTip[] = [
  {
    title: 'Inizia con un bicchiere d\'acqua tiepida',
    description: 'Al mattino, prima di colazione. Aiuta la digestione e riduce il gonfiore.',
    icon: '💧',
    tags: ['gonfiore', 'energia'],
    ingredients: [
      { name: 'Limone', substitutes: ['Aceto di mele (un cucchiaino)', 'Zenzero grattugiato', 'Niente, va benissimo anche solo acqua tiepida'] },
    ],
    simpleVariant: {
      title: 'Versione base',
      description: 'Solo acqua tiepida dal rubinetto. Già così fa bene.',
    },
  },
  {
    title: 'Spuntino anti-fame nervosa',
    description: 'Prova mandorle e un quadretto di cioccolato fondente. Sazia senza sensi di colpa.',
    icon: '🥜',
    tags: ['fame nervosa', 'dolci'],
    ingredients: [
      { name: 'Mandorle', substitutes: ['Noci', 'Nocciole', 'Semi di girasole', 'Una banana'] },
      { name: 'Cioccolato fondente', substitutes: ['Un cucchiaino di miele', 'Frutta secca', 'Un dattero'] },
    ],
    simpleVariant: {
      title: 'Versione con quello che hai',
      description: 'Qualsiasi frutta secca o un frutto fresco. L\'importante è spezzare la fame con calma.',
    },
  },
  {
    title: 'Aggiungi zenzero alla tua giornata',
    description: 'In tisana o grattugiato sui piatti. Ottimo per la digestione e contro il gonfiore.',
    icon: '🫚',
    tags: ['gonfiore'],
    ingredients: [
      { name: 'Zenzero fresco', substitutes: ['Zenzero in polvere', 'Finocchio (semi o tisana)', 'Menta fresca o secca'] },
    ],
    simpleVariant: {
      title: 'Senza zenzero?',
      description: 'Una tisana al finocchio o alla menta ha un effetto simile. Anche camomilla va bene.',
    },
  },
  {
    title: 'La regola del piatto colorato',
    description: 'Più colori nel piatto = più nutrienti. Non serve contare nulla, basta guardare.',
    icon: '🌈',
    tags: ['energia', 'costante'],
    simpleVariant: {
      title: 'Con quello che hai',
      description: 'Anche solo aggiungere un pomodoro o una carota al piatto è già un passo avanti.',
    },
  },
  {
    title: 'Camomilla dopo cena',
    description: 'Sostituisce il dolce serale e rilassa. Un piccolo rituale di cura.',
    icon: '🍵',
    tags: ['dolci', 'stress'],
    ingredients: [
      { name: 'Camomilla', substitutes: ['Tisana qualsiasi', 'Acqua calda con miele', 'Latte caldo (anche vegetale)'] },
    ],
    simpleVariant: {
      title: 'Niente tisane?',
      description: 'Anche solo un bicchiere di acqua calda. Il rituale conta più dell\'ingrediente.',
    },
  },
  {
    title: 'Prepara una bowl semplice',
    description: 'Riso, verdure di stagione, un filo d\'olio e semi. Veloce, leggera, buona.',
    icon: '🥗',
    tags: ['tempo', 'leggera'],
    ingredients: [
      { name: 'Riso', substitutes: ['Pasta corta', 'Farro', 'Pane raffermo a cubetti', 'Patate lesse'] },
      { name: 'Semi', substitutes: ['Frutta secca tritata', 'Un filo d\'olio in più', 'Niente, va bene uguale'] },
      { name: 'Verdure di stagione', substitutes: ['Verdure surgelate', 'Verdure in scatola', 'Anche solo pomodori e insalata'] },
    ],
    simpleVariant: {
      title: 'Versione dispensa',
      description: 'Pasta con olio, una verdura qualsiasi (anche surgelata) e un pizzico di sale. Fatto.',
    },
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
    ingredients: [
      { name: 'Banana', substitutes: ['Mela', 'Pera', 'Frutta surgelata'] },
      { name: 'Spinaci', substitutes: ['Niente (lo smoothie è buono anche senza)', 'Un cucchiaino di cacao'] },
      { name: 'Latte vegetale', substitutes: ['Latte normale', 'Acqua + yogurt', 'Succo di frutta'] },
      { name: 'Miele', substitutes: ['Zucchero', 'Un dattero', 'Niente, la banana è già dolce'] },
    ],
    simpleVariant: {
      title: 'Senza frullatore?',
      description: 'Schiaccia una banana con la forchetta, aggiungi yogurt e miele. Stessa energia, zero elettrodomestici.',
    },
  },
  {
    title: 'Finocchio dopo i pasti',
    description: 'Crudo o in tisana. È il miglior alleato naturale contro il gonfiore.',
    icon: '🌿',
    tags: ['gonfiore'],
    ingredients: [
      { name: 'Finocchio', substitutes: ['Semi di finocchio in tisana', 'Tisana digestiva', 'Menta fresca'] },
    ],
    simpleVariant: {
      title: 'Niente finocchio?',
      description: 'Una tisana digestiva qualsiasi, o anche solo acqua calda con limone.',
    },
  },
  {
    title: 'Cena leggera entro le 20:30',
    description: 'Una zuppa calda o verdure grigliate. Il corpo ti ringrazierà al mattino.',
    icon: '🌙',
    tags: ['leggera', 'gonfiore'],
    ingredients: [
      { name: 'Verdure per la zuppa', substitutes: ['Verdure surgelate', 'Minestrone pronto', 'Anche solo patate e carote'] },
    ],
    simpleVariant: {
      title: 'Versione velocissima',
      description: 'Pane tostato con olio e pomodoro, o un piatto di verdure surgelate. Leggero e pronto in 5 minuti.',
    },
  },
];

const tipsByIntolerance: Record<string, FoodTip[]> = {
  'Lattosio': [
    {
      title: 'Alternative al latte',
      description: 'Latte d\'avena, mandorla o riso. Scegli quello che ti piace di più, senza pensarci troppo.',
      icon: '🥛',
      tags: ['lattosio'],
      ingredients: [
        { name: 'Latte d\'avena', substitutes: ['Latte di riso', 'Latte di mandorla', 'Latte di soia', 'Latte senza lattosio'] },
      ],
    },
    {
      title: 'Yogurt vegetale con frutta',
      description: 'Di cocco o soia, con frutta fresca e un po\' di granola. Una colazione dolce e gentile.',
      icon: '🫐',
      tags: ['lattosio'],
      ingredients: [
        { name: 'Yogurt vegetale', substitutes: ['Yogurt senza lattosio', 'Frullato di banana', 'Crema di avena'] },
        { name: 'Granola', substitutes: ['Fiocchi d\'avena', 'Biscotti sbriciolati', 'Frutta secca tritata', 'Pane tostato a pezzetti'] },
      ],
    },
  ],
  'Glutine': [
    {
      title: 'Cereali senza glutine',
      description: 'Riso, quinoa, grano saraceno, miglio. Tante opzioni buone e leggere.',
      icon: '🌾',
      tags: ['glutine'],
      ingredients: [
        { name: 'Quinoa', substitutes: ['Riso (qualsiasi tipo)', 'Patate', 'Mais', 'Grano saraceno'] },
      ],
    },
    {
      title: 'Pasta di legumi',
      description: 'Pasta di lenticchie o ceci. Più proteine, senza glutine, e molto saporita.',
      icon: '🍝',
      tags: ['glutine'],
      ingredients: [
        { name: 'Pasta di legumi', substitutes: ['Riso', 'Pasta di mais', 'Pasta di riso', 'Gnocchi di patate (verifica senza glutine)'] },
      ],
    },
  ],
  'Nichel': [
    {
      title: 'Verdure a basso nichel',
      description: 'Zucchine, carote, finocchi, peperoni. Leggere e sicure per te.',
      icon: '🥕',
      tags: ['nichel'],
      ingredients: [
        { name: 'Zucchine', substitutes: ['Carote', 'Finocchi', 'Peperoni', 'Cetrioli'] },
      ],
    },
    {
      title: 'Proteine sicure',
      description: 'Pollo, tacchino, uova. Semplici e senza pensieri.',
      icon: '🍗',
      tags: ['nichel'],
      ingredients: [
        { name: 'Pollo', substitutes: ['Tacchino', 'Uova', 'Pesce bianco (merluzzo, sogliola)'] },
      ],
    },
  ],
  'Fruttosio': [
    {
      title: 'Frutta a basso fruttosio',
      description: 'Banane, mirtilli, fragole, kiwi. Dolcezza senza fastidio.',
      icon: '🍓',
      tags: ['fruttosio'],
      ingredients: [
        { name: 'Mirtilli', substitutes: ['Fragole', 'Kiwi', 'Banane', 'Lamponi'] },
      ],
    },
  ],
};

export const getDailyTip = (objective: string, difficulty: string, intolerances: string[]): FoodTip => {
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
