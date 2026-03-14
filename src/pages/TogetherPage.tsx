import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTogether } from '@/hooks/useTogether';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import { Copy, Check, UserPlus, Send, Heart, ArrowRight, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const badgeOptions = [
  { label: 'Brava! 👏', type: 'Brava!' },
  { label: 'Continua così 💪', type: 'Continua così' },
  { label: 'Un passo alla volta 🌿', type: 'Un passo alla volta' },
  { label: 'Oggi conta 💛', type: 'Oggi conta' },
];

type View = 'supporters' | 'supporting';

const TogetherPage = () => {
  const { user: authUser } = useAuth();
  const { supporters, supporting, myInvites, loading, createInvite, acceptInvite, sendBadge, getReceivedBadges, reload } = useTogether();
  const [view, setView] = useState<View>('supporters');
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [receivedBadges, setReceivedBadges] = useState<any[]>([]);
  const [sendingBadge, setSendingBadge] = useState<string | null>(null);
  const [customMessages, setCustomMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    getReceivedBadges().then(setReceivedBadges);
  }, [authUser]);

  const handleCreateInvite = async () => {
    const invite = await createInvite();
    if (invite) {
      setShowInviteCode(true);
      toast.success('Invito creato!');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Codice copiato!');
  };

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/together?code=${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiato! Condividilo con chi vuoi.');
  };

  const handleAcceptInvite = async () => {
    if (!codeInput.trim()) return;
    const result = await acceptInvite(codeInput);
    if (result.success) {
      toast.success('Ora sei il supporter di questa persona! 💛');
      setCodeInput('');
      setView('supporting');
    } else {
      toast.error(result.error || 'Errore');
    }
  };

  const handleSendBadge = async (toUserId: string, type: string) => {
    setSendingBadge(toUserId);
    await sendBadge(toUserId, type);
    toast.success('Pensiero inviato! ✨');
    setTimeout(() => setSendingBadge(null), 1500);
  };

  // Check for invite code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setCodeInput(code);
      setView('supporting');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-6">
        <AppHeader />
        <div className="flex items-center justify-center pt-20">
          <motion.span className="text-4xl" animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>❤️</motion.span>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-6">
      <AppHeader />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-2xl text-foreground mb-1">Insieme</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Camminiamo insieme, senza giudicare.
        </p>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('supporters')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300
              ${view === 'supporters'
                ? 'gradient-primary text-primary-foreground shadow-glow'
                : 'glass glass-border text-muted-foreground'
              }`}
          >
            ❤️ Chi mi supporta
            {supporters.length > 0 && <span className="ml-1 opacity-70">({supporters.length})</span>}
          </button>
          <button
            onClick={() => setView('supporting')}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300
              ${view === 'supporting'
                ? 'gradient-primary text-primary-foreground shadow-glow'
                : 'glass glass-border text-muted-foreground'
              }`}
          >
            🤝 Chi supporto
            {supporting.length > 0 && <span className="ml-1 opacity-70">({supporting.length})</span>}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'supporters' ? (
            <motion.div
              key="supporters"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Intro card */}
              <div className="p-5 rounded-2xl bg-accent glass-border text-center">
                <p className="text-sm text-accent-foreground/80 italic font-display">
                  "Ti accompagno, non ti giudico."
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Invita fino a 3 persone care. Vedranno solo il tuo progresso generale.
                </p>
              </div>

              {/* Received badges/messages */}
              {receivedBadges.length > 0 && (
                <div>
                  <p className="text-xs btn-text text-primary mb-3">💌 MESSAGGI RICEVUTI</p>
                  <div className="space-y-2">
                    {receivedBadges.slice(0, 5).map((badge, i) => (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-2xl glass glass-border flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
                          <Heart className="w-4 h-4 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-foreground">{badge.badge_type}</span>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(badge.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supporter list */}
              {supporters.length > 0 && (
                <div>
                  <p className="text-xs btn-text text-muted-foreground mb-3">I TUOI SUPPORTER</p>
                  {supporters.map((s) => (
                    <div key={s.id} className="p-4 rounded-2xl glass glass-border flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">
                          {s.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">Ti supporta 💛</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create invite */}
              <div>
                <p className="text-xs btn-text text-muted-foreground mb-3">INVITA QUALCUNO</p>
                
                {supporters.length >= 3 ? (
                  <div className="p-4 rounded-2xl glass glass-border text-center">
                    <p className="text-sm text-muted-foreground">Hai raggiunto il limite di 3 supporter 💛</p>
                  </div>
                ) : (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateInvite}
                      className="w-full p-4 rounded-2xl glass glass-border flex items-center justify-center gap-2 text-primary font-medium text-sm hover:border-primary/30 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      Crea un invito
                    </motion.button>

                    {/* Show latest invite code */}
                    {myInvites.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {myInvites.filter(i => !i.accepted_by).slice(0, 2).map((invite) => (
                          <div key={invite.id} className="p-4 rounded-2xl bg-accent glass-border">
                            <p className="text-xs text-muted-foreground mb-2">Codice invito:</p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 px-3 py-2 rounded-lg bg-background text-foreground font-mono text-sm font-bold tracking-wider">
                                {invite.invite_code}
                              </code>
                              <button
                                onClick={() => handleCopyCode(invite.invite_code)}
                                className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
                              >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                            <button
                              onClick={() => handleCopyLink(invite.invite_code)}
                              className="w-full mt-2 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium"
                            >
                              📤 Copia link di invito
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Privacy notice */}
              <div className="p-4 rounded-2xl glass glass-border">
                <p className="text-xs text-muted-foreground text-center">
                  🔒 <strong className="text-foreground">Supporto Gentile</strong> — I tuoi supporter vedono solo il progresso generale e la streak, mai dati personali o note emotive.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="supporting"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Accept invite */}
              <div className="p-5 rounded-2xl glass glass-border">
                <p className="text-sm font-medium text-foreground mb-3">
                  Hai ricevuto un codice invito?
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleAcceptInvite()}
                    placeholder="ES: A1B2-XY3Z"
                    className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm font-mono tracking-wider
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                      transition-all duration-300 placeholder:text-muted-foreground/40"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAcceptInvite}
                    disabled={!codeInput.trim()}
                    className="px-4 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-medium
                      disabled:opacity-40 transition-opacity"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* People I support */}
              {supporting.length > 0 ? (
                <div>
                  <p className="text-xs btn-text text-muted-foreground mb-3">PERSONE CHE SUPPORTI</p>
                  {supporting.map((s) => (
                    <div key={s.id} className="p-5 rounded-2xl glass glass-border mb-3">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center">
                          <span className="text-secondary-foreground font-bold text-lg">
                            {s.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-medium text-foreground">{s.name}</p>
                          {s.current_streak && s.current_streak > 0 ? (
                            <p className="text-xs text-primary">
                              🔥 {s.current_streak} {s.current_streak === 1 ? 'giorno' : 'giorni'} di fila
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">In attesa del primo check-in</p>
                          )}
                        </div>
                      </div>

                      {/* Send encouragement */}
                      <p className="text-xs text-muted-foreground mb-2">Manda un pensiero:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {badgeOptions.map((badge) => (
                          <motion.button
                            key={badge.type}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSendBadge(s.user_id, badge.type)}
                            disabled={sendingBadge === s.user_id}
                            className="p-3 rounded-xl bg-accent text-accent-foreground text-xs font-medium
                              transition-all duration-300 hover:bg-primary/10 hover:text-primary
                              disabled:opacity-50"
                          >
                            {badge.label}
                          </motion.button>
                        ))}
                      </div>
                      {/* Custom message */}
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={customMessages[s.user_id] || ''}
                          onChange={(e) => setCustomMessages(prev => ({ ...prev, [s.user_id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customMessages[s.user_id]?.trim()) {
                              handleSendBadge(s.user_id, customMessages[s.user_id].trim());
                              setCustomMessages(prev => ({ ...prev, [s.user_id]: '' }));
                            }
                          }}
                          placeholder="Scrivi un messaggio..."
                          maxLength={100}
                          className="flex-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-xs
                            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                            transition-all duration-300 placeholder:text-muted-foreground/40"
                        />
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (customMessages[s.user_id]?.trim()) {
                              handleSendBadge(s.user_id, customMessages[s.user_id].trim());
                              setCustomMessages(prev => ({ ...prev, [s.user_id]: '' }));
                            }
                          }}
                          disabled={!customMessages[s.user_id]?.trim() || sendingBadge === s.user_id}
                          className="px-3 py-2.5 rounded-xl gradient-primary text-primary-foreground
                            disabled:opacity-40 transition-opacity"
                        >
                          <Send className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🤝</span>
                  <p className="text-muted-foreground text-sm mb-2">
                    Non stai ancora supportando nessuno.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Inserisci il codice invito che hai ricevuto per iniziare a supportare qualcuno.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default TogetherPage;
