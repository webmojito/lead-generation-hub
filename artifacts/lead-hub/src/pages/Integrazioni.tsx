import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plug, CheckCircle2, XCircle, AlertCircle, RefreshCw,
  Settings, ExternalLink, Zap, Database, Mail, BarChart3,
  ShoppingCart, MessageSquare, Globe, ChevronRight, Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const C = { blue: "#2563EB", purple: "#7C3AED", green: "#16A34A", red: "#DC2626", amber: "#F97316", cyan: "#06B6D4" };
const GRAD = "linear-gradient(135deg, #7C3AED 0%, #2563EB 55%, #F97316 100%)";

type ConnStatus = "connected" | "disconnected" | "error" | "pending";

interface Integration {
  id: string; name: string; desc: string; category: string;
  status: ConnStatus; lastSync?: string; records?: string;
  logoUrl: string; logoColor: string; logoBg: string; docsUrl?: string;
}

const SI = (slug: string, hex: string) => `https://cdn.simpleicons.org/${slug}/${hex}`;

const INTEGRATIONS: Integration[] = [
  /* CRM */
  { id: "salesforce",     name: "Salesforce",         category: "CRM",         status: "disconnected", logoUrl: SI("salesforce","00A1E0"),       logoColor: "#00A1E0", logoBg: "#00A1E015", desc: "Sincronizza Lead, Opportunity e Account dal tuo CRM enterprise.",           docsUrl: "https://salesforce.com" },
  { id: "hubspot",        name: "HubSpot",             category: "CRM",         status: "connected",    lastSync: "2 min fa", records: "1.243 contatti", logoUrl: SI("hubspot","FF7A59"), logoColor: "#FF7A59", logoBg: "#FF7A5915", desc: "CRM marketing automation — Lead, Deal, Contact sync bidirezionale." },
  { id: "pipedrive",      name: "Pipedrive",           category: "CRM",         status: "disconnected", logoUrl: SI("pipedrive","00C44F"),         logoColor: "#00C44F", logoBg: "#00C44F15", desc: "Pipeline vendite e tracking opportunità per team sales SMB." },
  /* Email */
  { id: "mailchimp",      name: "Mailchimp",           category: "Email",       status: "connected",    lastSync: "1h fa", records: "3.891 iscritti", logoUrl: SI("mailchimp","FFE01B"),   logoColor: "#FFE01B", logoBg: "#FFE01B15", desc: "Gestisci le tue liste email, campagne e automation da un'unica interfaccia." },
  { id: "activecampaign", name: "ActiveCampaign",      category: "Email",       status: "error",        lastSync: "Errore 401",                    logoUrl: SI("activecampaign","356AE6"), logoColor: "#356AE6", logoBg: "#356AE615", desc: "Marketing automation e email marketing per B2B e B2C." },
  { id: "brevo",          name: "Brevo",               category: "Email",       status: "disconnected", logoUrl: SI("brevo","0B996E"),             logoColor: "#0B996E", logoBg: "#0B996E15", desc: "Piattaforma email + SMS + WhatsApp per campagne multicanale." },
  /* Analytics */
  { id: "ga4",            name: "Google Analytics 4",  category: "Analytics",   status: "connected",    lastSync: "5 min fa", records: "12.4K sessioni/mese", logoUrl: SI("googleanalytics","E37400"), logoColor: "#E37400", logoBg: "#E3740015", desc: "Tracciamento comportamento utenti, conversioni e attribuzione campagne." },
  { id: "mixpanel",       name: "Mixpanel",            category: "Analytics",   status: "disconnected", logoUrl: SI("mixpanel","7856FF"),          logoColor: "#7856FF", logoBg: "#7856FF15", desc: "Product analytics e funnel di engagement per app SaaS." },
  /* Ads */
  { id: "google_ads",     name: "Google Ads",          category: "Advertising", status: "connected",    lastSync: "15 min fa", records: "€4.2K spesa/mese", logoUrl: SI("googleads","4285F4"), logoColor: "#4285F4", logoBg: "#4285F415", desc: "Import automatico campagne, spend e lead form da Google Ads." },
  { id: "linkedin_ads",   name: "LinkedIn Ads",        category: "Advertising", status: "pending",      logoUrl: SI("linkedin","0A66C2"),          logoColor: "#0A66C2", logoBg: "#0A66C215", desc: "Sincronizzazione campagne, lead gen forms e audience insights LinkedIn." },
  { id: "meta_ads",       name: "Meta Ads",            category: "Advertising", status: "disconnected", logoUrl: SI("meta","0081FB"),              logoColor: "#0081FB", logoBg: "#0081FB15", desc: "Campagne Facebook e Instagram Ads — import conversioni e ROAS." },
  /* Collaboration */
  { id: "slack",          name: "Slack",               category: "Notifiche",   status: "connected",    lastSync: "live", records: "#marketing-alerts", logoUrl: SI("slack","E01E5A"), logoColor: "#E01E5A", logoBg: "#E01E5A15", desc: "Ricevi alert real-time su anomalie KPI e notifiche campagne." },
  { id: "notion",         name: "Notion",              category: "Notifiche",   status: "disconnected", logoUrl: SI("notion","FFFFFF"),            logoColor: "#FFFFFF", logoBg: "#FFFFFF10", desc: "Sincronizza il Piano Marketing e i report direttamente in Notion." },
  { id: "zapier",         name: "Zapier",              category: "Automazione", status: "disconnected", logoUrl: SI("zapier","FF4A00"),            logoColor: "#FF4A00", logoBg: "#FF4A0015", desc: "Connetti Lead Hub con oltre 5.000 app tramite workflow no-code." },
];

