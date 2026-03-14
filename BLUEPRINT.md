# 🌿 INSIEME — Blueprint Completo Ultra-Dettagliato

## Stack Tecnologico
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS 4
- **UI Components:** shadcn/ui (base), customizzati con glassmorphism
- **Animazioni:** Framer Motion
- **Grafici:** Recharts (LineChart)
- **State Management:** Zustand (store globale `useAppStore`)
- **Backend:** Supabase (Auth Google OAuth + Database PostgreSQL con RLS)
- **Routing:** React Router DOM v6
- **Font:** Google Fonts — DM Serif Display (titoli) + DM Sans (body)
- **Lingua:** Italiano 🇮🇹

---

## Design System (`index.css`)

### Palette chiara — serenità, fiducia, azione:
- `--background: 210 40% 98%` (azzurro-grigio chiaro)
- `--foreground: 220 25% 18%` (grigio scuro)
- `--primary: 168 55% 42%` (teal/acqua — fiducia)
- `--primary-foreground: 0 0% 100%` (bianco)
- `--secondary: 28 85% 58%` (arancione caldo — azione)
- `--muted: 210 30% 93%` / `--muted-foreground: 220 15% 50%`
- `--accent: 168 40% 93%` / `--accent-foreground: 168 55% 30%`
- `--border: 210 25% 90%`
- `--radius: 1.25rem`

### Gradienti CSS custom:
- `--gradient-primary: linear-gradient(135deg, hsl(168 55% 42%), hsl(180 45% 48%))`
- `--gradient-warm: linear-gradient(135deg, hsl(28 85% 58%), hsl(18 75% 52%))`

### Ombre:
- `--shadow-soft: 0 8px 32px -8px hsla(168 55% 42% / 0.12)`
- `--shadow-card: 0 2px 16px -2px hsla(220 25% 18% / 0.06)`
- `--shadow-glow: 0 0 30px -8px hsla(168 55% 42% / 0.2)`

### Utility classes:
- `.glass` → `background: hsla(0 0% 100% / 0.65); backdrop-filter: blur(16px)`
- `.glass-border` → `border: 1px solid hsla(210 25% 85% / 0.5)`
- `.gradient-primary`, `.gradient-warm`, `.text-gradient` (clip text)
- `.btn-text` → DM Sans, 600 weight, 0.06em spacing, uppercase
- `.font-display` → DM Serif Display, -0.02em tracking

---

## Database (5 tabelle con RLS)

### `profiles`
Creato automaticamente da trigger `handle_new_user` su `auth.users`:
- `user_id` (uuid, PK referenza), `name`, `objective`, `mode` (solo/together), `pace`, `activity`, `difficulty`, `age`, `sex`, `weight` (numeric nullable), `intolerances` (text[]), `custom_intolerances` (text[]), `current_streak` (int default 0), `last_check_in_date`, `partner_name`, `created_at`, `updated_at`
- RLS: utente vede/modifica solo il proprio; partner vede profili collegati via partnerships

### `weekly_checkins`
Check-in settimanali:
- `user_id`, `week_number` (int), `weight` (nullable), `bloating` (1-5), `energy` (1-5), `notes`, `created_at`
- RLS: solo proprio utente

### `partnerships`
Relazioni supporter ↔ supportato:
- `user_id` (chi viene supportato), `partner_id` (il supporter), `created_at`
- RLS: vede chi è coinvolto

### `invites`
Codici invito:
- `from_user_id`, `invite_code` (generato con `encode(gen_random_bytes(6), 'hex')`), `accepted_by` (nullable), `created_at`
- RLS: tutti possono leggere per codice; solo il creatore crea; solo non-accettati si possono accettare

### `badges`
Messaggi motivazionali:
- `from_user_id`, `to_user_id`, `badge_type` (text), `created_at`
- RLS: mittente può inserire; entrambi possono leggere

---

## Autenticazione (`AuthPage.tsx`)

**Layout:** Centrato verticalmente, max-w-lg, sfondo con glow blur cerchio primary/10.

**Elementi:**
1. Emoji 🌿 animata (floating su/giù con framer-motion, durata 4s, loop infinito)
2. Titolo "Insieme" — font-display text-5xl
3. Sottotitolo italic: "Un passo alla volta, con la gentilezza che meriti."
4. Bottone Google OAuth — glass con icona SVG Google a 4 colori, testo "Accedi con Google", hover scale 1.02
5. Footer: "Nessuna dieta. Nessun giudizio. Solo cura."

**Logica:** Usa `lovable.auth.signInWithOAuth("google")`. Redirect a `/` dopo login.

