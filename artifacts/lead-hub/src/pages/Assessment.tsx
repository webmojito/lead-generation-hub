import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2, Target, DollarSign, TrendingUp, BarChart2,
  CheckCircle2, ChevronRight, ChevronLeft, ArrowRight,
  Sparkles, Info, ChevronDown, BookOpen, Calculator,
  Rocket, Briefcase, Zap,
} from "lucide-react";

const C = { blue: "#2563EB", purple: "#7C3AED", green: "#16A34A", red: "#DC2626", amber: "#F97316" };
export const ASSESSMENT_KEY = "leadhub_assessment_v1";

/* ── Types ── */
export interface AssessmentData {
  mode: "enterprise" | "pmi";
  /* Step 1 — shared */
  nomeAzienda: string; settore: string; dimensione: string;
  mercatoTarget: string[]; modelloBusinesss: string;
  /* Step 2 — enterprise */
  arrAttuale: string; arrTarget: string; acvMedio: string;
  churnRate: string; crescitaMom: number;
  /* Step 2 — pmi */
  faseBusiness: string; obiettivoPrincipale: string; sfidaPrincipale: string;
  clientiAttuali: string; fatturatoPMI: string; acvStimato: string;
  /* Step 3 — enterprise */
  budgetAnnuale: string; budgetPaid: number; budgetContent: number;
  budgetEvents: number; budgetAbm: number; canaliAttivi: string[]; teamSize: string; crmStack: string[];
  /* Step 3 — pmi */
  budgetFascia: string; canaliPMI: string[]; frequenzaContenuti: string;
  /* Step 4 — enterprise */
  leadMensili: string; tassoMqlSql: number; tassoSqlClose: number;
  cicloVendita: number; cacAttuale: string;
  /* Step 4 — pmi */
  comeTrovaClienti: string[]; opportunitaMensili: string; tassoSuccessoPMI: string;
  tempoChiusuraPMI: string;
  /* Step 5 — shared */
  competitor1: string; competitor2: string; competitor3: string;
  differenziatore: string; nps: number; maturitaMktg: string;
  /* Step 5 — pmi extra */
  prossimaPriorita: string[]; chiSiOccupa: string;
}

const DEFAULT: AssessmentData = {
  mode: "enterprise",
  nomeAzienda: "", settore: "", dimensione: "", mercatoTarget: [], modelloBusinesss: "",
  arrAttuale: "", arrTarget: "", acvMedio: "", churnRate: "", crescitaMom: 15,
  faseBusiness: "", obiettivoPrincipale: "", sfidaPrincipale: "", clientiAttuali: "", fatturatoPMI: "", acvStimato: "",
  budgetAnnuale: "", budgetPaid: 40, budgetContent: 30, budgetEvents: 20, budgetAbm: 10,
  canaliAttivi: [], teamSize: "", crmStack: [],
  budgetFascia: "", canaliPMI: [], frequenzaContenuti: "",
  leadMensili: "", tassoMqlSql: 25, tassoSqlClose: 20, cicloVendita: 45, cacAttuale: "",
  comeTrovaClienti: [], opportunitaMensili: "", tassoSuccessoPMI: "", tempoChiusuraPMI: "",
  competitor1: "", competitor2: "", competitor3: "", differenziatore: "", nps: 40, maturitaMktg: "",
  prossimaPriorita: [], chiSiOccupa: "",
};

const STEPS = [
  { id: 1, label: "Profilo",  icon: <Building2 className="w-4 h-4" />,  color: C.blue   },
  { id: 2, label: "Obiettivi",icon: <Target className="w-4 h-4" />,     color: C.purple },
  { id: 3, label: "Budget",   icon: <DollarSign className="w-4 h-4" />, color: C.amber  },
  { id: 4, label: "Funnel",   icon: <TrendingUp className="w-4 h-4" />, color: C.green  },
  { id: 5, label: "Mercato",  icon: <BarChart2 className="w-4 h-4" />,  color: C.red    },
];

