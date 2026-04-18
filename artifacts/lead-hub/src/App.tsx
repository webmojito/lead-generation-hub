import { Switch, Route, Router as WouterRouter, useLocation, Link } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import RoiCalculator from "@/pages/RoiCalculator";
import AiStrategist from "@/pages/AiStrategist";
import PianoMarketing from "@/pages/PianoMarketing";
import ImportDati from "@/pages/ImportDati";
import Reporting from "@/pages/Reporting";
import Integrazioni from "@/pages/Integrazioni";
import Assessment, { ASSESSMENT_KEY } from "@/pages/Assessment";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Calculator, Bot, Map, Upload,
  ClipboardList, ChevronRight, Users, BarChart3, Plug,
  Settings, LogOut, X, Bell, Globe, Palette, FileSpreadsheet,
  Moon, Euro, Shield,
} from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const GRAD = "linear-gradient(135deg, #7C3AED 0%, #2563EB 55%, #F97316 100%)";
const GRAD_ORANGE_PURPLE = "linear-gradient(135deg, #F97316 0%, #7C3AED 100%)";

function CoraJEMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="igLogo" x1="3" y1="33" x2="30" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#405DE6" />
          <stop offset="22%"  stopColor="#833AB4" />
          <stop offset="50%"  stopColor="#C13584" />
          <stop offset="75%"  stopColor="#F77737" />
          <stop offset="100%" stopColor="#FCAF45" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="9" fill="url(#igLogo)" opacity="0.14" />
      <path d="M24 17H9C9 11.4 12.5 7 17.5 7C22.5 7 26 11.4 26 17"
        stroke="url(#igLogo)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M9 17H24"
        stroke="url(#igLogo)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M9 17C9 22.6 12.5 26 17.5 26C21 26 23.8 23.8 25 20.5"
        stroke="url(#igLogo)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M22 10L28 3" stroke="url(#igLogo)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 3L28 3L28 7" stroke="url(#igLogo)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const NAV_MAIN = [
  { href: "/assessment",      label: "Assessment",      icon: ClipboardList,   desc: "Profilo aziendale", highlight: true },
  { href: "/",                label: "Dashboard",       icon: LayoutDashboard, desc: "KPI & Funnel" },
  { href: "/roi-calculator",  label: "ROI Calculator",  icon: Calculator,      desc: "Simulatore ROI" },
  { href: "/ai-strategist",   label: "AI Strategist",   icon: Bot,             desc: "Analisi AI" },
  { href: "/piano-marketing", label: "Piano Marketing", icon: Map,             desc: "Strategia" },
  { href: "/reporting",       label: "Reporting",       icon: BarChart3,       desc: "Report consolidati" },
];

const NAV_TOOLS = [
  { href: "/import-dati",  label: "Import Dati",  icon: Upload, desc: "CSV / Excel" },
  { href: "/integrazioni", label: "Integrazioni", icon: Plug,   desc: "CRM & Tools" },
];

function NavItem({ item, active, assessed }: { item: typeof NAV_MAIN[0]; active: boolean; assessed: boolean }) {
  const showDot = (item as any).highlight && !assessed;
  const Icon = item.icon;
  return (
    <Link href={item.href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden"
      style={active
        ? { background: "linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(37,99,235,0.18) 100%)", border: "1px solid rgba(124,58,237,0.35)" }
        : { border: "1px solid transparent" }}>
      {active && <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: GRAD }} />}
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
        style={active
          ? { background: GRAD, boxShadow: "0 2px 12px rgba(124,58,237,0.45)" }
          : { background: "rgba(255,255,255,0.06)" }}>
        <Icon className="w-3.5 h-3.5" style={{ color: active ? "#fff" : "rgba(255,255,255,0.55)" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-none truncate" style={{ color: active ? "#fff" : "rgba(255,255,255,0.65)", fontWeight: active ? 700 : 500 }}>
          {item.label}
        </p>
        <p className="text-[10px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.3)" }}>{item.desc}</p>
      </div>
      {showDot && !active && <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: "#F97316" }} />}
      {active && <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />}
    </Link>
  );
}