---

## Landing/Router (`Index.tsx`)

**Logica:**
- Se loading → spinner 🌿 con pulse
- Se non autenticato → redirect `/auth`
- Se autenticato + onboarded → redirect `/home`
- Se autenticato + non onboarded → mostra welcome page

**Welcome page:** Emoji 🌿, titolo "Insieme", sottotitolo italic, bottone "INIZIAMO" → `/onboarding`, footer gentile.

---

## Onboarding (`Onboarding.tsx`) — 10 step

**Layout:** min-h-screen, max-w-lg, px-6 py-8, glow cerchio in alto.
**Progress bar:** h-1 in alto, gradient-primary animata con larghezza percentuale.
**Animazioni:** Slide laterale (x: 60→0→-60) con AnimatePresence mode="wait".

### Step 0 — Nome:
- "Ciao! 👋" font-display text-3xl
- "Come ti chiami?" text-lg muted
- Input text con rounded-xl, focus ring primary
- Bottone "CONTINUA" gradient-primary, disabilitato se vuoto

### Step 1 — Obiettivi (multi-select):
- "Quali sono i tuoi obiettivi?" + "Puoi sceglierne più di uno."
- 6 opzioni con emoji: Sentirmi più leggera 🌿, Avere più energia ⚡, Perdere peso ⚖️, Ridurre il gonfiore 🫧, Essere più costante 🎯, Stare meglio nel mio corpo 💛
- Ogni opzione: glass card px-6 py-5 rounded-2xl, checkbox w-6 h-6 rounded-lg a destra
- Selezionato: border-primary/30 + shadow-glow + checkbox con gradient-primary + ✓
- Bottone "CONTINUA" in basso, abilitato se ≥1 selezionato

### Step 2 — Modalità (single-select):
- "Vuoi fare questo percorso da sola o con qualcuno?"
- Da sola 🧘‍♀️ (value: 'solo'), Con un partner o una persona di supporto 🤝 (value: 'together')
- Auto-avanza al tap

### Step 3 — Sesso (single-select):
- "Come ti identifichi?" + subtitle
- Donna 👩, Uomo 👨, Preferisco non dirlo 🤍

### Step 4 — Età (single-select):
- "Qual è la tua fascia d'età?"
- 18-25 🌱, 26-35 🌿, 36-45 🌳, 46+ 🌻

### Step 5 — Ritmo (single-select):
- "Che tipo di percorso preferisci?"
- Molto gentile 🌸, Equilibrato ⚖️, Un po' più strutturato 📋

### Step 6 — Attività (single-select):
- "Quanto ti muovi durante il giorno?"
- Poco 🛋️, Moderatamente 🚶‍♀️, Abbastanza 🏃‍♀️

### Step 7 — Difficoltà (single-select):
- "Qual è la difficoltà più grande per te?"
- Fame nervosa 😰, Voglia di dolci 🍫, Mancanza di tempo ⏰, Stress 😮‍💨, Non riesco ad essere costante 🔄

### Step 8 — Peso (input numerico):
- "Qual è il tuo peso attuale?" + "Opzionale"
- Input number step 0.1 con "kg" a destra
- Bottone: "CONTINUA" se compilato, "SALTA E CONTINUA" se vuoto

### Step 9 — Intolleranze (multi-select + custom):
- "Hai intolleranze o sensibilità alimentari?"
- Lattosio 🥛, Glutine 🌾, Nichel 🔩, Fruttosio 🍎, Nessuna ✅
- "Nessuna" deseleziona tutte le altre e viceversa
- Bottone "+ Aggiungi altra sensibilità" (dashed border) → mostra input text + bottone "Aggiungi"
- Intolleranze custom mostrate con ⚠️ e bottone X per rimuovere

**Fine onboarding:** `completeOnboarding()` + `saveProfile()` + navigate `/home`

**Bottone "INDIETRO"** su tutti gli step tranne il primo (text muted, btn-text, self-center)

---

## Header Globale (`AppHeader.tsx`)

**Layout:** flex justify-between h-12, mb-2
- Sinistra: bottone freccia indietro (opzionale via prop `showBack`)
- Centro: titolo opzionale
- Destra: icona Settings ⚙️ → navigate `/profile` (nascosta se già su /profile)
- Icone: w-10 h-10 rounded-xl, hover bg-muted

---

## Bottom Navigation (`BottomNav.tsx`)

**Layout:** Fixed bottom, z-50, glass rounded-t-3xl, h-20, max-w-lg centrato.

**5 tab:** Home 🏠, Cibo 🍴, Check-in ✏️ (centrale), Risultati 📊, Insieme ❤️

