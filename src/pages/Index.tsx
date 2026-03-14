import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const Index = () => {
  const { user } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.onboarded) {
      navigate('/home');
    }
  }, [user.onboarded, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 max-w-lg mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <span className="text-6xl mb-6 block">🌿</span>
        <h1 className="font-display text-4xl font-semibold text-foreground mb-4 leading-tight">
          Insieme
        </h1>
        <p className="font-display text-lg text-muted-foreground italic mb-10 leading-relaxed">
          Un passo alla volta,<br />
          con la gentilezza che meriti.
        </p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/onboarding')}
          className="px-10 py-4 rounded-2xl bg-primary text-primary-foreground btn-text text-sm shadow-soft"
        >
          INIZIAMO
        </motion.button>
        <p className="text-xs text-muted-foreground mt-6">
          Nessuna dieta. Nessun giudizio. Solo cura.
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
