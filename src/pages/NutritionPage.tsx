import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { getAllRecipes, getIntoleranceTips, getDailyTip } from '../data/foodTips';
import BottomNav from '../components/BottomNav';

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
          Consigli gentili, mai imposizioni.
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
                <div>
                  <h3 className="font-display text-base font-medium text-accent-foreground mb-1">
                    {dailyTip.title}
                  </h3>
                  <p className="text-sm text-accent-foreground/80">{dailyTip.description}</p>
                </div>
              </div>
            </div>

            {/* Intolerance-specific tips */}
            {intoleranceTips.length > 0 && (
              <>
                <h3 className="font-display text-base font-medium text-foreground mt-6 mb-3">
                  Per le tue sensibilità
                </h3>
                {intoleranceTips.map((tip, i) => (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-5 rounded-[24px] bg-card border border-border shadow-card"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{tip.icon}</span>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  </motion.div>
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
              Piccole idee semplici. Niente di complicato, niente di rigido.
            </p>
            {allRecipes.map((recipe, i) => (
              <motion.div
                key={recipe.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-[24px] bg-card border border-border"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{recipe.icon}</span>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">{recipe.title}</h4>
                    <p className="text-sm text-muted-foreground">{recipe.description}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {recipe.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
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
