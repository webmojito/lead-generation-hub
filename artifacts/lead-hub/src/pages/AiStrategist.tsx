import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send, RefreshCw, AlertTriangle, CheckCircle2, Sparkles,
  TrendingDown, TrendingUp, Globe, BookOpen, Clock, Tag, Filter,
  Mail, Megaphone, Linkedin, Bot, Shield, Target, Video,
  FileText, BarChart2, User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const C = { blue: "#2563EB", purple: "#7C3AED", green: "#16A34A", red: "#DC2626", amber: "#F97316" };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ─── tipi ─── */
interface ChatMessage { role: "user" | "assistant"; content: string; ts: Date; }

/* ─── problemi e opportunità statici ─── */
const PROBLEMI: { icon: LucideIcon; color: string; title: string; desc: string }[] = [
  { icon: Mail,      color: "#F97316", title: "Email Fatigue nella Campagna B", desc: "I tassi di apertura sono scesi del 18% negli ultimi 7 giorni a causa di un'eccessiva frequenza." },
  { icon: Megaphone, color: "#DC2626", title: "Calo Lead ADV vs Benchmark",     desc: "Il CPC di Google Ads è aumentato del 22% mentre il CVR è rimasto stazionario." },
];

const CORREZIONI: { icon: LucideIcon; color: string; title: string; desc: string }[] = [
  { icon: Mail,     color: "#16A34A", title: "Riduci la frequenza email del 20%",   desc: "Implementazione di un cooldown di 48 ore tra le sequenze per recuperare l'engagement." },
  { icon: Linkedin, color: "#2563EB", title: "Riapplica il budget su LinkedIn",      desc: "Sposta 4K/mese da Google Search a LinkedIn ABM; target ROAS 4.2x." },
];

const SUGGERIMENTI_RAPIDI = [
  "Analizza Email Fatigue",
  "Report ROI LinkedIn",
  "Sposta Budget Ads",
  "Ottimizza Funnel MQL",
  "Analisi Competitor",
];

/* ─── trend globali mock ─── */
const TREND_CATEGORIES = ["Tutti", "Lead Gen", "Automazione", "Paid Ads", "Trend"] as const;
const TREND_ARTICLES: { cat: string; flag: string; icon: LucideIcon; imgColor: string; title: string; desc: string; mins: number; type: string }[] = [
  { cat: "Automazione",  flag: "IN TREND",  icon: Bot,       imgColor: "#7C3AED", title: "Come l'AI sta rivoluzionando il B2B Cold Outreach nel 2024",   desc: "Un nuovo studio mostra che gli agenti AI personalizzati stanno superando gli SDR umani del 34% nei tassi di...", mins: 6,  type: "Strategico"  },
  { cat: "Lead Gen",     flag: "NUOVO",     icon: Shield,    imgColor: "#F97316", title: "La morte dei cookie di terze parti: cosa devono sapere i marketer", desc: "Le strategie di raccolta dati di prima parte non sono più opzionali. Scopri i migliori framework per la retent...", mins: 9,  type: "Psicologia"  },
  { cat: "Paid Ads",     flag: "",          icon: Linkedin,  imgColor: "#2563EB", title: "LinkedIn Thought Leadership Ads: guida completa 2025",          desc: "Come sfruttare al massimo i nuovi formati di annuncio per il target decision maker nel B2B SaaS...",           mins: 7,  type: "Strategico"  },
  { cat: "Trend",        flag: "IN TREND",  icon: Target,    imgColor: "#16A34A", title: "Account-Based Marketing: Misurare il ROI in modo definitivo",   desc: "Finalmente un framework comprovato per misurare il reale impatto dell'ABM sul fatturato aziendale...",          mins: 5,  type: "Analitico"   },
  { cat: "Automazione",  flag: "",          icon: RefreshCw, imgColor: "#7C3AED", title: "Marketing Automation: i 10 workflow che fanno la differenza",   desc: "Dal lead scoring all'onboarding: i processi che le aziende top usano per ridurre il tempo di conversione...",    mins: 8,  type: "Pratico"     },
  { cat: "Lead Gen",     flag: "NUOVO",     icon: Video,     imgColor: "#F97316", title: "Webinar come motore di lead gen: case study +300% MQL",         desc: "Come un'azienda SaaS ha trasformato i webinar nella loro principale fonte di lead qualificati in 6 mesi...",    mins: 4,  type: "Case Study"  },
];

