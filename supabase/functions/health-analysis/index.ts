import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { documentId, manualContent, docType } = await req.json();

    // Update status to analyzing
    await supabase.from("health_documents").update({ status: "analyzing" }).eq("id", documentId);

    // Get user profile for context
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();

    // Get file content if uploaded
    let fileContent = "";
    let fileMimeType = "image/jpeg";
    if (!manualContent) {
      const { data: doc } = await supabase.from("health_documents").select("file_path, file_name").eq("id", documentId).single();
      if (doc?.file_path) {
        const { data: fileData } = await supabase.storage.from("health-documents").download(doc.file_path);
        if (fileData) {
          const arrayBuffer = await fileData.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = "";
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          fileContent = btoa(binary);
          
          // Detect MIME type from file extension
          const fileName = (doc.file_name || doc.file_path || "").toLowerCase();
          if (fileName.endsWith(".pdf")) fileMimeType = "application/pdf";
          else if (fileName.endsWith(".png")) fileMimeType = "image/png";
          else if (fileName.endsWith(".webp")) fileMimeType = "image/webp";
          else if (fileName.endsWith(".heic")) fileMimeType = "image/heic";
        }
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const profileContext = profile ? `
Profilo utente:
- Nome: ${profile.name}
- Età: ${profile.age || "non specificata"}
- Sesso: ${profile.sex || "non specificato"}
- Peso: ${profile.weight || "non specificato"} kg
- Attività: ${profile.activity || "non specificata"}
- Tipo lavoro: ${profile.work_type || "non specificato"}
- Obiettivo: ${profile.objective || "non specificato"}
- Intolleranze: ${[...(profile.intolerances || []), ...(profile.custom_intolerances || [])].join(", ") || "nessuna"}
- Difficoltà: ${profile.difficulty || "non specificata"}
- Digiuno intermittente: ${profile.fasting_enabled ? `Sì (${profile.fasting_protocol}, ${profile.fasting_hours}h)` : "No"}
` : "";

    let systemPrompt = "";
    if (docType === "diet") {
      systemPrompt = `Sei un nutrizionista esperto italiano. Analizza la dieta fornita dal dietologo dell'utente.
${profileContext}

DEVI restituire un JSON con questa struttura:
{
  "summary": "Riepilogo della dieta analizzata",
  "meals": [
    {
      "name": "Nome pasto (es: Colazione)",
      "time": "Orario suggerito",
      "foods": ["lista cibi prescritti"],
      "calories_estimate": 400,
      "notes": "note nutrizionali"
    }
  ],
  "strengths": ["punti di forza della dieta"],
  "suggestions": ["suggerimenti per migliorare/integrare"],
  "warnings": ["avvisi su possibili carenze o incompatibilità con il profilo"],
  "fusion_tips": ["come adattare la dieta al profilo e obiettivi dell'utente"]
}`;
    } else {
      systemPrompt = `Sei un medico nutrizionista esperto italiano. Analizza i risultati delle analisi mediche dell'utente.
${profileContext}

IMPORTANTE: Non fare diagnosi definitive, ma segnala valori fuori norma e le loro implicazioni nutrizionali.
CRITICO: Sii MOLTO SPECIFICO nella lista "foods_to_reduce" - elenca i SINGOLI ALIMENTI concreti da evitare (es: "marmellata", "pane bianco", "miele", "succhi di frutta") non solo categorie generiche. Questo è fondamentale perché l'app usa questa lista per avvisare l'utente quando un pasto suggerito contiene cibi incompatibili.

DEVI restituire un JSON con questa struttura:
{
  "summary": "Riepilogo generale dello stato di salute basato sulle analisi",
  "values": [
    {
      "name": "Nome valore (es: Colesterolo LDL)",
      "value": "valore rilevato",
      "range": "range normale",
      "status": "normal|high|low|critical",
      "implications": "cosa significa per l'alimentazione"
    }
  ],
  "risk_factors": ["fattori di rischio identificati"],
  "dietary_recommendations": ["raccomandazioni alimentari specifiche"],
  "foods_to_increase": ["cibi SPECIFICI da aumentare con motivo (es: 'Salmone e pesce azzurro - omega 3 per ridurre trigliceridi')"],
  "foods_to_reduce": ["cibi SPECIFICI da ridurre con motivo (es: 'Marmellata e miele - zuccheri semplici che alzano la glicemia', 'Pane bianco - alto indice glicemico', 'Succhi di frutta - zuccheri concentrati')"],
  "prevention_tips": ["suggerimenti preventivi per patologie a rischio"],
  "meal_plan": [
    {
      "name": "Nome pasto",
      "time": "Orario",
      "foods": ["cibi consigliati"],
      "reason": "perché questi cibi in base alle analisi"
    }
  ]
}`;
    }

    const content = manualContent || "Analizza il documento allegato (contenuto codificato in base64).";

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content }
    ];

    // If we have file content, attach it with correct MIME type
    if (fileContent && !manualContent) {
      const inlineData = {
        type: "image_url" as const,
        image_url: { url: `data:${fileMimeType};base64,${fileContent}` }
      };
      messages[1] = {
        role: "user",
        content: [
          { type: "text", text: `Analizza questo documento ${docType === 'diet' ? 'di dieta' : 'di analisi mediche'}:` },
          inlineData
        ]
      };
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        await supabase.from("health_documents").update({ status: "error", ai_analysis: { error: "Troppe richieste, riprova tra poco" } }).eq("id", documentId);
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        await supabase.from("health_documents").update({ status: "error", ai_analysis: { error: "Crediti AI esauriti" } }).eq("id", documentId);
        return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: responseText };
    } catch {
      analysis = { raw: responseText };
    }

    // Update document with analysis
    const updateData: any = { status: "completed", ai_analysis: analysis };
    if (docType === "medical_tests" && analysis.meal_plan) {
      updateData.ai_meal_plan = analysis.meal_plan;
    }
    if (docType === "diet" && analysis.meals) {
      updateData.ai_meal_plan = analysis.meals;
    }

    await supabase.from("health_documents").update(updateData).eq("id", documentId);

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("health-analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
