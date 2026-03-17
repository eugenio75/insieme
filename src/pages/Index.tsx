import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { LogOut } from 'lucide-react';

const Index = () => {
  const { user: profile } = useAppStore();
  const { user: authUser, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  // Load profile from DB when authenticated
  const { profileLoading, profileError, retryProfileLoad } = useProfile();

  // Show actions after 3 seconds of loading so user isn't stuck
  useEffect(() => {
    const timer = setTimeout(() => setShowActions(true), 3000);
    return () => clearTimeout(timer);
  }, []);

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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Force clear local state even if signOut fails
      localStorage.clear();
      window.location.href = '/auth';
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <span className="text-4xl animate-pulse">🌿</span>
        {showActions && authUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 mt-4"
          >
            <p className="text-xs text-muted-foreground">Caricamento lento…</p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium"
              >
                Ricarica
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl glass glass-border text-destructive text-xs font-medium flex items-center gap-1.5"
              >
                <LogOut className="w-3 h-3" />
                Esci
              </button>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  if (authUser && profileError && !profile.onboarded) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 max-w-lg mx-auto text-center gap-4">
        <span className="text-4xl">🔄</span>
        <p className="text-sm text-muted-foreground">Sto recuperando il tuo profilo, un attimo…</p>
        <div className="flex gap-3">
          <button
            onClick={retryProfileLoad}
            className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground btn-text text-xs"
          >
            Riprova ora
          </button>
          <button
            onClick={handleSignOut}
            className="px-6 py-3 rounded-2xl glass glass-border text-destructive btn-text text-xs flex items-center gap-1.5"
          >
            <LogOut className="w-3 h-3" />
            Esci
          </button>
        </div>
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