/* ── Helpers UI ── */
function Label({ text, hint, formula }: { text: string; hint?: string; formula?: string }) {
  const [showFormula, setShowFormula] = useState(false);
  return (
    <div className="mb-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-semibold">{text}</label>
        {hint && (
          <span className="group relative cursor-help">
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="absolute left-5 -top-1 z-20 hidden group-hover:block bg-foreground text-background text-[11px] rounded-lg px-2.5 py-1.5 w-56 leading-tight shadow-xl">
              {hint}
            </span>
          </span>
        )}
        {formula && (
          <button onClick={() => setShowFormula(v => !v)}
            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors"
            style={{ backgroundColor: `${C.blue}15`, color: C.blue }}>
            <Calculator className="w-2.5 h-2.5" /> Come si calcola
          </button>
        )}
      </div>
      {formula && showFormula && (
        <div className="mt-1.5 px-3 py-2 rounded-xl text-[11px] leading-relaxed font-mono"
          style={{ backgroundColor: `${C.blue}08`, borderLeft: `3px solid ${C.blue}40`, color: "var(--muted-foreground)" }}>
          {formula}
        </div>
      )}
    </div>
  );
}

function TextInput({ val, set, placeholder, prefix }: { val: string; set: (v: string) => void; placeholder?: string; prefix?: string }) {
  return (
    <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden focus-within:ring-2"
      style={{ "--tw-ring-color": `${C.blue}55` } as any}>
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

function SliderField({ label, val, set, min, max, step, suffix, hint, formula }: {
  label: string; val: number; set: (v: number) => void;
  min: number; max: number; step?: number; suffix?: string; hint?: string; formula?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <Label text={label} hint={hint} formula={formula} />
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

function FormulaBox({ title, rows }: { title: string; rows: { label: string; formula: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border transition-all" style={{ borderColor: `${C.purple}30`, backgroundColor: `${C.purple}06` }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-2 px-4 py-3 text-left">
        <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: C.purple }} />
        <span className="text-[12px] font-semibold flex-1" style={{ color: C.purple }}>{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} style={{ color: C.purple }} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {rows.map((r, i) => (
            <div key={i}>
              <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">{r.label}</p>
              <p className="text-[11px] font-mono px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${C.purple}10`, color: C.purple }}>
                {r.formula}
              </p>
            </div>
          ))}
        </div>
      )}
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
        Totale: {total}% {total === 100 ? "— Perfetto" : `— aggiusta di ${100 - total > 0 ? "+" : ""}${100 - total}%`}
      </div>
    </div>
  );
}

/* ── Step 1 — shared ── */
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
          <SelectInput val={data.settore} set={v => set("settore", v)} options={[
            "SaaS / Software","Finance & FinTech","Healthcare / MedTech","Manufacturing",
            "Retail & eCommerce","Professional Services","Education / EdTech","Artigianato / Commercio locale","Altro",
          ]} />
        </div>
      </div>
      <div>
        <Label text="Dimensione Azienda (dipendenti)" />
        <RadioGroup val={data.dimensione} set={v => set("dimensione", v)} options={[
          { value: "1-5",     label: "1–5" },
          { value: "6-15",    label: "6–15" },
          { value: "16-50",   label: "16–50" },
          { value: "51-200",  label: "51–200" },
          { value: "201-500", label: "201–500" },
          { value: "500+",    label: "500+" },
        ]} />
      </div>
      <div>
        <Label text="Mercato Target" hint="Seleziona tutti i mercati geografici in cui operi o vuoi espanderti." />
        <MultiCheck val={data.mercatoTarget} set={v => set("mercatoTarget", v)}
          options={["Italia","Europa (DACH)","Europa (EMEA)","UK","Nord America","APAC","Global"]} />
      </div>
      <div>
        <Label text="Modello di Business" />
        <RadioGroup val={data.modelloBusinesss} set={v => set("modelloBusinesss", v)} options={[
          { value: "B2B", label: "B2B" },
          { value: "B2C", label: "B2C" },
          { value: "B2B2C", label: "B2B2C" },
          { value: "PLG", label: "Product-Led (PLG)" },
          { value: "Misto", label: "Misto" },
        ]} />
      </div>
    </div>
  );
}

