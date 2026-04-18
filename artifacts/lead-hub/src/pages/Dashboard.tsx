import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetDashboardKpis,
  useGetFunnelVelocity,
  useGetChannelPerformance,
  useGetTopChannels,
} from "@workspace/api-client-react";
import { CSVLink } from "react-csv";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  RefreshCw, ChevronDown, Sun, Moon, Printer, Download,
  ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown,
  Activity, ArrowUpRight, ArrowDownRight, Flame, AlertTriangle,
  Clock, Users, X, ChevronsUpDown, ChevronUp,
  Target, BarChart2, Zap, Info,
  Mail, Linkedin, Search, Megaphone, FileText, Video, Globe, Phone, PhoneCall, CalendarDays,
} from "lucide-react";

/* ─── costanti colori ─── */
const C = {
  blue:   "#2563EB",
  purple: "#7C3AED",
  green:  "#16A34A",
  red:    "#DC2626",
  amber:  "#F97316",
  pink:   "#E8006A",
};

const PERIODI = ["7G", "30G", "T1", "YTD"] as const;
type Periodo = (typeof PERIODI)[number];

const AUTO_REFRESH_OPTIONS = [
  { label: "Ogni 5 minuti",  ms: 5  * 60 * 1000 },
  { label: "Ogni 15 minuti", ms: 15 * 60 * 1000 },
  { label: "Ogni 1 ora",     ms: 60 * 60 * 1000 },
];

/* ─── helpers formato ─── */
function fmt$  (v: number) { return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v); }
function fmtK  (v: number) { return new Intl.NumberFormat("it-IT", { notation: "compact", maximumFractionDigits: 1 }).format(v); }
function fmtPct(v: number) { return `${v.toFixed(1)}%`; }
function fmtN  (v: number) { return v.toLocaleString("it-IT"); }

