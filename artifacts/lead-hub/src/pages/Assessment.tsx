import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Building2, Target, DollarSign, TrendingUp, BarChart2,
  CheckCircle2, ChevronRight, ChevronLeft, ArrowRight,
  Sparkles, Info,
} from "lucide-react";

const C = { blue: "#2563EB", purple: "#7C3AED", green: "#16A34A", red: "#DC2626", amber: "#F97316" };
export const ASSESSMENT_KEY = "leadhub_assessment_v1";

/* ── Types ── */
export interface AssessmentData {
  /* Step 1 */
  nomeAzienda:      string;
  settore:          string;
  dimensione:       string;
  mercatoTarget:    string[];
  modelloBusinesss: string;
  /* Step 2 */
  arrAttuale:       string;
  arrTarget:        string;
  acvMedio:         string;
  churnRate:        string;
  crescitaMom:      number;
  /* Step 3 */
  budgetAnnuale:    string;
  budgetPaid:       number;
  budgetContent:    number;
  budgetEvents:     number;
  budgetAbm:        number;
  canaliAttivi:     string[];
  teamSize:         string;
  crmStack:         string[];
  /* Step 4 */
  leadMensili:      string;
  tassoMqlSql:      number;
  tassoSqlClose:    number;
  cicloVendita:     number;
  cacAttuale:       string;
  /* Step 5 */
  competitor1:      string;
  competitor2:      string;
  competitor3:      string;
  differenziatore:  string;
  nps:              number;
  maturitaMktg:     string;
}

const DEFAULT: AssessmentData = {
  nomeAzienda: "", settore: "", dimensione: "", mercatoTarget: [], modelloBusinesss: "",
  arrAttuale: "", arrTarget: "", acvMedio: "", churnRate: "", crescitaMom: 15,
  budgetAnnuale: "", budgetPaid: 40, budgetContent: 30, budgetEvents: 20, budgetAbm: 10,
  canaliAttivi: [], teamSize: "", crmStack: [],
  leadMensili: "", tassoMqlSql: 25, tassoSqlClose: 20, cicloVendita: 45, cacAttuale: "",
  competitor1: "", competitor2: "", competitor3: "", differenziatore: "", nps: 40, maturitaMktg: "",
};

const STEPS = [
  { id: 1, label: "Profilo",    icon: <Building2 className="w-4 h-4" />,  color: C.blue   },
  { id: 2, label: "Obiettivi",  icon: <Target className="w-4 h-4" />,     color: C.purple },
  { id: 3, label: "Budget",     icon: <DollarSign className="w-4 h-4" />, color: C.amber  },
  { id: 4, label: "Funnel",     icon: <TrendingUp className="w-4 h-4" />, color: C.green  },
  { id: 5, label: "Mercato",    icon: <BarChart2 className="w-4 h-4" />,  color: C.red    },
];

/* ── Small helpers ── */
function Label({ text, hint }: { text: string; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-sm font-semibold">{text}</label>
      {hint && (
        <span className="group relative cursor-help">
          <Info className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="absolute left-5 -top-1 z-10 hidden group-hover:block bg-foreground text-background text-[11px] rounded-lg px-2.5 py-1.5 w-48 leading-tight shadow">
            {hint}
          </span>
        </span>
      )}
    </div>
  );
}

function TextInput({ val, set, placeholder, prefix }: { val: string; set: (v: string) => void; placeholder?: string; prefix?: string }) {
  return (
    <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden focus-within:ring-2" style={{ "--tw-ring-color": `${C.blue}55` } as any}>
      {prefix && <span className="px-3 text-sm text-muted-foreground border-r border-border bg-muted/40 self-stretch flex items-center">{prefix}</span>}
      <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
        className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none" />
    </div>
  );
}