/* ── Step 2 Enterprise ── */
function Step2Enterprise({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label text="ARR Attuale" hint="Annual Recurring Revenue: somma di tutti i contratti ricorrenti annualizzati."
            formula={"ARR = MRR × 12\n\ndove MRR = somma di tutti i canoni mensili ricorrenti attivi"} />
          <TextInput val={data.arrAttuale} set={v => set("arrAttuale", v)} placeholder="Es. 500000" prefix="€" />
        </div>
        <div>
          <Label text="ARR Target (12 mesi)" hint="Obiettivo di ARR che vuoi raggiungere nei prossimi 12 mesi."
            formula={"ARR Target = ARR attuale × (1 + crescita annua desiderata)\n\nEs. 500K × 1.4 = 700K con crescita 40%"} />
          <TextInput val={data.arrTarget} set={v => set("arrTarget", v)} placeholder="Es. 1200000" prefix="€" />
        </div>
        <div>
          <Label text="ACV Medio per Cliente" hint="Average Contract Value: valore medio annuale di un contratto cliente."
            formula={"ACV = Valore totale contratto ÷ Durata anni\n\nOppure: ARR ÷ numero clienti attivi"} />
          <TextInput val={data.acvMedio} set={v => set("acvMedio", v)} placeholder="Es. 12000" prefix="€" />
        </div>
        <div>
          <Label text="Churn Rate Attuale" hint="Percentuale di clienti o ricavi persi ogni anno."
            formula={"Churn = Clienti persi nel periodo ÷ Clienti a inizio periodo × 100\n\nEs. 10 persi / 200 iniziali = 5%"} />
          <TextInput val={data.churnRate} set={v => set("churnRate", v)} placeholder="Es. 5" prefix="%" />
        </div>
      </div>
      <SliderField label="Crescita MoM Desiderata" val={data.crescitaMom} set={v => set("crescitaMom", v)}
        min={1} max={50} suffix="%"
        hint="Month-over-Month growth rate che vuoi raggiungere."
        formula={"MoM Growth = (MRR mese corrente - MRR mese precedente) ÷ MRR mese precedente × 100"} />
    </div>
  );
}

/* ── Step 2 PMI ── */
function Step2PMI({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <Label text="In che fase si trova la tua azienda?" hint="Scegli la fase che meglio descrive il momento attuale." />
        <RadioGroup val={data.faseBusiness} set={v => set("faseBusiness", v)} options={[
          { value: "idea",        label: "Idea / Pre-lancio" },
          { value: "early",       label: "Appena lanciati (0–2 anni)" },
          { value: "crescita",    label: "Crescita (2–5 anni)" },
          { value: "consolidamento", label: "Consolidamento (5+ anni)" },
        ]} />
      </div>
      <div>
        <Label text="Qual è il tuo obiettivo principale nei prossimi 12 mesi?" />
        <RadioGroup val={data.obiettivoPrincipale} set={v => set("obiettivoPrincipale", v)} options={[
          { value: "nuovi_clienti",  label: "Trovare nuovi clienti" },
          { value: "upsell",         label: "Aumentare il valore dei clienti esistenti" },
          { value: "espansione",     label: "Espandersi in nuovi mercati" },
          { value: "fidelizzazione", label: "Ridurre il churn / fidelizzare" },
          { value: "brand",          label: "Aumentare la notorietà del brand" },
        ]} />
      </div>
      <div>
        <Label text="Qual è la tua principale sfida di marketing?" />
        <RadioGroup val={data.sfidaPrincipale} set={v => set("sfidaPrincipale", v)} options={[
          { value: "budget",    label: "Budget limitato" },
          { value: "risorse",   label: "Mancanza di risorse / team" },
          { value: "dove",      label: "Non so da dove iniziare" },
          { value: "competition", label: "Concorrenza molto forte" },
          { value: "misurare",  label: "Non so come misurare i risultati" },
        ]} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label text="Quanti clienti attivi hai oggi (circa)?" />
          <TextInput val={data.clientiAttuali} set={v => set("clientiAttuali", v)} placeholder="Es. 50" />
        </div>
        <div>
          <Label text="Fatturato annuale approssimativo" hint="Non preoccuparti della precisione — serve per calibrare le raccomandazioni." />
          <SelectInput val={data.fatturatoPMI} set={v => set("fatturatoPMI", v)} options={[
            "< 100K €", "100K – 300K €", "300K – 500K €", "500K – 1M €", "1M – 3M €", "> 3M €",
          ]} placeholder="Seleziona fascia…" />
        </div>
      </div>
      <FormulaBox title="Come stimare il tuo ARR (Annual Recurring Revenue)" rows={[
        { label: "Se hai contratti/abbonamenti ricorrenti:", formula: "ARR = Numero clienti × Canone annuale medio" },
        { label: "Se hai vendite una-tantum:", formula: "ARR stimato = Fatturato annuo × % clienti ricorrenti" },
        { label: "Esempio pratico:", formula: "50 clienti × 2.400€/anno = 120.000€ ARR" },
      ]} />
    </div>
  );
}

