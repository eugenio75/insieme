import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChevronDown, Sparkles, ShoppingBag, MessageCircle, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import type { Meal, HealthConstraints } from '@/data/mealPlans';

interface MealActionsProps {
  meal: Meal;
  healthConstraints?: HealthConstraints;
  onMealSwap: (newMeal: Partial<Meal>) => void;
}

const MealActions = ({ meal, healthConstraints, onMealSwap }: MealActionsProps) => {
  const { user } = useAppStore();
  const [loading, setLoading] = useState<string | null>(null); // action type being loaded
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [aiAlternatives, setAiAlternatives] = useState<Array<{ name: string; note: string }> | null>(null);
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);

  const callMealSwap = async (action: string, extra: Record<string, any> = {}) => {
    setLoading(action);
    try {
      const { data, error } = await supabase.functions.invoke('meal-swap', {
        body: {
          action,
          meal: {
            type: meal.type,
            typeLabel: meal.typeLabel,
            title: meal.title,
            description: meal.description,
            icon: meal.icon,
          },
          userProfile: {
            objective: user.objective,
            intolerances: user.intolerances,
            customIntolerances: user.customIntolerances,
            age: user.age,
            sex: user.sex,
            activity: user.activity,
            workType: user.workType,
            difficulty: user.difficulty,
          },
          healthConstraints,
          ...extra,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return null;
      }
      return data?.result;
    } catch (err: any) {
      console.error('meal-swap error:', err);
      toast.error('Non sono riuscita a generare un\'alternativa. Riprova tra poco.');
      return null;
    } finally {
      setLoading(null);
    }
  };

  const handleRegenerate = async () => {
    const result = await callMealSwap('regenerate_meal');
    if (result) {
      onMealSwap(result);
      toast.success('Ecco un\'alternativa! 🔄');
    }
  };

  const handleNotAvailable = async () => {
    if (expandedIngredient) {
      // Replace just the selected ingredient with pantry alternatives
      const result = await callMealSwap('not_available_ingredient', { ingredient: expandedIngredient });
      if (result) {
        onMealSwap(result);
        setExpandedIngredient(null);
        setAiAlternatives(null);
        toast.success(`${expandedIngredient} sostituito con la dispensa! 🏠`);
      }
    } else {
      // No ingredient selected → regenerate whole meal with pantry items
      const result = await callMealSwap('not_available');
      if (result) {
        onMealSwap(result);
        toast.success('Ecco cosa puoi fare con la dispensa! 🏠');
      }
    }
  };

  const handleIngredientTap = async (ingredientName: string) => {
    if (expandedIngredient === ingredientName && aiAlternatives) {
      setExpandedIngredient(null);
      setAiAlternatives(null);
      return;
    }
    setExpandedIngredient(ingredientName);
    setAiAlternatives(null);
    const result = await callMealSwap('swap_ingredient', { ingredient: ingredientName });
    if (result && Array.isArray(result)) {
      setAiAlternatives(result);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const result = await callMealSwap('custom_request', { request: chatInput.trim() });
    if (result) {
      onMealSwap(result);
      setChatInput('');
      setShowChat(false);
      toast.success('Pasto adattato! ✨');
    }
  };

  // Extract ingredient names from description for tap-to-swap
  const mainIngredients = meal.ingredients?.map(i => i.name) || [];

  const isLoading = loading !== null;

  return (
    <div className="mt-3 space-y-2">
      {/* Ingredient chips - tap to get AI alternatives */}
      {mainIngredients.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground/60 btn-text px-1">TOCCA UN INGREDIENTE PER SOSTITUIRLO</p>
          <div className="flex flex-wrap gap-1.5">
            {mainIngredients.map((name) => (
              <button
                key={name}
                onClick={() => handleIngredientTap(name)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${expandedIngredient === name
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'bg-muted/60 text-foreground hover:bg-muted border border-transparent'
                  }
                  disabled:opacity-50`}
              >
                {loading === 'swap_ingredient' && expandedIngredient === name ? (
                  <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                ) : null}
                {name}
              </button>
            ))}
          </div>

          {/* AI alternatives for selected ingredient */}
          <AnimatePresence>
            {expandedIngredient && aiAlternatives && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-primary/70 btn-text">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      ALTERNATIVE AI PER {expandedIngredient.toUpperCase()}
                    </p>
                    <button onClick={() => { setExpandedIngredient(null); setAiAlternatives(null); }}>
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                  {aiAlternatives.map((alt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-primary mt-0.5">•</span>
                      <div>
                        <span className="font-medium text-foreground">{alt.name}</span>
                        {alt.note && <span className="text-muted-foreground ml-1">— {alt.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action buttons row */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={handleRegenerate}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/60 text-[11px] font-medium text-accent-foreground
            hover:bg-accent transition-colors disabled:opacity-50"
        >
          {loading === 'regenerate_meal' ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          Sorprendimi
        </button>

        <button
          onClick={handleNotAvailable}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/60 text-[11px] font-medium text-accent-foreground
            hover:bg-accent transition-colors disabled:opacity-50"
        >
          {loading === 'not_available' || loading === 'not_available_ingredient' ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ShoppingBag className="w-3 h-3" />
          )}
          {expandedIngredient ? 'Non ho neanche queste' : 'Non ce l\'ho'}
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-colors disabled:opacity-50
            ${showChat
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'bg-accent/60 text-accent-foreground hover:bg-accent'
            }`}
        >
          <MessageCircle className="w-3 h-3" />
          Adatta
        </button>
      </div>

      {/* Mini chat input */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Es: più leggero, senza cottura, veloce..."
                className="flex-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-xs
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-all duration-200 placeholder:text-muted-foreground/50"
                autoFocus
              />
              <button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || isLoading}
                className="px-3 py-2.5 rounded-xl gradient-primary text-primary-foreground text-xs font-medium
                  disabled:opacity-40 transition-opacity flex items-center gap-1"
              >
                {loading === 'custom_request' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-1 px-1">
              Chiedi quello che vuoi: più proteico, senza forno, con quello che ho...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealActions;
