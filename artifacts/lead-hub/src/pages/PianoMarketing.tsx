import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Download, Pencil, ChevronRight, Check, X, AlertTriangle,
  Eye, Target, Globe, Zap, TrendingUp, Users, BarChart2,
  Calendar, DollarSign, Map, Award, Briefcase, Settings,
  FileSpreadsheet, FileText,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const C = { blue: "#2563EB", purple: "#7C3AED", green: "#16A34A", red: "#DC2626", amber: "#F97316", cyan: "#0EA5E9" };

/* ── Sidebar sections ── */
const SECTIONS = [
  { id: "riepilogo",  label: "Riepilogo Esecutivo",   icon: <Award className="w-4 h-4" /> },
  { id: "mercato",    label: "Contesto di Mercato",    icon: <Globe className="w-4 h-4" /> },
  { id: "swot",       label: "Analisi SWOT",           icon: <BarChart2 className="w-4 h-4" /> },
  { id: "personas",   label: "Buyer Personas",         icon: <Users className="w-4 h-4" /> },
  { id: "funnel",     label: "Obiettivi & Funnel",     icon: <TrendingUp className="w-4 h-4" /> },
  { id: "canali",     label: "Strategie di Canale",    icon: <Zap className="w-4 h-4" /> },
  { id: "budget",     label: "Automazione & Budget",   icon: <DollarSign className="w-4 h-4" /> },
  { id: "roadmap",    label: "Roadmap & Rischi",       icon: <Map className="w-4 h-4" /> },
  { id: "impatto",    label: "Impatto Aziendale",      icon: <Target className="w-4 h-4" /> },
];

const BUDGET_PIE = [
  { name: "Paid Acquisition", value: 40, color: C.blue },
  { name: "Content & SEO",    value: 30, color: C.purple },
  { name: "Events & ABM",     value: 20, color: C.amber },
  { name: "Tools & Ops",      value: 10, color: C.cyan },
];

function exportPianoExcel() {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
    { Sezione: "Visione", Contenuto: "Diventare il leader indiscusso nelle soluzioni SaaS per la gestione dei flussi di lavoro Enterprise entro il Q4 2025." },
    { Sezione: "Obiettivi Business", Contenuto: "+65% crescita ARR, Churn Rate < 3%, Top 3 Quadrante Magico" },
    { Sezione: "Mercato", Contenuto: "Opportunità EMEA stimata: 150M€" },
    { Sezione: "Budget Totale", Contenuto: "1.2M€ allocati per il 2026, ROI atteso 4.2x entro 18 mesi" },
    { Sezione: "Priorità", Contenuto: "Lead Gen alta qualità, ABM, ottimizzazione funnel" },
    { Sezione: "Impatto Atteso", Contenuto: "+25% quota di mercato, posizionamento Top 3" },
  ]), "Riepilogo Esecutivo");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
    { Canale: "Paid Ads", Badge: "B2B · Paid", Obiettivo: "Lead qualificati C-Level", Budget: "45K€/mese", CPCTarget: "2.50€", Azioni: "LinkedIn Document Ads, A/B test, Ottimizzazione funnel" },
    { Canale: "Content & SEO", Badge: "B2B · Content", Obiettivo: "Autorità mercato SaaS Enterprise", Budget: "20K€/mese", Download: "5K/mese", Azioni: "Case studies, SEO keyword intent, Video tutorial" },
    { Canale: "Account-Based Marketing", Badge: "B2B · ABM", Obiettivo: "Chiudere top 50 account", Budget: "35K€/mese", SQLTarget: "10/account", Azioni: "Outreach personalizzato, Intent data, Sequenze multi-canale" },
  ]), "Strategie di Canale");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
    { Fase: "Gen-Feb", Label: "Setup & Foundation", Azioni: "CRM migration, SEO audit, LinkedIn setup" },
    { Fase: "Mar-Apr", Label: "Launch & Test", Azioni: "Campagne Paid, Newsletter, Webinar series" },
    { Fase: "Mag", Label: "Scale", Azioni: "ABM expansion, Partner program, Content hub" },
    { Fase: "Giu", Label: "Review & Optimize", Azioni: "H1 retrospective, Budget realloc, H2 planning" },
    { Fase: "Lug-Set", Label: "H2 Growth", Azioni: "Espansione EMEA, Thought leadership, Enterprise deals" },
    { Fase: "Ott-Dic", Label: "Year-End Push", Azioni: "Upsell/cross-sell, Rinnovi, Q4 objectives review" },
  ]), "Roadmap");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
    { Voce: "Paid Acquisition", Percentuale: "40%", Importo: "480.000€" },
    { Voce: "Content & SEO", Percentuale: "30%", Importo: "360.000€" },
    { Voce: "Events & ABM", Percentuale: "20%", Importo: "240.000€" },
    { Voce: "Tools & Ops", Percentuale: "10%", Importo: "120.000€" },
    { Voce: "TOTALE", Percentuale: "100%", Importo: "1.200.000€" },
  ]), "Budget");
  XLSX.writeFile(wb, `PianoMarketing_${new Date().getFullYear()}.xlsx`);
}

