import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ChevronDown } from 'lucide-react';
import { useFasting, getProtocolOptions } from '@/hooks/useFasting';
import { Switch } from '@/components/ui/switch';

const FastingSettings = () => {
  const { config, saveConfig, loading } = useFasting();
  const [expanded, setExpanded] = useState(false);
  const [customHours, setCustomHours] = useState(String(config.fastingHours));
  const [startHour, setStartHour] = useState(String(config.startHour));
  const protocols = getProtocolOptions();

  if (loading) return null;

  const handleToggle = (checked: boolean) => {
    saveConfig({ enabled: checked });
    if (checked) setExpanded(true);
  };

  const handleProtocolChange = (protocol: string) => {
    if (protocol === 'custom') {
      saveConfig({ protocol, fastingHours: parseInt(customHours) || 16 });
    } else {
      const parts = protocol.split(':').map(Number);
      saveConfig({ protocol, fastingHours: parts[0] });
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary" />
          <h2 className="font-display text-lg text-foreground">Digiuno Intermittente</h2>
        </div>
        <Switch checked={config.enabled} onCheckedChange={handleToggle} />
      </div>

      <AnimatePresence>
        {config.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Protocol selection */}
            <p className="text-xs text-muted-foreground mb-2">Scegli il tuo protocollo:</p>
            {protocols.map((p) => {
              const isSelected = config.protocol === p.value;
              return (
                <motion.button
                  key={p.value}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleProtocolChange(p.value)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300
                    ${isSelected ? 'glass glass-border border-primary/30' : 'glass glass-border'}`}
                >
                  <div className="text-left">
                    <span className="text-sm font-medium text-foreground">{p.label}</span>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                    ${isSelected ? 'gradient-primary border-transparent' : 'border-muted-foreground/20'}`}>
                    {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                  </div>
                </motion.button>
              );
            })}

            {/* Custom hours */}
            {config.protocol === 'custom' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-2xl glass glass-border space-y-3"
              >
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground flex-1">Ore di digiuno:</label>
                  <input
                    type="number"
                    min="12"
                    max="23"
                    value={customHours}
                    onChange={(e) => {
                      setCustomHours(e.target.value);
                      const val = parseInt(e.target.value);
                      if (val >= 12 && val <= 23) saveConfig({ fastingHours: val });
                    }}
                    className="w-20 px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-sm text-center
                      focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </motion.div>
            )}

            {/* Start hour */}
            <div className="p-4 rounded-2xl glass glass-border">
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground flex-1">Inizio digiuno (ora):</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={startHour}
                  onChange={(e) => {
                    setStartHour(e.target.value);
                    const val = parseInt(e.target.value);
                    if (val >= 0 && val <= 23) saveConfig({ startHour: val });
                  }}
                  className="w-20 px-3 py-2 rounded-xl bg-muted border border-border text-foreground text-sm text-center
                    focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Finestra alimentare: {((config.startHour + config.fastingHours) % 24).toString().padStart(2, '0')}:00 — {config.startHour.toString().padStart(2, '0')}:00
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-accent glass-border">
              <p className="text-xs text-accent-foreground/80 italic">
                💡 Il piano alimentare si adatterà automaticamente alla tua finestra alimentare, spostando i pasti di conseguenza.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FastingSettings;
