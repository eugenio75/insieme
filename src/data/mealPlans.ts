import { Ingredient } from './foodTips';

export interface Meal {
  type: 'colazione' | 'spuntino_mattina' | 'pranzo' | 'spuntino_pomeriggio' | 'cena';
  typeLabel: string;
  icon: string;
  title: string;
  description: string;
  ingredients?: Ingredient[];
  simpleVariant?: {
    title: string;
    description: string;
  };
  tags?: string[];
}

export interface DayPlan {
  day: string;
  dayShort: string;
  meals: Meal[];
}

// Base plans by objective
const lightPlan: DayPlan[] = [
  {
    day: 'Lunedì', dayShort: 'Lun',
    meals: [
      { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Yogurt con frutta fresca', description: 'Yogurt bianco, banana a fette e un cucchiaino di miele.',
        ingredients: [
          { name: 'Yogurt bianco', substitutes: ['Yogurt greco', 'Yogurt vegetale', 'Latte con fiocchi d\'avena'] },
          { name: 'Banana', substitutes: ['Mela', 'Pera', 'Frutti di bosco', 'Kiwi'] },
          { name: 'Miele', substitutes: ['Marmellata', 'Sciroppo d\'acero', 'Niente, è già buono così'] },
        ],
        simpleVariant: { title: 'Versione base', description: 'Latte e biscotti secchi. Semplice e va benissimo.' },
      },
      { type: 'spuntino_mattina', typeLabel: 'Spuntino', icon: '🍎', title: 'Un frutto di stagione', description: 'Quello che hai. Una mela, un\'arancia, una pera.',
        simpleVariant: { title: 'Alternative', description: 'Un pacchetto di crackers o 3-4 biscotti secchi.' },
      },
      { type: 'pranzo', typeLabel: 'Pranzo', icon: '🍝', title: 'Pasta con zucchine e olio EVO', description: 'Pasta corta, zucchine saltate, un filo d\'olio e parmigiano.',
        ingredients: [
          { name: 'Zucchine', substitutes: ['Pomodorini', 'Melanzane', 'Peperoni', 'Verdure surgelate miste'] },
          { name: 'Parmigiano', substitutes: ['Pecorino', 'Ricotta salata', 'Un filo d\'olio in più', 'Niente'] },
        ],
        simpleVariant: { title: 'Versione dispensa', description: 'Pasta aglio e olio. Tre ingredienti, sempre buona.' },
      },
      { type: 'spuntino_pomeriggio', typeLabel: 'Merenda', icon: '🥜', title: 'Mandorle e cioccolato fondente', description: '8-10 mandorle e 2 quadretti di fondente. Sazia e fa bene.',
        ingredients: [
          { name: 'Mandorle', substitutes: ['Noci', 'Nocciole', 'Semi di girasole', 'Arachidi'] },
          { name: 'Cioccolato fondente', substitutes: ['Un frutto', 'Un cucchiaino di miele', 'Biscotti secchi'] },
        ],
      },
      { type: 'cena', typeLabel: 'Cena', icon: '🌙', title: 'Vellutata di carote', description: 'Carote, patata, un filo d\'olio. Calda e confortante.',
        ingredients: [
          { name: 'Carote', substitutes: ['Zucca', 'Piselli', 'Cavolfiore', 'Patate'] },
          { name: 'Patata', substitutes: ['Pane raffermo', 'Riso (per addensare)', 'Niente, viene più leggera'] },
        ],
        simpleVariant: { title: 'Niente vellutata?', description: 'Minestrone pronto o verdure al vapore con pane. Leggero uguale.' },
      },
    ],
  },
  {
    day: 'Martedì', dayShort: 'Mar',
    meals: [
      { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Pane e marmellata', description: 'Fette biscottate o pane tostato con marmellata e un caffè.',
        ingredients: [
          { name: 'Fette biscottate', substitutes: ['Pane tostato', 'Biscotti secchi', 'Gallette di riso'] },
          { name: 'Marmellata', substitutes: ['Miele', 'Crema di nocciole (poca)', 'Frutta fresca'] },
        ],
      },
      { type: 'spuntino_mattina', typeLabel: 'Spuntino', icon: '🍊', title: 'Spremuta o frutto', description: 'Un\'arancia spremuta o un frutto intero. Quello che preferisci.' },
      { type: 'pranzo', typeLabel: 'Pranzo', icon: '🥗', title: 'Insalata di riso leggera', description: 'Riso freddo con pomodorini, olive, tonno e un filo d\'olio.',
        ingredients: [
          { name: 'Tonno', substitutes: ['Mozzarella', 'Uovo sodo', 'Ceci in scatola', 'Feta'] },
          { name: 'Olive', substitutes: ['Capperi', 'Mais', 'Niente'] },
          { name: 'Pomodorini', substitutes: ['Peperoni', 'Cetrioli', 'Carote grattugiate'] },
        ],
        simpleVariant: { title: 'Versione veloce', description: 'Riso in bianco con tonno e olio. 10 minuti.' },
      },
      { type: 'spuntino_pomeriggio', typeLabel: 'Merenda', icon: '🫐', title: 'Yogurt con miele', description: 'Uno yogurt semplice con un cucchiaino di miele.',
        ingredients: [
          { name: 'Yogurt', substitutes: ['Frutta fresca', 'Frutta secca', 'Crackers'] },
        ],
      },
      { type: 'cena', typeLabel: 'Cena', icon: '🌙', title: 'Frittata di verdure', description: 'Due uova con verdure di stagione. Veloce e nutriente.',
        ingredients: [
          { name: 'Uova', substitutes: ['Ricotta (al forno con verdure)', 'Formaggio fresco e pane'] },
          { name: 'Verdure di stagione', substitutes: ['Verdure surgelate', 'Cipolle', 'Anche solo patate'] },
        ],
        simpleVariant: { title: 'Senza uova?', description: 'Toast con formaggio e pomodoro. Leggero e pronto in 5 minuti.' },
      },
    ],
  },
  {
    day: 'Mercoledì', dayShort: 'Mer',
    meals: [
      { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Porridge veloce', description: 'Fiocchi d\'avena con latte caldo, cannella e una mela a pezzetti.',
        ingredients: [
          { name: 'Fiocchi d\'avena', substitutes: ['Cereali integrali', 'Fette biscottate sbriciolate', 'Semolino'] },
          { name: 'Mela', substitutes: ['Banana', 'Frutta secca', 'Marmellata'] },
          { name: 'Latte', substitutes: ['Latte vegetale', 'Acqua (viene tipo crema)', 'Yogurt diluito'] },
        ],
        simpleVariant: { title: 'Più semplice', description: 'Latte caldo con biscotti e un frutto. Classico e perfetto.' },
      },
      { type: 'spuntino_mattina', typeLabel: 'Spuntino', icon: '🍌', title: 'Banana', description: 'Veloce, nutriente, sempre disponibile.' },
      { type: 'pranzo', typeLabel: 'Pranzo', icon: '🍝', title: 'Pasta al pomodoro fresco', description: 'Pasta con pomodoro, basilico e un filo d\'olio. Semplice e buona.',
        ingredients: [
          { name: 'Pomodoro fresco', substitutes: ['Passata di pomodoro', 'Pomodori pelati', 'Pesto'] },
          { name: 'Basilico', substitutes: ['Origano', 'Prezzemolo', 'Niente'] },
        ],
      },
      { type: 'spuntino_pomeriggio', typeLabel: 'Merenda', icon: '🍪', title: 'Biscotti secchi e tè', description: '3-4 biscotti con una tazza di tè o tisana.' },
      { type: 'cena', typeLabel: 'Cena', icon: '🌙', title: 'Pesce al forno con patate', description: 'Filetto di pesce bianco con patate e rosmarino.',
        ingredients: [
          { name: 'Pesce bianco', substitutes: ['Petto di pollo', 'Uova', 'Tofu', 'Legumi'] },
          { name: 'Patate', substitutes: ['Riso', 'Pane', 'Verdure al forno'] },
        ],
        simpleVariant: { title: 'Versione rapida', description: 'Tonno in scatola con contorno di verdure. Pronto subito.' },
      },
    ],
  },
  {
    day: 'Giovedì', dayShort: 'Gio',
    meals: [
      { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Toast con ricotta e miele', description: 'Pane tostato con ricotta spalmata e un filo di miele.',
        ingredients: [
          { name: 'Ricotta', substitutes: ['Formaggio fresco spalmabile', 'Yogurt greco', 'Marmellata'] },
        ],
      },
      { type: 'spuntino_mattina', typeLabel: 'Spuntino', icon: '🥕', title: 'Carote e hummus', description: 'Bastoncini di carota con hummus. Croccante e saziante.',
        ingredients: [
          { name: 'Hummus', substitutes: ['Yogurt greco', 'Crema di ricotta', 'Olio e sale'] },
          { name: 'Carote', substitutes: ['Finocchi', 'Sedano', 'Cetrioli'] },
        ],
        simpleVariant: { title: 'Senza hummus?', description: 'Carote da sole o con un formaggino. Semplice ma buono.' },
      },
      { type: 'pranzo', typeLabel: 'Pranzo', icon: '🥗', title: 'Bowl di farro e verdure', description: 'Farro, pomodorini, cetrioli, feta e olio.',
        ingredients: [
          { name: 'Farro', substitutes: ['Riso', 'Orzo', 'Pasta fredda', 'Cous cous'] },
          { name: 'Feta', substitutes: ['Mozzarella', 'Ricotta salata', 'Tonno', 'Ceci'] },
        ],
        simpleVariant: { title: 'Versione base', description: 'Riso con verdure che hai e un filo d\'olio.' },
      },
      { type: 'spuntino_pomeriggio', typeLabel: 'Merenda', icon: '🍐', title: 'Un frutto e noci', description: 'Una pera e 4-5 noci. Energia buona.' },
      { type: 'cena', typeLabel: 'Cena', icon: '🌙', title: 'Zuppa di legumi', description: 'Lenticchie o ceci con un filo d\'olio e crostini.',
        ingredients: [
          { name: 'Lenticchie', substitutes: ['Ceci', 'Fagioli', 'Piselli', 'Legumi misti in scatola'] },
          { name: 'Crostini', substitutes: ['Pane tostato', 'Riso', 'Fette biscottate'] },
        ],
        simpleVariant: { title: 'Versione velocissima', description: 'Legumi in scatola scaldati con olio, sale e rosmarino. 5 minuti.' },
      },
    ],
  },
  {
    day: 'Venerdì', dayShort: 'Ven',
    meals: [
      { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Smoothie banana e avena', description: 'Banana, latte, fiocchi d\'avena frullati. Cremoso e saziante.',
        ingredients: [
          { name: 'Banana', substitutes: ['Frutta surgelata', 'Mela', 'Pera'] },
          { name: 'Fiocchi d\'avena', substitutes: ['Biscotti (frullati)', 'Niente (viene più liquido)'] },
        ],
        simpleVariant: { title: 'Senza frullatore?', description: 'Banana schiacciata con yogurt e miele. Stessa energia.' },
      },
      { type: 'spuntino_mattina', typeLabel: 'Spuntino', icon: '🍊', title: 'Agrume di stagione', description: 'Arancia, mandarino o pompelmo. Vitamina C naturale.' },
      { type: 'pranzo', typeLabel: 'Pranzo', icon: '🍝', title: 'Pasta ceci e rosmarino', description: 'Un piatto unico, saziante e ricco di proteine vegetali.',
        ingredients: [
          { name: 'Ceci', substitutes: ['Lenticchie', 'Fagioli', 'Piselli'] },
          { name: 'Rosmarino', substitutes: ['Salvia', 'Alloro', 'Niente'] },
        ],
        simpleVariant: { title: 'Versione lampo', description: 'Pasta con ceci in scatola, olio e pepe. Pronta in 15 minuti.' },
      },
      { type: 'spuntino_pomeriggio', typeLabel: 'Merenda', icon: '🫖', title: 'Tisana e biscotti', description: 'Un momento di pausa con tisana e 2-3 biscotti.' },
      { type: 'cena', typeLabel: 'Cena', icon: '🌙', title: 'Petto di pollo con verdure', description: 'Pollo alla piastra con insalata mista. Leggero e veloce.',
        ingredients: [
          { name: 'Petto di pollo', substitutes: ['Tacchino', 'Pesce', 'Uova', 'Tofu'] },
          { name: 'Insalata mista', substitutes: ['Verdure al vapore', 'Pomodori e cetrioli', 'Verdure grigliate'] },
        ],
      },
    ],
  },
  {
    day: 'Sabato', dayShort: 'Sab',
    meals: [
      { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Pancake semplici', description: 'Uovo, banana schiacciata e un pizzico di cannella. Senza farina.',
        ingredients: [
          { name: 'Banana', substitutes: ['Mela grattugiata', 'Zucca cotta'] },
          { name: 'Uovo', substitutes: ['Yogurt e farina (pancake classici)'] },
        ],
        simpleVariant: { title: 'Più classico', description: 'Fette biscottate con marmellata e caffè. Il sabato si fa come si vuole.' },
      },
      { type: 'spuntino_mattina', typeLabel: 'Spuntino', icon: '🥝', title: 'Macedonia veloce', description: 'Taglia 2-3 frutti che hai. Un po\' di limone sopra.' },
      { type: 'pranzo', typeLabel: 'Pranzo', icon: '🍕', title: 'Piadina con verdure', description: 'Piadina con rucola, pomodoro, mozzarella. Sabato un po\' speciale.',
        ingredients: [
          { name: 'Piadina', substitutes: ['Pane', 'Tortilla', 'Focaccia'] },
          { name: 'Mozzarella', substitutes: ['Ricotta', 'Formaggio spalmabile', 'Hummus'] },
        ],
      },
      { type: 'spuntino_pomeriggio', typeLabel: 'Merenda', icon: '🍫', title: 'Cioccolato fondente', description: '2-3 quadretti con calma. Un piccolo piacere senza sensi di colpa.' },
      { type: 'cena', typeLabel: 'Cena', icon: '🌙', title: 'Riso con verdure saltate', description: 'Riso basmati con verdure miste saltate in padella.',
        ingredients: [
          { name: 'Riso basmati', substitutes: ['Riso qualsiasi', 'Noodles', 'Cous cous'] },
          { name: 'Verdure miste', substitutes: ['Verdure surgelate', 'Solo zucchine e carote', 'Quello che hai nel frigo'] },
        ],
      },
    ],
  },
  {
    day: 'Domenica', dayShort: 'Dom',
    meals: [
      { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Colazione lenta', description: 'Prenditi tempo. Pane, burro, marmellata e un succo di frutta.',
        ingredients: [
          { name: 'Burro', substitutes: ['Olio d\'oliva', 'Crema di nocciole', 'Niente'] },
        ],
      },
      { type: 'spuntino_mattina', typeLabel: 'Spuntino', icon: '🍇', title: 'Frutta secca mista', description: 'Un pugno di frutta secca. Noci, mandorle, quello che hai.' },
      { type: 'pranzo', typeLabel: 'Pranzo', icon: '🍝', title: 'Lasagna leggera o pasta al forno', description: 'Una porzione di comfort food. La domenica si può.',
        simpleVariant: { title: 'Versione veloce', description: 'Pasta al ragù semplice o pasta al forno con quello che hai.' },
      },
      { type: 'spuntino_pomeriggio', typeLabel: 'Merenda', icon: '🍰', title: 'Un dolcetto fatto in casa', description: 'Anche una fetta di ciambellone o biscotti. Condividi con qualcuno.',
        simpleVariant: { title: 'Senza dolce?', description: 'Yogurt con miele o frutta. Va benissimo uguale.' },
      },
      { type: 'cena', typeLabel: 'Cena', icon: '🌙', title: 'Minestrone della domenica', description: 'Verdure, patate, un filo d\'olio. Leggero per chiudere il weekend.',
        ingredients: [
          { name: 'Verdure varie', substitutes: ['Minestrone surgelato', 'Minestrone pronto', 'Anche solo patate e carote'] },
        ],
        simpleVariant: { title: 'Super veloce', description: 'Minestrone pronto scaldato. Zero stress, stessa bontà.' },
      },
    ],
  },
];