function exportPianoWord() {
  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head><meta charset='utf-8'><title>Piano Marketing 2026</title>
    <style>
      body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin: 2cm; }
      h1 { font-size: 18pt; color: #7C3AED; }
      h2 { font-size: 14pt; color: #2563EB; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 20px; }
      h3 { font-size: 12pt; color: #333; }
      table { border-collapse: collapse; width: 100%; margin: 10px 0; }
      th { background: #7C3AED; color: white; padding: 6px 10px; text-align: left; font-size: 10pt; }
      td { border: 1px solid #ddd; padding: 6px 10px; font-size: 10pt; }
      .badge { background: #7C3AED22; color: #7C3AED; padding: 2px 8px; border-radius: 4px; font-size: 9pt; font-weight: bold; }
      .kpi { font-size: 14pt; font-weight: bold; color: #C13584; }
    </style></head><body>
    <h1>Piano Marketing Strategico 2026</h1>
    <p>Documentazione esecutiva per l'espansione nel mercato SaaS Enterprise.</p>
    <h2>Riepilogo Esecutivo</h2>
    <table><tr><th>Area</th><th>Dettaglio</th></tr>
    <tr><td>Visione</td><td>Leader indiscusso SaaS Enterprise entro Q4 2025</td></tr>
    <tr><td>Obiettivi Business</td><td>+65% ARR, Churn &lt;3%, Top 3 Quadrante Magico</td></tr>
    <tr><td>Budget Totale</td><td class='kpi'>1.200.000€</td></tr>
    <tr><td>ROI Atteso</td><td>4.2x entro 18 mesi</td></tr>
    <tr><td>Mercato Target</td><td>EMEA — valore stimato 150M€</td></tr>
    </table>
    <h2>Analisi SWOT</h2>
    <table><tr><th>Punti di Forza</th><th>Debolezze</th><th>Opportunità</th><th>Minacce</th></tr>
    <tr><td>Product-led growth consolidato</td><td>Brand awareness limitata EMEA</td><td>Espansione mercato Enterprise</td><td>Competitor con budget maggiori</td></tr>
    <tr><td>NPS elevato (72)</td><td>Ciclo di vendita lungo (45 gg)</td><td>AI integration demand +300%</td><td>Recessione economica potenziale</td></tr>
    </table>
    <h2>Strategie di Canale</h2>
    <table><tr><th>Canale</th><th>Obiettivo</th><th>Budget/mese</th><th>KPI Target</th></tr>
    <tr><td><span class='badge'>B2B · Paid</span> Paid Ads</td><td>Lead qualificati C-Level</td><td class='kpi'>45.000€</td><td>CPC 2.50€</td></tr>
    <tr><td><span class='badge'>B2B · Content</span> Content & SEO</td><td>Autorità SaaS Enterprise</td><td class='kpi'>20.000€</td><td>5K download/mese</td></tr>
    <tr><td><span class='badge'>B2B · ABM</span> Account-Based Marketing</td><td>Top 50 account target</td><td class='kpi'>35.000€</td><td>10 SQL/account</td></tr>
    </table>
    <h2>Roadmap H1-H2 2026</h2>
    <table><tr><th>Fase</th><th>Label</th><th>Azioni Principali</th></tr>
    <tr><td>Gen-Feb</td><td>Setup & Foundation</td><td>CRM migration, SEO audit, LinkedIn setup</td></tr>
    <tr><td>Mar-Apr</td><td>Launch & Test</td><td>Campagne Paid live, Newsletter, Webinar series</td></tr>
    <tr><td>Mag</td><td>Scale</td><td>ABM expansion, Partner program, Content hub</td></tr>
    <tr><td>Giu</td><td>Review & Optimize</td><td>H1 retrospective, Budget realloc, H2 planning</td></tr>
    </table>
    <p style='color:#888;font-size:9pt;margin-top:30px;border-top:1px solid #eee;padding-top:10px;'>
    Documento generato da Lead Hub - Growth Intelligence Platform · ${new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}
    </p>
    </body></html>`;
  const blob = new Blob(["\ufeff" + html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `PianoMarketing_${new Date().getFullYear()}.doc`;
  a.click(); URL.revokeObjectURL(url);
}

function SectionTitle({ title, id }: { emoji?: string; title: string; id: string }) {
  return (
    <div id={id} className="flex items-center gap-3 mb-4 pt-2 scroll-mt-20">
      <div className="w-1 h-6 rounded-full shrink-0" style={{ background: "linear-gradient(180deg, #7C3AED, #F97316)" }} />
      <h2 className="text-xl font-extrabold">{title}</h2>
    </div>
  );
}

export default function PianoMarketing() {
  const [active, setActive] = useState("riepilogo");
  const [editMode, setEditMode] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollTo = (id: string) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* track active section on scroll */
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1400px] mx-auto px-5 py-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-extrabold text-[28px] tracking-tight leading-none">
              Piano Marketing Strategico 2026
            </h1>
            <p className="text-muted-foreground mt-1.5 text-[14px]">
              Documentazione esecutiva per l'espansione nel mercato SaaS Enterprise.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { exportPianoExcel(); toast({ title: "Export Excel avviato", description: "File PianoMarketing.xlsx scaricato." }); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-border hover:bg-muted/50 transition-colors"
              style={{ color: C.green }}>
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button
              onClick={() => { exportPianoWord(); toast({ title: "Export Word avviato", description: "File PianoMarketing.doc scaricato." }); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-border hover:bg-muted/50 transition-colors"
              style={{ color: C.blue }}>
              <FileText className="w-4 h-4" /> Word
            </button>
            <button
              onClick={() => {
                toast({ title: "Esportazione PDF avviata", description: "Preparazione del PDF in corso…" });
                setTimeout(() => window.print(), 400);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-border hover:bg-muted/50 transition-colors">
              <Download className="w-4 h-4" /> PDF
            </button>
            <button
              onClick={() => {
                setEditMode(v => !v);
                toast({ title: editMode ? "Modalità lettura attivata" : "Modalità modifica attivata", description: editMode ? "Il piano è di sola lettura." : "Puoi ora modificare il piano." });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: editMode ? C.green : C.blue }}>
              <Pencil className="w-4 h-4" /> {editMode ? "Salva" : "Modifica"}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20 rounded-2xl border border-border bg-card p-3 space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2">
                Strategia 2026-2027
              </p>
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-medium transition-all"
                  style={active === s.id
                    ? { backgroundColor: `${C.blue}15`, color: C.blue, fontWeight: 700 }
                    : { color: "var(--muted-foreground)" }}>
                  <span style={active === s.id ? { color: C.blue } : { color: "var(--muted-foreground)" }}>{s.icon}</span>
                  {s.label}
                  {active === s.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </button>
              ))}
              <div className="mx-3 mt-3 pt-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5">Stato Approvazione</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[12px] font-semibold text-green-600">Board Ready</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main ref={mainRef} className="flex-1 min-w-0 space-y-10">

            {/* 1 — Riepilogo Esecutivo */}
            <div id="riepilogo">
              <SectionTitle emoji="📋" title="Riepilogo Esecutivo" id="riepilogo" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: <Eye className="w-5 h-5" />, color: C.blue,   title: "Visione",         body: "Diventare il leader indiscusso nelle soluzioni SaaS per la gestione dei flussi di lavoro Enterprise entro il Q4 2025." },
                  { icon: <Target className="w-5 h-5" />, color: C.green, title: "Obiettivi Business", body: "+65% di crescita ARR rispetto all'anno precedente a riduzione del Churn Rate al di sotto del 3%." },
                  { icon: <Globe className="w-5 h-5" />, color: C.amber,  title: "Mercato",         body: "Opportunità di espansione nel mercato EMEA con un valore potenziale stimato di 150M€." },
                  { icon: <Zap className="w-5 h-5" />, color: C.purple, title: "Priorità",         body: "Focus su Lead Generation di alta qualità, Account Based Marketing e ottimizzazione del funnel." },
                  { icon: <TrendingUp className="w-5 h-5" />, color: C.blue, title: "Impatto Atteso", body: "Incremento del 25% della quota di mercato e posizionamento come Top 3 nel Quadrante Magico." },
                  { icon: <DollarSign className="w-5 h-5" />, color: C.green, title: "Budget Totale", body: "1.2M€ allocati per il 2026, con un ROI atteso di 4.2x entro 18 mesi." },
                ].map((c, i) => (
                  <Card key={i} className="hover:border-primary/30 transition-colors cursor-default">
                    <CardContent className="p-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${c.color}15`, color: c.color }}>
                        {c.icon}
                      </div>
                      <h3 className="font-bold text-sm mb-1.5">{c.title}</h3>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">{c.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 2 — Contesto di Mercato */}
            <div id="mercato">
              <SectionTitle emoji="🏆" title="Contesto di Mercato & Competitor" id="mercato" />
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border" style={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                          {["Competitor", "Prezzo", "Feature Chiave", "Punto Debole", "Minaccia"].map(h => (
                            <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {[
                          { name: "CloudFlow Pro",  price: "High-End ($$)",   feature: "Integrazioni ERP",       weak: "UI Complessa",           threat: "ALTA",   tc: C.red    },
                          { name: "SaaSify Next",   price: "Freemium ($)",    feature: "Mobile First",           weak: "No Enterprise Security", threat: "MEDIA",  tc: C.amber  },
                          { name: "Nexus Systems",  price: "Mid-Range ($$)",  feature: "Customer Support 24/7",  weak: "Tecnologia Datata",      threat: "BASSA",  tc: C.green  },
                          { name: "Orbit Platform", price: "Enterprise ($$$)", feature: "AI Automation Suite",   weak: "Costi elevati",          threat: "MEDIA",  tc: C.amber  },
                        ].map((r, i) => (
                          <tr key={i} className="hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-3.5 font-semibold" style={{ color: C.blue }}>{r.name}</td>
                            <td className="px-5 py-3.5 text-muted-foreground">{r.price}</td>
                            <td className="px-5 py-3.5">{r.feature}</td>
                            <td className="px-5 py-3.5 text-muted-foreground">{r.weak}</td>
                            <td className="px-5 py-3.5">
                              <Badge className="text-[10px] font-bold px-2" style={{ backgroundColor: `${r.tc}18`, color: r.tc, border: `1px solid ${r.tc}35` }}>
                                {r.threat}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3 — SWOT */}
            <div id="swot">
              <SectionTitle emoji="✖️" title="Analisi SWOT Strategica" id="swot" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "PUNTI DI FORZA",  color: C.green,  bg: "#16A34A", icon: <TrendingUp className="w-4 h-4" />, prefix: "✓",
                    items: ["UX/UI proprietaria pluripremiata", "Bassi costi di acquisizione (CAC)", "Forte team di Customer Success", "Integrazioni native con 50+ tool"] },
                  { label: "PUNTI DI DEBOLEZZA", color: C.red, bg: "#DC2626", icon: <AlertTriangle className="w-4 h-4" />, prefix: "✗",
                    items: ["Poca notorietà nel mercato EMEA", "Stack tecnologico da scalare", "Processo di sales cycle lungo", "Documentazione tecnica da migliorare"] },
                  { label: "OPPORTUNITÀ",    color: C.blue,   bg: "#E8006A", icon: <Zap className="w-4 h-4" />,          prefix: "◆",
                    items: ["Crescente domanda di AI automation", "Partnership con system integrator", "Eventi di settore post-pandemia", "Espansione mercato mid-market"] },
                  { label: "MINACCE",        color: C.amber,  bg: "#F97316", icon: <AlertTriangle className="w-4 h-4" />, prefix: "!",
                    items: ["Consolidamento dei competitor", "Instabilità economica globale", "Cambiamenti nelle policy privacy", "Nuovi entranti VC-backed"] },
                ].map((q, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-1 w-full" style={{ backgroundColor: q.color }} />
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3" style={{ color: q.color }}>
                        {q.icon}
                        <span className="text-[11px] font-extrabold uppercase tracking-widest">{q.label}</span>
                      </div>
                      <ul className="space-y-2">
                        {q.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-[13px]">
                            <span className="font-bold mt-0.5 shrink-0" style={{ color: q.color }}>{q.prefix}</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 4 — Buyer Personas */}
            <div id="personas">
              <SectionTitle emoji="👥" title="Target Market & Buyer Personas" id="personas" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "Marco, CTO", role: "DECISION MAKER", roleColor: C.blue, avatar: "👨‍💻",
                    obiettivi: "Sicurezza dati, scalabilità infra, automazione processi IT.",
                    painPoints: "Shadow IT, sistemi legacy lenti, mancanza di analytics reali." },
                  { name: "Giulia, IT Manager", role: "TECHNICAL EVALUATOR", roleColor: C.green, avatar: "👩‍💼",
                    obiettivi: "Riduzione ticket supporto, facilità di implementazione.",
                    painPoints: "Training utenti difficile, bug frequenti, setup complesso." },
                  { name: "Luca, CFO", role: "FINANCIAL APPROVER", roleColor: C.amber, avatar: "👨‍💼",
                    obiettivi: "ROI chiaro, ottimizzazione budget, costi prevedibili.",
                    painPoints: "Costi nascosti, contratti poco flessibili, basse ROI." },
                ].map((p, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-1" style={{ backgroundColor: p.roleColor }} />
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${p.roleColor}15` }}>{p.avatar}</div>
                        <div>
                          <p className="font-bold text-sm">{p.name}</p>
                          <Badge className="text-[9px] font-bold px-1.5 mt-0.5"
                            style={{ backgroundColor: `${p.roleColor}15`, color: p.roleColor, border: `1px solid ${p.roleColor}30` }}>
                            {p.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Obiettivi</p>
                          <p className="text-[12px] leading-relaxed">{p.obiettivi}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Pain Points</p>
                          <p className="text-[12px] text-muted-foreground leading-relaxed">{p.painPoints}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 5 — Funnel */}
            <div id="funnel">
              <SectionTitle emoji="🔻" title="Obiettivi & Funnel Semplificato" id="funnel" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card>
                  <CardContent className="p-5 space-y-3">
                    {[
                      { label: "TOFU: Awareness",   sub: "250k visite/mese", val: 75, color: C.blue },
                      { label: "MOFU: Engagement",  sub: "15k lead/mese",    val: 55, color: C.purple },
                      { label: "BOFU: Conversion",  sub: "1.2k opp/mese",    val: 35, color: C.amber },
                    ].map((f, i) => (
                      <div key={i} className="rounded-xl p-4" style={{ backgroundColor: `${f.color}10`, border: `1px solid ${f.color}25` }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold" style={{ color: f.color }}>{f.label}</span>
                          <span className="text-xs text-muted-foreground font-medium">{f.sub}</span>
                        </div>
                        <Progress value={f.val} className="h-2" style={{ "--progress-color": f.color } as any} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5 space-y-4">
                    {[
                      { label: "LEAD GENERATION TARGET",  val: 78, color: C.blue },
                      { label: "BRAND AWARENESS INDEX",   val: 62, color: C.green },
                      { label: "PIPELINE COVERAGE RATIO", val: 85, color: C.amber },
                      { label: "SALES QUALIFIED LEADS",   val: 54, color: C.purple },
                    ].map((m, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-bold uppercase tracking-wider text-muted-foreground">{m.label}</span>
                          <span className="font-extrabold" style={{ color: m.color }}>{m.val}%</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ backgroundColor: `${m.color}20` }}>
                          <div className="h-2 rounded-full transition-all" style={{ width: `${m.val}%`, backgroundColor: m.color }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 6 — Strategie di canale */}
            <div id="canali">
              <SectionTitle title="Top 3 Channel Strategy" id="canali" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    badge: "B2B · Paid",
                    accent: C.blue,
                    title: "Paid Ads — SEA & Social",
                    obiettivo: "Generare lead qualificati su target C-Level con campagne LinkedIn e Google high-intent.",
                    azioni: ["LinkedIn Document Ads + lead magnet premium", "Segmentazione per ruolo, settore e dimensione", "A/B test su 6 copy e 3 creatività differenti", "Ottimizzazione continua targeting e funnel"],
                    risultati: [{ v: "45K€", l: "Budget mensile" }, { v: "$2.50", l: "CPC Target" }],
                  },
                  {
                    badge: "B2B · Content",
                    accent: C.purple,
                    title: "Content & SEO",
                    obiettivo: "Costruire autorità nel mercato SaaS Enterprise con contenuti ad alto valore educativo.",
                    azioni: ["Case studies mensili + whitepapers verticali", "Ottimizzazione SEO per keyword intent commerciale", "Video tutorial tecnici per engagement qualificato", "Distribuzione su LinkedIn, newsletter e blog"],
                    risultati: [{ v: "20K€", l: "Budget mensile" }, { v: "5K", l: "Download/mese" }],
                  },
                  {
                    badge: "B2B · ABM",
                    accent: C.amber,
                    title: "Account-Based Marketing",
                    obiettivo: "Chiudere i top 50 account target con un approccio 1:1 iperpersonalizzato multi-touch.",
                    azioni: ["Identificazione e qualificazione top 50 accounts", "Campagne outreach personalizzate per account", "Intent data monitoring con 6sense e G2", "Sequenze multi-canale: email + LinkedIn + calls"],
                    risultati: [{ v: "35K€", l: "Budget mensile" }, { v: "10 SQL", l: "per Account" }],
                  },
                ].map((c, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-border/50 card-hover"
                    style={{ backgroundColor: "hsl(var(--card))" }}>
                    <div className="h-1" style={{ background: `linear-gradient(90deg, #833AB4, #C13584, #F77737)` }} />
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <Badge className="text-[9px] font-bold px-2 py-0.5" style={{ backgroundColor: `${c.accent}18`, color: c.accent, border: `1px solid ${c.accent}35` }}>
                          {c.badge}
                        </Badge>
                      </div>
                      <h3 className="font-extrabold text-base leading-tight">{c.title}</h3>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Obiettivo</p>
                        <p className="text-[12px] text-muted-foreground italic leading-relaxed">{c.obiettivo}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Intervento</p>
                        <div className="space-y-1.5">
                          {c.azioni.map((a, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5"
                                style={{ background: "linear-gradient(135deg, #C13584, #F77737)" }}>
                                {j + 1}
                              </span>
                              <p className="text-[11px] text-muted-foreground leading-tight">{a}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Risultati Attesi</p>
                        <div className="flex gap-3">
                          {c.risultati.map((r, j) => (
                            <div key={j} className="rounded-lg px-3 py-2 flex-1 text-center" style={{ backgroundColor: "#C1358415" }}>
                              <p className="text-lg font-extrabold" style={{ color: "#C13584" }}>{r.v}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{r.l}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7 — Budget & Automazione */}
            <div id="budget">
              <SectionTitle emoji="💰" title="Budget Allocation & Automazione" id="budget" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card>
                  <CardContent className="p-5 flex items-center gap-6">
                    <div className="w-[160px] h-[160px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={BUDGET_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                            dataKey="value" stroke="none" isAnimationActive={false}>
                            {BUDGET_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip formatter={(v: any) => `${v}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2.5 flex-1">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Budget Totale: <span className="text-foreground font-extrabold text-sm">1.2M€</span></p>
                      {BUDGET_PIE.map((e, i) => (
                        <div key={i} className="flex items-center gap-2 text-[13px]">
                          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: e.color }} />
                          <span className="text-muted-foreground flex-1">{e.name}</span>
                          <span className="font-bold" style={{ color: e.color }}>{e.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5 space-y-3">
                    <p className="text-sm font-bold mb-3">Stack di Automazione</p>
                    {[
                      { tool: "HubSpot CRM",         use: "Lead nurturing & pipeline", status: "Attivo",     sc: C.green  },
                      { tool: "LinkedIn Campaign",     use: "ABM targeting & outreach",  status: "Attivo",     sc: C.green  },
                      { tool: "Marketo Engage",       use: "Email sequences automation", status: "In Setup",   sc: C.amber  },
                      { tool: "Semrush",              use: "SEO & keyword intelligence", status: "Attivo",     sc: C.green  },
                      { tool: "6sense ABM",           use: "Intent data & account IQ",   status: "Pianificato", sc: C.blue  },
                    ].map((t, i) => (
                      <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border/40 last:border-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.sc }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold">{t.tool}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{t.use}</p>
                        </div>
                        <Badge className="text-[10px] shrink-0" style={{ backgroundColor: `${t.sc}15`, color: t.sc, border: `1px solid ${t.sc}30` }}>
                          {t.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 8 — Roadmap */}
            <div id="roadmap">
              <SectionTitle emoji="🗺️" title="Roadmap H1 & Gestione Rischi" id="roadmap" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card>
                  <CardContent className="p-5 space-y-3">
                    {[
                      { q: "Q1 – Setup & Launch",   color: C.blue,   items: ["Auditing SEO, New Brand Identity", "Launch LinkedIn Ads Campaign", "HubSpot onboarding completato"] },
                      { q: "Q2 – Expansion",         color: C.green,  items: ["Market entry France/Germany", "Regional Webinars (3 eventi)", "Product Feature Rollout v2.1"] },
                      { q: "Q3 – Optimization",      color: C.amber,  items: ["ABM full rollout top 50 accounts", "Lancio Referral Program", "AI-powered lead scoring live"] },
                      { q: "Q4 – Scale & Review",    color: C.purple, items: ["Annual review & FY2025 planning", "Partnership network launch", "Espansione team Sales +5 FTE"] },
                    ].map((r, i) => (
                      <div key={i} className="rounded-xl p-3.5 border" style={{ borderColor: `${r.color}30`, backgroundColor: `${r.color}07` }}>
                        <p className="font-bold text-sm mb-2" style={{ color: r.color }}>{r.q}</p>
                        <ul className="space-y-1">
                          {r.items.map((item, j) => (
                            <li key={j} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                              <ChevronRight className="w-3 h-3 shrink-0" style={{ color: r.color }} /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5 space-y-3">
                    <p className="text-sm font-bold mb-3">Registro Rischi</p>
                    {[
                      { risk: "Budget ridotto da board",      prob: "Media",  impact: "Alto",  action: "Prioritizzare canali ad alto ROI"           },
                      { risk: "Turnover team marketing",      prob: "Bassa",  impact: "Alto",  action: "Documentazione processi + piano successione" },
                      { risk: "Algoritmo LinkedIn cambia",    prob: "Alta",   impact: "Medio", action: "Diversificare mix canali Q2"                 },
                      { risk: "Concorrente nuovo lancio",     prob: "Media",  impact: "Alto",  action: "Accelerare differenziazione prodotto"        },
                    ].map((r, i) => (
                      <div key={i} className="py-2.5 border-b border-border/40 last:border-0">
                        <p className="text-[13px] font-semibold mb-1">{r.risk}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="text-[10px]" style={{ backgroundColor: `${C.amber}15`, color: C.amber, border: `1px solid ${C.amber}30` }}>
                            Prob: {r.prob}
                          </Badge>
                          <Badge className="text-[10px]" style={{ backgroundColor: `${C.red}15`, color: C.red, border: `1px solid ${C.red}30` }}>
                            Impatto: {r.impact}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">{r.action}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 9 — Impatto */}
            <div id="impatto">
              <SectionTitle emoji="📊" title="Impatto Aziendale Atteso (Annuale)" id="impatto" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                {[
                  { label: "ARR TARGET",      val: "€8.5M",    sub: "+42% YoY Growth", color: C.blue   },
                  { label: "CAC ATTESO",       val: "€1.250",   sub: "-15% Ottimizzato", color: C.purple },
                  { label: "LTV STIMATO",      val: "€12.8k",   sub: "10.2x LTV/CAC Ratio", color: C.amber },
                  { label: "MARKET SHARE",     val: "14.5%",    sub: "Top 3 Quadrante",  color: C.green  },
                ].map((k, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-1" style={{ backgroundColor: k.color }} />
                    <CardContent className="p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{k.label}</p>
                      <p className="text-2xl font-extrabold" style={{ color: k.color }}>{k.val}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{k.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm font-bold mb-4">Metriche di Successo per Funzione</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { fn: "Marketing", icon: "📢", kpis: ["MQL/mese: 1.200", "CPL target: <$40", "Content: 20 pz/mese", "Email open rate: >32%"] },
                      { fn: "Sales",     icon: "💼", kpis: ["SQLs/mese: 300", "Win rate: >25%", "Cycle time: <45 gg", "ACVtarget: €15k"] },
                      { fn: "Product",   icon: "⚙️", kpis: ["NPS: >65", "Churn: <3%", "Feature adoption: >60%", "Onboarding: <7 gg"] },
                    ].map((f, i) => (
                      <div key={i} className="rounded-xl p-4" style={{ backgroundColor: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{f.icon}</span>
                          <span className="font-bold text-sm">{f.fn}</span>
                        </div>
                        <ul className="space-y-1.5">
                          {f.kpis.map((k, j) => (
                            <li key={j} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                              <Check className="w-3 h-3 text-green-500 shrink-0" /> {k}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
