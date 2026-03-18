import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, meal, ingredient, request, userProfile, healthConstraints, dietAdaptation } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const profileContext = userProfile ? (() => {
      // Calculate BMI
      const w = parseFloat(userProfile.weight || '');
      const h = parseFloat(userProfile.height || '');
      let bmiInfo = '';
      if (w && h && h > 100) {
        const hm = h / 100;
        const bmi = w / (hm * hm);
        const bmiRounded = Math.round(bmi * 10) / 10;
        let bmiCategory = '';
        if (bmi < 18.5) bmiCategory = 'SOTTOPESO - aumentare leggermente le porzioni, includere grassi buoni e carboidrati complessi';
        else if (bmi < 25) bmiCategory = 'NORMOPESO - mantenere equilibrio attuale';
        else if (bmi < 30) bmiCategory = 'SOVRAPPESO - ridurre porzioni gradualmente, preferire proteine e verdure, limitare carboidrati raffinati e grassi saturi';
        else bmiCategory = 'OBESITÀ - porzioni controllate, eliminare zuccheri semplici, massimizzare verdure e proteine magre, evitare fritti e ultra-processati';
        bmiInfo = `- BMI: ${bmiRounded} (${bmiCategory})`;
      }

      return `
Profilo utente:
- Obiettivo: ${userProfile.objective || 'non specificato'}
- Intolleranze: ${[...(userProfile.intolerances || []), ...(userProfile.customIntolerances || [])].join(', ') || 'nessuna'}
- Età: ${userProfile.age || 'non specificata'}
- Sesso: ${userProfile.sex || 'non specificato'}
- Attività: ${userProfile.activity || 'non specificata'}
- Lavoro: ${userProfile.workType || 'non specificato'}
- Difficoltà: ${userProfile.difficulty || 'non specificata'}
${userProfile.weight ? `- Peso attuale: ${userProfile.weight} kg` : ''}
${userProfile.height ? `- Altezza: ${userProfile.height} cm` : ''}
${bmiInfo}
${userProfile.bloodPressureSystolic || userProfile.bloodPressureDiastolic ? `- Pressione arteriosa media: ${userProfile.bloodPressureSystolic || '?'}/${userProfile.bloodPressureDiastolic || '?'} mmHg${
  parseInt(userProfile.bloodPressureSystolic) >= 140 || parseInt(userProfile.bloodPressureDiastolic) >= 90 
    ? ' (IPERTENSIONE - ridurre sodio, insaccati, cibi conservati; aumentare potassio, verdure, frutta)'
    : parseInt(userProfile.bloodPressureSystolic) >= 130 || parseInt(userProfile.bloodPressureDiastolic) >= 85
      ? ' (PRE-IPERTENSIONE - moderare il sodio, preferire cibi freschi)'
      : parseInt(userProfile.bloodPressureSystolic) <= 90 || parseInt(userProfile.bloodPressureDiastolic) <= 60
        ? ' (IPOTENSIONE - idratarsi bene, pasti piccoli e frequenti, un po\' più di sale è ok)'
        : ' (nella norma)'
}` : ''}
${userProfile.region ? `- Zona: ${userProfile.city ? userProfile.city + ', ' : ''}${userProfile.province ? userProfile.province + ', ' : ''}${userProfile.region}
- IMPORTANTE: Suggerisci prodotti locali e di stagione tipici di questa zona d'Italia. Privilegia ingredienti freschi, a km zero e della tradizione culinaria regionale.` : ''}
IMPORTANTE: Adatta SEMPRE i pasti al BMI dell'utente. Per sovrappeso/obesità: porzioni più piccole, meno carboidrati, più proteine e verdure.
`;
    })() : '';

    const healthContext = healthConstraints ? `
Vincoli medici:
- Rischio glicemico: ${healthConstraints.hasGlycemicRisk ? 'SÌ - evita zuccheri semplici, preferisci basso IG' : 'no'}
- Rischio colesterolo: ${healthConstraints.hasCholesterolRisk ? 'SÌ - limita grassi saturi' : 'no'}
- Ipertensione: ${healthConstraints.hasHypertension ? 'SÌ - RIDURRE SALE, insaccati, cibi conservati, formaggi stagionati. Aumentare potassio (banane, verdure a foglia, legumi)' : 'no'}
- Ipotensione: ${healthConstraints.hasHypotension ? 'SÌ - idratarsi bene, pasti piccoli e frequenti, un po\' di sale è consentito' : 'no'}
- Alimenti da ridurre: ${healthConstraints.foodsToReduce?.join(', ') || 'nessuno'}
- Alimenti da aumentare: ${healthConstraints.foodsToIncrease?.join(', ') || 'nessuno'}
` : '';

    const adaptationContext = dietAdaptation ? `
Adattamento settimanale in corso (basato sui check-in):
- Trend: ${dietAdaptation.weeklyTrend}
${dietAdaptation.reducePortions ? '- RIDURRE le porzioni (l\'utente vuole dimagrire ma il peso non scende)' : ''}
${dietAdaptation.lighterDinners ? '- Cene PIÙ LEGGERE (proteine + verdure, meno carboidrati)' : ''}
${dietAdaptation.moreProtein ? '- Aumentare le PROTEINE (energia bassa)' : ''}
${dietAdaptation.lessCarbsDinner ? '- MENO CARBOIDRATI a cena' : ''}
${dietAdaptation.moreVegetables ? '- PIÙ VERDURE in ogni pasto' : ''}
${dietAdaptation.moreHydration ? '- Aumentare IDRATAZIONE' : ''}
${dietAdaptation.summary ? `- Riepilogo: ${dietAdaptation.summary}` : ''}
IMPORTANTE: Adatta OGNI suggerimento a queste indicazioni settimanali.
` : '';

    let systemPrompt = `Sei una nutrizionista gentile e pratica per un'app italiana di benessere chiamata "Insieme".
Rispondi SEMPRE in italiano. Sii breve, concreta e rassicurante.
NON usare markdown complesso. Usa emoji con moderazione.
${profileContext}${healthContext}${adaptationContext}
IMPORTANTE: Rispetta SEMPRE le intolleranze, i vincoli medici e gli adattamenti settimanali dell'utente.`;

    let userPrompt = '';

    if (action === 'swap_ingredient') {
      systemPrompt += `\nDevi suggerire 3 alternative per un ingrediente specifico di un pasto.`;
      userPrompt = `Nel pasto "${meal.title}" (${meal.description}), l'utente non ha "${ingredient}".
Suggerisci esattamente 3 alternative pratiche e salutari, considerando il contesto del pasto.
Rispondi con un JSON array: [{"name": "...", "note": "breve nota"}]
Solo il JSON, nient'altro.`;
    } else if (action === 'regenerate_meal') {
      systemPrompt += `\nDevi generare un pasto alternativo completo.`;
      userPrompt = `L'utente vuole un'alternativa completa per questo pasto:
Tipo: ${meal.typeLabel} (${meal.type})
Attuale: "${meal.title}" - ${meal.description}

Genera UN pasto alternativo diverso ma equivalente nutrizionalmente.
Rispondi con un JSON: {"title": "...", "description": "...", "icon": "${meal.icon}"}
Solo il JSON, nient'altro.`;
    } else if (action === 'custom_request') {
      systemPrompt += `\nL'utente ha una richiesta specifica su un pasto. Rispondi con un pasto modificato.`;
      userPrompt = `Pasto attuale: "${meal.title}" - ${meal.description}
Richiesta dell'utente: "${request}"

Modifica il pasto secondo la richiesta. Rispondi con un JSON: {"title": "...", "description": "...", "icon": "${meal.icon}"}
Solo il JSON, nient'altro.`;
    } else if (action === 'not_available_ingredient') {
      systemPrompt += `\nL'utente non ha un ingrediente specifico e nemmeno le alternative proposte. Devi modificare il pasto mantenendo la ricetta originale, cambiando SOLO l'ingrediente mancante con uno da dispensa.`;
      userPrompt = `Pasto originale: "${meal.title}" - ${meal.description}
L'utente non ha "${ingredient}" e non ha nessuna delle alternative comuni.
IMPORTANTE: Mantieni la ricetta originale il più possibile. Cambia SOLO "${ingredient}" con un ingrediente molto comune da dispensa italiana (uova, tonno, legumi in scatola, pasta, riso, pane, olio, formaggio, verdure base...).
Il titolo deve restare simile (cambia solo se il nome del piatto contiene l'ingrediente sostituito).
La descrizione deve essere la ricetta originale con il nuovo ingrediente al posto di "${ingredient}".
Rispondi con un JSON: {"title": "...", "description": "...", "icon": "${meal.icon}", "swappedIngredient": "${ingredient}", "newIngredient": "nome del sostituto"}
Solo il JSON, nient'altro.`;
    } else if (action === 'not_available') {
      systemPrompt += `\nL'utente non ha gli ingredienti per questo pasto. Suggerisci un'alternativa con ingredienti comuni da dispensa.`;
      userPrompt = `L'utente non ha gli ingredienti per: "${meal.title}" - ${meal.description}
Tipo pasto: ${meal.typeLabel}

Suggerisci UN pasto alternativo usando solo ingredienti comuni da dispensa italiana (pasta, riso, uova, tonno, legumi in scatola, verdure base, pane, olio, formaggio...).
Rispondi con un JSON: {"title": "...", "description": "...", "icon": "${meal.icon}"}
Solo il JSON, nient'altro.`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Troppe richieste, riprova tra poco." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI esauriti." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Errore AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();
    // Also try to find raw JSON
    const rawMatch = jsonStr.match(/[\[{][\s\S]*[\]}]/);
    if (rawMatch) jsonStr = rawMatch[0];

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Risposta AI non valida", raw: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("meal-swap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