function SelectInput({ val, set, options, placeholder }: { val: string; set: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <select value={val} onChange={e => set(e.target.value)}
      className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-background outline-none focus:ring-2 cursor-pointer"
      style={{ "--tw-ring-color": `${C.blue}55` } as any}>
      <option value="">{placeholder || "Seleziona…"}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function RadioGroup({ val, set, options }: { val: string; set: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o.value} onClick={() => set(o.value)}
          className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
          style={val === o.value
            ? { backgroundColor: `${C.blue}15`, borderColor: `${C.blue}60`, color: C.blue, fontWeight: 700 }
            : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function MultiCheck({ val, set, options }: { val: string[]; set: (v: string[]) => void; options: string[] }) {
  const toggle = (o: string) => val.includes(o) ? set(val.filter(x => x !== o)) : set([...val, o]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} onClick={() => toggle(o)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border transition-all"
          style={val.includes(o)
            ? { backgroundColor: `${C.blue}12`, borderColor: `${C.blue}50`, color: C.blue, fontWeight: 600 }
            : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
          {val.includes(o) && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
          {o}
        </button>
      ))}
    </div>
  );
}

function SliderField({ label, val, set, min, max, step, suffix, hint }: {
  label: string; val: number; set: (v: number) => void;
  min: number; max: number; step?: number; suffix?: string; hint?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <Label text={label} hint={hint} />
        <span className="text-sm font-extrabold" style={{ color: C.blue }}>{val}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step ?? 1} value={val}
        onChange={e => set(Number(e.target.value))} className="w-full h-2 rounded-full outline-none"
        style={{ accentColor: C.blue }} />
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>{min}{suffix}</span><span>{max}{suffix}</span>
      </div>
    </div>
  );
}

function BudgetSliders({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  const vals = [data.budgetPaid, data.budgetContent, data.budgetEvents, data.budgetAbm];
  const labels = ["Paid Acquisition", "Content & SEO", "Events & ABM", "Tools & Ops"];
  const keys: (keyof AssessmentData)[] = ["budgetPaid","budgetContent","budgetEvents","budgetAbm"];
  const colors = [C.blue, C.purple, C.amber, C.green];
  const total = vals.reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-3">
      {labels.map((l, i) => (
        <div key={l}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold">{l}</span>
            <span className="font-bold" style={{ color: colors[i] }}>{vals[i]}%</span>
          </div>
          <input type="range" min={0} max={100} value={vals[i]}
            onChange={e => set(keys[i], Number(e.target.value))}
            className="w-full h-2 rounded-full outline-none" style={{ accentColor: colors[i] }} />
        </div>
      ))}
      <div className={`text-xs mt-2 font-semibold ${total === 100 ? "text-green-600" : "text-amber-600"}`}>
        Totale: {total}% {total === 100 ? "✓ Perfetto" : `— aggiusta di ${100 - total > 0 ? "+" : ""}${100 - total}%`}
      </div>
    </div>
  );
}

/* ── Steps ── */
function Step1({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label text="Nome Azienda" />
          <TextInput val={data.nomeAzienda} set={v => set("nomeAzienda", v)} placeholder="Es. Acme Corp Srl" />
        </div>
        <div>
          <Label text="Settore / Industria" hint="Il settore principale in cui opera la tua azienda." />
          <SelectInput val={data.settore} set={v => set("settore", v)} placeholder="Seleziona settore…" options={[
            "SaaS / Software", "Finance & FinTech", "Healthcare / MedTech", "Manufacturing",
            "Retail & eCommerce", "Professional Services", "Education / EdTech", "Altro",
          ]} />
        </div>
      </div>
      <div>
        <Label text="Dimensione Azienda (dipendenti)" />
        <RadioGroup val={data.dimensione} set={v => set("dimensione", v)} options={[
          { value: "1-10",    label: "1–10" },
          { value: "11-50",   label: "11–50" },
          { value: "51-200",  label: "51–200" },
          { value: "201-500", label: "201–500" },
          { value: "500+",    label: "500+" },
        ]} />
      </div>
      <div>
        <Label text="Mercato Target" hint="Seleziona tutti i mercati geografici in cui operi o vuoi espanderti." />
        <MultiCheck val={data.mercatoTarget} set={v => set("mercatoTarget", v)}
          options={["Italia", "Europa (DACH)", "Europa (EMEA)", "UK", "Nord America", "APAC", "Global"]} />
      </div>
      <div>
        <Label text="Modello di Business" />
        <RadioGroup val={data.modelloBusinesss} set={v => set("modelloBusinesss", v)} options={[
          { value: "B2B",    label: "B2B" },
          { value: "B2C",    label: "B2C" },
          { value: "B2B2C",  label: "B2B2C" },
          { value: "PLG",    label: "Product-Led (PLG)" },
          { value: "Misto",  label: "Misto" },
        ]} />
      </div>
    </div>
  );
}

function Step2({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label text="ARR Attuale" hint="Annual Recurring Revenue attuale in Euro." />
          <TextInput val={data.arrAttuale} set={v => set("arrAttuale", v)} placeholder="Es. 500000" prefix="€" />
        </div>
        <div>
          <Label text="ARR Target (12 mesi)" hint="Obiettivo di ARR che vuoi raggiungere nei prossimi 12 mesi." />
          <TextInput val={data.arrTarget} set={v => set("arrTarget", v)} placeholder="Es. 1200000" prefix="€" />
        </div>
        <div>
          <Label text="ACV Medio per Cliente" hint="Average Contract Value — valore medio annuo per cliente." />
          <TextInput val={data.acvMedio} set={v => set("acvMedio", v)} placeholder="Es. 12000" prefix="€" />
        </div>
        <div>
          <Label text="Churn Rate Attuale" hint="Percentuale di clienti persi ogni anno." />
          <TextInput val={data.churnRate} set={v => set("churnRate", v)} placeholder="Es. 5" prefix="%" />
        </div>
      </div>
      <SliderField label="Crescita MoM Desiderata" val={data.crescitaMom} set={v => set("crescitaMom", v)}
        min={1} max={50} suffix="%" hint="Month-over-Month growth rate che vuoi raggiungere." />
    </div>
  );
}

function Step3({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label text="Budget Marketing Annuale" hint="Budget totale disponibile per il marketing (incluso team)." />
          <TextInput val={data.budgetAnnuale} set={v => set("budgetAnnuale", v)} placeholder="Es. 200000" prefix="€" />
        </div>
        <div>
          <Label text="Dimensione Team Marketing" />
          <TextInput val={data.teamSize} set={v => set("teamSize", v)} placeholder="Numero di persone" />
        </div>
      </div>
      <div>
        <Label text="Allocazione Budget per Canale" hint="La somma deve essere 100%. Trascina per modificare." />
        <BudgetSliders data={data} set={set} />
      </div>
      <div>
        <Label text="Canali di Marketing Attivi" />
        <MultiCheck val={data.canaliAttivi} set={v => set("canaliAttivi", v)}
          options={["LinkedIn Ads","Google Ads","SEO/Content","Email Marketing","Webinar","Eventi Fisici","Podcast","PR / Media","Referral","Partner"]} />
      </div>
      <div>
        <Label text="CRM & Marketing Stack in uso" />
        <MultiCheck val={data.crmStack} set={v => set("crmStack", v)}
          options={["HubSpot","Salesforce","Marketo","Pardot","ActiveCampaign","Pipedrive","Monday.com","Notion","Altro"]} />
      </div>
    </div>
  );
}

function Step4({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label text="Lead Totali al Mese (attuali)" hint="Numero di nuovi lead generati ogni mese in media." />
          <TextInput val={data.leadMensili} set={v => set("leadMensili", v)} placeholder="Es. 500" />
        </div>
        <div>
          <Label text="CAC Attuale (Costo per Acquisire un Cliente)" hint="Quanto spendi in media per acquisire un nuovo cliente." />
          <TextInput val={data.cacAttuale} set={v => set("cacAttuale", v)} placeholder="Es. 1500" prefix="€" />
        </div>
      </div>
      <SliderField label="Tasso di Conversione MQL → SQL" val={data.tassoMqlSql} set={v => set("tassoMqlSql", v)}
        min={1} max={80} suffix="%" hint="Quanti MQL (Marketing Qualified Lead) diventano SQL (Sales Qualified Lead)." />
      <SliderField label="Tasso di Chiusura SQL → Cliente" val={data.tassoSqlClose} set={v => set("tassoSqlClose", v)}
        min={1} max={80} suffix="%" hint="Quanti SQL diventano effettivamente clienti paganti." />
      <SliderField label="Ciclo di Vendita Medio" val={data.cicloVendita} set={v => set("cicloVendita", v)}
        min={1} max={365} step={5} suffix=" gg" hint="Numero di giorni dal primo contatto alla firma del contratto." />
    </div>
  );
}

function Step5({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <Label text="Principali Competitor (fino a 3)" hint="Inserisci i nomi dei tuoi principali concorrenti diretti." />
        <div className="space-y-2.5">
          {(["competitor1","competitor2","competitor3"] as (keyof AssessmentData)[]).map((k, i) => (
            <TextInput key={k} val={data[k] as string} set={v => set(k, v)} placeholder={`Competitor ${i + 1} — es. CompanyName`} />
          ))}
        </div>
      </div>
      <div>
        <Label text="Principale Differenziatore Competitivo" hint="In cosa sei unico rispetto alla concorrenza?" />
        <SelectInput val={data.differenziatore} set={v => set("differenziatore", v)} options={[
          "Prezzo / Value for Money", "UX / Facilità d'uso", "Integrazioni native",
          "Customer Success dedicato", "Specializzazione verticale", "AI / Automazione avanzata",
          "Compliance / Sicurezza", "Time-to-value più rapido", "Altro",
        ]} />
      </div>
      <SliderField label="NPS Attuale (Net Promoter Score)" val={data.nps} set={v => set("nps", v)}
        min={-100} max={100} hint="Quanto i tuoi clienti ti raccomanderebbero? Scala da -100 a 100." />
      <div>
        <Label text="Maturità del Team Marketing" hint="Valuta onestamente il livello attuale del tuo team e dei processi." />
        <RadioGroup val={data.maturitaMktg} set={v => set("maturitaMktg", v)} options={[
          { value: "Nascente",     label: "Nascente — appena avviato" },
          { value: "In sviluppo",  label: "In sviluppo — processi parziali" },
          { value: "Strutturato",  label: "Strutturato — team e tool attivi" },
          { value: "Avanzato",     label: "Avanzato — data-driven & scalable" },
        ]} />
      </div>
    </div>
  );
}

/* ── Summary card ── */
function SummaryCard({ data }: { data: AssessmentData }) {
  const arr    = Number(data.arrAttuale)  || 0;
  const target = Number(data.arrTarget)   || 0;
  const growth = arr > 0 ? (((target - arr) / arr) * 100).toFixed(0) : "—";
  const leads  = Number(data.leadMensili) || 0;
  const sql    = Math.round(leads * data.tassoMqlSql / 100);
  const won    = Math.round(sql  * data.tassoSqlClose / 100);
  const budget = Number(data.budgetAnnuale) || 0;
  const cac    = Number(data.cacAttuale) || 0;
  const ltv    = Number(data.acvMedio) || 0;
  const ltvCac = cac > 0 ? (ltv / cac).toFixed(1) : "—";

  return (
    <div className="space-y-5">
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl"
          style={{ backgroundColor: C.green }}>
          ✓
        </div>
        <h3 className="text-xl font-extrabold mb-1">Assessment Completato!</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Hai risposto a tutte le domande. Ecco il riepilogo del tuo profilo aziendale.
          Tutti i dati sono stati salvati e verranno usati per calcoli e previsioni.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "ARR Target",     val: target > 0 ? `€${(target/1000).toFixed(0)}K` : "—", sub: `+${growth}%`, color: C.blue   },
          { label: "Lead → Clienti", val: `${leads}→${won}/mo`, sub: `SQL ${sql}/mo`,          color: C.purple },
          { label: "Budget Annuale", val: budget > 0 ? `€${(budget/1000).toFixed(0)}K` : "—", sub: `${data.canaliAttivi.length} canali`, color: C.amber },
          { label: "LTV / CAC",      val: ltvCac,               sub: `CAC €${cac.toLocaleString("it-IT")}`,       color: C.green  },
        ].map((k, i) => (
          <div key={i} className="rounded-xl border border-border p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{k.label}</p>
            <p className="text-lg font-extrabold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: `${C.blue}06`, borderColor: `${C.blue}20` }}>
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.blue }} />
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: C.blue }}>Cosa succede adesso</p>
            <ul className="text-[12px] text-muted-foreground space-y-1">
              <li>→ <strong>Dashboard</strong>: i tuoi KPI sono ora personalizzati sul tuo funnel reale</li>
              <li>→ <strong>ROI Calculator</strong>: i valori di default riflettono il tuo budget e ACV</li>
              <li>→ <strong>AI Strategist</strong>: il contesto aziendale è incluso in ogni analisi AI</li>
              <li>→ <strong>Piano Marketing</strong>: obiettivi e roadmap allineati al tuo ARR target</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function Assessment() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [data, setData] = useState<AssessmentData>(() => {
    try {
      const saved = localStorage.getItem(ASSESSMENT_KEY);
      return saved ? { ...DEFAULT, ...JSON.parse(saved) } : DEFAULT;
    } catch { return DEFAULT; }
  });
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const setField = (k: keyof AssessmentData, v: any) => setData(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (done) localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(data));
  }, [done, data]);

  const stepColor = STEPS[step - 1]?.color ?? C.blue;
  const pct       = ((step - 1) / (STEPS.length)) * 100;

  const handleNext = () => {
    if (step < STEPS.length) { setStep(s => s + 1); window.scrollTo(0, 0); }
    else {
      localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(data));
      setDone(true);
      toast({ title: "Assessment salvato", description: "I dati sono pronti per tutte le sezioni." });
    }
  };

  const STEP_TITLES = [
    { title: "Profilo Aziendale",        sub: "Raccontaci chi sei e in quale mercato operi" },
    { title: "Obiettivi di Crescita",    sub: "Definisci i target di business per i prossimi 12 mesi" },
    { title: "Budget & Canali",          sub: "Come investi il tuo budget marketing?" },
    { title: "Performance del Funnel",   sub: "Le metriche attuali del tuo processo di acquisizione" },
    { title: "Competitor & Posizione",   sub: "Il tuo contesto competitivo e il livello di maturità" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[860px] mx-auto px-5 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: C.blue }}>A</div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Business Assessment</span>
          </div>
          <h1 className="font-extrabold text-[28px] tracking-tight leading-none mb-1.5">
            Configura il tuo profilo aziendale
          </h1>
          <p className="text-muted-foreground text-[14px]">
            Rispondi a {STEPS.length} sezioni di domande per personalizzare calcoli, previsioni e strategie su misura per la tua azienda.
          </p>
        </div>

        {!done ? (
          <>
            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {STEPS.map((s, i) => {
                const past    = step > s.id;
                const current = step === s.id;
                return (
                  <div key={s.id} className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => step > s.id && setStep(s.id)}
                      disabled={step <= s.id && !past}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                      style={current
                        ? { backgroundColor: `${s.color}15`, color: s.color, fontWeight: 700, border: `1.5px solid ${s.color}40` }
                        : past
                          ? { color: C.green, cursor: "pointer" }
                          : { color: "var(--muted-foreground)", cursor: "default" }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-white"
                        style={{ backgroundColor: past ? C.green : current ? s.color : "var(--muted-foreground)" }}>
                        {past ? "✓" : s.id}
                      </span>
                      {s.label}
                    </button>
                    {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                <span>Progresso</span>
                <span className="font-bold">{step} / {STEPS.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct + 20}%`, backgroundColor: stepColor }} />
              </div>
            </div>

            {/* Step card */}
            <Card className="border-2 mb-6" style={{ borderColor: `${stepColor}25` }}>
              <div className="h-1 rounded-t-xl" style={{ backgroundColor: stepColor }} />
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-3 mb-7">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: stepColor }}>
                    {STEPS[step - 1].icon}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-lg leading-tight">{STEP_TITLES[step - 1].title}</h2>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{STEP_TITLES[step - 1].sub}</p>
                  </div>
                </div>

                {step === 1 && <Step1 data={data} set={setField} />}
                {step === 2 && <Step2 data={data} set={setField} />}
                {step === 3 && <Step3 data={data} set={setField} />}
                {step === 4 && <Step4 data={data} set={setField} />}
                {step === 5 && <Step5 data={data} set={setField} />}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setStep(s => s - 1); window.scrollTo(0, 0); }}
                disabled={step === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-border hover:bg-muted/50 transition-colors disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" /> Indietro
              </button>
              <span className="text-xs text-muted-foreground hidden sm:block">
                I dati vengono salvati automaticamente
              </span>
              <button onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
                style={{ backgroundColor: stepColor }}>
                {step < STEPS.length ? <><span>Avanti</span><ChevronRight className="w-4 h-4" /></> : <><span>Completa Assessment</span><CheckCircle2 className="w-4 h-4" /></>}
              </button>
            </div>
          </>
        ) : (
          <>
            <Card className="border-2 mb-6" style={{ borderColor: `${C.green}30` }}>
              <div className="h-1 rounded-t-xl" style={{ backgroundColor: C.green }} />
              <CardContent className="p-6 sm:p-8">
                <SummaryCard data={data} />
              </CardContent>
            </Card>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => { setDone(false); setStep(1); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-border hover:bg-muted/50 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Modifica risposte
              </button>
              <button onClick={() => navigate("/roi-calculator")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border transition-colors hover:opacity-85"
                style={{ borderColor: `${C.amber}40`, backgroundColor: `${C.amber}10`, color: C.amber }}>
                ROI Calculator <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
                style={{ backgroundColor: C.blue }}>
                Vai alla Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