// Health-safe replacement meals (low glycemic, heart-healthy, etc.)
const healthReplacements: Record<string, Meal[]> = {
  // Low-glycemic breakfast replacements
  colazione_lowgi: [
    { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Uova strapazzate e avocado', description: 'Due uova con mezzo avocado e pomodorini. Proteine e grassi buoni per iniziare.',
      ingredients: [
        { name: 'Uova', substitutes: ['Ricotta fresca', 'Yogurt greco bianco (senza zuccheri)', 'Tofu strapazzato'] },
        { name: 'Avocado', substitutes: ['Olio EVO su pane integrale', 'Frutta secca', 'Hummus'] },
      ],
      simpleVariant: { title: 'Versione veloce', description: 'Yogurt greco bianco con noci e semi. Zero zuccheri aggiunti, tanta energia.' },
    },
    { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Yogurt greco con noci e semi', description: 'Yogurt greco bianco, noci, semi di chia. Saziante e a basso impatto glicemico.',
      ingredients: [
        { name: 'Yogurt greco', substitutes: ['Ricotta', 'Yogurt bianco naturale', 'Latte intero con semi'] },
        { name: 'Noci', substitutes: ['Mandorle', 'Nocciole', 'Semi di zucca'] },
      ],
      simpleVariant: { title: 'Ancora più semplice', description: 'Ricotta con un filo d\'olio e semi. Pochi ingredienti, tanta sostanza.' },
    },
    { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Porridge proteico', description: 'Fiocchi d\'avena con latte, semi di chia e frutta secca. Rilascio lento di energia.',
      ingredients: [
        { name: 'Fiocchi d\'avena', substitutes: ['Crusca d\'avena', 'Fiocchi di farro'] },
        { name: 'Semi di chia', substitutes: ['Semi di lino', 'Semi di girasole', 'Noci tritate'] },
      ],
    },
    { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Pane integrale con ricotta e noci', description: 'Una fetta di pane integrale con ricotta e qualche noce. Semplice e bilanciato.',
      ingredients: [
        { name: 'Pane integrale', substitutes: ['Gallette di avena', 'Pane di segale'] },
        { name: 'Ricotta', substitutes: ['Formaggio fresco magro', 'Hummus'] },
      ],
    },
    { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Frittata leggera con verdure', description: 'Un uovo con spinaci o zucchine. Proteica e saziante senza picchi glicemici.',
      ingredients: [
        { name: 'Uovo', substitutes: ['Albumi (2-3)', 'Ricotta al forno'] },
        { name: 'Spinaci', substitutes: ['Zucchine', 'Peperoni', 'Funghi'] },
      ],
    },
    { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Smoothie proteico verde', description: 'Yogurt greco, spinacini, mezza banana non troppo matura, semi di lino.',
      ingredients: [
        { name: 'Spinacini', substitutes: ['Cetriolo', 'Sedano'] },
        { name: 'Banana (mezza, non matura)', substitutes: ['Frutti di bosco', 'Mela verde'] },
      ],
    },
    { type: 'colazione', typeLabel: 'Colazione', icon: '🌅', title: 'Toast integrale con uovo e pomodoro', description: 'Pane integrale tostato, uovo in padella e fettine di pomodoro.',
      ingredients: [
        { name: 'Pane integrale', substitutes: ['Gallette integrali', 'Pane di segale'] },
      ],
    },
  ],
  // Low-glycemic snack replacements
  spuntino_lowgi: [
    { type: 'spuntino_mattina', typeLabel: 'Spuntino', icon: '🥜', title: 'Frutta secca mista', description: 'Un pugno di mandorle, noci o nocciole. Energia buona e stabile.',
      simpleVariant: { title: 'Alternative', description: 'Un pezzo di formaggio stagionato o bastoncini di finocchio.' },
    },
    { type: 'spuntino_mattina', typeLabel: 'Spuntino', icon: '🥒', title: 'Verdura cruda e hummus', description: 'Carote, finocchi o cetrioli con un po\' di hummus.',
    },
    { type: 'spuntino_mattina', typeLabel: 'Spuntino', icon: '🍏', title: 'Mela verde con burro di mandorle', description: 'La mela verde ha meno zuccheri. Con un po\' di burro di mandorle è perfetta.',
    },
  ],
  merenda_lowgi: [
    { type: 'spuntino_pomeriggio', typeLabel: 'Merenda', icon: '🥜', title: 'Mandorle e cioccolato fondente 85%', description: '8-10 mandorle e 2 quadretti di fondente almeno 85%. Pochissimi zuccheri.',
      ingredients: [
        { name: 'Mandorle', substitutes: ['Noci', 'Nocciole', 'Semi di zucca'] },
      ],
    },
    { type: 'spuntino_pomeriggio', typeLabel: 'Merenda', icon: '🧀', title: 'Formaggio e noci', description: 'Un pezzetto di parmigiano con qualche noce. Saziante e senza picchi.',
    },
    { type: 'spuntino_pomeriggio', typeLabel: 'Merenda', icon: '🫐', title: 'Yogurt greco con frutti di bosco', description: 'Yogurt bianco con mirtilli o lamponi. I frutti di bosco hanno pochi zuccheri.',
    },
  ],
};

