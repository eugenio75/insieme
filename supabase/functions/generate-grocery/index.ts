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
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

    const authClient = createClient(supabaseUrl, anonKey!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub as string;

    const supabase = createClient(supabaseUrl, serviceKey);
    const { mealPlan } = await req.json();

    // Get profile for intolerances and preferences
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, intolerances, custom_intolerances, objective, sex, region, city")
      .eq("user_id", userId)
      .single();

    // Check for household connections
    const { data: householdConnections } = await supabase
      .from("household_connections")
      .select("from_user_id, to_user_id, to_email, status")
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .eq("status", "accepted");

    let householdContext = "";
    if (householdConnections && householdConnections.length > 0) {
      // Get partner profiles
      for (const conn of householdConnections) {
        const partnerId = conn.from_user_id === userId ? conn.to_user_id : conn.from_user_id;
        if (!partnerId) continue;
        const { data: partnerProfile } = await supabase
          .from("profiles")
          .select("name, intolerances, custom_intolerances, objective, sex")
          .eq("user_id", partnerId)
          .single();
        if (partnerProfile) {
          householdContext += `\nCONVIVENTE: ${partnerProfile.name || "Partner"}
- Intolleranze: ${[...(partnerProfile.intolerances || []), ...(partnerProfile.custom_intolerances || [])].join(", ") || "nessuna"}
- Obiettivo: ${partnerProfile.objective || "non specificato"}`;
        }
      }
    }

    const intolerances = [...(profile?.intolerances || []), ...(profile?.custom_intolerances || [])];

    const systemPrompt = `Sei un assistente che genera liste della spesa intelligenti basate su un piano alimentare settimanale.

PROFILO UTENTE:
- Nome: ${profile?.name || "utente"}
- Intolleranze: ${intolerances.join(", ") || "nessuna"}
- Obiettivo: ${profile?.objective || "benessere"}
- Zona: ${profile?.region || ""} ${profile?.city || ""}
${householdContext}

REGOLE:
- Analizza tutti i pasti della settimana e crea una lista della spesa UNICA e ottimizzata
- Raggruppa per categoria: Verdure, Frutta, Proteine, Latticini e alternative, Cereali e pane, Dispensa, Extra
- Unifica gli ingredienti ricorrenti (es. se serve olio in 5 ricette, metti "Olio EVO" una sola volta con quantità adeguata)
- Le quantità devono essere approssimative e pratiche (es. "500g", "1 confezione", "un mazzo", "4-5")
- NON includere ingredienti che normalmente si hanno già in dispensa (sale, pepe, olio base) a meno che servano in quantità speciali
- Rispetta le intolleranze dell'utente
${householdContext ? "- Considera anche le intolleranze del convivente nella scelta degli ingredienti\n- Adatta le quantità per 2 persone dove appropriato" : ""}
- Preferisci prodotti stagionali e locali quando possibile

RISPONDI CON JSON VALIDO:
{
  "categories": [
    {
      "name": "Verdure",
      "emoji": "🥬",
      "items": [
        { "name": "Zucchine", "quantity": "4-5 medie" },
        { "name": "Carote", "quantity": "un mazzo" }
      ]
    }
  ],
  "tips": ["Un consiglio utile sulla spesa"],
  "estimated_for": ${householdContext ? 2 : 1}
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Ecco il piano alimentare settimanale:\n\n${JSON.stringify(mealPlan)}` },
        ],
        temperature: 0.4,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Troppe richieste, riprova tra poco" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Crediti AI esauriti" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      parsed = null;
    }

    if (!parsed?.categories) {
      throw new Error("Failed to parse grocery list from AI");
    }

    // Save grocery list to DB
    const { data: list, error: listError } = await supabase
      .from("grocery_lists")
      .insert({
        user_id: userId,
        title: "Spesa settimanale",
        meal_plan_snapshot: mealPlan,
      })
      .select()
      .single();

    if (listError) throw listError;

    // Save items
    const items: any[] = [];
    for (const cat of parsed.categories) {
      for (const item of cat.items) {
        items.push({
          list_id: list.id,
          user_id: userId,
          name: item.name,
          quantity: item.quantity || null,
          category: cat.name,
          checked: false,
          is_manual: false,
        });
      }
    }

    if (items.length > 0) {
      await supabase.from("grocery_items").insert(items);
    }

    return new Response(JSON.stringify({
      list_id: list.id,
      categories: parsed.categories,
      tips: parsed.tips || [],
      estimated_for: parsed.estimated_for || 1,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-grocery error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
