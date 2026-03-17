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
  const { profileLoading, profileError, retryProfileLoad } = useProfile();

  useEffect(() => {
    if (loading || profileLoading) return;

    // Not logged in → auth page
    if (!authUser) {
      navigate('/auth');
      return;
    }

    // Logged in + onboarded → home
    if (profile.onboarded) {
      navigate('/home');
      return;
    }

    // If backend timed out, don't mis-route user to onboarding
    if (profileError) return;
  }, [authUser, profile.onboarded, loading, profileLoading, profileError, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-4xl animate-pulse">🌿</span>
      </div>
    );
  }

  if (authUser && profileError && !profile.onboarded) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 max-w-lg mx-auto text-center gap-4">
        <span className="text-4xl">🔄</span>
        <p className="text-sm text-muted-foreground">Sto recuperando il tuo profilo, un attimo…</p>
        <button
          onClick={retryProfileLoad}
          className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground btn-text text-xs"
        >
          Riprova ora
        </button>
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
          Ascolta il tuo corpo.<br />
          Vivi meglio.
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