/* ── Settings Panel ── */
function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [notif, setNotif]     = useState(true);
  const [compact, setCompact] = useState(false);
  const [currency, setCurrency] = useState("EUR");
  const [lang, setLang]       = useState("IT");
  const [exportFmt, setExportFmt] = useState("xlsx");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-[480px] rounded-2xl border overflow-hidden mx-4 mb-4 sm:mb-0"
        style={{ background: "linear-gradient(180deg, #0D0A1E 0%, #0A0814 100%)", borderColor: "rgba(124,58,237,0.3)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(124,58,237,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: GRAD }}>
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-[15px] text-white">Impostazioni</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Personalizza la piattaforma</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Sezione Interfaccia */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Interfaccia</p>
            <div className="space-y-3">
              <SettingRow icon={<Moon className="w-3.5 h-3.5" />} label="Tema" desc="Dark mode attivo">
                <span className="text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: "rgba(124,58,237,0.2)", color: "#A78BFA" }}>Dark</span>
              </SettingRow>
              <SettingRow icon={<Palette className="w-3.5 h-3.5" />} label="Vista compatta" desc="Riduce spaziature">
                <Toggle val={compact} set={setCompact} />
              </SettingRow>
              <SettingRow icon={<Globe className="w-3.5 h-3.5" />} label="Lingua" desc="Lingua dell'interfaccia">
                <select value={lang} onChange={e => setLang(e.target.value)}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}>
                  <option value="IT">Italiano</option>
                  <option value="EN">English</option>
                </select>
              </SettingRow>
            </div>
          </div>

          {/* Sezione Dati */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Dati & Export</p>
            <div className="space-y-3">
              <SettingRow icon={<Euro className="w-3.5 h-3.5" />} label="Valuta" desc="Usata in tutto il sistema">
                <select value={currency} onChange={e => setCurrency(e.target.value)}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dollaro</option>
                  <option value="GBP">GBP - Sterlina</option>
                </select>
              </SettingRow>
              <SettingRow icon={<FileSpreadsheet className="w-3.5 h-3.5" />} label="Formato export default" desc="Usato per i download rapidi">
                <select value={exportFmt} onChange={e => setExportFmt(e.target.value)}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}>
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </SettingRow>
            </div>
          </div>

          {/* Sezione Notifiche */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Notifiche</p>
            <div className="space-y-3">
              <SettingRow icon={<Bell className="w-3.5 h-3.5" />} label="Alert KPI" desc="Notifiche su variazioni critiche">
                <Toggle val={notif} set={setNotif} />
              </SettingRow>
            </div>
          </div>

          {/* Sezione Sicurezza */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Account</p>
            <div className="space-y-3">
              <SettingRow icon={<Shield className="w-3.5 h-3.5" />} label="Workspace" desc="Marketing Team - Q2 2025">
                <span className="text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: "rgba(22,163,74,0.15)", color: "#4ADE80" }}>Attivo</span>
              </SettingRow>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: "rgba(124,58,237,0.2)" }}>
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
            style={{ background: GRAD }}>
            Salva Impostazioni
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, desc, children }: { icon: React.ReactNode; label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)", color: "#A78BFA" }}>
          {icon}
        </div>
        <div>
          <p className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{label}</p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ val, set }: { val: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!val)} className="relative w-9 h-5 rounded-full transition-all shrink-0"
      style={{ background: val ? "linear-gradient(135deg,#7C3AED,#2563EB)" : "rgba(255,255,255,0.15)" }}>
      <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
        style={{ left: val ? "calc(100% - 1.1rem)" : "2px" }} />
    </button>
  );
}

