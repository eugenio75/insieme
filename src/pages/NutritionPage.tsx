import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { getAllRecipes, getIntoleranceTips, getDailyTip, FoodTip, Ingredient } from '../data/foodTips';
import { getTodayPlan, getWeeklyPlan, Meal, DayPlan } from '../data/mealPlans';
import BottomNav from '../components/BottomNav';
import { ChevronDown, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, Timer, Sparkles } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import { useFoodFindings } from '@/hooks/useFoodFindings';
import { usePatternAnalysis } from '@/hooks/useFoodFindings';
import { useFasting } from '@/hooks/useFasting';

type Tab = 'piano' | 'consigli' | 'ricette' | 'gonfiore';

const antiBloatingGuide = [
  { title: 'Mangia lentamente', description: 'Posa la forchetta tra un boccone e l\'altro. Aiuta a ridurre l\'aria ingerita.', icon: '🧘‍♀️' },
  { title: 'Evita le bevande gassate', description: 'Preferisci acqua naturale o tisane. Le bollicine aumentano il gonfiore.', icon: '🫧' },
  { title: 'Finocchio e zenzero', description: 'I tuoi migliori alleati naturali. In tisana, crudi, o nei piatti.', icon: '🌿' },
  { title: 'Non saltare i pasti', description: 'Mangiare con regolarità aiuta la digestione e previene la fame nervosa.', icon: '⏰' },
  { title: 'Cucina semplice', description: 'Meno ingredienti, meno elaborazione. Il tuo intestino ti ringrazierà.', icon: '🍳' },
  { title: 'Cammina dopo mangiato', description: 'Anche solo 10 minuti. Favorisce il transito e riduce la pesantezza.', icon: '🚶‍♀️' },
  { title: 'Attenzione ai FODMAP', description: 'Cipolle, aglio, legumi possono causare gonfiore. Prova a ridurli per una settimana.', icon: '📋' },
  { title: 'Rilassati prima di mangiare', description: 'Lo stress influisce sulla digestione. Un respiro profondo prima di iniziare.', icon: '🌸' },
];