// Keywords that indicate a meal has high glycemic content
const highGIMealKeywords = ['marmellata', 'miele', 'zucchero', 'sciroppo', 'biscotti', 'ciambellone', 'torta', 'dolce', 'succo di frutta', 'pancake', 'nutella', 'crema di nocciole', 'pane e marmellata', 'fette biscottate'];
const highGISubstituteKeywords = ['marmellata', 'miele', 'sciroppo d\'acero', 'crema di nocciole'];

export interface HealthConstraints {
  foodsToReduce: string[];
  foodsToIncrease: string[];
  hasGlycemicRisk: boolean;
  hasCholesterolRisk: boolean;
}

/**
 * Check if a meal conflicts with health constraints.
 */
const mealConflictsWithHealth = (meal: Meal, constraints: HealthConstraints): boolean => {
  if (!constraints.hasGlycemicRisk) return false;
  const text = `${meal.title} ${meal.description}`.toLowerCase();
  // Check substitutes too
  const subTexts = meal.ingredients?.flatMap(i => [i.name, ...i.substitutes].map(s => s.toLowerCase())) || [];
  const allText = text + ' ' + subTexts.join(' ');
  
  return highGIMealKeywords.some(kw => allText.includes(kw));
};

/**
 * Filter out high-GI substitutes from ingredients
 */