const SELEZIONATI = [
  { title: "Combattere l'Email Fatigue: Una Guida", mins: 6, type: "Strategico" },
  { title: "Neuromarketing nel Copywriting",        mins: 7, type: "Psicologia" },
  { title: "Ottimizzare l'orario di Invio",         mins: 5, type: "Automazione" },
];

/* ─── formatta contenuto AI con markdown basilare ─── */
function FormatMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-[13px] leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**"))
          return <p key={i} className="font-bold">{line.slice(2, -2)}</p>;
        if (line.startsWith("- ") || line.startsWith("• "))
          return <p key={i} className="flex gap-2"><span style={{ color: C.blue }}>•</span><span>{line.slice(2)}</span></p>;
        if (line.trim() === "")
          return <div key={i} className="h-1" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

export default function AiStrategist() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ciao! Sono il tuo AI Strategist per la Lead Generation.\n\nSto analizzando i tuoi Dati Storici, Trend Mensili e Benchmark Interni per ottimizzare il tuo ROI. Elaborazione di 1.2 milioni di punti dati per il trimestre attuale.\n\nCome posso aiutarti oggi?",
      ts: new Date(),
    },
  ]);
  const [input, setInput]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [activeFilter, setFilter]   = useState<string>("Tutti");
  const [settore, setSettore]       = useState("SaaS B2B");
  const [paese, setPaese]           = useState("Italia");
  const bottomRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || isLoading) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: msg, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply ?? "Errore nella risposta.", ts: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Errore di connessione. Riprova tra qualche secondo.", ts: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = activeFilter === "Tutti"
    ? TREND_ARTICLES
    : TREND_ARTICLES.filter(a => a.cat === activeFilter);

  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-6">
      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-extrabold text-[28px] tracking-tight leading-none flex items-center gap-3">
              AI Strategist & Hub di Marketing Intelligence
            </h1>
            <p className="text-muted-foreground mt-1.5 text-[14px]">
              Motore strategico in tempo reale per lead generation ad alte prestazioni
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-border hover:border-primary/40 transition-colors">
              <FileText className="w-4 h-4" /> Esporta Piano (PDF)
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: C.green }}>
              <BarChart2 className="w-4 h-4" /> Scarica Template Excel
            </button>
          </div>
        </div>

        {/* Banner Analisi */}
        <div className="rounded-2xl p-4 flex items-center gap-4 border" style={{ backgroundColor: `${C.blue}12`, borderColor: `${C.blue}30` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${C.blue}25` }}>
            <Sparkles className="w-5 h-5" style={{ color: C.blue }} />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: C.blue }}>Analisi Strategica Contestuale</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              L'algoritmo sta analizzando{" "}
              <span className="font-bold text-foreground">Dati Storici, Trend Mensili e Benchmark Interni</span>{" "}
              per ottimizzare il tuo ROI. Elaborazione di 1.2 milioni di punti dati per il trimestre attuale.
            </p>
          </div>
        </div>

        {/* Problemi + Opportunità */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="px-5 py-3.5 border-b border-border flex-row items-center gap-2 space-y-0">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <CardTitle className="text-sm font-bold">Cosa non funziona e Perché</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {PROBLEMI.map((p, i) => (
                <div key={i} className="rounded-xl p-3.5 border" style={{ backgroundColor: `${C.red}08`, borderColor: `${C.red}25` }}>
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: p.color }}>
                      <p.icon className="w-3.5 h-3.5 text-white" />
                    </span>
                    {p.title}
                  </div>
                  <p className="text-[12px] text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-5 py-3.5 border-b border-border flex-row items-center gap-2 space-y-0">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <CardTitle className="text-sm font-bold">Correzioni Strategiche & Opportunità</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {CORREZIONI.map((c, i) => (
                <div key={i} className="rounded-xl p-3.5 border" style={{ backgroundColor: `${C.green}08`, borderColor: `${C.green}25` }}>
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: c.color }}>
                      <c.icon className="w-3.5 h-3.5 text-white" />
                    </span>
                    {c.title}
                  </div>
                  <p className="text-[12px] text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat AI */}
        <Card>
          <CardHeader className="px-5 py-3.5 border-b border-border flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${C.blue}20` }}>
                  <Bot className="w-5 h-5" style={{ color: C.blue }} />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-card" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">AI Strategist</CardTitle>
                <p className="text-[11px] text-green-400 font-medium">● Online · Analisi in tempo reale</p>
              </div>
            </div>
            <button onClick={() => setMessages(prev => prev.slice(0, 1))} className="text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </CardHeader>

          {/* messaggi */}
          <CardContent className="p-0">
            <div className="h-[300px] overflow-y-auto p-5 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2.5`}>
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${C.blue}20` }}>
                      <Bot className="w-4 h-4" style={{ color: C.blue }} />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${m.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                    style={m.role === "user"
                      ? { backgroundColor: C.blue, color: "#fff" }
                      : { backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {m.role === "assistant"
                      ? <FormatMessage text={m.content} />
                      : <p className="text-[13px] leading-relaxed">{m.content}</p>}
                    <p className="text-[10px] mt-2 opacity-50">{m.ts.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  {m.role === "user" && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-muted">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${C.blue}20` }}>
                    <Bot className="w-4 h-4" style={{ color: C.blue }} />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {[0, 1, 2].map(j => (
                      <div key={j} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: C.blue, animationDelay: `${j * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* suggerimenti */}
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {SUGGERIMENTI_RAPIDI.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold border border-border hover:border-primary/50 hover:text-primary transition-colors">
                  {s}
                </button>
              ))}
            </div>

            {/* input */}
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 focus-within:border-primary/60 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                <span className="text-muted-foreground text-lg">💬</span>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Chiedi alla tua AI Strategica..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-30"
                  style={{ backgroundColor: C.blue }}>
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Globali */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3 flex-row items-start justify-between space-y-0 flex-wrap gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="w-4 h-4" style={{ color: C.blue }} />
                Trend di Marketing Globali & Insight (via API) 🌐
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">Articoli e analisi selezionati in base ai tuoi KPI e al settore</CardDescription>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TREND_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={activeFilter === cat
                    ? { backgroundColor: C.blue, color: "#fff" }
                    : { backgroundColor: "rgba(255,255,255,0.07)", color: "var(--muted-foreground)" }}>
                  {cat}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {/* Filtri settore/paese */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="relative">
                <select value={settore} onChange={e => setSettore(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold bg-muted/40 border border-border focus:outline-none cursor-pointer">
                  {["SaaS B2B", "E-Commerce", "Finance", "Healthcare", "Tech"].map(s => <option key={s}>{s}</option>)}
                </select>
                <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select value={paese} onChange={e => setPaese(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold bg-muted/40 border border-border focus:outline-none cursor-pointer">
                  {["Italia", "Europa", "USA", "DACH", "UK"].map(p => <option key={p}>{p}</option>)}
                </select>
                <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Articoli */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredArticles.slice(0, 4).map((a, i) => (
                  <div key={i} className="rounded-xl border border-border/50 hover:border-primary/30 transition-colors cursor-pointer group overflow-hidden">
                    <div className="h-24 flex items-center justify-center rounded-t-xl"
                      style={{ background: `linear-gradient(135deg, ${a.imgColor}22, ${a.imgColor}08)` }}>
                      <span className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${a.imgColor}cc, ${a.imgColor}88)` }}>
                        <a.icon className="w-6 h-6 text-white" />
                      </span>
                    </div>
                    <div className="p-3">
                      {a.flag && (
                        <Badge className="text-[9px] font-bold mb-1.5 px-1.5 py-0.5"
                          style={a.flag === "IN TREND"
                            ? { backgroundColor: `${C.blue}20`, color: C.blue, border: `1px solid ${C.blue}40` }
                            : { backgroundColor: `${C.green}20`, color: C.green, border: `1px solid ${C.green}40` }}>
                          {a.flag}
                        </Badge>
                      )}
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.amber }}>{a.cat}</p>
                      <p className="text-xs font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{a.desc}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{a.mins} min · {a.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selezionati per te */}
              <div className="space-y-3">
                <div className="rounded-xl p-3.5 border" style={{ backgroundColor: `${C.purple}10`, borderColor: `${C.purple}25` }}>
                  <div className="flex items-center gap-2 text-xs font-bold mb-2" style={{ color: C.purple }}>
                    <Sparkles className="w-3.5 h-3.5" /> Selezionati per te
                  </div>
                  <p className="text-[11px] text-muted-foreground italic">
                    "In base al calo delle prestazioni in <span className="font-bold not-italic text-foreground">Email Marketing</span>, ti suggeriamo questi articoli:"
                  </p>
                </div>
                {SELEZIONATI.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/40 hover:border-primary/30 cursor-pointer transition-colors group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"
                      style={{ backgroundColor: `${C.blue}15` }}>
                      <BookOpen className="w-4 h-4" style={{ color: C.blue }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight group-hover:text-primary transition-colors">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{a.mins} min · {a.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