/* ── Step 3 Enterprise ── */
function Step3Enterprise({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label text="Budget Marketing Annuale"
            hint="Budget totale disponibile per il marketing (incluso team)."
            formula={"Regola pratica:\n- Startup crescita: 20–30% del fatturato\n- Scale-up: 15–20%\n- Consolidato: 10–15%"} />
          <TextInput val={data.budgetAnnuale} set={v => set("budgetAnnuale", v)} placeholder="Es. 200000" prefix="€" />
        </div>
        <div>
          <Label text="Dimensione Team Marketing" />
          <TextInput val={data.teamSize} set={v => set("teamSize", v)} placeholder="Numero di persone" />
        </div>
      </div>
      <div>
        <Label text="Allocazione Budget per Canale" hint="La somma deve essere 100%." />
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

/* ── Step 3 PMI ── */
function Step3PMI({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <Label text="Quanto spendi in marketing all'anno (circa)?" hint="Include qualsiasi spesa per pubblicità, strumenti, consulenti e contenuti." />
        <RadioGroup val={data.budgetFascia} set={v => set("budgetFascia", v)} options={[
          { value: "< 5K",     label: "Meno di 5.000€" },
          { value: "5-20K",    label: "5.000 – 20.000€" },
          { value: "20-50K",   label: "20.000 – 50.000€" },
          { value: "50-100K",  label: "50.000 – 100.000€" },
          { value: "> 100K",   label: "Oltre 100.000€" },
        ]} />
      </div>
      <div>
        <Label text="Canali che usi (o vuoi usare)" />
        <MultiCheck val={data.canaliPMI} set={v => set("canaliPMI", v)}
          options={["Instagram / Facebook","LinkedIn","Google Ads","SEO / Blog","Email Newsletter","WhatsApp Business","Fiere / Eventi","Passaparola","Altro"]} />
      </div>
      <div>
        <Label text="Con quale frequenza pubblichi contenuti?" />
        <RadioGroup val={data.frequenzaContenuti} set={v => set("frequenzaContenuti", v)} options={[
          { value: "mai",          label: "Mai / Raramente" },
          { value: "mensile",      label: "Qualche volta al mese" },
          { value: "settimanale",  label: "1–2 volte a settimana" },
          { value: "quotidiano",   label: "Ogni giorno" },
        ]} />
      </div>
      <FormulaBox title="Come stimare il budget marketing ottimale per la tua fase" rows={[
        { label: "Startup (fase di crescita aggressiva):", formula: "Budget = Fatturato × 20–30%" },
        { label: "PMI in espansione:", formula: "Budget = Fatturato × 12–18%" },
        { label: "Azienda consolidata:", formula: "Budget = Fatturato × 8–12%" },
        { label: "Esempio PMI con 500K fatturato:", formula: "500.000€ × 15% = 75.000€/anno → 6.250€/mese" },
      ]} />
    </div>
  );
}

/* ── Step 4 Enterprise ── */
function Step4Enterprise({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label text="Lead Totali al Mese (attuali)"
            hint="Numero di nuovi lead generati ogni mese in media."
            formula={"Lead = Visitatori sito × Conversion rate\n\nOppure: somma contatti acquisiti da tutti i canali nel mese"} />
          <TextInput val={data.leadMensili} set={v => set("leadMensili", v)} placeholder="Es. 500" />
        </div>
        <div>
          <Label text="CAC Attuale"
            hint="Quanto spendi in media per acquisire un nuovo cliente."
            formula={"CAC = Budget Marketing totale ÷ Nuovi clienti acquisiti nello stesso periodo\n\nEs. 20.000€/mese ÷ 10 nuovi clienti = 2.000€ CAC"} />
          <TextInput val={data.cacAttuale} set={v => set("cacAttuale", v)} placeholder="Es. 1500" prefix="€" />
        </div>
      </div>
      <SliderField label="Tasso di Conversione MQL → SQL" val={data.tassoMqlSql} set={v => set("tassoMqlSql", v)}
        min={1} max={80} suffix="%"
        hint="Quanti MQL (Marketing Qualified Lead) diventano SQL (Sales Qualified Lead)."
        formula={"MQL→SQL = SQL qualificati ÷ MQL totali × 100\n\nBenchmark B2B SaaS: 15–30%"} />
      <SliderField label="Tasso di Chiusura SQL → Cliente" val={data.tassoSqlClose} set={v => set("tassoSqlClose", v)}
        min={1} max={80} suffix="%"
        hint="Quanti SQL diventano effettivamente clienti paganti."
        formula={"Close rate = Contratti firmati ÷ SQL inviati a Sales × 100\n\nBenchmark B2B: 15–25%"} />
      <SliderField label="Ciclo di Vendita Medio" val={data.cicloVendita} set={v => set("cicloVendita", v)}
        min={1} max={365} step={5} suffix=" gg"
        hint="Numero di giorni dal primo contatto alla firma del contratto."
        formula={"Ciclo medio = Somma giorni di tutte le trattative chiuse ÷ numero trattative chiuse"} />
    </div>
  );
}

/* ── Step 4 PMI ── */
function Step4PMI({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <Label text="Come trovano te i tuoi clienti attuali?" hint="Seleziona tutte le fonti applicabili." />
        <MultiCheck val={data.comeTrovaClienti} set={v => set("comeTrovaClienti", v)}
          options={["Passaparola","Social media","Google / SEO","Pubblicità online","Fiere / eventi","Contatto diretto (cold outreach)","Partner / agenti","Altro"]} />
      </div>
      <div>
        <Label text="Quante opportunità commerciali gestisci ogni mese?" hint="Una 'opportunità' = una trattativa aperta con un potenziale cliente." />
        <RadioGroup val={data.opportunitaMensili} set={v => set("opportunitaMensili", v)} options={[
          { value: "0-5",   label: "0–5" },
          { value: "5-15",  label: "5–15" },
          { value: "15-30", label: "15–30" },
          { value: "30-50", label: "30–50" },
          { value: "50+",   label: "50+" },
        ]} />
      </div>
      <div>
        <Label text="Quante di queste trattative si concludono positivamente (circa)?" />
        <RadioGroup val={data.tassoSuccessoPMI} set={v => set("tassoSuccessoPMI", v)} options={[
          { value: "< 10%", label: "Meno del 10%" },
          { value: "10-25%", label: "10–25%" },
          { value: "25-50%", label: "25–50%" },
          { value: "> 50%",  label: "Oltre il 50%" },
        ]} />
      </div>
      <div>
        <Label text="Quanto tempo passa di solito dal primo contatto all'acquisto?" />
        <RadioGroup val={data.tempoChiusuraPMI} set={v => set("tempoChiusuraPMI", v)} options={[
          { value: "giorni",  label: "Pochi giorni" },
          { value: "settimane", label: "Qualche settimana" },
          { value: "1-3mesi", label: "1–3 mesi" },
          { value: "3-6mesi", label: "3–6 mesi" },
          { value: "6m+",     label: "Oltre 6 mesi" },
        ]} />
      </div>
      <FormulaBox title="Formule per calcolare le tue metriche di acquisizione" rows={[
        { label: "CAC (Costo di Acquisizione Cliente):", formula: "CAC = Budget marketing mensile ÷ Nuovi clienti acquisiti nel mese" },
        { label: "LTV (Lifetime Value):", formula: "LTV = Scontrino medio × Frequenza acquisti × Anni di vita media del cliente" },
        { label: "Rapporto LTV/CAC sano:", formula: "LTV/CAC > 3x  (es. LTV 6.000€ / CAC 1.500€ = 4x — ottimo)" },
        { label: "Tasso di conversione medio:", formula: "Conv. rate = Clienti acquisiti ÷ Contatti totali generati × 100" },
      ]} />
    </div>
  );
}

/* ── Step 5 Enterprise ── */
function Step5Enterprise({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
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
          "Prezzo / Value for Money","UX / Facilità d'uso","Integrazioni native",
          "Customer Success dedicato","Specializzazione verticale","AI / Automazione avanzata",
          "Compliance / Sicurezza","Time-to-value più rapido","Altro",
        ]} />
      </div>
      <SliderField label="NPS Attuale (Net Promoter Score)" val={data.nps} set={v => set("nps", v)}
        min={-100} max={100}
        hint="Quanto i tuoi clienti ti raccomanderebbero? Scala da -100 a 100."
        formula={"NPS = % Promotori (9–10) - % Detrattori (0–6)\n\nBenchmark SaaS B2B eccellente: NPS > 50"} />
      <div>
        <Label text="Maturità del Team Marketing" hint="Valuta onestamente il livello attuale del tuo team e dei processi." />
        <RadioGroup val={data.maturitaMktg} set={v => set("maturitaMktg", v)} options={[
          { value: "Nascente",    label: "Nascente — appena avviato" },
          { value: "In sviluppo", label: "In sviluppo — processi parziali" },
          { value: "Strutturato", label: "Strutturato — team e tool attivi" },
          { value: "Avanzato",    label: "Avanzato — data-driven & scalable" },
        ]} />
      </div>
    </div>
  );
}

