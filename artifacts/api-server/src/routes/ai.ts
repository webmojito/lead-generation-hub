import { Router, type IRouter } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `Sei un AI Strategist specializzato in B2B marketing e lead generation. 
Stai lavorando con un Marketing Manager / CMO che usa il Lead Intelligence Hub — una dashboard analitica 
che traccia KPI come CPL (Costo Per Lead), tassi MQL→SQL, ROI, velocità del funnel e performance dei canali.

Dati di contesto attuale (Q1 2026):
- CPL Medio: $42.5 (↓12% vs anno precedente) 
- Tasso MQL→SQL: 24.8% (benchmark settore: 22%)
- Tasso SQL→Won: 18.2%
- ROI Corrente: 4.8x
- Pipeline Totale: $1.2M (goal: $1.6M, 75% raggiunto)
- Closed Won: $420K (goal: $560K)
- Canali top: SEO Organico, LinkedIn ABM, Webinar
- Canali critici: Paid Search (CPC alto), Display Ads (CVR bassa), Cold Email (fatigue)
- Totale MQL: 2.410 | SQL: 598 | Contatti DB: 18.340

Rispondi SEMPRE in italiano, in modo conciso e strategico. 
Fornisci raccomandazioni pratiche e azionabili con numeri quando possibile.
Usa bullet points per liste e raccomandazioni.
Se viene chiesto un'analisi, fornisci sia il problema che la soluzione raccomandata.`;

router.post("/ai/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_completion_tokens: 600,
      stream: false,
    });

    const reply = response.choices[0]?.message?.content ?? "";
    return res.json({ reply });
  } catch (err) {
    console.error("AI chat error:", err);
    return res.status(500).json({ error: "Errore AI. Riprova tra qualche secondo." });
  }
});

export default router;
