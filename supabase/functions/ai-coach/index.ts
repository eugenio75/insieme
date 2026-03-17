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
    if (!supabaseKey) throw new Error("Supabase anon/publishable key is not configured");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Get the trigger context from request body
    const { trigger, mood, energy, stress, sleepHours, bloating } = await req.json();

    // Fetch profile for personalization
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, objective, difficulty, current_streak, activity, work_type, sex, age")
      .eq("user_id", user.id)
      .single();

    // Fetch recent check-ins for context
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    const { data: recentCheckins } = await supabase
      .from("daily_checkins")
      .select("mood, energy, bloating, stress, sleep_hours, foods_eaten, created_at")
      .eq("user_id", user.id)
      .gte("created_at", threeDaysAgo)
      .order("created_at", { ascending: false })
      .limit(10);

    const name = profile?.name || "cara";
    const difficulty = profile?.difficulty || "";
    const streak = profile?.current_streak || 0;

    // Build situation context
    let situation = "";
    if (trigger === "checkin_critical") {
      situation = `${name} ha appena completato un check-in con segnali di difficoltà:`;
      if (mood && mood <= 2) situation += ` Umore basso (${mood}/5).`;
      if (energy && energy <= 2) situation += ` Energia molto bassa (${energy}/5).`;
      if (stress && stress >= 3) situation += ` Stress ${stress >= 4 ? 'molto alto' : 'alto'} (${stress}/4).`;
      if (sleepHours && sleepHours < 6) situation += ` Ha dormito solo ${sleepHours} ore.`;
      if (bloating && bloating >= 3) situation += ` Gonfiore ${bloating >= 4 ? 'forte' : 'moderato'} (${bloating}/4).`;
    } else if (trigger === "sos") {
      situation = `${name} ha premuto il pulsante SOS — sta attraversando un momento molto difficile e ha bisogno di supporto immediato.`;
    }

    // Add historical context
    if (recentCheckins && recentCheckins.length > 1) {
      const avgMood = recentCheckins.reduce((s, c) => s + c.mood, 0) / recentCheckins.length;
      const avgEnergy = recentCheckins.reduce((s, c) => s + c.energy, 0) / recentCheckins.length;
      situation += ` Negli ultimi giorni: umore medio ${avgMood.toFixed(1)}/5, energia media ${avgEnergy.toFixed(1)}/5.`;
    }

    if (difficulty) situation += ` Le sue difficoltà principali: ${difficulty}.`;
    if (streak > 0) situation += ` Ha uno streak di ${streak} giorni.`;

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
            content: `Sei un coach gentile e empatico per un'app di benessere. L'utente sta attraversando un momento difficile.

REGOLE:
- Rispondi SOLO con JSON valido: { "message": "...", "actionTips": [...], "tone": "..." }
- message: Un messaggio empatico e personalizzato (2-3 frasi). Come una migliore amica che capisce davvero.
- actionTips: 1-3 consigli PRATICI e IMMEDIATI che può fare ORA (es. "Bevi un bicchiere d'acqua calda", "Fai 3 respiri profondi")
- tone: "gentle" | "encouraging" | "comforting" in base alla situazione

TONO:
- Mai giudicante, mai colpevolizzante
- Non dire "dovresti" o "devi" — usa "potresti provare" o "che ne dici di"
- Se ha dormito poco: empatia + suggerimento pratico per il giorno
- Se è stressata: validazione + tecnica di rilassamento rapida
- Se umore basso: accoglienza + piccola azione che può aiutare
- Se SOS: massima empatia, ricorda che non è sola, suggerisci di parlare con qualcuno
- Se ha uno streak positivo: usa quello come leva motivazionale gentile
- Adatta il linguaggio al contesto (donna/uomo, età, tipo di lavoro)
- Max 1-2 emoji nel messaggio`,
          },
          { role: "user", content: situation },
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
      parsed = {
        message: "Ehi, sono qui con te. Qualunque cosa stia succedendo, ricorda che ogni momento difficile è temporaneo 💛",
        actionTips: ["Fai 3 respiri profondi", "Bevi un bicchiere d'acqua"],
        tone: "comforting",
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
