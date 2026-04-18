import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calculator, TrendingUp, Target, Zap, BarChart2,
  Save, Info, ArrowUp, ArrowDown, DollarSign, Users,
} from "lucide-react";

const C = { blue: "#2563EB", purple: "#7C3AED", green: "#16A34A", red: "#DC2626", amber: "#F97316" };

function fmtK(v: number) { return new Intl.NumberFormat("it-IT", { notation: "compact", maximumFractionDigits: 1 }).format(v); }
function fmt$(v: number) { return new Intl.NumberFormat("it-IT", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v); }
function fmtN(v: number) { return v.toLocaleString("it-IT"); }

const CANALI = [
  { id: "paid",    label: "Paid Ads",  icon: "📢", cpl: 48, convRate: 0.22 },
  { id: "email",   label: "Email",     icon: "✉️", cpl: 12, convRate: 0.18 },
  { id: "webinar", label: "Webinar",   icon: "🎙️", cpl: 28, convRate: 0.31 },
  { id: "content", label: "Content",  icon: "📄", cpl: 22, convRate: 0.20 },
  { id: "social",  label: "LinkedIn",  icon: "💼", cpl: 55, convRate: 0.28 },
  { id: "seo",     label: "SEO",       icon: "🔍", cpl: 15, convRate: 0.24 },
];

const BENCHMARK = { cpc: "$4.20 – $6.50", mqlSql: "18.4%", closedWon: "14%" };

type Scenario = { name: string; budget: number; canale: string; dealValue: number; budgetMult: number; convOpt: number };

