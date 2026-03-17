import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, TestTubes, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Loader2, Utensils, Activity, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import { useHealthDocuments, HealthDocument } from '@/hooks/useHealthDocuments';
import { Link } from 'react-router-dom';

const HealthPage = () => {
  const { dietDocs, medicalDocs, loading, uploadFile, submitManual, deleteDocument } = useHealthDocuments();
  const [activeTab, setActiveTab] = useState<'diet' | 'medical'>('diet');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await uploadFile(file, activeTab === 'diet' ? 'diet' : 'medical_tests');
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualSubmit = async () => {
    if (!manualText.trim()) return;
    setUploading(true);
    await submitManual(manualText.trim(), activeTab === 'diet' ? 'diet' : 'medical_tests');
    setManualText('');
    setShowManualInput(false);
    setUploading(false);
  };

  const currentDocs = activeTab === 'diet' ? dietDocs : medicalDocs;

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto px-6 pt-6">
      <AppHeader showBack />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-2xl text-foreground mb-2">La tua Salute</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Carica la dieta del tuo dietologo o le analisi mediche per un piano personalizzato
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'diet' as const, icon: Utensils, label: 'Dieta' },
            { id: 'medical' as const, icon: TestTubes, label: 'Analisi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'gradient-primary text-primary-foreground'
                  : 'glass glass-border text-muted-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload area */}
        <div className="mb-6 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full p-6 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/60 
              transition-all duration-300 flex flex-col items-center gap-3 text-center"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-primary" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {activeTab === 'diet' ? 'Carica la dieta del dietologo' : 'Carica le analisi mediche'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF o foto • L'AI analizzerà il contenuto
              </p>
            </div>
          </button>

          {!showManualInput ? (
            <button
              onClick={() => setShowManualInput(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl glass glass-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">
                {activeTab === 'diet' ? 'Inserisci manualmente la dieta' : 'Inserisci manualmente i valori'}
              </span>
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder={
                  activeTab === 'diet'
                    ? 'Scrivi i pasti della tua dieta:\n\nColazione: yogurt greco, frutta secca...\nPranzo: pasta integrale, verdure...\nCena: pesce, insalata...'
                    : 'Inserisci i valori delle analisi:\n\nGlicemia: 92 mg/dL\nColesterolo totale: 210 mg/dL\nFerritina: 45 ng/mL...'
                }
                className="w-full h-40 px-5 py-4 rounded-2xl bg-muted border border-border text-foreground text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  transition-all duration-300 placeholder:text-muted-foreground/50 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualText.trim() || uploading}
                  className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-medium 
                    disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Analizza con AI
                </button>
                <button
                  onClick={() => { setShowManualInput(false); setManualText(''); }}
                  className="px-4 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium"
                >
                  Annulla
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Documents list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : currentDocs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {activeTab === 'diet'
                ? 'Nessuna dieta caricata ancora'
                : 'Nessuna analisi caricata ancora'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentDocs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onDelete={deleteDocument} />
            ))}
          </div>
        )}
      </motion.div>
      <BottomNav />
    </div>
  );
};

