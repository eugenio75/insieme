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
): DayPlan[] => {
  // For now return the base plan - can be extended with more specific plans
  if (objective.toLowerCase().includes('energia')) {
    return energyPlan;
  }
  return lightPlan;
};

export const getTodayPlan = (
  objective: string,
  activity: string,
  sex?: string,
  age?: string,
): DayPlan | undefined => {
  const plan = getWeeklyPlan(objective, activity, sex, age);
  const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
  const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // 0=Mon, 6=Sun
  return plan[mappedIndex];
};
