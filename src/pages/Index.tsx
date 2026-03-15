import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const Index = () => {
  const { user: profile } = useAppStore();
  const { user: authUser, loading } = useAuth();
  const navigate = useNavigate();

  // Load profile from DB when authenticated
  useProfile();

  useEffect(() => {
    if (loading) return;

    // Not logged in → auth page
    if (!authUser) {
      navigate('/auth');
      return;
    }

    // Logged in + onboarded → home
    if (profile.onboarded) {
      navigate('/home');
    }
  }, [authUser, profile.onboarded, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-4xl animate-pulse">🌿</span>
      </div>
    );
  }

  // Logged in but not onboarded → show welcome
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
          Listen to your body.<br />
          Live better.
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