/* ── Logout Confirm ── */
function LogoutConfirm({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-[340px] rounded-2xl border mx-4 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0D0A1E 0%, #0A0814 100%)", borderColor: "rgba(220,38,38,0.35)" }}>
        <div className="px-6 py-5 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(220,38,38,0.15)", border: "1.5px solid rgba(220,38,38,0.3)" }}>
            <LogOut className="w-5 h-5" style={{ color: "#F87171" }} />
          </div>
          <p className="font-bold text-[16px] text-white mb-1">Esci dal workspace</p>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>Stai per uscire dalla sessione corrente di Marketing Team.</p>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
            Annulla
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
            style={{ background: "linear-gradient(135deg,#DC2626,#991B1B)" }}>
            Esci
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const [location] = useLocation();
  const [assessed, setAssessed]       = useState(!!localStorage.getItem(ASSESSMENT_KEY));
  const [showSettings, setSettings]   = useState(false);
  const [showLogout, setLogout]       = useState(false);

  useEffect(() => {
    const check = () => setAssessed(!!localStorage.getItem(ASSESSMENT_KEY));
    window.addEventListener("storage", check);
    const interval = setInterval(check, 1000);
    return () => { window.removeEventListener("storage", check); clearInterval(interval); };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(ASSESSMENT_KEY);
    setLogout(false);
    window.location.href = "/";
  };

  return (
    <>
      {showSettings && <SettingsPanel onClose={() => setSettings(false)} />}
      {showLogout   && <LogoutConfirm onClose={() => setLogout(false)} onConfirm={handleLogout} />}

      <aside className="w-[228px] shrink-0 flex flex-col print:hidden"
        style={{ height: "100vh", position: "sticky", top: 0, background: "linear-gradient(180deg, #090714 0%, #0D0A1E 60%, #100A1A 100%)", borderRight: "1px solid rgba(124,58,237,0.18)", overflowY: "auto" }}>

        {/* Brand */}
        <div className="px-5 py-5 shrink-0" style={{ borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
          <div className="flex items-center gap-3">
            <CoraJEMark size={34} />
            <div>
              <p className="font-extrabold text-[15px] tracking-tight leading-none"
                style={{ background: GRAD_ORANGE_PURPLE, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Lead Hub
              </p>
              <p className="text-[8.5px] font-semibold tracking-[0.16em] uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.32)" }}>
                Growth Intelligence Platform
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] px-3 mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            Piattaforma
          </p>
          {NAV_MAIN.map(item => (
            <NavItem key={item.href} item={item} active={location === item.href} assessed={assessed} />
          ))}

          <div className="pt-4 pb-1">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] px-3 mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              Strumenti
            </p>
            {NAV_TOOLS.map(item => (
              <NavItem key={item.href} item={item as any} active={location === item.href} assessed={assessed} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 shrink-0" style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}>
          {/* User info + settings */}
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl mb-2 group" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: GRAD }}>
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.8)" }}>Marketing Team</p>
              <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>Q2 2025</p>
            </div>
            <button onClick={() => setSettings(true)}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 shrink-0"
              title="Impostazioni">
              <Settings className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
          </div>

          {/* Logout */}
          <button onClick={() => setLogout(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors hover:bg-red-500/10 group"
            style={{ border: "1px solid transparent" }}>
            <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(220,38,38,0.12)" }}>
              <LogOut className="w-3 h-3" style={{ color: "#F87171" }} />
            </div>
            <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function AppLayout() {
  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ height: "100vh" }}>
        <Switch>
          <Route path="/assessment"      component={Assessment} />
          <Route path="/"                component={Dashboard} />
          <Route path="/roi-calculator"  component={RoiCalculator} />
          <Route path="/ai-strategist"   component={AiStrategist} />
          <Route path="/piano-marketing" component={PianoMarketing} />
          <Route path="/reporting"       component={Reporting} />
          <Route path="/import-dati"     component={ImportDati} />
          <Route path="/integrazioni"    component={Integrazioni} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  useEffect(() => { document.documentElement.classList.add("dark"); }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppLayout />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
