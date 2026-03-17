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

    // Fetch recent check-ins (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("mood, energy, bloating, created_at")
      .eq("user_id", user.id)
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: false })
      .limit(20);

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, objective, current_streak, difficulty, sex")
      .eq("user_id", user.id)
      .single();

    const name = profile?.name || "";
    const sex = profile?.sex || "";
    const streak = profile?.current_streak || 0;
    const objective = profile?.objective || "";
    const isMale = sex === "maschio" || sex === "male" || sex === "M";
    const salutation = name ? (isMale ? `caro ${name}` : `cara ${name}`) : (isMale ? "caro" : "cara");

    // Build context
    let context = `L'utente si chiama ${name || "utente"} (${isMale ? "maschio" : "femmina"}).`;
    if (objective) context += ` Il suo obiettivo è: ${objective}.`;
    if (streak > 0) context += ` Ha uno streak di ${streak} giorni consecutivi.`;

    if (checkins && checkins.length > 0) {
      const avgMood = checkins.reduce((s, c) => s + c.mood, 0) / checkins.length;
      const avgEnergy = checkins.reduce((s, c) => s + c.energy, 0) / checkins.length;
      const avgBloating = checkins.reduce((s, c) => s + c.bloating, 0) / checkins.length;
      const latest = checkins[0];
      context += ` Negli ultimi check-in: umore medio ${avgMood.toFixed(1)}/5, energia media ${avgEnergy.toFixed(1)}/5, gonfiore medio ${avgBloating.toFixed(1)}/4.`;
      context += ` Ultimo check-in: umore ${latest.mood}/5, energia ${latest.energy}/5, gonfiore ${latest.bloating}/4.`;
    } else {
      context += " Non ha ancora fatto check-in recenti.";
    }

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
            content: `Sei un coach gentile e motivazionale per un'app di benessere. 
Genera UN SOLO messaggio motivazionale breve (max 2 frasi) personalizzato.
Rivolgiti all'utente come "${salutation}".
Il tono deve essere caldo, incoraggiante, mai giudicante. Come un/una migliore amico/a che ti sostiene.
Non usare emoji eccessive. Max 1-2 emoji. Non mettere virgolette.
Usa il genere corretto (${isMale ? "maschile" : "femminile"}) per aggettivi e participi.
Rispondi SOLO con il messaggio, nient'altro.`,
          },
          { role: "user", content: context },
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
    const message = aiData.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("motivational-message error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
