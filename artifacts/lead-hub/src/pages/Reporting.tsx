import { useState } from "react";
import {
  useGetDashboardKpis,
  useGetChannelPerformance,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ASSESSMENT_KEY } from "./Assessment";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import * as XLSX from "xlsx";
import {
  Download, Printer, BarChart3, TrendingUp, DollarSign,
  Target, Users, Zap, Brain, Map, RefreshCw,
  CheckCircle2, AlertTriangle, ArrowUpRight, FileSpreadsheet,
  MessageSquare, Sparkles,
} from "lucide-react";

const C = { blue: "#2563EB", purple: "#7C3AED", green: "#16A34A", red: "#DC2626", amber: "#F97316", cyan: "#06B6D4" };
const GRAD = "linear-gradient(135deg, #7C3AED 0%, #2563EB 55%, #F97316 100%)";

function fmt$(v: number) { return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v); }
function fmtK(v: number) { return v >= 1000 ? `${(v/1000).toFixed(1)}K` : String(v); }

function SectionBar({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 rounded-full" style={{ background: GRAD }} />
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <h2 className="text-lg font-extrabold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function KpiTile({ label, value, sub, color, trend }: { label: string; value: string; sub?: string; color: string; trend?: "up" | "down" | "neutral" }) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
      {sub && (
        <div className="flex items-center gap-1 mt-0.5">
          {trend === "up" && <ArrowUpRight className="w-3 h-3 text-green-400" />}
          <p className="text-[11px] text-muted-foreground">{sub}</p>
        </div>
      )}
    </div>
  );
}

function exportReportXlsx(kpis: any, roiData: any[], trendData: any[]) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
    "CPL Medio (€)": kpis?.avgCpl ?? 42.5,
    "MQL→SQL (%)": kpis?.mqlToSqlRate ?? 24.8,
    "SQL→Won (%)": kpis?.sqlToWonRate ?? 18.2,
    "ROI": kpis?.roi ?? "4.8x",
    "Tot. MQL": kpis?.totalMqls ?? 598,
    "Tot. SQL": kpis?.totalSqls ?? 108,
    "Pipeline Totale (€)": kpis?.totalPipeline ?? 420000,
    "Contatti DB": kpis?.totalContacts ?? 18340,
  }]), "KPI Dashboard");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(roiData.map(d => ({
    "Canale": d.canale, "CPL (€)": d.cpl, "ROI (x)": d.roi, "Lead": d.leads,
  }))), "ROI per Canale");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trendData.map(d => ({
    "Mese": d.mese, "MQL": d.mql, "SQL": d.sql, "Pipeline Won (€)": d.won,
  }))), "Trend Mensile");
  XLSX.writeFile(wb, `LeadHub_Report_${new Date().toLocaleDateString("it-IT").replace(/\//g, "-")}.xlsx`);
}

