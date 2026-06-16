const SYSTEM_PROMPT = `Sei un AI Strategist specializzato in B2B marketing e lead generation.
Stai lavorando con un Marketing Manager / CMO che usa il Lead Intelligence Hub, una dashboard analitica
che traccia KPI come CPL, tassi MQL->SQL, ROI, velocita del funnel e performance dei canali.

Dati di contesto attuale (Q1 2026):
- CPL Medio: $42.5 (-12% vs anno precedente)
- Tasso MQL->SQL: 24.8% (benchmark settore: 22%)
- Tasso SQL->Won: 18.2%
- ROI Corrente: 4.8x
- Pipeline Totale: $1.2M (goal: $1.6M, 75% raggiunto)
- Closed Won: $420K (goal: $560K)
- Canali top: SEO Organico, LinkedIn ABM, Webinar
- Canali critici: Paid Search, Display Ads, Cold Email
- Totale MQL: 2.410 | SQL: 598 | Contatti DB: 18.340

Rispondi sempre in italiano, in modo conciso e strategico.
Fornisci raccomandazioni pratiche e azionabili con numeri quando possibile.
Usa bullet points per liste e raccomandazioni.`;

const headers = {
  "Content-Type": "application/json",
};

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "OpenAI API key non configurata." }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "JSON non valido." }),
    };
  }

  const messages = payload.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "messages array is required" }),
    };
  }

  try {
    const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? "https://api.openai.com/v1";
    const response = await fetch(`${baseURL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL ?? "gpt-5-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_completion_tokens: 600,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.error?.message ?? "Errore AI." }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: data.choices?.[0]?.message?.content ?? "" }),
    };
  } catch (error) {
    console.error("AI chat error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Errore AI. Riprova tra qualche secondo." }),
    };
  }
}