const CATEGORIES = ["Tutte", "CRM", "Email", "Analytics", "Advertising", "Notifiche", "Automazione"];

const STATUS_CONFIG: Record<ConnStatus, { label: string; color: string; icon: any; bg: string }> = {
  connected:    { label: "Connesso",    color: C.green, icon: CheckCircle2,  bg: `${C.green}15`   },
  disconnected: { label: "Non connesso", color: "rgba(255,255,255,0.35)", icon: XCircle, bg: "rgba(255,255,255,0.05)" },
  error:        { label: "Errore",      color: C.red,   icon: AlertCircle,   bg: `${C.red}15`     },
  pending:      { label: "In attesa",   color: C.amber, icon: RefreshCw,     bg: `${C.amber}15`   },
};

function IntegrationCard({ intg, onToggle }: { intg: Integration; onToggle: (id: string) => void }) {
  const cfg = STATUS_CONFIG[intg.status];
  const StatusIcon = cfg.icon;
  const isConnected = intg.status === "connected";
  const isError     = intg.status === "error";

  return (
    <Card className="flex flex-col transition-all hover:border-primary/30" style={{ borderColor: isConnected ? `${C.green}30` : isError ? `${C.red}20` : undefined }}>
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: intg.logoBg, border: `1px solid ${intg.logoColor}30` }}>
            <img src={intg.logoUrl} alt={intg.name} className="w-5 h-5 object-contain" loading="lazy" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-[14px] font-bold">{intg.name}</CardTitle>
              <Badge className="text-[9px] font-bold px-1.5 py-0 border" style={{ color: "rgba(255,255,255,0.45)", borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.06)" }}>
                {intg.category}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <StatusIcon className="w-3 h-3" style={{ color: cfg.color }} />
              <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
              {intg.lastSync && <span className="text-[10px] text-muted-foreground">— {intg.lastSync}</span>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 flex-1 flex flex-col gap-3">
        <p className="text-[12px] text-muted-foreground leading-relaxed flex-1">{intg.desc}</p>
        {intg.records && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${C.green}10` }}>
            <Database className="w-3 h-3" style={{ color: C.green }} />
            <span className="text-[11px] font-semibold" style={{ color: C.green }}>{intg.records}</span>
          </div>
        )}
        <div className="flex gap-2 mt-1">
          <button onClick={() => onToggle(intg.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={isConnected
              ? { backgroundColor: `${C.red}12`, color: C.red, border: `1px solid ${C.red}25` }
              : { background: GRAD, color: "#fff" }}>
            {isConnected ? <><XCircle className="w-3 h-3" /> Disconnetti</> : <><Plus className="w-3 h-3" /> Connetti</>}
          </button>
          {isConnected && (
            <button className="px-3 py-2 rounded-xl text-xs font-semibold border border-border transition-all hover:bg-muted/30">
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          {intg.docsUrl && (
            <a href={intg.docsUrl} target="_blank" rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-border transition-all hover:bg-muted/30">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Integrazioni() {
  const [category, setCategory] = useState("Tutte");
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const { toast } = useToast();

  const filtered = category === "Tutte" ? integrations : integrations.filter(i => i.category === category);

  const connected = integrations.filter(i => i.status === "connected").length;
  const errors    = integrations.filter(i => i.status === "error").length;

  const handleToggle = (id: string) => {
    setIntegrations(prev => prev.map(intg => {
      if (intg.id !== id) return intg;
      if (intg.status === "connected") {
        toast({ title: `${intg.name} disconnesso`, description: "La sincronizzazione è stata interrotta." });
        return { ...intg, status: "disconnected" as ConnStatus, lastSync: undefined, records: undefined };
      } else {
        toast({ title: `${intg.name} — configurazione avviata`, description: "Inserisci le credenziali nella finestra che si aprirà." });
        return { ...intg, status: "pending" as ConnStatus, lastSync: "In corso…" };
      }
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1200px] mx-auto px-5 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-extrabold text-[28px] tracking-tight leading-none">Integrazioni</h1>
            <p className="text-muted-foreground mt-1.5 text-[14px]">
              Connetti Lead Hub ai tuoi CRM, strumenti di email, advertising e analytics.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: GRAD }}>
            <Plug className="w-4 h-4" /> Richiedi integrazione
          </button>
        </div>

        {/* Status bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Integrazioni Totali",  value: String(integrations.length), color: C.blue,   icon: Plug        },
            { label: "Connesse",             value: String(connected),           color: C.green,  icon: CheckCircle2 },
            { label: "Con Errori",           value: String(errors),             color: C.red,    icon: AlertCircle  },
            { label: "Dati Sincronizzati",   value: "17.5K",                    color: C.amber,  icon: Database     },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="rounded-xl border border-border px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-extrabold leading-tight" style={{ color: s.color }}>{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => {
            const icons: Record<string, any> = {
              "Tutte": Globe, "CRM": Database, "Email": Mail, "Analytics": BarChart3,
              "Advertising": Zap, "Notifiche": MessageSquare, "Automazione": RefreshCw,
            };
            const Icon = icons[cat] ?? Globe;
            return (
              <button key={cat} onClick={() => setCategory(cat)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all"
                style={category === cat
                  ? { background: GRAD, color: "#fff", border: "1px solid transparent" }
                  : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                <Icon className="w-3 h-3" />{cat}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(intg => (
            <IntegrationCard key={intg.id} intg={intg} onToggle={handleToggle} />
          ))}
        </div>

        {/* Webhook / API section */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${C.purple}20` }}>
                <Globe className="w-4 h-4" style={{ color: C.purple }} />
              </div>
              <div>
                <CardTitle className="text-[14px] font-bold">API & Webhook personalizzato</CardTitle>
                <CardDescription className="text-xs mt-0.5">Integra qualsiasi sistema esterno tramite REST API o webhook</CardDescription>
              </div>
              <Badge className="ml-auto text-[9px] font-bold" style={{ backgroundColor: `${C.purple}20`, color: C.purple, border: `1px solid ${C.purple}30` }}>
                PRO
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "REST API",     desc: "Accedi a tutti i dati di Lead Hub via API con autenticazione Bearer token.", action: "Genera API Key" },
              { title: "Webhook Push", desc: "Ricevi notifiche in real-time su eventi Lead Hub nel tuo endpoint personalizzato.", action: "Configura Endpoint" },
              { title: "Import CSV",   desc: "Importa dati da qualsiasi sistema tramite file CSV con field mapping automatico.", action: "Vai a Import Dati" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-border">
                <p className="text-sm font-bold mb-1">{item.title}</p>
                <p className="text-[11px] text-muted-foreground mb-3">{item.desc}</p>
                <button className="flex items-center gap-1.5 text-[12px] font-semibold transition-colors hover:opacity-80" style={{ color: C.blue }}>
                  {item.action} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
