import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import BottomNav from '../components/BottomNav';

const ProfilePage = () => {
  const { user, checkIns, weeklyHabits } = useAppStore();
  const completedHabits = weeklyHabits.filter((h) => h.completed).length;

  return (
    <div className="min-h-screen bg-background pb-24 max-w-lg mx-auto px-6 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
          Profilo
        </h1>
        <p className="text-muted-foreground mb-8">
          Ciao, {user.name || 'cara'} 💛
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="p-5 rounded-[24px] bg-card border border-border text-center">
            <p className="font-display text-3xl font-semibold text-foreground">{checkIns.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Momenti di cura</p>
          </div>
          <div className="p-5 rounded-[24px] bg-card border border-border text-center">
            <p className="font-display text-3xl font-semibold text-foreground">{completedHabits}</p>
            <p className="text-xs text-muted-foreground mt-1">Abitudini completate</p>
          </div>
        </div>

        {/* Settings */}
        <h2 className="font-display text-lg font-medium text-foreground mb-4">
          Il tuo percorso
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Obiettivo', value: user.objective || '—' },
            { label: 'Modalità', value: user.mode === 'together' ? 'Insieme' : 'Da sola' },
            { label: 'Ritmo', value: user.pace || '—' },
            { label: 'Difficoltà principale', value: user.difficulty || '—' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-5 rounded-[24px] bg-card border border-border"
            >
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium text-foreground">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Privacy mode */}
        <div className="mt-8 p-6 rounded-[32px] bg-accent border border-transparent">
          <h3 className="font-display text-base font-medium text-accent-foreground mb-2">
            🔒 Supporto Gentile
          </h3>
          <p className="text-sm text-accent-foreground/80">
            La tua privacy è al sicuro. Chi ti supporta può vedere solo il progresso generale, 
            mai i dati personali o le note emotive.
          </p>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
