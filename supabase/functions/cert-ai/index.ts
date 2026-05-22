import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un asistente experto en redacción de certificados académicos y profesionales para instituciones paraguayas.

Tu tarea es generar el TEXTO COMPLETO y FORMAL de un certificado a partir de una descripción informal del usuario.

Reglas estrictas:
1. Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin bloques de código, sin markdown.
2. El JSON debe tener exactamente estas claves:
   - "courseDescription": texto formal de entre 25-45 palabras que narre el logro del participante, en tercera persona, en tono institucional. Nunca menciones el nombre del curso aquí.
   - "certType": tipo de certificado (ej: "participación", "aprovechamiento", "formación profesional", "asistencia", "honor al mérito", "excelencia académica")
   - "suggestedTitle": título completo sugerido para el curso/evento (elegante y formal)
   - "suggestedInstitution": nombre institucional formal si se puede inferir del prompt, si no devuelve ""
   - "suggestedDuration": duración estimada si se menciona, en formato "XX horas cátedra", si no ""
3. El texto debe sonar auténtico, usar vocabulario formal paraguayo/latinoamericano y ser apropiado para un documento oficial.
4. Usa variaciones de frases como: "Ha completado satisfactoriamente", "Ha participado activamente", "Ha demostrado competencia", "Ha cumplido los requisitos académicos", según el tipo.
5. NO inventes datos específicos como fechas, nombres o números de cédula.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "prompt requerido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "Límite de uso alcanzado. Intenta más tarde." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA agotados. Recarga en Lovable." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI gateway: ${res.status} ${txt}`);
    }

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    let parsed: any;
    try { parsed = JSON.parse(cleaned); }
    catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : null;
    }
    if (!parsed) throw new Error("Respuesta no es JSON válido");

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});