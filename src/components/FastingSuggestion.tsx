import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DISMISS_KEY = 'fasting_suggestion_dismissals';
const LAST_SHOWN_KEY = 'fasting_suggestion_last_shown';

const FastingSuggestion = () => {
  const [visible, setVisible] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const checkVisibility = async () => {
      // Check dismissal count
      const dismissals = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
      if (dismissals >= 3) return;

      // Show max once per week
      const lastShown = localStorage.getItem(LAST_SHOWN_KEY);
      if (lastShown) {
        const daysSince = (Date.now() - parseInt(lastShown, 10)) / 86400000;
        if (daysSince < 7) return;
      }

      // Check if fasting is already enabled
      const { data } = await supabase
        .from('profiles')
        .select('fasting_enabled')
        .eq('user_id', user.id)
        .single();

      if (data?.fasting_enabled) return;

      setVisible(true);
      localStorage.setItem(LAST_SHOWN_KEY, Date.now().toString());
    };

    checkVisibility();
  }, [user]);

  const handleDismiss = () => {
    const count = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10) + 1;
    localStorage.setItem(DISMISS_KEY, count.toString());
    setVisible(false);
  };

  const handleActivate = () => {
    navigate('/profile');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="mt-5"
        >
          <div className="relative p-5 rounded-2xl bg-accent/60 glass-border overflow-hidden">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Chiudi suggerimento"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-4 pr-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Moon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground btn-text mb-1">🌙 LO SAPEVI?</p>
                <p className="text-sm font-medium text-foreground">
                  Una pausa digestiva fa bene al corpo
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Dare al tuo corpo qualche ora di riposo dalla digestione può ridurre il gonfiore e migliorare l'energia. Nessuna regola rigida, solo ascolto.
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleActivate}
                  className="mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Scopri la pausa digestiva →
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FastingSuggestion;