- **Check-in (centrale):** Bottone elevato (-mt-6), w-14 h-14 rounded-2xl gradient-primary shadow-glow, icona bianca
- **Tab attivo:** Icona text-primary scale-110, label text-primary, dot animato sotto (layoutId "activeTab", gradient-primary w-6 h-1)
- **Tab inattivo:** text-muted-foreground
- Icone: lucide-react (Home, Utensils, PenLine, BarChart3, Heart)

---

## Home Page (`HomePage.tsx`)

**Layout:** min-h-screen pb-28 max-w-lg, px-6 pt-6

**Sezioni in ordine verticale:**

1. **AppHeader** (con ⚙️)
2. **Saluto personalizzato** — "Buongiorno/Buon pomeriggio/Buonasera, {nome} ☀️" font-display text-3xl + citazione motivazionale italic (ruota giornalmente tra 5 frasi)
3. **Progress Ring** — Cerchio SVG animato (140×140, strokeWidth 10), gradiente teal, percentuale al centro con text-gradient, label "settimana". Glow blur che scala con il progresso.
4. **Streak Counter** (se >0) — Glass card con icona milestone (w-12 h-12 rounded-xl bg-accent), numero bold text-gradient + "giorni di fila", messaggio milestone se raggiunto. Milestone: 3🌱, 7✨, 14💪, 21🦋, 30🌟, 60🌺, 90👑
5. **"I tuoi 3 passi"** — Titolo + label settimana. 3 HabitCard animate in sequenza (delay 0.4 + i*0.1)
6. **Check-in Status** — Se già fatto: card accent "✨ Hai già fatto il check-in di oggi. Brava!". Se no: gradient-warm card "FAI IL CHECK-IN DI OGGI" + "Meno di 1 minuto ⏱️"
7. **Check-in Settimanale** (solo sab/dom) — Glass card con 📊, titolo + sottotitolo
8. **Consiglio del giorno** — Glass card con label "💡 CONSIGLIO DEL GIORNO", icona + titolo + descrizione. Link a /nutrition
9. **Card Insieme** (se mode='together') — Glass card con nome partner, cuore pulsante, ultimi 3 badge ricevuti

### HabitCard component:
- Glass card px-5 py-5 rounded-2xl, flex justify-between
- Sinistra: icona in box 40×40 rounded-xl (bg-primary/20 se completato, bg-muted se no) + titolo (line-through + opacity-50 se completato)
- Destra: checkbox w-7 h-7 rounded-lg, gradient-primary + checkmark SVG animato se completato
- whileTap scale 0.97, border-primary/20 + shadow-glow se completato

---

## Check-in Giornaliero (`CheckIn.tsx`) — 4 fasi

**Fase 0 — Umore:** "Come ti senti oggi?" — 5 opzioni (Serena 😊 5, Calma 😌 4, Così così 😐 3, Stanca 😔 2, Difficile 😢 1)

**Fase 1 — Energia:** "Com'è la tua energia?" — 5 opzioni (Alta ⚡ 5, Buona ✨ 4, Nella media ➡️ 3, Bassa 🔋 2, Molto bassa 😴 1)

**Fase 2 — Gonfiore:** "Hai avuto gonfiore?" — 4 opzioni (Nessuno 🌿 1, Leggero 🫧 2, Moderato 💨 3, Forte 😣 4)

Ogni fase: slide animation (x: 40→0→-40), opzioni glass card, progress dots (4 dots, attivo w-6 gradient-primary, inattivo w-1.5 bg-muted)

**Fase 3 — Abitudini:** "Le tue abitudini di oggi" — Lista toggleable delle weeklyHabits con checkbox. Bottone "COMPLETA IL CHECK-IN" gradient-primary.

**Fase 4 — Completamento:** Emoji 🌿 floating, "Hai fatto quello che potevi oggi." + "È abbastanza." italic. Streak counter se >0 con messaggi milestone specifici. Bottone "TORNA ALLA HOME".

---

## Alimentazione (`NutritionPage.tsx`) — 4 tab

**Header:** "Alimentazione 🥗" + "Consigli gentili, mai imposizioni."

**Tab bar:** 4 bottoni scrollabili — 📋 Piano, Per te, Idee, Anti-gonfiore. Attivo: gradient-primary + shadow-glow.

### Tab Piano:
- Frase motivazionale in card accent
- **DaySelector:** 7 bottoni giorno (Lun-Dom), oggi evidenziato bg-accent, selezionato gradient-primary + shadow-glow, dot se oggi non selezionato
- **MealCard per ogni pasto:** Glass card con icona pasto (40×40 bg-muted), typeLabel, titolo, descrizione. + SimpleVariantBadge espandibile + SubstitutionPanel espandibile per ogni ingrediente
- Navigazione "Giorno prima" / "Giorno dopo" con ChevronLeft/Right