const DocumentCard = ({ doc, onDelete }: { doc: HealthDocument; onDelete: (id: string, path?: string | null) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const analysis = doc.ai_analysis;
  const isAnalyzing = doc.status === 'analyzing';
  const hasError = doc.status === 'error';
  const isCompleted = doc.status === 'completed' && analysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl glass glass-border overflow-hidden"
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isCompleted ? 'bg-accent' : hasError ? 'bg-destructive/10' : 'bg-muted'
          }`}>
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : hasError ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : isCompleted ? (
              <CheckCircle className="w-5 h-5 text-accent-foreground" />
            ) : (
              <FileText className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {doc.file_name || (doc.doc_type === 'diet' ? 'Dieta inserita manualmente' : 'Analisi inserite manualmente')}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(doc.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
              {isAnalyzing && ' • Analisi in corso...'}
              {hasError && ' • Errore nell\'analisi'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <button onClick={() => setExpanded(!expanded)} className="p-2">
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          )}
          <button onClick={() => onDelete(doc.id, doc.file_path)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && isCompleted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/50 pt-4 space-y-4">
              {doc.doc_type === 'diet' ? (
                <DietAnalysis analysis={analysis} />
              ) : (
                <MedicalAnalysis analysis={analysis} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DietAnalysis = ({ analysis }: { analysis: any }) => (
  <>
    {analysis.summary && (
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Riepilogo</p>
        <p className="text-sm text-foreground">{analysis.summary}</p>
      </div>
    )}

    {analysis.meals?.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Pasti</p>
        <div className="space-y-2">
          {analysis.meals.map((meal: any, i: number) => (
            <div key={i} className="p-3 rounded-xl bg-muted/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{meal.name}</span>
                {meal.time && <span className="text-xs text-muted-foreground">{meal.time}</span>}
              </div>
              <p className="text-xs text-muted-foreground">{meal.foods?.join(', ')}</p>
              {meal.notes && <p className="text-xs text-accent-foreground mt-1">💡 {meal.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    )}

    {analysis.strengths?.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">✅ Punti di forza</p>
        <ul className="space-y-1">
          {analysis.strengths.map((s: string, i: number) => (
            <li key={i} className="text-sm text-foreground">• {s}</li>
          ))}
        </ul>
      </div>
    )}

    {analysis.suggestions?.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">💡 Suggerimenti</p>
        <ul className="space-y-1">
          {analysis.suggestions.map((s: string, i: number) => (
            <li key={i} className="text-sm text-foreground">• {s}</li>
          ))}
        </ul>
      </div>
    )}

    {analysis.fusion_tips?.length > 0 && (
      <div className="p-3 rounded-xl bg-accent">
        <p className="text-xs font-semibold text-accent-foreground uppercase tracking-wider mb-2">🔄 Fusione intelligente</p>
        <ul className="space-y-1">
          {analysis.fusion_tips.map((t: string, i: number) => (
            <li key={i} className="text-sm text-accent-foreground">• {t}</li>
          ))}
        </ul>
      </div>
    )}

    {analysis.warnings?.length > 0 && (
      <div className="p-3 rounded-xl bg-destructive/10">
        <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">⚠️ Avvisi</p>
        <ul className="space-y-1">
          {analysis.warnings.map((w: string, i: number) => (
            <li key={i} className="text-sm text-foreground">• {w}</li>
          ))}
        </ul>
      </div>
    )}
  </>
);

const MedicalAnalysis = ({ analysis }: { analysis: any }) => (
  <>
    {analysis.summary && (
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Riepilogo</p>
        <p className="text-sm text-foreground">{analysis.summary}</p>
      </div>
    )}

    {analysis.values?.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Valori analizzati</p>
        <div className="space-y-2">
          {analysis.values.map((v: any, i: number) => (
            <div key={i} className={`p-3 rounded-xl ${
              v.status === 'critical' ? 'bg-destructive/10 border border-destructive/20' :
              v.status === 'high' || v.status === 'low' ? 'bg-secondary/10 border border-secondary/20' :
              'bg-muted/50'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{v.name}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  v.status === 'critical' ? 'bg-destructive text-destructive-foreground' :
                  v.status === 'high' ? 'bg-secondary text-secondary-foreground' :
                  v.status === 'low' ? 'bg-secondary text-secondary-foreground' :
                  'bg-accent text-accent-foreground'
                }`}>
                  {v.status === 'normal' ? '✓ Normale' : v.status === 'high' ? '↑ Alto' : v.status === 'low' ? '↓ Basso' : '⚠ Critico'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Valore: {v.value} • Range: {v.range}
              </p>
              {v.implications && <p className="text-xs text-foreground mt-1">💡 {v.implications}</p>}
            </div>
          ))}
        </div>
      </div>
    )}

    {analysis.risk_factors?.length > 0 && (
      <div className="p-3 rounded-xl bg-destructive/10">
        <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-2">⚠️ Fattori di rischio</p>
        <ul className="space-y-1">
          {analysis.risk_factors.map((r: string, i: number) => (
            <li key={i} className="text-sm text-foreground">• {r}</li>
          ))}
        </ul>
      </div>
    )}

    {analysis.dietary_recommendations?.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">🍽 Raccomandazioni alimentari</p>
        <ul className="space-y-1">
          {analysis.dietary_recommendations.map((r: string, i: number) => (
            <li key={i} className="text-sm text-foreground">• {r}</li>
          ))}
        </ul>
      </div>
    )}

    <div className="grid grid-cols-2 gap-3">
      {analysis.foods_to_increase?.length > 0 && (
        <div className="p-3 rounded-xl bg-accent">
          <p className="text-xs font-semibold text-accent-foreground mb-2">✅ Da aumentare</p>
          <ul className="space-y-1">
            {analysis.foods_to_increase.map((f: string, i: number) => (
              <li key={i} className="text-xs text-accent-foreground">• {f}</li>
            ))}
          </ul>
        </div>
      )}
      {analysis.foods_to_reduce?.length > 0 && (
        <div className="p-3 rounded-xl bg-destructive/10">
          <p className="text-xs font-semibold text-destructive mb-2">⛔ Da ridurre</p>
          <ul className="space-y-1">
            {analysis.foods_to_reduce.map((f: string, i: number) => (
              <li key={i} className="text-xs text-foreground">• {f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>

    {analysis.prevention_tips?.length > 0 && (
      <div className="p-3 rounded-xl bg-accent border border-primary/20">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">🛡 Prevenzione</p>
        <ul className="space-y-1">
          {analysis.prevention_tips.map((t: string, i: number) => (
            <li key={i} className="text-sm text-foreground">• {t}</li>
          ))}
        </ul>
      </div>
    )}

    {analysis.meal_plan?.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">🍽 Piano alimentare consigliato</p>
        <div className="space-y-2">
          {analysis.meal_plan.map((meal: any, i: number) => (
            <div key={i} className="p-3 rounded-xl bg-muted/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{meal.name}</span>
                {meal.time && <span className="text-xs text-muted-foreground">{meal.time}</span>}
              </div>
              <p className="text-xs text-muted-foreground">{meal.foods?.join(', ')}</p>
              {meal.reason && <p className="text-xs text-accent-foreground mt-1">💡 {meal.reason}</p>}
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);

export default HealthPage;
