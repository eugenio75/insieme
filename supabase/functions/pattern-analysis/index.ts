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
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    if (!supabaseKey) throw new Error("Supabase key not configured");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Fetch all check-ins
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("mood, energy, bloating, foods_eaten, sleep_hours, stress, plan_adherence, plan_foods_followed, off_plan_foods, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    // Fetch user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("objective, age, sex, activity, intolerances, custom_intolerances, work_type, difficulty")
      .eq("user_id", user.id)
      .single();

    if (!checkins || checkins.length < 10) {
      return new Response(JSON.stringify({
        patterns: [],
        foodFindings: [],
        message: `Servono almeno 10 check-in per iniziare l'analisi dei pattern. Ne hai ${checkins?.length || 0}.`,
        dataPoints: checkins?.length || 0,
        nextAnalysisIn: Math.max(0, 10 - (checkins?.length || 0)),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalCheckins = checkins.length;
    const confidence = totalCheckins < 20 ? "bassa" : totalCheckins < 40 ? "media" : "alta";

    // Prepare data for AI
    const dataForAI = checkins.map(c => ({
      date: c.created_at,
      foods: c.foods_eaten,
      plan_adherence: c.plan_adherence,
      plan_foods_followed: c.plan_foods_followed,
      off_plan_foods: c.off_plan_foods,
      bloating: c.bloating,
      energy: c.energy,
      mood: c.mood,
      sleep_hours: c.sleep_hours,
      stress: c.stress,
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Sei un nutrizionista AI certificato. Analizza i dati dei check-in e il profilo dell'utente per trovare pattern e dare consigli PERSONALIZZATI e SALUTARI.

PROFILO UTENTE:
- Sesso: ${profile?.sex || 'non specificato'}
- Età: ${profile?.age || 'non specificata'}
- Attività fisica: ${profile?.activity || 'non specificata'}
- Tipo di lavoro: ${(profile as any)?.work_type || 'non specificato'}
- Obiettivo: ${profile?.objective || 'benessere generale'}
- Difficoltà: ${profile?.difficulty || 'non specificata'}
- Intolleranze certificate: ${(profile?.intolerances || []).join(', ') || 'nessuna'}
- Sensibilità personalizzate: ${(profile?.custom_intolerances || []).join(', ') || 'nessuna'}

LINEE GUIDA NUTRIZIONALI OBBLIGATORIE:
- I suggerimenti devono SEMPRE rispettare le intolleranze e sensibilità dell'utente
- MAI suggerire cibi che contengono allergeni o intolleranze dichiarate
- Adattare le porzioni e il fabbisogno in base a sesso, età, livello di attività E tipo di lavoro:
  * Lavoro sedentario: più pause attive, spuntini leggeri, attenzione a non eccedere con carboidrati semplici
  * Lavoro in piedi: più idratazione, spuntini energetici, supporto per gambe e circolazione
  * Lavoro fisico: più carboidrati complessi, proteine per recupero muscolare, pasti più sostanziosi
  * Donna sedentaria: ~1600-1800 kcal, più ferro e calcio
  * Donna attiva: ~2000-2200 kcal, più proteine per recupero
  * Uomo sedentario: ~2000-2200 kcal
  * Uomo attivo: ~2400-2800 kcal, più proteine e carboidrati complessi
  * Adolescenti: più calcio, vitamina D, ferro
  * Over 50: più proteine, vitamina D, fibre, meno sodio
- Privilegiare: cibi integrali, verdure di stagione, proteine magre, grassi buoni (olio EVO, frutta secca, pesce azzurro)
- Evitare: cibi ultra-processati, eccesso di zuccheri semplici, eccesso di sale
- Idratazione: almeno 1.5-2L acqua/giorno
- NON contare calorie esplicitamente nei suggerimenti (filosofia non-dieta)

ANALIZZA questi pattern nei check-in:
- ADERENZA AL PIANO: correlazione tra plan_adherence (full/partial/none) e benessere (umore, energia, gonfiore). Es: "Nei giorni in cui segui il piano, la tua energia è più alta"
- CIBI FUORI PIANO: quali off_plan_foods si correlano con sintomi negativi
- CIBI DEL PIANO: quali plan_foods_followed si correlano con benessere positivo
- Cibi consumati e sintomi (gonfiore, energia bassa, umore)
- Combinazioni di cibi nello stesso giorno e reazioni
- Ore di sonno e fame/energia/umore del giorno dopo
- Stress e scelte alimentari o sintomi

REGOLE OUTPUT:
- Rispondi SOLO con JSON valido
- Formato: { "patterns": [...], "foodFindings": [...], "dietSuggestions": [...] }

PATTERN: { "type": "plan_adherence"|"off_plan_impact"|"sleep_hunger"|"sleep_energy"|"stress_eating"|"food_combo"|"meal_timing"|"stress_bloating", "title": "titolo breve", "description": "spiegazione gentile e pratica", "icon": "emoji", "correlation": 0.0-1.0, "actionTip": "consiglio concreto adattato a sesso/età/attività" }

FOOD FINDINGS: { "food": "nome", "issue": "gonfiore|energia_bassa|umore_basso", "correlation": 0.0-1.0, "description": "breve spiegazione", "icon": "emoji" }

DIET SUGGESTIONS: { "type": "add"|"reduce"|"replace"|"timing", "category": "proteine|carboidrati|verdure|latticini|zuccheri|idratazione|fibre|grassi_buoni", "suggestion": "suggerimento specifico e salutare, rispetta intolleranze", "reason": "basato su quale pattern + profilo utente", "priority": "alta|media|bassa" }

- Max 5 patterns, max 5 food findings, max 4 diet suggestions
- Solo correlazioni con dati sufficienti (almeno 3 occorrenze)
- Tono gentile, empatico, non allarmante. Mai sensi di colpa.
- Le alternative devono essere PRATICHE e con ingredienti comuni
- Confidenza: ${confidence} (${totalCheckins} check-in)
- Se non trovi pattern significativi, ritorna arrays vuoti`,
          },
          {
            role: "user",
            content: `Ecco i dati dei check-in:\n${JSON.stringify(dataForAI, null, 2)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content?.trim() || "{}";
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { patterns: [], foodFindings: [], dietSuggestions: [] };
    }

    return new Response(JSON.stringify({
      patterns: parsed.patterns || [],
      foodFindings: parsed.foodFindings || [],
      dietSuggestions: parsed.dietSuggestions || [],
      confidence,
      dataPoints: totalCheckins,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pattern-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
