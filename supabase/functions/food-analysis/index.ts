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

    // Fetch all check-ins with food data
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("mood, energy, bloating, foods_eaten, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!checkins || checkins.length < 5) {
      return new Response(JSON.stringify({
        findings: [],
        message: "Servono almeno 5 check-in con cibi tracciati per iniziare l'analisi.",
        dataPoints: checkins?.length || 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter check-ins that have food data
    const withFoods = checkins.filter(c => c.foods_eaten && c.foods_eaten.length > 0);

    if (withFoods.length < 3) {
      return new Response(JSON.stringify({
        findings: [],
        message: "Continua a tracciare i cibi nei check-in. Servono più dati per trovare correlazioni.",
        dataPoints: withFoods.length,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context for AI analysis
    const dataForAI = withFoods.map(c => ({
      date: c.created_at,
      foods: c.foods_eaten,
      bloating: c.bloating,
      energy: c.energy,
      mood: c.mood,
    }));

    const totalCheckins = withFoods.length;
    const confidence = totalCheckins < 7 ? "bassa" : totalCheckins < 14 ? "media" : "alta";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Sei un nutrizionista AI gentile. Analizza i dati dei check-in dell'utente per trovare correlazioni tra cibi e sintomi (gonfiore, energia bassa, umore basso).

REGOLE:
- Rispondi SOLO con JSON valido, nessun altro testo
- Formato: { "findings": [...] }
- Ogni finding: { "food": "nome cibo", "issue": "gonfiore|energia_bassa|umore_basso", "correlation": 0.0-1.0, "description": "breve spiegazione gentile", "icon": "emoji" }
- correlation: 0.3-0.5 = sospetto leggero, 0.5-0.7 = correlazione moderata, 0.7-1.0 = correlazione forte
- Sii prudente: non segnalare cibi senza dati sufficienti
- Max 5 findings, ordina per correlazione decrescente
- Se non trovi correlazioni significative, ritorna findings vuoto
- Tono gentile e non allarmante nelle descrizioni
- Il livello di confidenza generale è: ${confidence} (${totalCheckins} check-in analizzati)`,
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
    
    // Clean markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { findings: [] };
    }

    return new Response(JSON.stringify({
      findings: parsed.findings || [],
      confidence,
      dataPoints: totalCheckins,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("food-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
