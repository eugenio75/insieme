import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { getAllRecipes, getIntoleranceTips, getDailyTip, FoodTip, Ingredient } from '../data/foodTips';
import BottomNav from '../components/BottomNav';
import { ChevronDown, RefreshCw } from 'lucide-react';

type Tab = 'consigli' | 'ricette' | 'gonfiore';

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
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl bg-muted/50 text-xs transition-colors hover:bg-muted"
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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/60 text-[11px] font-medium text-accent-foreground transition-colors hover:bg-accent"
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
    className="p-5 rounded-[24px] bg-card border border-border"
  >
    <div className="flex items-start gap-4">
      <span className="text-2xl">{tip.icon}</span>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground mb-1">{tip.title}</h4>
        <p className="text-sm text-muted-foreground">{tip.description}</p>
        {tip.tags && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {tip.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">
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

const NutritionPage = () => {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('consigli');

  const dailyTip = getDailyTip(user.objective, user.difficulty, user.intolerances);
  const intoleranceTips = getIntoleranceTips(user.intolerances);
  const allRecipes = getAllRecipes();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'consigli', label: 'Per te' },
    { key: 'ricette', label: 'Idee' },
    { key: 'gonfiore', label: 'Anti-gonfiore' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto px-6 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
          Alimentazione 🥗
        </h1>
        <p className="text-muted-foreground mb-6">
          Consigli gentili, mai imposizioni. Adattali a quello che hai.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                ${activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'consigli' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Daily tip highlight */}
            <div className="p-6 rounded-[32px] bg-accent border border-transparent">
              <p className="text-xs text-accent-foreground/60 btn-text mb-3">CONSIGLIO DEL GIORNO</p>
              <div className="flex items-start gap-4">
                <span className="text-3xl">{dailyTip.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-medium text-accent-foreground mb-1">
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

            {/* Info card */}
            <div className="p-4 rounded-[20px] bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground text-center italic">
                💡 Ogni consiglio ha una versione semplice e le sostituzioni per ogni ingrediente. Usa quello che hai in casa!
              </p>
            </div>

            {/* Intolerance-specific tips */}
            {intoleranceTips.length > 0 && (
              <>
                <h3 className="font-display text-base font-medium text-foreground mt-6 mb-3">
                  Per le tue sensibilità
                </h3>
                {intoleranceTips.map((tip, i) => (
                  <TipCard key={tip.title} tip={tip} delay={i * 0.08} />
                ))}
              </>
            )}

            {user.intolerances.length === 0 && (
              <div className="p-5 rounded-[24px] bg-card border border-border text-center">
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
            <div className="p-5 rounded-[24px] bg-accent border border-transparent mb-4">
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
                className="p-5 rounded-[24px] bg-card border border-border"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{item.icon}</span>
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