const SubstitutionPanel = ({ ingredients }: { ingredients: Ingredient[] }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="mt-3 space-y-1.5">
      {ingredients.map((ing, idx) => (
        <div key={ing.name}>
          <button
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-muted/50 text-xs transition-colors hover:bg-muted"
          >
            <span className="text-muted-foreground">
              Non hai <span className="font-medium text-foreground">{ing.name}</span>?
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${expandedIdx === idx ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {expandedIdx === idx && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 py-2 space-y-1">
                  <p className="text-[10px] text-muted-foreground/70 btn-text mb-1">PUOI SOSTITUIRE CON:</p>
                  {ing.substitutes.map((sub) => (
                    <div key={sub} className="flex items-center gap-2 text-xs text-foreground">
                      <span className="text-primary">•</span>
                      {sub}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

const SimpleVariantBadge = ({ variant }: { variant: { title: string; description: string } }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/60 text-[11px] font-medium text-accent-foreground transition-colors hover:bg-accent"
      >
        <RefreshCw className="w-3 h-3" />
        {variant.title}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-accent-foreground/80 mt-2 pl-1 italic">
              {variant.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TipCard = ({ tip, delay = 0 }: { tip: FoodTip; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-5 rounded-2xl glass glass-border"
  >
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
        <span className="text-xl">{tip.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground mb-1">{tip.title}</h4>
        <p className="text-sm text-muted-foreground">{tip.description}</p>
        {tip.tags && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {tip.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-lg bg-muted text-muted-foreground text-[10px]">
                {tag}
              </span>
            ))}
          </div>
        )}
        {tip.simpleVariant && <SimpleVariantBadge variant={tip.simpleVariant} />}
        {tip.ingredients && tip.ingredients.length > 0 && (
          <SubstitutionPanel ingredients={tip.ingredients} />
        )}
      </div>
    </div>
  </motion.div>
);

const MealCard = ({ meal, delay = 0, warning, dimmed }: { meal: Meal; delay?: number; warning?: string | null; dimmed?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: dimmed ? 0.5 : 1, y: 0 }}
    transition={{ delay }}
    className={`p-5 rounded-2xl glass glass-border ${warning ? 'border-secondary/30' : ''} ${dimmed ? 'opacity-50' : ''}`}
  >
    {warning && (
      <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-secondary/10">
        <AlertTriangle className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
        <p className="text-[11px] text-secondary">{warning}</p>
      </div>
    )}
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <span className="text-xl">{meal.icon}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">{meal.typeLabel}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground mb-1">{meal.title}</h4>
        <p className="text-sm text-muted-foreground">{meal.description}</p>
        {meal.simpleVariant && <SimpleVariantBadge variant={meal.simpleVariant} />}
        {meal.ingredients && meal.ingredients.length > 0 && (
          <SubstitutionPanel ingredients={meal.ingredients} />
        )}
      </div>
    </div>
  </motion.div>
);

const DaySelector = ({
  weekPlan,
  selectedDay,
  onSelectDay,
}: {
  weekPlan: DayPlan[];
  selectedDay: number;
  onSelectDay: (idx: number) => void;
}) => {
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
      {weekPlan.map((day, idx) => {
        const isToday = idx === todayIdx;
        const isSelected = idx === selectedDay;
        return (
          <button
            key={day.day}
            onClick={() => onSelectDay(idx)}
            className={`flex flex-col items-center px-3 py-2.5 rounded-xl min-w-[52px] transition-all duration-300
              ${isSelected
                ? 'gradient-primary text-primary-foreground shadow-glow'
                : isToday
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
          >
            <span className="text-[10px] font-medium">{day.dayShort}</span>
            {isToday && !isSelected && (
              <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
};

const NutritionPage = () => {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('piano');
  const { checkMeal } = useFoodFindings();
  const { analysis, load: loadPatterns, loaded: patternsLoaded } = usePatternAnalysis();
  const { config: fastingConfig, getStatus } = useFasting();

  // Load patterns when component mounts
  useEffect(() => {
    if (!patternsLoaded) loadPatterns();
  }, [patternsLoaded]);

  const dietSuggestions = analysis?.dietSuggestions || [];

  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  const [selectedDay, setSelectedDay] = useState(todayIdx);

  const dailyTip = getDailyTip(user.objective, user.difficulty, user.intolerances);
  const intoleranceTips = getIntoleranceTips(user.intolerances);
  const allRecipes = getAllRecipes();
  const weekPlan = getWeeklyPlan(user.objective, user.activity, user.sex, user.age);
  const selectedDayPlan = weekPlan[selectedDay];

  // Determine which meals are outside the eating window
  const fastingStatus = getStatus();
  const isMealOutsideWindow = (mealType: string): boolean => {
    if (!fastingConfig.enabled) return false;
    const eatingStart = fastingStatus.eatingWindowStart;
    const eatingEnd = fastingStatus.eatingWindowEnd;
    
    const mealHours: Record<string, number> = {
      'colazione': 8,
      'spuntino_mattina': 10,
      'pranzo': 13,
      'spuntino_pomeriggio': 16,
      'cena': 20,
    };
    const mealHour = mealHours[mealType] ?? 12;
    
    // Check if meal hour is within eating window
    if (eatingStart < eatingEnd) {
      return mealHour < eatingStart || mealHour >= eatingEnd;
    } else {
      // Window wraps around midnight
      return mealHour >= eatingEnd && mealHour < eatingStart;
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'piano', label: '📋 Piano' },
    { key: 'consigli', label: 'Per te' },
    { key: 'ricette', label: 'Idee' },
    { key: 'gonfiore', label: 'Anti-gonfiore' },
  ];

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-6">
      <AppHeader />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <h1 className="font-display text-2xl text-foreground mb-2">
          Alimentazione 🥗
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Consigli gentili, mai imposizioni. Adattali a quello che hai.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap
                ${activeTab === tab.key
                  ? 'gradient-primary text-primary-foreground shadow-glow'
                  : 'glass glass-border text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Piano settimanale */}
        {activeTab === 'piano' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 rounded-2xl bg-accent glass-border mb-5">
              <p className="text-sm text-accent-foreground/80 italic font-display">
                "Non è una dieta. Sono idee per mangiare bene, con quello che hai. Cambia tutto quello che vuoi." 💛
              </p>
            </div>

            {/* Fasting window info */}
            {fastingConfig.enabled && (
              <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
                <Timer className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-xs text-foreground">
                  Finestra alimentare: <span className="font-medium">{fastingStatus.eatingWindowStart.toString().padStart(2, '0')}:00 — {fastingStatus.eatingWindowEnd.toString().padStart(2, '0')}:00</span>
                  <span className="text-muted-foreground ml-1">• I pasti fuori finestra sono segnalati</span>
                </p>
              </div>
            )}

            {/* AI Diet Adaptation Banner */}
            {dietSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 rounded-2xl bg-primary/5 border border-primary/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-xs font-medium text-foreground">Il piano si sta adattando a te</p>
                </div>
                <div className="space-y-2">
                  {dietSuggestions.slice(0, 3).map((sug, i) => {
                    const icon = sug.type === 'add' ? '➕' : sug.type === 'reduce' ? '➖' : sug.type === 'replace' ? '🔄' : '⏰';
                    return (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span>{icon}</span>
                        <div>
                          <p className="text-foreground font-medium">{sug.suggestion}</p>
                          <p className="text-muted-foreground">{sug.reason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

              weekPlan={weekPlan}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />

            {selectedDayPlan && (
              <div className="space-y-3">
                <h3 className="font-display text-base text-foreground">
                  {selectedDayPlan.day}
                  {selectedDay === todayIdx && (
                    <span className="ml-2 text-xs text-primary font-normal">• oggi</span>
                  )}
                </h3>
                {selectedDayPlan.meals
                  .map((meal, i) => {
                    const finding = checkMeal(meal.title, meal.description);
                    const outsideWindow = isMealOutsideWindow(meal.type);
                    const warning = outsideWindow
                      ? `⏱️ Questo pasto è fuori dalla tua finestra alimentare (${fastingConfig.protocol})`
                      : finding
                        ? `${finding.food} potrebbe causare ${finding.issue === 'gonfiore' ? 'gonfiore' : finding.issue === 'energia_bassa' ? 'calo di energia' : 'disagio'}. Prova la versione alternativa!`
                        : null;
                    return <MealCard key={meal.type} meal={meal} delay={i * 0.06} warning={warning} dimmed={outsideWindow} />;
                  })}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                disabled={selectedDay === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-xl glass glass-border text-muted-foreground text-sm disabled:opacity-30 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" /> Giorno prima
              </button>
              <button
                onClick={() => setSelectedDay(Math.min(6, selectedDay + 1))}
                disabled={selectedDay === 6}
                className="flex items-center gap-1 px-4 py-2 rounded-xl glass glass-border text-muted-foreground text-sm disabled:opacity-30 transition-opacity"
              >
                Giorno dopo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'consigli' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="p-6 rounded-2xl bg-accent glass-border">
              <p className="text-xs text-accent-foreground/60 btn-text mb-3">CONSIGLIO DEL GIORNO</p>
              <div className="flex items-start gap-4">
                <span className="text-3xl">{dailyTip.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base text-accent-foreground mb-1">
                    {dailyTip.title}
                  </h3>
                  <p className="text-sm text-accent-foreground/80">{dailyTip.description}</p>
                  {dailyTip.simpleVariant && <SimpleVariantBadge variant={dailyTip.simpleVariant} />}
                  {dailyTip.ingredients && dailyTip.ingredients.length > 0 && (
                    <SubstitutionPanel ingredients={dailyTip.ingredients} />
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass glass-border">
              <p className="text-xs text-muted-foreground text-center italic">
                💡 Ogni consiglio ha una versione semplice e le sostituzioni per ogni ingrediente. Usa quello che hai in casa!
              </p>
            </div>

            {intoleranceTips.length > 0 && (
              <>
                <h3 className="font-display text-base text-foreground mt-6 mb-3">
                  Per le tue sensibilità
                </h3>
                {intoleranceTips.map((tip, i) => (
                  <TipCard key={tip.title} tip={tip} delay={i * 0.08} />
                ))}
              </>
            )}

            {user.intolerances.length === 0 && (
              <div className="p-5 rounded-2xl glass glass-border text-center">
                <p className="text-sm text-muted-foreground">
                  Non hai indicato intolleranze. Puoi aggiungerle dal tuo profilo in qualsiasi momento 💛
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'ricette' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Piccole idee semplici. Ogni ricetta ha alternative con quello che hai in casa.
            </p>
            {allRecipes.map((recipe, i) => (
              <TipCard key={recipe.title} tip={recipe} delay={i * 0.05} />
            ))}
          </motion.div>
        )}

        {activeTab === 'gonfiore' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="p-5 rounded-2xl bg-accent glass-border mb-4">
              <p className="text-sm text-accent-foreground/80 italic font-display">
                "Il gonfiore non è una colpa. È un segnale del corpo. Ascoltalo con gentilezza."
              </p>
            </div>
            {antiBloatingGuide.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl glass glass-border"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default NutritionPage;