function Slider({ label, min, max, step, value, onChange, leftLabel, rightLabel, color = C.blue, formatter }: {
  label: string; min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; leftLabel?: string; rightLabel?: string;
  color?: string; formatter: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{formatter(value)}</span>
      </div>
      <div className="relative">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      </div>
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

function KpiResult({ label, value, sub, color, icon: Icon }: { label: string; value: string; sub?: string; color: string; icon: any }) {
  return (
    <Card className="border-0 overflow-hidden">
      <div className="h-0.5 w-full" style={{ backgroundColor: color }} />
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color }}>
          <Icon className="w-3.5 h-3.5" /> {label}
        </div>
        <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function RoiCalculator() {
  const [budget, setBudget]         = useState(25000);
  const [canaleId, setCanaleId]     = useState("paid");
  const [dealValue, setDealValue]   = useState(12500);
  const [budgetMult, setBudgetMult] = useState(1.0);
  const [convOpt, setConvOpt]       = useState(0);
  const [savedScenarios, setSaved]  = useState<Scenario[]>([]);
  const [activeScenario, setActive] = useState<Scenario | null>(null);

  const canale = CANALI.find(c => c.id === canaleId)!;

  const calc = useMemo(() => {
    const b = activeScenario ? activeScenario.budget * activeScenario.budgetMult : budget * budgetMult;
    const cvr = activeScenario
      ? CANALI.find(c => c.id === activeScenario.canale)!.convRate * (1 + activeScenario.convOpt / 100)
      : canale.convRate * (1 + convOpt / 100);
    const cpl = activeScenario ? CANALI.find(c => c.id === activeScenario.canale)!.cpl : canale.cpl;
    const dv  = activeScenario ? activeScenario.dealValue : dealValue;

    const mqls    = Math.round(b / cpl);
    const sqls    = Math.round(mqls * cvr);
    const won     = Math.round(sqls * 0.182);
    const revenue = won * dv;
    const pipeline = sqls * dv;
    const roi     = revenue / b;
    const roas    = revenue / b * 100;

    const whatIfMqls    = Math.round(budget * budgetMult / canale.cpl);
    const whatIfSqls    = Math.round(whatIfMqls * canale.convRate * (1 + convOpt / 100));
    const whatIfWon     = Math.round(whatIfSqls * 0.182);
    const whatIfRev     = whatIfWon * dealValue;
    const growthPotential = whatIfRev - (Math.round(budget / canale.cpl) * canale.convRate * 0.182 * dealValue);

    return { mqls, sqls, won, revenue, pipeline, roi, roas, whatIfRev, growthPotential };
  }, [budget, canaleId, dealValue, budgetMult, convOpt, activeScenario, canale]);

  const saveScenario = () => {
    setSaved(prev => [...prev, {
      name: `Scenario ${prev.length + 1} – ${canale.label}`,
      budget, canale: canaleId, dealValue, budgetMult, convOpt,
    }]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-6">
      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-extrabold text-[28px] tracking-tight leading-none">
              ROI Calculator & Simulator 🚀
            </h1>
            <p className="text-muted-foreground mt-1.5 text-[14px]">
              Piano Marketing Pro · Previsione Strategica Q3
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={saveScenario}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: C.blue }}>
              <Save className="w-4 h-4" /> Salva Scenario
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* ── COLONNA SINISTRA: Inputs ── */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: C.blue }} />
                  1. Parametri di Input 💰
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-5">
                {/* Budget */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Budget Campagna ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number" value={budget} onChange={e => setBudget(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-semibold bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ "--tw-ring-color": C.blue } as any}
                      min={1000} step={1000}
                    />
                  </div>
                </div>

                {/* Canale */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Canale di Marketing
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CANALI.map(c => (
                      <button key={c.id} onClick={() => setCanaleId(c.id)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                        style={canaleId === c.id
                          ? { backgroundColor: C.blue, color: "#fff", borderColor: C.blue }
                          : { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.1)", color: "var(--muted-foreground)" }}>
                        <span>{c.icon}</span> {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deal Value */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Valore Medio Contratto ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number" value={dealValue} onChange={e => setDealValue(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-semibold bg-muted/40 border border-border focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": C.blue } as any}
                      min={1000} step={500}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benchmark */}
            <Card>
              <CardHeader className="px-5 pt-4 pb-2">
                <CardTitle className="text-xs font-bold flex items-center gap-2 text-primary">
                  <Info className="w-3.5 h-3.5" /> CONTESTO DATI STORICI
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-2.5">
                {[
                  { label: "Benchmark Mercato (CPC)", val: BENCHMARK.cpc },
                  { label: "Tasso Storico MQL/SQL",   val: BENCHMARK.mqlSql },
                  { label: "Tasso Closed Won",         val: BENCHMARK.closedWon },
                  { label: "CPL Attuale Canale",       val: `$${canale.cpl}` },
                  { label: "Tasso Conv. Canale",       val: `${(canale.convRate * 100).toFixed(1)}%` },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-bold" style={{ color: C.blue }}>{val}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Scenari salvati */}
            {savedScenarios.length > 0 && (
              <Card>
                <CardHeader className="px-5 pt-4 pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Scenari Salvati ({savedScenarios.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4 space-y-2">
                  {savedScenarios.map((s, i) => (
                    <button key={i} onClick={() => setActive(activeScenario === s ? null : s)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm border transition-all hover:border-primary/50"
                      style={activeScenario === s
                        ? { borderColor: C.blue, backgroundColor: `${C.blue}15` }
                        : { borderColor: "rgba(255,255,255,0.1)" }}>
                      <span className="font-medium text-xs">{s.name}</span>
                      <span className="text-xs text-muted-foreground">${(s.budget * s.budgetMult / 1000).toFixed(0)}K</span>
                    </button>
                  ))}
                  {activeScenario && (
                    <button onClick={() => setActive(null)} className="text-xs text-primary hover:underline w-full text-center pt-1">
                      Torna ai parametri correnti
                    </button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── COLONNA DESTRA: Risultati + What-if ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* KPI results */}
            <div className="grid grid-cols-2 gap-4">
              <KpiResult label="MQL Stimati"       value={fmtN(calc.mqls)}    sub={`+12.5% vs Trimestre Prec.`} color={C.blue}   icon={BarChart2} />
              <KpiResult label="Revenue Prevista"  value={fmt$(calc.revenue)} sub={`ROI ${calc.roi.toFixed(1)}x`}               color={C.green}  icon={TrendingUp} />
              <KpiResult label="SQL Previsti"      value={fmtN(calc.sqls)}    sub={`Conv. Rate ${(canale.convRate * 100).toFixed(1)}%`} color={C.purple} icon={Target} />
              <KpiResult label="Pipeline Value"    value={fmtK(calc.pipeline)} sub={`${calc.won} deal chiusi previsti`}          color={C.amber}  icon={Zap} />
            </div>

            {/* What-if Simulator */}
            <Card>
              <CardHeader className="px-5 pt-5 pb-3 flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Calculator className="w-4 h-4" style={{ color: C.purple }} />
                    Simulatore 'What-if' Interattivo 🎛️
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Simula variazioni per vedere l'impatto sul tuo bottom line.
                  </CardDescription>
                </div>
                <button onClick={saveScenario}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-85 shrink-0"
                  style={{ backgroundColor: C.blue }}>
                  Salva
                </button>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-6">
                <Slider
                  label="Moltiplicatore Budget"
                  min={0.5} max={3.0} step={0.1} value={budgetMult}
                  onChange={setBudgetMult}
                  leftLabel="ATTUALE" rightLabel="MAX AGGRESSIVO"
                  color={C.blue}
                  formatter={v => `${v.toFixed(1)}x`}
                />
                <Slider
                  label="Ottimizzazione Conversione"
                  min={-20} max={50} step={5} value={convOpt}
                  onChange={setConvOpt}
                  leftLabel="BASELINE" rightLabel="ALTA PERFORMANCE"
                  color={convOpt >= 0 ? C.green : C.red}
                  formatter={v => `${v >= 0 ? "+" : ""}${v}%`}
                />

                {/* Growth potential card */}
                <div className="rounded-2xl p-4 flex items-center gap-4" style={{ backgroundColor: `${C.green}18`, border: `1px solid ${C.green}30` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: `${C.green}25` }}>
                    🚀
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">POTENZIALE DI CRESCITA</p>
                    <p className="text-2xl font-extrabold mt-0.5" style={{ color: C.green }}>
                      {calc.growthPotential >= 0 ? "+" : ""}{fmt$(calc.growthPotential)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Revenue aggiuntiva rispetto allo scenario base con budget attuale
                    </p>
                  </div>
                </div>

                {/* ROI context */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "ROI",   val: `${calc.roi.toFixed(1)}x`,   color: calc.roi >= 4 ? C.green : calc.roi >= 2 ? C.amber : C.red },
                    { label: "ROAS",  val: `${calc.roas.toFixed(0)}%`,  color: C.blue   },
                    { label: "Deal Chiusi", val: fmtN(calc.won),        color: C.purple },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="text-lg font-extrabold mt-1" style={{ color }}>{val}</p>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground text-center border-t border-border/40 pt-4">
                  ❓ Hai bisogno di un'analisi più approfondita?{" "}
                  <span className="font-bold text-primary">Passa all'AI Strategist</span> per la modellazione storica in tempo reale.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