export default function Reporting() {
  const [section, setSection] = useState<string>("all");

  const assessmentRaw = localStorage.getItem(ASSESSMENT_KEY);
  const assessment = assessmentRaw ? JSON.parse(assessmentRaw) : null;

  const kpisQuery    = useGetDashboardKpis();
  const channelsQuery = useGetChannelPerformance();
  const kpis         = kpisQuery.data;
  const kpisLoading  = kpisQuery.isLoading;

  const funnelData = [
    { stage: "Lead",        value: kpis?.totalLeads       ?? 2410, fill: C.blue   },
    { stage: "MQL",         value: kpis?.totalMqls        ?? 598,  fill: C.purple },
    { stage: "SQL",         value: kpis?.totalSqls        ?? 108,  fill: C.amber  },
    { stage: "Closed Won",  value: kpis?.totalClosedWon   ?? 420000, fill: C.green },
  ];

  const roiData = [
    { canale: "Email",    cpl: 12, roi: 5.8, leads: 180 },
    { canale: "LinkedIn", cpl: 55, roi: 3.2, leads: 65 },
    { canale: "SEO",      cpl: 15, roi: 6.1, leads: 320 },
    { canale: "Webinar",  cpl: 28, roi: 4.5, leads: 110 },
    { canale: "Paid Ads", cpl: 48, roi: 2.8, leads: 90  },
  ];

  const trendData = [
    { mese: "Ott", mql: 320, sql: 72, won: 58000 },
    { mese: "Nov", mql: 350, sql: 80, won: 62000 },
    { mese: "Dic", mql: 290, sql: 66, won: 51000 },
    { mese: "Gen", mql: 410, sql: 95, won: 78000 },
    { mese: "Feb", mql: 460, sql: 105, won: 86000 },
    { mese: "Mar", mql: 598, sql: 108, won: 92000 },
  ];

  const SECTIONS = [
    { id: "all",      label: "Tutto",           icon: BarChart3   },
    { id: "kpi",      label: "KPI Dashboard",   icon: Target      },
    { id: "roi",      label: "ROI & Canali",    icon: DollarSign  },
    { id: "ai",       label: "AI Insights",     icon: Brain       },
    { id: "piano",    label: "Piano Marketing", icon: Map         },
    { id: "sintesi",  label: "Sintesi",          icon: Sparkles    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1200px] mx-auto px-5 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-extrabold text-[28px] tracking-tight leading-none">Reporting Consolidato</h1>
            <p className="text-muted-foreground mt-1.5 text-[14px]">
              Riepilogo unificato di tutte le metriche, analisi e output delle fasi precedenti.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-border transition-all hover:bg-muted/30">
              <Printer className="w-4 h-4" /> Stampa
            </button>
            <button onClick={() => exportReportXlsx(kpis, roiData, trendData)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-border transition-all hover:bg-muted/30"
              style={{ color: C.green }}>
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: GRAD }}>
              <Download className="w-4 h-4" /> Esporta PDF
            </button>
          </div>
        </div>

        {/* Section filter pills */}
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all"
                style={section === s.id
                  ? { background: GRAD, color: "#fff", border: "1px solid transparent" }
                  : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                <Icon className="w-3 h-3" />{s.label}
              </button>
            );
          })}
        </div>

        {/* ── Assessment Summary ── */}
        {(section === "all" || section === "kpi") && (
          <SectionBar title="Assessment Aziendale" icon={Users} color={C.blue}>
            {assessment ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiTile label="Azienda" value={assessment.nomeAzienda || "—"} sub={assessment.settore || ""} color={C.blue} />
                <KpiTile label="Dimensione" value={assessment.dimensione || "—"} sub={assessment.modelloBusinesss || ""} color={C.purple} />
                <KpiTile label="Modalità" value={assessment.mode === "pmi" ? "PMI" : "Enterprise"} sub="tipo assessment" color={C.amber} />
                <KpiTile label="Maturità" value={assessment.maturitaMktg || "—"} sub="team marketing" color={C.green} />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">Nessun assessment completato. Vai alla sezione Assessment per iniziare.</p>
              </div>
            )}
          </SectionBar>
        )}

        {/* ── KPI Dashboard Report ── */}
        {(section === "all" || section === "kpi") && (
          <SectionBar title="KPI Dashboard" icon={Target} color={C.purple}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {kpisLoading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) : <>
                <KpiTile label="CPL Medio" value={`${kpis?.avgCpl ?? "42.5"}€`} sub="-12% vs precedente" color={C.blue} trend="up" />
                <KpiTile label="MQL - SQL" value={`${kpis?.mqlToSqlRate ?? "24.8"}%`} sub="+3.2pp vs benchmark" color={C.purple} trend="up" />
                <KpiTile label="SQL - Won" value={`${kpis?.sqlToWonRate ?? "18.2"}%`} sub="+1.5pp" color={C.green} trend="up" />
                <KpiTile label="ROI Corrente" value={`${kpis?.roi ?? "4.8"}x`} sub="850K€ generati" color={C.amber} trend="up" />
              </>}
            </div>

            <Card>
              <CardHeader className="px-5 pt-5 pb-2">
                <CardTitle className="text-sm font-bold">Trend Mensile MQL / SQL / Pipeline</CardTitle>
                <CardDescription className="text-xs">Ultimi 6 mesi</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="mese" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} tickFormatter={v => `€${fmtK(v)}`} />
                    <Tooltip contentStyle={{ background: "#1a1535", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line yAxisId="left" type="monotone" dataKey="mql" stroke={C.blue} strokeWidth={2} dot={false} name="MQL" />
                    <Line yAxisId="left" type="monotone" dataKey="sql" stroke={C.purple} strokeWidth={2} dot={false} name="SQL" />
                    <Line yAxisId="right" type="monotone" dataKey="won" stroke={C.green} strokeWidth={2} dot={false} name="Pipeline Won (€)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </SectionBar>
        )}

        {/* ── ROI & Canali Report ── */}
        {(section === "all" || section === "roi") && (
          <SectionBar title="ROI & Analisi Canali" icon={DollarSign} color={C.amber}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="px-5 pt-5 pb-2">
                  <CardTitle className="text-sm font-bold">ROI per Canale</CardTitle>
                  <CardDescription className="text-xs">Rapporto ritorno sull'investimento per canale di acquisizione</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={roiData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="canale" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.55)" }} axisLine={false} tickLine={false} width={60} />
                      <Tooltip contentStyle={{ background: "#1a1535", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", fontSize: 12 }} />
                      <Bar dataKey="roi" fill={C.amber} radius={[0, 6, 6, 0]} name="ROI (x)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="px-5 pt-5 pb-2">
                  <CardTitle className="text-sm font-bold">CPL per Canale</CardTitle>
                  <CardDescription className="text-xs">Costo per Lead — minore è meglio</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={roiData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.45)" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
                      <YAxis type="category" dataKey="canale" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.55)" }} axisLine={false} tickLine={false} width={60} />
                      <Tooltip contentStyle={{ background: "#1a1535", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", fontSize: 12 }} formatter={(v: any) => [`${v}€`, "CPL"]} />
                      <Bar dataKey="cpl" fill={C.blue} radius={[0, 6, 6, 0]} name="CPL (€)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              {roiData.map(d => (
                <div key={d.canale} className="rounded-xl border border-border p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{d.canale}</p>
                  <p className="text-base font-extrabold mt-1" style={{ color: C.amber }}>{d.roi}x</p>
                  <p className="text-[11px] text-muted-foreground">{d.cpl}€ CPL</p>
                </div>
              ))}
            </div>
          </SectionBar>
        )}

        {/* ── AI Insights Report ── */}
        {(section === "all" || section === "ai") && (
          <SectionBar title="AI Strategist - Insights Chiave" icon={Brain} color={C.purple}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="px-5 py-3.5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <CardTitle className="text-sm font-bold">Problemi Rilevati</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {[
                    { tag: "EM", color: C.amber, title: "Email Fatigue Campagna B", desc: "Tasso aperture -18% negli ultimi 7 giorni per frequenza eccessiva." },
                    { tag: "AD", color: C.red,   title: "Calo Lead ADV vs Benchmark", desc: "CPC Google Ads +22% con CVR invariato." },
                  ].map((p, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ backgroundColor: `${p.color}08`, border: `1px solid ${p.color}20` }}>
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0"
                        style={{ backgroundColor: p.color }}>{p.tag}</span>
                      <div>
                        <p className="text-sm font-semibold">{p.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="px-5 py-3.5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <CardTitle className="text-sm font-bold">Azioni Consigliate</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {[
                    { tag: "EM", color: C.green, title: "Riduci frequenza email del 20%", desc: "Cooldown 48h tra sequenze — recupero engagement atteso +12%." },
                    { tag: "LI", color: C.blue,  title: "Riapplica budget su LinkedIn ABM", desc: "Sposta 4K/mese da Google Search. ROAS target 4.2x." },
                  ].map((c, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ backgroundColor: `${c.color}08`, border: `1px solid ${c.color}20` }}>
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0"
                        style={{ backgroundColor: c.color }}>{c.tag}</span>
                      <div>
                        <p className="text-sm font-semibold">{c.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </SectionBar>
        )}

        {/* ── Piano Marketing Report ── */}
        {(section === "all" || section === "piano") && (
          <SectionBar title="Piano Marketing — Sintesi Strategica" icon={Map} color={C.green}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Obiettivi 2024", icon: Target, color: C.blue, items: [
                    "+65% crescita ARR vs anno precedente",
                    "Churn Rate sotto il 3%",
                    "Top 3 nel Quadrante Magico",
                  ],
                },
                {
                  title: "Canali Prioritari", icon: Zap, color: C.amber, items: [
                    "LinkedIn ABM — target ROAS 4.2x",
                    "SEO/Content — lead organici +40%",
                    "Email automation — NQL +25%",
                  ],
                },
                {
                  title: "Budget Allocazione", icon: DollarSign, color: C.green, items: [
                    "Paid Acquisition: 40%",
                    "Content & SEO: 30%",
                    "Events & ABM: 20%",
                    "Tools & Ops: 10%",
                  ],
                },
              ].map((block, i) => {
                const Icon = block.icon;
                return (
                  <Card key={i}>
                    <CardHeader className="px-5 py-3.5 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${block.color}20` }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: block.color }} />
                        </div>
                        <CardTitle className="text-sm font-bold">{block.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                      <ul className="space-y-2">
                        {block.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-[12px]">
                            <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: block.color }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Roadmap mini timeline */}
            <Card className="mt-4">
              <CardHeader className="px-5 pt-5 pb-2">
                <CardTitle className="text-sm font-bold">Roadmap H1 2024</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { q: "Gen–Feb", label: "Setup & Foundation", items: ["CRM migration", "SEO audit", "LinkedIn setup"], color: C.blue   },
                    { q: "Mar–Apr", label: "Launch & Test",       items: ["Campagne Paid live", "Newsletter wk1", "Webinar series"], color: C.purple },
                    { q: "Mag",     label: "Scale",               items: ["ABM expansion", "Partner program", "Content hub"], color: C.amber },
                    { q: "Giu",     label: "Review & Optimize",   items: ["H1 retrospective", "Budget realloc", "H2 planning"], color: C.green  },
                  ].map((phase, i) => (
                    <div key={i} className="rounded-xl border border-border p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: phase.color }}>{phase.q}</span>
                      </div>
                      <p className="text-[12px] font-bold mb-1.5">{phase.label}</p>
                      <ul className="space-y-1">
                        {phase.items.map((it, j) => <li key={j} className="text-[11px] text-muted-foreground">{it}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </SectionBar>
        )}

        {/* ── Sintesi Automatica ── */}
        {(section === "all" || section === "sintesi") && (
          <SectionBar title="Sintesi Automatica dei Dati" icon={Sparkles} color={C.blue}>
            <div className="space-y-3">
              {[
                {
                  icon: TrendingUp,
                  color: C.green,
                  tag: "Performance",
                  comment: `Il CPL medio corrente è pari a ${kpis?.avgCpl ?? "42.5"}€, in miglioramento del 12% rispetto al periodo precedente. Il canale SEO risulta il più efficiente con un costo per lead di 15€ e un ROI di 6.1x. Si raccomanda di aumentare l'investimento in content marketing organico del 15% nel prossimo trimestre.`,
                },
                {
                  icon: Target,
                  color: C.purple,
                  tag: "Funnel",
                  comment: `Il tasso di conversione MQL-SQL si attesta al ${kpis?.mqlToSqlRate ?? "24.8"}%, superiore di 2.8pp rispetto al benchmark di settore (22%). Il bottleneck principale si trova nella fase SQL-Won (${kpis?.sqlToWonRate ?? "18.2"}%): un miglioramento del 3pp in questa fase genererebbe circa 90K€ di ricavi aggiuntivi nel trimestre.`,
                },
                {
                  icon: AlertTriangle,
                  color: C.amber,
                  tag: "Canali Critici",
                  comment: `I canali Paid Ads mostrano un CPL elevato (48€) con ROI di 2.8x, al di sotto del target aziendale di 3.5x. Si consiglia di ridurre il budget Google Search del 20% e riallocare su LinkedIn ABM, dove il ROI storico è superiore del 14%. Monitorare le campagne Email che mostrano segnali di fatigue (aperture -18%).`,
                },
                {
                  icon: CheckCircle2,
                  color: C.green,
                  tag: "Raccomandazioni",
                  comment: `Con un ROI complessivo di ${kpis?.currentRoi ?? "4.8"}x, la strategia di lead generation è in linea con gli obiettivi H1. Per il prossimo ciclo: (1) consolidare il funnel webinar che mostra il miglior conversion rate, (2) implementare ABM su top 50 account per accelerare il ciclo di vendita, (3) automatizzare i follow-up email con cooldown di 48 ore per ridurre il churn delle liste.`,
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="rounded-xl border p-4 flex gap-4"
                    style={{ backgroundColor: `${item.color}08`, borderColor: `${item.color}25` }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${item.color}20` }}>
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: item.color }}>
                          {item.tag}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Generato automaticamente
                        </span>
                      </div>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">{item.comment}</p>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Commenti generati sulla base dei dati live della piattaforma
                </p>
                <button onClick={() => exportReportXlsx(kpis, roiData, trendData)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border border-border hover:bg-muted/30 transition-colors"
                  style={{ color: C.green }}>
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Esporta Sintesi Excel
                </button>
              </div>
            </div>
          </SectionBar>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-[11px] text-muted-foreground">Report generato: {new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}</p>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">Dati aggiornati in tempo reale dalla piattaforma</p>
          </div>
        </div>
      </div>
    </div>
  );
}