### Tab Per te:
- Card accent "CONSIGLIO DEL GIORNO" con dailyTip personalizzato
- Info card: "Ogni consiglio ha una versione semplice..."
- Sezione "Per le tue sensibilità" con TipCard per ogni intolleranza
- Se nessuna intolleranza: messaggio gentile

### Tab Idee:
- Lista di ricette come TipCard, ciascuna con ingredienti sostituibili

### Tab Anti-gonfiore:
- Frase motivazionale + 8 consigli (mangia lentamente, evita gassate, finocchio/zenzero, non saltare pasti, cucina semplice, cammina dopo mangiato, FODMAP, rilassati)

### SubstitutionPanel:
Per ogni ingrediente, bottone "Non hai {nome}?" espandibile con lista sostituzioni (bullet primary •)

### SimpleVariantBadge:
Bottone con icona RefreshCw, espandibile con descrizione variante semplice

---

## Check-in Settimanale (`WeeklyCheckIn.tsx`) — 3 fasi

**Fase 0 — Peso:** "Riepilogo settimana {N}" — Input numero opzionale + "CONTINUA" / "SALTA E CONTINUA"

**Fase 1 — Gonfiore:** 5 opzioni (Nessuno→Molto forte, 1-5)

**Fase 2 — Energia:** 5 opzioni — al tap salva tutto su Supabase (upsert su user_id+week_number)

**Completamento:** 📊 floating, "Check-in settimanale salvato!", bottoni "VEDI I RISULTATI" + "TORNA ALLA HOME"

Progress dots (3 dots) in basso.

---

## Progressi (`ProgressPage.tsx`) — 2 tab

### Tab Andamento (📈):
- **Grafico Energia:** LineChart Recharts, linea teal `hsl(158 60% 52%)`, strokeWidth 2.5, dots r=4
- **Grafico Gonfiore:** Linea arancione `hsl(25 80% 60%)`, nota "Più basso = meglio"
- **Grafico Peso** (se dati): Linea bianca/foreground, dominio auto, tooltip "kg"
- Tutti: CartesianGrid tratteggiata, tooltip con sfondo scuro, XAxis "S1, S2..."
- **Confronto settimana vs precedente:** Grid 3 colonne (Energia, Gonfiore, Peso) con frecce ↑ meglio / ↓ peggio, colorati primary/secondary

### Tab Adattamenti (🔧):
- Badge contatore su tab se ci sono adattamenti applicati
- Sezione "MODIFICHE APPLICATE AUTOMATICAMENTE" con AdjustmentCard (bg-accent, badge "Applicato al tuo percorso")
- Sezione "OSSERVAZIONI" con suggerimenti non applicati
- Se <2 settimane: "Servono almeno 2 settimane di dati"

### AdjustmentCard:
Glass card con icona 40×40, titolo, descrizione, badge "Applicato" se applied

### Logica adattamento (`adaptationLogic.ts`):
Confronta ultime 2 settimane, genera suggerimenti su abitudini/nutrizione basati su trend energia, gonfiore, peso e obiettivo utente.

### Stato vuoto:
Emoji 📊 floating, "Nessun dato ancora", bottone "PRIMO CHECK-IN SETTIMANALE"

---

## Settimana (`WeekPage.tsx`)

- Griglia 7 giorni (Lun-Dom): box 40×40 rounded-xl. Completato: gradient-primary + ✓. Oggi: gradient-warm + •. Futuro: bg-muted.
- Lista abitudini con stato (Fatto/In corso)
- Suggerimento settimanale basato su completamento

---

## Insieme (`TogetherPage.tsx`) — 2 viste

**Toggle:** 2 bottoni flex-1 — "❤️ Chi mi supporta" (default) / "🤝 Chi supporto"
Con contatori. Attivo: gradient-primary + shadow-glow.

### Vista "Chi mi supporta":
1. Card accent con frase + "Invita fino a 3 persone care"
2. **Messaggi ricevuti** — Lista badge con icona Heart secondary, testo badge_type, data
3. **Lista supporter** — Avatar con iniziale (gradient-primary w-10 h-10 rounded-xl) + nome + "Ti supporta 💛"
4. **Crea invito** — Bottone "Crea un invito" con UserPlus. Limite 3 supporter.
   - Codice mostrato in `<code>` font-mono tracking-wider bold + bottone copia + bottone "📤 Copia link di invito"
