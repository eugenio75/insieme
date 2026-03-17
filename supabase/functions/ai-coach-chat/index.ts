import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    
    // Verify JWT via getClaims (no DB round-trip, avoids timeouts)
    const authClient = createClient(supabaseUrl, anonKey!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) throw new Error("Unauthorized");
    const user = { id: claimsData.claims.sub as string };

    // Service client for data fetching
    const supabase = createClient(supabaseUrl, serviceKey);

    const { messages: chatMessages, mode } = await req.json();
    // mode: "chat" (conversational) or "proactive" (generate daily insights)

    // ===== GATHER ALL CONTEXT =====

    // 1. Profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // 2. Recent check-ins (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("mood, energy, bloating, stress, sleep_hours, foods_eaten, created_at")
      .eq("user_id", user.id)
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: false })
      .limit(20);

    // 3. Health documents (analyses + diet)
    const { data: healthDocs } = await supabase
      .from("health_documents")
      .select("doc_type, ai_analysis, ai_meal_plan, status, created_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(5);

    // 4. Weekly check-ins (progress)
    const { data: weeklyCheckins } = await supabase
      .from("weekly_checkins")
      .select("weight, energy, bloating, week_number, notes, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8);

    // 5. Fasting sessions
    const { data: fastingSessions } = await supabase
      .from("fasting_sessions")
      .select("started_at, ended_at, completed, target_hours, protocol")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(10);

    // ===== BUILD CONTEXT STRING =====
    const name = profile?.name || "utente";
    const sex = profile?.sex || "";
    const sexLower = sex.toLowerCase();
    const isFemale = ["donna", "femmina", "female", "f"].includes(sexLower);
    const age = profile?.age || "";

    let context = `PROFILO UTENTE:
- Nome: ${name}
- Sesso: ${sex}
- Età: ${age}
- Peso: ${profile?.weight || "non specificato"} kg
- Obiettivo: ${profile?.objective || "non specificato"}
- Attività fisica: ${profile?.activity || "non specificata"}
- Tipo lavoro: ${profile?.work_type || "non specificato"}
- Difficoltà: ${profile?.difficulty || "nessuna"}
- Intolleranze: ${[...(profile?.intolerances || []), ...(profile?.custom_intolerances || [])].join(", ") || "nessuna"}
- Digiuno: ${profile?.fasting_enabled ? `Sì (${profile.fasting_protocol}, ${profile.fasting_hours}h)` : "No"}
- Streak attuale: ${profile?.current_streak || 0} giorni\n`;

    // Check-in context
    if (checkins && checkins.length > 0) {
      const avgMood = (checkins.reduce((s, c) => s + c.mood, 0) / checkins.length).toFixed(1);
      const avgEnergy = (checkins.reduce((s, c) => s + c.energy, 0) / checkins.length).toFixed(1);
      const avgBloating = (checkins.reduce((s, c) => s + c.bloating, 0) / checkins.length).toFixed(1);
      const latestCheckin = checkins[0];
      
      context += `\nCHECK-IN RECENTI (ultimi 7 giorni, ${checkins.length} check-in):
- Umore medio: ${avgMood}/5
- Energia media: ${avgEnergy}/5
- Gonfiore medio: ${avgBloating}/5
- Ultimo check-in: umore ${latestCheckin.mood}/5, energia ${latestCheckin.energy}/5, gonfiore ${latestCheckin.bloating}/5`;
      if (latestCheckin.stress) context += `, stress ${latestCheckin.stress}/4`;
      if (latestCheckin.sleep_hours) context += `, sonno ${latestCheckin.sleep_hours}h`;
      if (latestCheckin.foods_eaten?.length) context += `\n- Cibi recenti: ${latestCheckin.foods_eaten.join(", ")}`;
      context += "\n";
    }

    // Health documents context
    if (healthDocs && healthDocs.length > 0) {
      const dietDocs = healthDocs.filter(d => d.doc_type === "diet");
      const medDocs = healthDocs.filter(d => d.doc_type === "medical_tests");

      if (medDocs.length > 0) {
        const latestMed = medDocs[0];
        const analysis = latestMed.ai_analysis as any;
        context += `\nANALISI MEDICHE (${new Date(latestMed.created_at).toLocaleDateString("it-IT")}):`;
        if (analysis?.summary) context += `\n- Riepilogo: ${analysis.summary}`;
        if (analysis?.risk_factors?.length) context += `\n- Fattori di rischio: ${analysis.risk_factors.join("; ")}`;
        if (analysis?.dietary_recommendations?.length) context += `\n- Raccomandazioni: ${analysis.dietary_recommendations.join("; ")}`;
        if (analysis?.foods_to_increase?.length) context += `\n- Da aumentare: ${analysis.foods_to_increase.join("; ")}`;
        if (analysis?.foods_to_reduce?.length) context += `\n- Da ridurre: ${analysis.foods_to_reduce.join("; ")}`;
        if (analysis?.prevention_tips?.length) context += `\n- Prevenzione: ${analysis.prevention_tips.join("; ")}`;
        if (analysis?.values?.length) {
          const abnormal = analysis.values.filter((v: any) => v.status !== "normal");
          if (abnormal.length) {
            context += `\n- Valori anomali: ${abnormal.map((v: any) => `${v.name}: ${v.value} (${v.status})`).join("; ")}`;
          }
        }
        context += "\n";
      }

      if (dietDocs.length > 0) {
        const latestDiet = dietDocs[0];
        const analysis = latestDiet.ai_analysis as any;
        context += `\nDIETA DEL DIETOLOGO:`;
        if (analysis?.summary) context += `\n- ${analysis.summary}`;
        if (analysis?.meals?.length) {
          context += `\n- Pasti: ${analysis.meals.map((m: any) => `${m.name}: ${m.foods?.join(", ")}`).join(" | ")}`;
        }
        if (analysis?.fusion_tips?.length) context += `\n- Fusione intelligente: ${analysis.fusion_tips.join("; ")}`;
        context += "\n";
      }
    }

    // Weekly progress
    if (weeklyCheckins && weeklyCheckins.length > 0) {
      context += `\nPROGRESSI SETTIMANALI:`;
      weeklyCheckins.slice(0, 4).forEach((wc: any) => {
        context += `\n- Sett. ${wc.week_number}: energia ${wc.energy}/5, gonfiore ${wc.bloating}/5${wc.weight ? `, peso ${wc.weight}kg` : ""}${wc.notes ? ` (${wc.notes})` : ""}`;
      });
      if (weeklyCheckins.length >= 2) {
        const latest = weeklyCheckins[0];
        const previous = weeklyCheckins[1];
        if (latest.weight && previous.weight) {
          const diff = latest.weight - previous.weight;
          context += `\n- Trend peso: ${diff > 0 ? "+" : ""}${diff.toFixed(1)}kg rispetto alla settimana precedente`;
        }
      }
      context += "\n";
    }

    // Fasting context
    if (fastingSessions && fastingSessions.length > 0) {
      const completed = fastingSessions.filter(s => s.completed).length;
      context += `\nDIGIUNO: ${completed}/${fastingSessions.length} sessioni completate negli ultimi giorni\n`;
    }

    // ===== SYSTEM PROMPT =====
    let systemPrompt = "";
    
    if (mode === "proactive") {
      systemPrompt = `Sei il coach nutrizionale AI personale di ${name}. Analizza TUTTI i dati disponibili e genera un consiglio proattivo e personalizzato per oggi.

${context}

REGOLE:
- Rispondi SOLO con JSON valido: { "title": "...", "message": "...", "tips": ["..."], "category": "..." }
- title: Titolo breve e accattivante (max 5 parole)
- message: Consiglio personalizzato breve (1-2 frasi). NON citare MAI numeri, valori o risultati delle analisi mediche. Parla in modo semplice e concreto.
- tips: 2 azioni concrete e brevi per OGGI (max 6-8 parole ciascuna)
- category: "nutrition" | "health" | "wellness" | "motivation"

PRIORITÀ:
1. Se ci sono valori anomali nelle analisi → consigli alimentari mirati per quei valori
2. Se il trend check-in mostra calo energia/umore → supporto motivazionale + nutrizione
3. Se ha una dieta del dietologo → ricorda cosa seguire oggi
4. Se sta facendo digiuno → consigli su quando e cosa mangiare
5. Altrimenti → consiglio generico basato su obiettivi

⚠️ VINCOLO CRITICO - SICUREZZA ALIMENTARE:
- Se le analisi mediche mostrano valori glicemici alti, pre-diabete, insulino-resistenza o rischio diabetico: NON suggerire MAI cibi ad alto indice glicemico (pane bianco, marmellata, miele, succhi di frutta, dolci, biscotti, zucchero). Suggerisci invece proteine, grassi buoni, verdure, cereali integrali.
- Se ci sono valori di colesterolo alti: NON suggerire cibi ricchi di grassi saturi.
- Se ci sono carenze (ferro, vitamina D, ecc.): includi cibi ricchi di quei nutrienti.
- I consigli devono essere SEMPRE coerenti con i "cibi da ridurre" e "cibi da aumentare" delle analisi mediche.
- Se l'utente ha caricato una dieta del dietologo, i consigli devono essere coerenti con quella dieta.

TONO: Come un amico nutrizionista che ti conosce bene. Gentile e soft, mai ansiogeno. ${isFemale ? "Femminile, empatico" : "Diretto, supportivo"}. Max 1-2 emoji.`;
    } else {
      systemPrompt = `Sei il coach nutrizionale AI personale di ${name} nell'app "Insieme". Hai accesso a TUTTI i dati di salute, alimentazione e benessere dell'utente.

${context}

RUOLO:
- Rispondi alle domande usando i dati REALI dell'utente (analisi, dieta, check-in, progressi)
- Dai consigli alimentari personalizzati basati sulle analisi mediche
- Aiuta a seguire la dieta del dietologo con suggerimenti pratici
- Motiva basandoti sui progressi reali
- Spiega cosa significano i valori delle analisi in modo semplice

⚠️ VINCOLO CRITICO - SICUREZZA ALIMENTARE:
- Se le analisi mediche mostrano valori glicemici alti, pre-diabete, insulino-resistenza o rischio diabetico: NON suggerire MAI cibi ad alto indice glicemico (pane bianco, marmellata, miele, succhi di frutta, dolci, biscotti, zucchero). Suggerisci invece proteine, grassi buoni, verdure, cereali integrali.
- Se ci sono valori di colesterolo alti: NON suggerire cibi ricchi di grassi saturi.
- Se ci sono carenze (ferro, vitamina D, ecc.): includi cibi ricchi di quei nutrienti.
- OGNI consiglio alimentare deve essere COERENTE con i "cibi da ridurre" e "cibi da aumentare" delle analisi mediche.
- Se l'utente ha caricato una dieta del dietologo, i consigli devono rispettare quella dieta.

REGOLE:
- Tono: amichevole, competente, mai giudicante, mai ansiogeno
- Risposte concise ma complete (3-5 frasi max per paragrafo)
- Usa i dati specifici dell'utente quando rispondi (non risposte generiche!)
- Se non hai dati su qualcosa, dillo onestamente
- NON fare diagnosi mediche, ma spiega le implicazioni nutrizionali
- ${isFemale ? "Usa il femminile" : "Usa il maschile"}
- Max 2 emoji per messaggio
- Rispondi in italiano`;
    }

    // ===== CALL AI =====
    const aiMessages: any[] = [{ role: "system", content: systemPrompt }];
    
    if (mode === "proactive") {
      aiMessages.push({ role: "user", content: "Genera il consiglio proattivo personalizzato per oggi basato su tutti i miei dati." });
    } else {
      // Add conversation history
      if (chatMessages && Array.isArray(chatMessages)) {
        aiMessages.push(...chatMessages);
      }
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream: mode !== "proactive",
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Troppe richieste, riprova tra poco" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI esauriti" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    if (mode === "proactive") {
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "";
      let parsed;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: "Per te oggi", message: content, tips: [], category: "wellness" };
      } catch {
        parsed = { title: "Per te oggi", message: content, tips: [], category: "wellness" };
      }
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream response for chat mode
    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (e) {
    console.error("ai-coach-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