const filterSubstitutes = (meal: Meal, constraints: HealthConstraints): Meal => {
  if (!constraints.hasGlycemicRisk || !meal.ingredients) return meal;
  return {
    ...meal,
    ingredients: meal.ingredients.map(ing => ({
      ...ing,
      substitutes: ing.substitutes.filter(sub => 
        !highGISubstituteKeywords.some(kw => sub.toLowerCase().includes(kw))
      ),
    })).filter(ing => ing.substitutes.length > 0),
  };
};

/**
 * Replace a conflicting meal with a health-safe alternative.
 */
const getHealthSafeReplacement = (meal: Meal, dayIndex: number, constraints: HealthConstraints): Meal => {
  if (meal.type === 'colazione') {
    const options = healthReplacements.colazione_lowgi;
    return options[dayIndex % options.length];
  }
  if (meal.type === 'spuntino_mattina') {
    const options = healthReplacements.spuntino_lowgi;
    return options[dayIndex % options.length];
  }
  if (meal.type === 'spuntino_pomeriggio') {
    const options = healthReplacements.merenda_lowgi;
    return options[dayIndex % options.length];
  }
  // For pranzo/cena, just filter substitutes
  return filterSubstitutes(meal, constraints);
};

// Energy-focused plan variations
const energyPlan: DayPlan[] = lightPlan.map((day) => ({
  ...day,
  meals: day.meals.map((meal) => {
    if (meal.type === 'colazione') {
      return { ...meal, tags: ['energia'] };
    }
    return meal;
  }),
}));

export const getWeeklyPlan = (
  objective: string,
  _activity: string,
  _sex?: string,
  _age?: string,
  healthConstraints?: HealthConstraints,
): DayPlan[] => {
  let basePlan = objective.toLowerCase().includes('energia') ? energyPlan : lightPlan;

  // Apply health constraints — replace conflicting meals
  if (healthConstraints && (healthConstraints.hasGlycemicRisk || healthConstraints.hasCholesterolRisk)) {
    basePlan = basePlan.map((day, dayIdx) => ({
      ...day,
      meals: day.meals.map(meal => {
        if (mealConflictsWithHealth(meal, healthConstraints)) {
          return getHealthSafeReplacement(meal, dayIdx, healthConstraints);
        }
        return filterSubstitutes(meal, healthConstraints);
      }),
    }));
  }

  return basePlan;
};

export const getTodayPlan = (
  objective: string,
  activity: string,
  sex?: string,
  age?: string,
  healthConstraints?: HealthConstraints,
): DayPlan | undefined => {
  const plan = getWeeklyPlan(objective, activity, sex, age, healthConstraints);
  const dayIndex = new Date().getDay();
  const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return plan[mappedIndex];
};
