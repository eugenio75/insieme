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
    const supabaseKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Fetch all check-ins
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("mood, energy, bloating, foods_eaten, sleep_hours, stress, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    // Fetch user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("objective, age, sex, activity, intolerances, custom_intolerances")
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
            content: `Sei un nutrizionista AI che analizza pattern nel comportamento e nella salute dell'utente.
Analizza i dati dei check-in per trovare PATTERN e CORRELAZIONI tra:
- Cibi consumati e sintomi (gonfiore, energia bassa, umore)
- Combinazioni di cibi nello stesso giorno e reazioni
- Ore di sonno e fame/energia/umore del giorno dopo
- Stress e scelte alimentari o sintomi
- Orari e frequenza dei pasti

PROFILO UTENTE: ${JSON.stringify(profile || {})}

REGOLE:
- Rispondi SOLO con JSON valido
- Formato: { "patterns": [...], "foodFindings": [...], "dietSuggestions": [...] }

PATTERN (correlazioni comportamentali):
Ogni pattern: { "type": "sleep_hunger"|"sleep_energy"|"stress_eating"|"food_combo"|"meal_timing"|"stress_bloating", "title": "titolo breve", "description": "spiegazione gentile e pratica", "icon": "emoji", "correlation": 0.0-1.0, "actionTip": "consiglio concreto e specifico" }

FOOD FINDINGS (sensibilità alimentari):
Ogni finding: { "food": "nome", "issue": "gonfiore|energia_bassa|umore_basso", "correlation": 0.0-1.0, "description": "breve spiegazione", "icon": "emoji" }

DIET SUGGESTIONS (suggerimenti adattivi per il piano):
Ogni suggerimento: { "type": "add"|"reduce"|"replace"|"timing", "category": "proteine|carboidrati|verdure|latticini|zuccheri|idratazione", "suggestion": "suggerimento specifico", "reason": "basato su quale pattern", "priority": "alta|media|bassa" }

- Max 5 patterns, max 5 food findings, max 4 diet suggestions
- Solo correlazioni con dati sufficienti (almeno 3 occorrenze)
- Tono gentile, empatico, non allarmante
- Confidenza generale: ${confidence} (${totalCheckins} check-in)
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