/* ─── tooltip personalizzato ─── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-[13px] shadow-lg">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mt-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: e.color }} />
          <span className="text-muted-foreground">{e.name}</span>
          <span className="ml-auto font-bold text-foreground">{fmtN(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] mt-2">
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
          <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: e.color }} />
          {e.value}
        </div>
      ))}
    </div>
  );
}

/* ─── badge trend ─── */
function TrendBadge({ val, inverse = false }: { val: number; inverse?: boolean }) {
  const up = val >= 0;
  const positive = inverse ? !up : up;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${positive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
      {up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {Math.abs(val)}%
    </span>
  );
}

/* ─── icone canali ─── */
function channelIcon(name: string) {
  const n = (name ?? "").toLowerCase();
  if (n.includes("email") || n.includes("newsletter"))                      return <Mail      className="w-4 h-4" style={{ color: "#2563EB" }} />;
  if (n.includes("linkedin"))                                               return <Linkedin  className="w-4 h-4" style={{ color: "#0A66C2" }} />;
  if (n.includes("seo") || n.includes("organic") || n.includes("search"))  return <Search    className="w-4 h-4" style={{ color: "#16A34A" }} />;
  if (n.includes("paid") || n.includes("ads") || n.includes("adv") || n.includes("google")) return <Megaphone className="w-4 h-4" style={{ color: "#F97316" }} />;
  if (n.includes("content") || n.includes("blog"))                         return <FileText  className="w-4 h-4" style={{ color: "#7C3AED" }} />;
  if (n.includes("webinar") || n.includes("video") || n.includes("youtube")) return <Video  className="w-4 h-4" style={{ color: "#DC2626" }} />;
  if (n.includes("phone") || n.includes("call") || n.includes("telefon"))  return <Phone     className="w-4 h-4" style={{ color: "#16A34A" }} />;
  if (n.includes("outbound") || n.includes("cold"))                        return <PhoneCall className="w-4 h-4" style={{ color: "#E8006A" }} />;
  if (n.includes("event") || n.includes("fiera") || n.includes("sito"))   return <CalendarDays className="w-4 h-4" style={{ color: "#F59E0B" }} />;
  return <Globe className="w-4 h-4" style={{ color: "#6B7280" }} />;
}

/* ─── icona trend tabella ─── */
function TrendIcon({ t }: { t: string }) {
  if (t === "up")   return <ArrowUpRight   className="w-4 h-4 text-green-400" />;
  if (t === "down") return <ArrowDownRight className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

/* ─── Modal dettaglio canale ─── */
function CanalDetailModal({ canale, onClose, isDark }: { canale: any; onClose: () => void; isDark: boolean }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${C.blue}18`, color: C.blue }}>
            {channelIcon(canale.name)}
          </div>
          <div>
            <h2 className="font-bold text-xl">{canale.name}</h2>
            <p className="text-muted-foreground text-sm">Dettaglio canale</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "MQL generati",       val: fmtN(canale.mqls),                  color: C.blue,   icon: <BarChart2 className="w-4 h-4" /> },
            { label: "SQL qualificati",    val: fmtN(canale.sqls),                  color: C.purple, icon: <Target    className="w-4 h-4" /> },
            { label: "Tasso conv.",        val: fmtPct(canale.conversionRate),      color: C.amber,  icon: <Zap       className="w-4 h-4" /> },
            { label: "ROI",                val: `${canale.roi}x`,                   color: C.green,  icon: <TrendingUp className="w-4 h-4" /> },
            { label: "% Pipeline",         val: fmtPct(canale.pipelineContribution), color: C.blue,  icon: <Activity  className="w-4 h-4" /> },
            { label: "% Closed Won",       val: fmtPct(canale.wonContribution),     color: C.green,  icon: <Activity  className="w-4 h-4" /> },
            { label: "Gg. medi conv.",     val: `${canale.avgConversionDays} gg`,   color: C.amber,  icon: <Clock     className="w-4 h-4" /> },
            { label: "Trend",              val: canale.trend === "up" ? "In crescita" : canale.trend === "down" ? "In calo" : "Stabile", color: canale.trend === "up" ? C.green : canale.trend === "down" ? C.red : C.amber, icon: <Info className="w-4 h-4" /> },
          ].map(({ label, val, color, icon }) => (
            <div key={label} className="rounded-xl p-3" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1" style={{ color }}>
                {icon} {label}
              </div>
              <p className="font-bold text-lg text-foreground">{val}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80" style={{ backgroundColor: C.blue }}>
          Chiudi
        </button>
      </div>
    </div>
  );
}

/* ─── componente principale ─── */
export default function Dashboard() {
  const [isDark, setIsDark]           = useState(false);
  const [periodo, setPeriodo]         = useState<Periodo>("30G");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [autoRefreshMs, setAutoRefreshMs] = useState<number | null>(null);
  const [autoRefreshLabel, setAutoRefreshLabel] = useState<string | null>(null);
  const [isSpinning, setIsSpinning]   = useState(false);
  const [selectedCanale, setSelectedCanale] = useState<any | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
  const [sorting, setSorting]         = useState<SortingState>([]);

  const queryClient  = useQueryClient();
  const dropdownRef  = useRef<HTMLDivElement>(null);
  const autoRefTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const kpisQuery        = useGetDashboardKpis();
  const velocityQuery    = useGetFunnelVelocity();
  const performanceQuery = useGetChannelPerformance();
  const topChannelsQuery = useGetTopChannels();

  const loading = [kpisQuery, velocityQuery, performanceQuery, topChannelsQuery]
    .some(q => q.isLoading || q.isFetching);

  /* dark mode */
  useEffect(() => { document.documentElement.classList.toggle("dark", isDark); }, [isDark]);

  /* click outside dropdown */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* spin refresh */
  useEffect(() => {
    if (loading) { setIsSpinning(true); }
    else { const t = setTimeout(() => setIsSpinning(false), 600); return () => clearTimeout(t); }
  }, [loading]);

  /* auto refresh */
  useEffect(() => {
    if (autoRefTimer.current) clearInterval(autoRefTimer.current);
    if (!autoRefreshMs) return;
    autoRefTimer.current = setInterval(() => queryClient.invalidateQueries(), autoRefreshMs);
    return () => { if (autoRefTimer.current) clearInterval(autoRefTimer.current); };
  }, [autoRefreshMs, queryClient]);

  const handleRefresh = useCallback(() => { queryClient.invalidateQueries(); }, [queryClient]);

  const lastRefreshed = kpisQuery.dataUpdatedAt
    ? new Date(kpisQuery.dataUpdatedAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) +
      " del " + new Date(kpisQuery.dataUpdatedAt).toLocaleDateString("it-IT", { day: "numeric", month: "short" })
    : null;

  const kpis        = kpisQuery.data;
  const velocityData = velocityQuery.data || [];
  const topChannels  = topChannelsQuery.data;

  const donutData = kpis
    ? [
        { name: "Raggiunto",  value: kpis.performanceVsGoal },
        { name: "Rimanente", value: 100 - kpis.performanceVsGoal },
      ]
    : [];

  const gridColor = isDark ? "rgba(255,255,255,0.07)" : "#e8eaf0";
  const tickColor = isDark ? "#6b7280" : "#8b9ab5";

  /* ─── colonne tabella ─── */
  const tableColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "name",
      header: "CANALE",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-semibold min-w-[130px]">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${C.blue}18`, color: C.blue }}>
            {channelIcon(row.original.name)}
          </span>
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "mqls",
      header: "MQL",
      cell: ({ getValue }) => <span className="font-bold" style={{ color: C.blue }}>{fmtN(getValue() as number)}</span>,
    },
    {
      accessorKey: "sqls",
      header: "SQL",
      cell: ({ getValue }) => <span className="font-bold" style={{ color: C.purple }}>{fmtN(getValue() as number)}</span>,
    },
    {
      accessorKey: "conversionRate",
      header: "CONVERSIONE",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-[110px]">
          <Progress value={row.original.conversionRate} className="h-1.5 w-16 shrink-0" />
          <span className="text-xs text-muted-foreground">{row.original.conversionRate.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      accessorKey: "pipelineContribution",
      header: "% PIPELINE",
      cell: ({ getValue }) => <span className="font-medium" style={{ color: C.blue }}>{fmtPct(getValue() as number)}</span>,
    },
    {
      accessorKey: "wonContribution",
      header: "% WON",
      cell: ({ getValue }) => <span className="font-medium" style={{ color: C.green }}>{fmtPct(getValue() as number)}</span>,
    },
    {
      accessorKey: "roi",
      header: "ROI",
      cell: ({ getValue }) => (
        <span className="font-bold text-sm" style={{ color: getValue() as number >= 5 ? C.green : getValue() as number >= 4 ? C.amber : C.red }}>
          {getValue() as number}x
        </span>
      ),
    },
    {
      accessorKey: "avgConversionDays",
      header: "GG. CONV.",
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() as number} gg</span>,
    },
    {
      accessorKey: "trend",
      header: "TREND",
      cell: ({ row }) => <TrendIcon t={row.original.trend} />,
    },
  ], []);

  const table = useReactTable({
    data: performanceQuery.data || [],
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const getSortIcon = (col: any) => {
    const sorted = col.getIsSorted();
    if (sorted === "asc")  return <ChevronUp className="w-3 h-3 ml-1 inline" />;
    if (sorted === "desc") return <ChevronDown className="w-3 h-3 ml-1 inline" />;
    return <ChevronsUpDown className="w-3 h-3 ml-1 inline opacity-30" />;
  };

  /* ─── card KPI ─── */
  const KpiCard = ({
    id, label, value, change, subtitle, icon: Icon, inverse = false,
  }: { id: string; label: string; value: string; change: number; subtitle: string; icon: any; inverse?: boolean }) => {
    const active = selectedKpi === id;
    return (
      <Card
        className={`cursor-pointer transition-all duration-200 card-hover ${active ? "ring-2 ig-border" : "ig-border"}`}
        style={active ? { "--tw-ring-color": C.blue } as any : {}}
        onClick={() => setSelectedKpi(active ? null : id)}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-3">
            <span>{label}</span>
            <Icon className="w-4 h-4 opacity-40" />
          </div>
          {kpisQuery.isLoading ? (
            <Skeleton className="h-9 w-28 mb-2" />
          ) : (
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-extrabold leading-none" style={{ color: C.blue }}>{value}</span>
              <TrendBadge val={change} inverse={inverse} />
            </div>
          )}
          <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
          {active && !kpisQuery.isLoading && (
            <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
              {id === "cpl" && <p>Obiettivo: ridurre a 35€/lead entro Q4</p>}
              {id === "mql" && <p>Benchmark settore: 22% - sei sopra del {(24.8 - 22).toFixed(1)}pp</p>}
              {id === "sql" && <p>Migliorare al 21% = +90K€ Closed Won stim.</p>}
              {id === "roi" && <p>ROI generato: 850K€ - target anno: 1,1M€</p>}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {/* Modal canale */}
      {selectedCanale && (
        <CanalDetailModal canale={selectedCanale} onClose={() => setSelectedCanale(null)} isDark={isDark} />
      )}

      <div className="min-h-screen bg-background text-foreground px-5 py-6">
        <div className="max-w-[1400px] mx-auto space-y-5">

          {/* ── Header ── */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-extrabold text-[30px] tracking-tight leading-none">
                Lead Generation Hub
              </h1>
              <p className="text-muted-foreground mt-1.5 text-[14px]">
                Segnali di domanda in tempo reale e tracciamento della velocità del funnel.
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-muted-foreground">Fonti dati:</span>
                {["App DB", "Salesforce", "Marketo"].map(s => (
                  <span key={s} className="text-[11px] font-semibold rounded px-2 py-0.5"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB", color: isDark ? "#c8c9cc" : "#4B5563" }}>
                    {s}
                  </span>
                ))}
              </div>
              {lastRefreshed && (
                <p className="text-[11px] text-muted-foreground mt-1">Aggiornato alle {lastRefreshed}</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2.5 print:hidden">
              {/* filtro periodo */}
              <div className="flex rounded-lg p-0.5 gap-0.5"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#F3F4F6" }}>
                {PERIODI.map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriodo(p)}
                    className="px-3 py-1 text-xs font-semibold rounded-md transition-all"
                    style={periodo === p
                      ? { backgroundColor: C.blue, color: "#fff" }
                      : { color: isDark ? "#9ca3af" : "#6B7280" }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {/* split refresh */}
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center rounded-lg overflow-hidden h-[28px] text-[12px] font-medium"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB", color: isDark ? "#c8c9cc" : "#4B5563" }}>
                    <button onClick={handleRefresh} disabled={loading}
                      className="flex items-center gap-1.5 px-2.5 h-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50">
                      <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
                      Aggiorna
                    </button>
                    <div className="w-px h-4 shrink-0 bg-black/10 dark:bg-white/15" />
                    <button onClick={() => setDropdownOpen(o => !o)}
                      className="flex items-center justify-center px-1.5 h-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-xl shadow-xl py-1.5 z-50">
                      <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Aggiornamento automatico
                        {autoRefreshLabel && <span className="ml-1 text-primary">· {autoRefreshLabel}</span>}
                      </p>
                      {AUTO_REFRESH_OPTIONS.map(opt => (
                        <button
                          key={opt.ms}
                          onClick={() => {
                            setAutoRefreshMs(autoRefreshMs === opt.ms ? null : opt.ms);
                            setAutoRefreshLabel(autoRefreshMs === opt.ms ? null : opt.label);
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors flex items-center justify-between"
                        >
                          {opt.label}
                          {autoRefreshMs === opt.ms && <span className="text-primary font-bold text-xs">Attivo</span>}
                        </button>
                      ))}
                      <div className="h-px bg-border my-1" />
                      <button onClick={() => { setAutoRefreshMs(null); setAutoRefreshLabel(null); setDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 transition-colors">
                        Disattiva
                      </button>
                    </div>
                  )}
                </div>

                {/* stampa */}
                <button onClick={() => window.print()} aria-label="Stampa"
                  className="flex items-center justify-center w-[28px] h-[28px] rounded-lg transition-colors hover:opacity-80"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB", color: isDark ? "#c8c9cc" : "#4B5563" }}>
                  <Printer className="w-3.5 h-3.5" />
                </button>

                {/* dark mode */}
                <button onClick={() => setIsDark(d => !d)} aria-label="Tema"
                  className="flex items-center justify-center w-[28px] h-[28px] rounded-lg transition-colors hover:opacity-80"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB", color: isDark ? "#c8c9cc" : "#4B5563" }}>
                  {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* ── KPI row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard id="cpl"   label="CPL Medio"      value={`${kpis?.avgCpl}€`}           change={kpis?.avgCplChange ?? 0}       subtitle="Efficienza vs anno prec."    icon={Activity}    inverse />
            <KpiCard id="mql"   label="MQL - SQL"      value={`${kpis?.mqlToSqlRate}%`}    change={kpis?.mqlToSqlChange ?? 0}     subtitle="Benchmark obiettivo: 22%"   icon={TrendingUp} />
            <KpiCard id="sql"   label="SQL - Won"      value={`${kpis?.sqlToWonRate}%`}    change={kpis?.sqlToWonChange ?? 0}     subtitle="Segmento alta velocità"     icon={TrendingUp} />
            <KpiCard id="roi"   label="ROI Corrente"   value={`${kpis?.currentRoi}x`}      change={kpis?.currentRoiChange ?? 0}   subtitle="850K€ generati"             icon={Activity} />
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "TOTALE MQL",       val: kpis ? fmtN(kpis.totalMqls)           : null, color: C.blue,   icon: <BarChart2 className="w-4 h-4" /> },
              { label: "TOTALE SQL",       val: kpis ? fmtN(kpis.totalSqls)           : null, color: C.purple, icon: <Target    className="w-4 h-4" /> },
              { label: "PIPELINE TOTALE", val: kpis ? fmtK(kpis.totalPipeline)       : null, color: C.amber,  icon: <Activity  className="w-4 h-4" /> },
              { label: "CLOSED WON",      val: kpis ? fmtK(kpis.totalClosedWon)      : null, color: C.green,  icon: <Zap       className="w-4 h-4" /> },
            ].map(({ label, val, color, icon }) => (
              <Card key={label} className="border-0 overflow-hidden">
                <div className="h-0.5 w-full" style={{ backgroundColor: color }} />
                <CardContent className="p-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color }}>
                    {icon} {label}
                  </div>
                  {kpisQuery.isLoading
                    ? <Skeleton className="h-7 w-20" />
                    : <p className="text-2xl font-extrabold" style={{ color }}>{val}</p>}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Funnel velocity — 3/5 */}
            <Card className="lg:col-span-3 flex flex-col card-hover">
              <CardHeader className="px-5 pt-5 pb-2 flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-bold">Velocità del Funnel</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Progressione mensile MQL vs SQL - obiettivi inclusi</CardDescription>
                </div>
                {!loading && velocityData.length > 0 && (
                  <CSVLink data={velocityData} filename="funnel-velocity.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-lg hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB", color: isDark ? "#c8c9cc" : "#4B5563" }}>
                    <Download className="w-3.5 h-3.5" />
                  </CSVLink>
                )}
              </CardHeader>
              <CardContent className="p-5 flex-1 min-h-[300px]">
                {velocityQuery.isLoading ? <Skeleton className="w-full h-full min-h-[280px]" /> : (
                  <ResponsiveContainer width="100%" height={280} debounce={0}>
                    <BarChart data={velocityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} stroke="none" tickLine={false}
                        tickFormatter={m => m.slice(0, 3)} />
                      <YAxis tickFormatter={v => fmtK(v)} tick={{ fontSize: 11, fill: tickColor }} stroke="none" tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} isAnimationActive={false} />
                      <Legend content={<CustomLegend />} />
                      <Bar dataKey="mql"     name="MQL"          fill={C.blue}   radius={[4,4,0,0]} barSize={26} isAnimationActive={false} />
                      <Bar dataKey="sql"     name="SQL"          fill={C.purple} radius={[4,4,0,0]} barSize={26} isAnimationActive={false} />
                      <Bar dataKey="mqlGoal" name="Obiet. MQL"   fill={C.blue}   fillOpacity={0.2} radius={[4,4,0,0]} barSize={26} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Performance vs Obiettivi — 2/5 */}
            <Card className="lg:col-span-2 flex flex-col card-hover">
              <CardHeader className="px-5 pt-5 pb-2 flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-bold">Performance vs Obiettivi</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Avanzamento verso i target annuali</CardDescription>
                </div>
                {!loading && kpis && (
                  <CSVLink data={[{ pipeline: kpis.totalPipeline, closedWon: kpis.totalClosedWon, goal: kpis.performanceVsGoal }]}
                    filename="performance.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-lg hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB", color: isDark ? "#c8c9cc" : "#4B5563" }}>
                    <Download className="w-3.5 h-3.5" />
                  </CSVLink>
                )}
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col justify-between">
                {kpisQuery.isLoading ? <Skeleton className="w-full flex-1 min-h-[200px]" /> : (
                  <>
                    <div className="relative h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%" debounce={0}>
                        <PieChart>
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={68} outerRadius={88}
                            cornerRadius={6} paddingAngle={4} dataKey="value" stroke="none" isAnimationActive={false}>
                            <Cell fill={C.blue} />
                            <Cell fill={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"} />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-extrabold" style={{ color: C.blue }}>{kpis?.performanceVsGoal}%</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">del Goal</span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-border pt-4">
                      {[
                        { label: "Pipeline generata", val: kpis ? fmtK(kpis.totalPipeline) : "", goal: kpis ? fmtK(kpis.pipelineGoal) : "", color: C.amber },
                        { label: "Closed Won",        val: kpis ? fmtK(kpis.totalClosedWon) : "", goal: kpis ? fmtK(kpis.closedWonGoal) : "", color: C.green },
                      ].map(({ label, val, goal, color }) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground text-xs">{label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold" style={{ color }}>{val}</span>
                            <span className="text-[10px] text-muted-foreground">/ {goal}</span>
                          </div>
                        </div>
                      ))}
                      <div className="text-center pt-1">
                        <Badge className="bg-primary/15 text-primary border-primary/25 text-[10px] font-bold">
                          In linea con target fine anno
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Tabella canali ── */}
          <Card className="card-hover">
            <CardHeader className="px-5 pt-5 pb-3 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-bold">Analisi Canali di Acquisizione</CardTitle>
                <CardDescription className="text-xs mt-0.5">Efficienza cross-canale e tracciamento conversioni - clicca una riga per i dettagli</CardDescription>
              </div>
              <button className="text-xs font-semibold text-primary hover:underline transition-colors">
                Vedi report completo →
              </button>
            </CardHeader>
            <CardContent className="p-0">
              {performanceQuery.isLoading ? (
                <div className="p-5 space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map(hg => (
                        <TableRow key={hg.id} className="border-b border-border hover:bg-transparent"
                          style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
                          {hg.headers.map(h => (
                            <TableHead key={h.id}
                              className="text-[10px] font-bold text-muted-foreground py-3 h-auto uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
                              onClick={h.column.getToggleSortingHandler()}>
                              {flexRender(h.column.columnDef.header, h.getContext())}
                              {h.column.getCanSort() && getSortIcon(h.column)}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}
                          className="border-b border-border/40 cursor-pointer transition-colors hover:bg-primary/5"
                          onClick={() => setSelectedCanale(row.original)}>
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id} className="py-3.5 text-sm">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Top / Underperforming ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top canali */}
            <Card>
              <CardHeader className="px-5 py-3.5 border-b border-border flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" /> Canali Top
                </CardTitle>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px] font-bold">HIGH ROI</Badge>
              </CardHeader>
              <CardContent className="p-0">
                {topChannelsQuery.isLoading ? (
                  <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {topChannels?.topChannels.map((c, i) => (
                      <button key={i} onClick={() => setSelectedCanale({ ...c, mqls: c.leads, sqls: Math.round(c.leads * 0.25), conversionRate: 25, pipelineContribution: 15, wonContribution: 12, roi: (30 / c.cpl).toFixed(1), trend: "up", avgConversionDays: 22 })}
                        className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${C.blue}18`, color: C.blue }}>
                            {channelIcon(c.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground">{c.subtitle}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="font-bold text-sm">{fmtN(c.leads)} lead</p>
                          <p className="text-[11px] font-bold text-green-400">CPL {c.cpl.toFixed(2)}€</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Underperforming */}
            <Card>
              <CardHeader className="px-5 py-3.5 border-b border-border flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Canali Critici
                </CardTitle>
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-bold">ATTENZIONE</Badge>
              </CardHeader>
              <CardContent className="p-0">
                {topChannelsQuery.isLoading ? (
                  <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {topChannels?.underperformingChannels.map((c, i) => (
                      <button key={i} onClick={() => setSelectedCanale({ ...c, mqls: c.leads, sqls: Math.round(c.leads * 0.1), conversionRate: 10, pipelineContribution: 3, wonContribution: 2, roi: (10 / c.cpl).toFixed(1), trend: "down", avgConversionDays: 55 })}
                        className="w-full flex items-center justify-between p-4 hover:bg-red-500/5 transition-colors text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${C.red}18`, color: C.red }}>
                            {channelIcon(c.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground">{c.subtitle}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="font-bold text-sm">{fmtN(c.leads)} lead</p>
                          <p className="text-[11px] font-bold text-red-400">CPL {c.cpl.toFixed(2)}€</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Footer stats ── */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 pb-6 border-t border-border/40">
            <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-bold text-foreground">{kpis ? fmtN(kpis.totalContacts) : "-"}</span>
                <span>contatti totali nel Database</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-bold text-foreground">{kpis?.avgConversionTimeDays ?? "-"} gg</span>
                <span>tempo medio di conversione</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Periodo selezionato: <span className="font-bold text-foreground">{periodo}</span>
              {autoRefreshLabel && <> · Auto-refresh: <span className="font-bold text-primary">{autoRefreshLabel}</span></>}
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