/* ── Step 5 PMI ── */
function Step5PMI({ data, set }: { data: AssessmentData; set: (k: keyof AssessmentData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <Label text="Chi sono i tuoi principali competitor?" hint="Anche indiretti o sostituti." />
        <div className="space-y-2.5">
          {(["competitor1","competitor2","competitor3"] as (keyof AssessmentData)[]).map((k, i) => (
            <TextInput key={k} val={data[k] as string} set={v => set(k, v)} placeholder={`Competitor ${i + 1}`} />
          ))}
        </div>
      </div>
      <div>
        <Label text="Cosa ti differenzia dalla concorrenza?" />
        <SelectInput val={data.differenziatore} set={v => set("differenziatore", v)} options={[
          "Prezzo / Value for Money","Qualità del prodotto / servizio","Servizio clienti personalizzato",
          "Specializzazione di nicchia","Velocità di consegna / risposta","Reputazione / fiducia locale",
          "Esperienza del team","Altro",
        ]} />
      </div>
      <div>
        <Label text="Cosa vuoi implementare per prima cosa?" hint="Seleziona le priorità per i prossimi 3–6 mesi." />
        <MultiCheck val={data.prossimaPriorita} set={v => set("prossimaPriorita", v)}
          options={["Creare/migliorare il sito web","Avviare campagne pubblicitarie","Costruire una presenza social","Creare contenuti / blog",
            "Implementare un CRM","Avviare email marketing","Definire un processo di vendita","Misurare i risultati"]} />
      </div>
      <div>
        <Label text="Chi si occupa del marketing nella tua azienda?" />
        <RadioGroup val={data.chiSiOccupa} set={v => set("chiSiOccupa", v)} options={[
          { value: "io",         label: "Lo faccio io stesso" },
          { value: "dipendente", label: "Un dipendente dedicato" },
          { value: "agenzia",    label: "Un'agenzia esterna" },
          { value: "freelance",  label: "Un freelance" },
          { value: "nessuno",    label: "Per ora nessuno" },
        ]} />
      </div>
      <div>
        <Label text="Maturità del Marketing" hint="Dove ti collocheresti onestamente?" />
        <RadioGroup val={data.maturitaMktg} set={v => set("maturitaMktg", v)} options={[
          { value: "Nascente",    label: "Nascente — sto iniziando" },
          { value: "In sviluppo", label: "Primissimi passi — qualcosa esiste" },
          { value: "Strutturato", label: "Ho un processo — ma non misuro tutto" },
          { value: "Avanzato",    label: "Misuro e ottimizzo regolarmente" },
        ]} />
      </div>
    </div>
  );
}

/* ── Summary ── */
function SummaryCard({ data }: { data: AssessmentData }) {
  const isPMI = data.mode === "pmi";
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

  const pmiKpis = (() => {
    const fatMap: Record<string, string> = {
      "< 100K €": "< 100K", "100K – 300K €": "~200K", "300K – 500K €": "~400K",
      "500K – 1M €": "~750K", "1M – 3M €": "~2M", "> 3M €": "> 3M",
    };
    const budgetMap: Record<string, string> = {
      "< 5K": "< 5K", "5-20K": "~12K", "20-50K": "~35K", "50-100K": "~75K", "> 100K": "> 100K",
    };
    return [
      { label: "Fase Business",   val: data.faseBusiness || "—",           sub: data.obiettivoPrincipale || "",    color: C.blue   },
      { label: "Fatturato",       val: fatMap[data.fatturatoPMI] || "—",   sub: `${data.clientiAttuali || "?"} clienti`, color: C.purple },
      { label: "Budget Mktg",     val: budgetMap[data.budgetFascia] || "—",sub: `${data.canaliPMI.length} canali`, color: C.amber  },
      { label: "Maturità",        val: data.maturitaMktg || "—",           sub: data.chiSiOccupa || "",            color: C.green  },
    ];
  })();

  const kpis = isPMI ? pmiKpis : [
    { label: "ARR Target",     val: target > 0 ? `€${(target/1000).toFixed(0)}K` : "—", sub: `+${growth}%`, color: C.blue   },
    { label: "Lead → Clienti", val: `${leads}→${won}/mo`, sub: `SQL ${sql}/mo`,          color: C.purple },
    { label: "Budget Annuale", val: budget > 0 ? `€${(budget/1000).toFixed(0)}K` : "—", sub: `${data.canaliAttivi.length} canali`, color: C.amber },
    { label: "LTV / CAC",      val: ltvCac,               sub: `CAC €${cac.toLocaleString("it-IT")}`, color: C.green },
  ];

  return (
    <div className="space-y-5">
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
          style={{ backgroundColor: C.green }}>
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold mb-1">Assessment Completato!</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {isPMI
            ? "Il tuo profilo PMI è stato salvato. Hai risposto a tutte le domande qualitative."
            : "Hai risposto a tutte le domande. I dati sono stati salvati e usati per calcoli e previsioni."}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
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
              <li>→ <strong>Dashboard</strong>: i tuoi KPI sono personalizzati sul tuo profilo reale</li>
              <li>→ <strong>ROI Calculator</strong>: i valori di default riflettono il tuo budget</li>
              <li>→ <strong>AI Strategist</strong>: il contesto aziendale guida ogni analisi AI</li>
              <li>→ <strong>Piano Marketing</strong>: obiettivi allineati al tuo target</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mode Selector ── */
function ModeSelector({ mode, onChange }: { mode: "enterprise" | "pmi"; onChange: (m: "enterprise" | "pmi") => void }) {
  const opts = [
    {
      id: "enterprise" as const,
      label: "Enterprise / Scale-up",
      sub: "Per aziende con team marketing strutturato e KPI quantitativi. Inserisci ARR, CAC, LTV e metriche di funnel reali.",
      color: C.purple,
      icon: <Briefcase className="w-5 h-5" />,
      tags: ["ARR & Metriche", "Team 5+ persone", "CRM avanzato"],
    },
    {
      id: "pmi" as const,
      label: "PMI & Startup",
      sub: "Per realtà in crescita che partono dai fondamentali. Domande qualitative con guide ai calcoli integrate.",
      color: C.green,
      icon: <Rocket className="w-5 h-5" />,
      tags: ["Qualitativo", "Guide ai calcoli", "Quick setup"],
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
      {opts.map(opt => {
        const active = mode === opt.id;
        return (
          <button key={opt.id} onClick={() => onChange(opt.id)}
            className="relative text-left rounded-2xl border p-5 transition-all overflow-hidden group"
            style={active
              ? { borderColor: `${opt.color}55`, background: `linear-gradient(135deg, ${opt.color}12 0%, ${opt.color}06 100%)`, boxShadow: `0 0 0 1px ${opt.color}30, 0 8px 32px ${opt.color}15` }
              : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            {active && <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${opt.color}, transparent)` }} />}
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all"
                style={active
                  ? { background: `linear-gradient(135deg, ${opt.color}30, ${opt.color}15)`, border: `1.5px solid ${opt.color}40`, color: opt.color }
                  : { background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-[14px]" style={{ color: active ? opt.color : "rgba(255,255,255,0.7)" }}>
                    {opt.label}
                  </p>
                  {active && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: `${opt.color}20`, color: opt.color }}>Selezionato</span>
                  )}
                </div>
                <p className="text-[12px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>{opt.sub}</p>
                <div className="flex flex-wrap gap-1.5">
                  {opt.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={active
                        ? { background: `${opt.color}15`, color: opt.color }
                        : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        );
      })}
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
  const isPMI = data.mode === "pmi";

  const STEP_TITLES = isPMI ? [
    { title: "Profilo Aziendale",       sub: "Raccontaci chi sei e in quale mercato operi" },
    { title: "Fase & Obiettivi",         sub: "Dove si trova la tua azienda e dove vuole arrivare" },
    { title: "Marketing & Budget",       sub: "Come comunichi e quanto investi" },
    { title: "Vendite & Acquisizione",   sub: "Come acquisisci e converti i clienti" },
    { title: "Concorrenza & Priorità",   sub: "Il tuo contesto competitivo e i prossimi passi" },
  ] : [
    { title: "Profilo Aziendale",        sub: "Raccontaci chi sei e in quale mercato operi" },
    { title: "Obiettivi di Crescita",    sub: "Definisci i target di business per i prossimi 12 mesi" },
    { title: "Budget & Canali",          sub: "Come investi il tuo budget marketing?" },
    { title: "Performance del Funnel",   sub: "Le metriche attuali del tuo processo di acquisizione" },
    { title: "Competitor & Posizione",   sub: "Il tuo contesto competitivo e il livello di maturità" },
  ];

  const handleNext = () => {
    if (step < STEPS.length) { setStep(s => s + 1); window.scrollTo(0, 0); }
    else {
      localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(data));
      setDone(true);
      toast({ title: "Assessment salvato", description: "I dati sono pronti per tutte le sezioni." });
    }
  };

  const renderStep = () => {
    if (step === 1) return <Step1 data={data} set={setField} />;
    if (step === 2) return isPMI ? <Step2PMI data={data} set={setField} /> : <Step2Enterprise data={data} set={setField} />;
    if (step === 3) return isPMI ? <Step3PMI data={data} set={setField} /> : <Step3Enterprise data={data} set={setField} />;
    if (step === 4) return isPMI ? <Step4PMI data={data} set={setField} /> : <Step4Enterprise data={data} set={setField} />;
    if (step === 5) return isPMI ? <Step5PMI data={data} set={setField} /> : <Step5Enterprise data={data} set={setField} />;
    return null;
  };

  const progressPct = Math.round(((step - 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero header */}
      <div className="relative overflow-hidden px-5 pt-8 pb-7"
        style={{ borderBottom: "1px solid rgba(124,58,237,0.15)", background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(37,99,235,0.06) 50%, rgba(249,115,22,0.04) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 80% at 80% -20%, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
        <div className="max-w-[860px] mx-auto relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #7C3AED, #2563EB)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-[26px] tracking-tight leading-none text-white">
                Profilo Aziendale
              </h1>
              <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Configura il contesto per personalizzare tutta la piattaforma
              </p>
            </div>
          </div>

          {/* Mode selector */}
          {!done && (
            <ModeSelector mode={data.mode} onChange={m => { setField("mode", m); setStep(1); setDone(false); }} />
          )}

          {/* Progress bar */}
          {!done && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 flex-1 mr-4">
                  {STEPS.map((s, i) => {
                    const past    = step > s.id;
                    const current = step === s.id;
                    return (
                      <div key={s.id} className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => past && setStep(s.id)} disabled={!past && !current}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                          style={current
                            ? { backgroundColor: `${s.color}18`, color: s.color, border: `1.5px solid ${s.color}40` }
                            : past
                              ? { color: C.green, cursor: "pointer" }
                              : { color: "rgba(255,255,255,0.3)", cursor: "default" }}>
                          <span className="w-4.5 h-4.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ backgroundColor: past ? C.green : current ? s.color : "rgba(255,255,255,0.2)" }}>
                            {past ? <CheckCircle2 className="w-2.5 h-2.5" /> : s.id}
                          </span>
                          {s.label}
                        </button>
                        {i < STEPS.length - 1 && <div className="w-4 h-px shrink-0" style={{ backgroundColor: past ? `${C.green}50` : "rgba(255,255,255,0.1)" }} />}
                      </div>
                    );
                  })}
                </div>
                <span className="text-[12px] font-bold shrink-0" style={{ color: stepColor }}>
                  {step}/{STEPS.length}
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${C.purple}, ${stepColor})` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-5 py-6">
        {!done ? (
          <>
            {/* Card */}
            <Card className="mb-5" style={{ border: `1px solid rgba(124,58,237,0.2)`, background: "rgba(255,255,255,0.02)" }}>
              <CardContent className="px-6 py-6">
                <div className="mb-5 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${stepColor}20`, border: `1.5px solid ${stepColor}30` }}>
                      <span style={{ color: stepColor }}>{STEPS[step-1].icon}</span>
                    </div>
                    <div className="flex-1">
                      <h2 className="font-extrabold text-[17px] leading-tight">{STEP_TITLES[step-1].title}</h2>
                      <p className="text-[12px] text-muted-foreground">{STEP_TITLES[step-1].sub}</p>
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${stepColor}15`, color: stepColor, border: `1px solid ${stepColor}30` }}>
                      Sezione {step} di {STEPS.length}
                    </span>
                  </div>
                </div>
                {renderStep()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button onClick={() => { if (step > 1) { setStep(s => s - 1); window.scrollTo(0, 0); } }}
                disabled={step === 1}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)" }}>
                <ChevronLeft className="w-4 h-4" /> Indietro
              </button>
              <button onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${stepColor}, ${C.blue})`, boxShadow: `0 4px 20px ${stepColor}35` }}>
                {step < STEPS.length
                  ? <><span>Avanti</span><ChevronRight className="w-4 h-4" /></>
                  : <><span>Completa Assessment</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </>
        ) : (
          <>
            <Card style={{ border: "1px solid rgba(22,163,74,0.25)", background: "rgba(22,163,74,0.04)" }}>
              <CardContent className="px-6 py-6">
                <SummaryCard data={data} />
              </CardContent>
            </Card>
            <div className="flex justify-center gap-3 mt-5">
              <button onClick={() => { setStep(1); setDone(false); }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)" }}>
                Modifica risposte
              </button>
              <button onClick={() => navigate("/")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`, boxShadow: "0 4px 20px rgba(37,99,235,0.35)" }}>
                Vai alla Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