5. **Privacy notice** — "🔒 Supporto Gentile — I tuoi supporter vedono solo il progresso generale..."

### Vista "Chi supporto io":
1. **Input codice invito** — Input uppercase font-mono + bottone ArrowRight gradient-primary
2. **Persone che supporti** — Card con avatar gradient-warm w-12 h-12, nome, streak (🔥 X giorni)
   - Griglia 2×2 di bottoni badge motivazionali: "Brava! 👏", "Continua così 💪", "Un passo alla volta 🌿", "Oggi conta 💛"
3. **Stato vuoto:** 🤝 + "Non stai ancora supportando nessuno"

**URL invite:** Auto-detect `?code=` in URL per pre-compilare e switchare a vista supporting.

### Hook `useTogether`:
Gestisce supporters, supporting, invites via Supabase. Limite 3. createInvite, acceptInvite (controlla se non auto-accettazione, se codice esiste, se non già partner), sendBadge, getReceivedBadges.

---

## Profilo (`ProfilePage.tsx`)

**Header:** AppHeader con showBack.

### Sezioni:

1. **Stats** — Grid 2 colonne: "Momenti di cura" (count check-in) + "Abitudini completate" (count). Numeri text-3xl font-bold text-gradient.
2. **Il tuo percorso** — Lista settings read-only: Obiettivo, Modalità, Peso (✏️ editabile), Ritmo, Attività, Difficoltà, Età, Genere. Glass cards con label muted a sinistra, value a destra.
3. **Edit peso** — Panel espandibile: input number + bottoni "Salva" (gradient-primary) / "Annulla" (bg-muted)
4. **Intolleranze** — Lista con bottone "Modifica"/"Fatto". In edit: checkbox toggle per standard (Lattosio, Glutine, Nichel, Fruttosio) + custom con X + "Aggiungi altra sensibilità"
5. **Privacy** — Card accent "🔒 Supporto Gentile"
6. **Logout** — Bottone glass con icona LogOut + "Esci dall'account", text-destructive

---

## Sistema Abitudini Progressive (`weeklyHabits.ts`)

4 tracce basate sull'obiettivo, 6 settimane ciascuna, 3 abitudini/settimana:
- **Leggerezza/Sgonfiarsi:** Camminare 10→30min, Acqua 1→2L, Alimentazione leggera
- **Energia:** Colazione, Acqua, Movimento 0→30min, Sonno
- **Perdita peso:** Camminare, Acqua, Porzioni, No zuccheri
- **Benessere (default):** Mix equilibrato

Risoluzione traccia: peso→weightloss, gonfiore→light, energia→energy, default→wellness.
Settimana calcolata da `created_at` del profilo. Cicla dopo 6 settimane.

---

## Consigli Alimentari (`foodTips.ts`)

Ogni tip ha: titolo, descrizione, icona, tags, ingredienti con sostituzioni, variante semplice.
Filtrati per obiettivo, difficoltà e intolleranze dell'utente.
Include: ricette semplici, consigli per intolleranze specifiche, guida anti-gonfiore.

---

## Piani Pasto (`mealPlans.ts`)

Piani settimanali (Lun-Dom) con 4 pasti/giorno (colazione, pranzo, cena, snack).
Adattati per: obiettivo, livello attività, sesso, età.
Ogni pasto ha: titolo, descrizione, icona, tipo, variante semplice, ingredienti con sostituzioni.

---

## Store Globale (`useAppStore.ts` — Zustand)

**State:** user (UserProfile), weeklyHabits, weekLabel, weekNumber, totalWeeks, checkIns, todayCheckedIn, currentStreak, lastCheckInDate, badges

**Actions:** setUser, completeOnboarding, toggleHabit, addCheckIn (con calcolo streak), refreshWeeklyHabits, addBadge, toggleIntolerance, addCustomIntolerance, removeCustomIntolerance, getStreakMilestone

**Streak:** Calcolato confrontando lastCheckInDate con oggi/ieri. Reset se gap >1 giorno.

---

## Routing (`App.tsx`)

```
/ → Index (router/landing)
/auth → AuthPage (Google login)
/onboarding → Onboarding (9 step)
/home → HomePage
/checkin → CheckIn (giornaliero)
/week → WeekPage
/together → TogetherPage
/nutrition → NutritionPage
/weekly-checkin → WeeklyCheckIn
/progress → ProgressPage
/profile → ProfilePage
* → NotFound
```

Wrapped in: QueryClientProvider, AuthProvider, TooltipProvider, Sonner (toast), BrowserRouter.
