import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Send, UserPlus, Check, X, Loader2, Trash2 } from 'lucide-react';
import { useHousehold } from '@/hooks/useHousehold';

const HouseholdSection = () => {
  const {
    connections,
    pendingIncoming,
    loading,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeConnection,
  } = useHousehold();

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSend = async () => {
    if (!email.trim() || !email.includes('@')) return;
    setSending(true);
    const ok = await sendRequest(email.trim());
    if (ok) {
      setEmail('');
      setShowForm(false);
    }
    setSending(false);
  };

  return (
    <div className="mt-8">
      <h2 className="font-display text-lg text-foreground mb-2 flex items-center gap-2">
        <Home className="w-5 h-5 text-primary" />
        Mangiamo insieme
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Collega un convivente per permettere all'AI di organizzare pasti più compatibili e una spesa più semplice.
        Ognuno mantiene il proprio percorso personale.
      </p>

      {/* Pending incoming requests */}
      <AnimatePresence>
        {pendingIncoming.map((conn) => (
          <motion.div
            key={conn.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-4 rounded-2xl bg-primary/5 border border-primary/15"
          >
            <p className="text-sm text-foreground mb-2">
              💌 <span className="font-medium">{conn.partner_name || conn.to_email}</span> ti ha chiesto di collegarvi come conviventi
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => acceptRequest(conn.id)}
                className="flex-1 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Accetta
              </button>
              <button
                onClick={() => declineRequest(conn.id)}
                className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-xs"
              >
                Declina
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Active connections */}
      {connections.length > 0 && (
        <div className="space-y-2 mb-4">
          {connections.map((conn) => (
            <div key={conn.id} className="flex items-center justify-between p-4 rounded-2xl glass glass-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Home className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{conn.partner_name || conn.to_email}</p>
                  <p className="text-[10px] text-green-600 dark:text-green-400">✓ Collegamento attivo</p>
                </div>
              </div>
              <button
                onClick={() => removeConnection(conn.id)}
                className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}

          <div className="p-3 rounded-xl bg-accent/50 glass-border">
            <p className="text-xs text-accent-foreground/80">
              🏠 Da ora l'AI terrà conto della vostra convivenza per proporre pasti più compatibili, quando possibile.
            </p>
          </div>
        </div>
      )}

      {/* Add connection */}
      {connections.length === 0 && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl
            border border-dashed border-muted-foreground/20 text-muted-foreground
            hover:border-primary/30 hover:text-foreground transition-all duration-300"
        >
          <UserPlus className="w-4 h-4" />
          <span className="text-sm font-medium">Collega un convivente</span>
        </button>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-3"
          >
            <div className="p-4 rounded-2xl glass glass-border space-y-3">
              <p className="text-xs text-muted-foreground">
                Inserisci l'email di un convivente che usa già Insieme. Riceverà una richiesta di collegamento.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="email@esempio.com"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-all duration-300 placeholder:text-muted-foreground/50"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSend}
                  disabled={sending || !email.includes('@')}
                  className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-medium
                    disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Invia richiesta
                </button>
                <button
                  onClick={() => { setShowForm(false); setEmail(''); }}
                  className="px-4 py-3 rounded-xl bg-muted text-muted-foreground text-sm"
                >
                  Annulla
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy note */}
      <div className="mt-4 p-3 rounded-xl bg-accent/30">
        <p className="text-[10px] text-muted-foreground/70 text-center italic">
          La privacy è al sicuro: l'AI coordina i pasti in modo invisibile, senza condividere dati personali tra voi 🔒
        </p>
      </div>
    </div>
  );
};

export default HouseholdSection;
