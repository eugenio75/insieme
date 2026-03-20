import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Square, Pause } from 'lucide-react';
import { useFasting } from '@/hooks/useFasting';

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
};

const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

const FastingTimer = () => {
  const { config, activeSession, startSession, endSession, getStatus, getStats } = useFasting();
  const [status, setStatus] = useState(getStatus());
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const stats = getStats();

  // Refresh status every minute
  useEffect(() => {
    setStatus(getStatus());
    const interval = setInterval(() => setStatus(getStatus()), 60000);
    return () => clearInterval(interval);
  }, [getStatus]);

  if (!config.enabled) return null;

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference * (1 - status.progress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mt-5"
    >
      <div className="p-6 rounded-2xl glass glass-border">
        <div className="flex items-center gap-2 mb-5">
          <Timer className="w-5 h-5 text-primary" />
          <span className="text-xs text-muted-foreground btn-text">DIGIUNO INTERMITTENTE</span>
          <div className="ml-auto flex items-center gap-2">
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1 rounded-full">
                <span className="text-base">🔥</span>
                <span className="text-lg font-extrabold text-gradient">{stats.currentStreak}</span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {stats.currentStreak === 1 ? 'giorno' : 'giorni'}
                </span>
              </div>
            )}
            <span className="text-xs font-medium text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
              {config.protocol === 'custom' ? `${config.fastingHours}:${24 - config.fastingHours}` : config.protocol}
            </span>
          </div>
        </div>

        {!status.isActive ? (
          // Not active — show start button
          <div className="flex items-center gap-5">
            <div className="flex-1">
              <p className="text-base text-foreground font-medium mb-2">
                Pronta per iniziare?
              </p>
              <p className="text-sm text-muted-foreground">
                Finestra alimentare: {formatHour(status.eatingWindowStart)} — {formatHour(status.eatingWindowEnd)}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startSession}
              className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"
            >
              <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
            </motion.button>
          </div>
        ) : (
          // Active session
          <div className="flex items-center gap-6">
            {/* Circular progress */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="3.5" />
                <circle
                  cx="48" cy="48" r="42" fill="none"
                  stroke={status.isFasting ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-foreground">
                  {formatTime(status.remainingMinutes)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {status.isFasting ? 'al pasto' : 'al digiuno'}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${status.isFasting ? 'bg-primary animate-pulse' : 'bg-secondary animate-pulse'}`} />
                <span className="text-sm font-medium text-foreground">
                  {status.isFasting ? 'Periodo di digiuno' : 'Finestra alimentare'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {status.isFasting
                  ? `${formatTime(status.elapsedMinutes)} di ${Math.floor(status.targetMinutes / 60)}h completati`
                  : `${formatTime(status.elapsedMinutes)} di ${Math.floor(status.targetMinutes / 60)}h — puoi mangiare 🍽️`}
              </p>

              <AnimatePresence mode="wait">
                {!showConfirmEnd ? (
                  <motion.div key="buttons" className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { endSession(false); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/10 text-secondary text-xs font-medium"
                      title="Salta questo giorno senza perdere i progressi"
                    >
                      <Pause className="w-3 h-3" />
                      Pausa
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowConfirmEnd(true)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-medium"
                    >
                      <Square className="w-3 h-3" />
                      Termina
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2"
                  >
                    <button
                      onClick={() => { endSession(); setShowConfirmEnd(false); }}
                      className="px-3 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-medium"
                    >
                      Conferma
                    </button>
                    <button
                      onClick={() => setShowConfirmEnd(false)}
                      className="px-3 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-medium"
                    >
                      Annulla
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FastingTimer;
