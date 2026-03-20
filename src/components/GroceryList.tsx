import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Trash2, Check, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { useGroceryList } from '@/hooks/useGroceryList';
import { useAppStore } from '@/store/useAppStore';
import { getWeeklyPlan } from '@/data/mealPlans';

const GroceryList = () => {
  const { user } = useAppStore();
  const {
    categories,
    listId,
    loading,
    generating,
    tips,
    totalItems,
    checkedItems,
    generateList,
    toggleItem,
    addItem,
    deleteItem,
  } = useGroceryList();

  const [showAddInput, setShowAddInput] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Altro');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const handleGenerate = () => {
    const weekPlan = getWeeklyPlan(user.objective, user.activity, user.sex, user.age);
    const simplified = weekPlan.map(day => ({
      day: day.day,
      meals: day.meals.map(m => ({
        type: m.type,
        title: m.title,
        description: m.description,
      })),
    }));
    generateList(simplified);
  };

  const handleAddItem = () => {
    const trimmed = newItemName.trim();
    if (trimmed) {
      addItem(trimmed, newItemCategory);
      setNewItemName('');
      setShowAddInput(false);
    }
  };

  const toggleCat = (catName: string) => {
    setExpandedCats(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const categoryOptions = ['Verdure', 'Frutta', 'Proteine', 'Latticini e alternative', 'Cereali e pane', 'Dispensa', 'Extra', 'Altro'];

  // Empty state — no list yet
  if (!listId && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display text-lg text-foreground mb-2">
            La tua spesa della prossima settimana
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Preparata in base ai pasti suggeriti per te. Semplice, organizzata, senza stress.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-3.5 rounded-2xl gradient-primary text-primary-foreground text-sm font-medium
              shadow-glow disabled:opacity-50 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sto preparando la spesa...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Prepara la mia spesa
              </>
            )}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-accent glass-border">
          <p className="text-xs text-accent-foreground/80 italic">
            "Questa lista è pensata per aiutarti a organizzarti meglio, senza stress. Puoi sempre modificarla." 💛
          </p>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base text-foreground flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary" />
            La tua spesa
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {checkedItems}/{totalItems} elementi • {progress}% completato
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="text-xs text-primary font-medium flex items-center gap-1"
        >
          {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Rigenera
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className="p-3 rounded-xl bg-accent/50 glass-border">
          <p className="text-xs text-accent-foreground/80">💡 {tips[0]}</p>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-2">
        {categories.map((cat) => {
          const catChecked = cat.items.filter(i => i.checked).length;
          const isExpanded = expandedCats[cat.name] !== false; // default expanded
          const allChecked = catChecked === cat.items.length;

          return (
            <div key={cat.name} className="rounded-2xl glass glass-border overflow-hidden">
              <button
                onClick={() => toggleCat(cat.name)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span>{cat.emoji}</span>
                  <span className={`text-sm font-medium ${allChecked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-lg">
                    {catChecked}/{cat.items.length}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-1">
                      {cat.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-muted/50 transition-colors group"
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
                              ${item.checked
                                ? 'gradient-primary border-transparent'
                                : 'border-muted-foreground/20 hover:border-primary/40'
                              }`}
                          >
                            {item.checked && <Check className="w-3 h-3 text-primary-foreground" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm ${item.checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {item.name}
                            </span>
                            {item.quantity && (
                              <span className="text-[10px] text-muted-foreground ml-1.5">
                                ({item.quantity})
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Add item */}
      <AnimatePresence>
        {showAddInput ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Es: Limoni, Latte di mandorla..."
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                transition-all duration-300 placeholder:text-muted-foreground/50"
              autoFocus
            />
            <div className="flex gap-2">
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-xs"
              >
                {categoryOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className="px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-xs font-medium disabled:opacity-40"
              >
                Aggiungi
              </button>
              <button
                onClick={() => { setShowAddInput(false); setNewItemName(''); }}
                className="px-3 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs"
              >
                Annulla
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowAddInput(true)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl
              border border-dashed border-muted-foreground/20 text-muted-foreground
              hover:border-primary/30 hover:text-foreground transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Aggiungi un prodotto</span>
          </button>
        )}
      </AnimatePresence>

      {/* Helper note */}
      <div className="p-3 rounded-xl bg-accent/30">
        <p className="text-[10px] text-muted-foreground/70 text-center italic">
          Questa lista è pensata per aiutarti a organizzarti meglio, senza stress. Puoi sempre modificarla 💛
        </p>
      </div>
    </motion.div>
  );
};

export default GroceryList;
