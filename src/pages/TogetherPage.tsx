import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import BottomNav from '../components/BottomNav';

const badgeOptions = [
  { label: 'Brava! 👏', type: 'Brava!' },
  { label: 'Continua così 💪', type: 'Continua così' },
  { label: 'Un passo alla volta 🌿', type: 'Un passo alla volta' },
  { label: 'Oggi conta 💛', type: 'Oggi conta' },
];

const TogetherPage = () => {
  const { user, badges, addBadge } = useAppStore();
  const [sent, setSent] = useState(false);

  const sendBadge = (type: string) => {
    addBadge({ from: 'Tu', type, date: new Date().toISOString() });
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <h1 className="font-display text-2xl text-foreground mb-2">
          Insieme
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Ti accompagno, non ti giudico.
        </p>

        {/* Shared message card */}
        <div className="p-8 rounded-2xl bg-accent glass-border text-center mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 blur-[60px] rounded-full" />
          <span className="text-4xl mb-4 block animate-pulse-gentle relative">❤️</span>
          <p className="font-display text-lg text-accent-foreground italic relative">
            "Ti accompagno, non ti giudico."
          </p>
        </div>

        {user.mode === 'together' ? (
          <>
            <div className="p-6 rounded-2xl glass glass-border mb-6">
              <h3 className="font-display text-base text-foreground mb-1">
                Il tuo percorso condiviso
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Modalità: Supporto Gentile 🌸
              </p>
              <p className="text-sm text-muted-foreground">
                Il tuo supporto può vedere il progresso generale ma non i dati personali.
              </p>
            </div>

            <h3 className="font-display text-base text-foreground mb-3">
              Manda un pensiero
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {badgeOptions.map((badge) => (
                <motion.button
                  key={badge.type}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendBadge(badge.type)}
                  className="p-4 rounded-2xl glass glass-border text-center 
                    transition-all duration-300 hover:border-primary/30 active:bg-accent"
                >
                  <span className="text-sm font-medium text-foreground">{badge.label}</span>
                </motion.button>
              ))}
            </div>

            {sent && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-primary font-medium text-sm mb-6"
              >
                ✨ Pensiero inviato!
              </motion.p>
            )}

            <h3 className="font-display text-base text-foreground mb-3">
              Messaggi recenti
            </h3>
            <div className="space-y-2">
              {badges.slice(-5).reverse().map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-2xl glass glass-border"
                >
                  <span className="text-sm text-muted-foreground">{badge.from}</span>
                  <span className="px-3 py-1 rounded-xl bg-accent text-accent-foreground text-xs font-medium">
                    {badge.type}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-6">
              Stai facendo il percorso da sola, ma puoi sempre invitare qualcuno.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => useAppStore.getState().setUser({ mode: 'together' })}
              className="px-8 py-4 rounded-2xl gradient-warm text-secondary-foreground btn-text text-sm shadow-soft"
            >
              INVITA UNA PERSONA CARA
            </motion.button>
            <p className="text-xs text-muted-foreground mt-4 max-w-xs mx-auto">
              Invita una persona cara a camminare con te. Non giudicherà, solo incoraggerà.
            </p>
          </div>
        )}
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default TogetherPage;
