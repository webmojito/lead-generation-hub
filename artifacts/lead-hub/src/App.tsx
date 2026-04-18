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
  { href: "/import-dati",     label: "Import Dati",     icon: Upload,          desc: "CSV / Excel" },
];

const NAV_EXTRA = [
  { href: "/reporting",    label: "Reporting",     icon: BarChart3, desc: "Report consolidati" },
  { href: "/integrazioni", label: "Integrazioni",  icon: Plug,      desc: "CRM & Tools" },
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

function Sidebar() {
  const [location] = useLocation();
  const [assessed, setAssessed] = useState(!!localStorage.getItem(ASSESSMENT_KEY));

  useEffect(() => {
    const check = () => setAssessed(!!localStorage.getItem(ASSESSMENT_KEY));
    window.addEventListener("storage", check);
    const interval = setInterval(check, 1000);
    return () => { window.removeEventListener("storage", check); clearInterval(interval); };
  }, []);

  return (
    <aside className="w-[228px] shrink-0 flex flex-col print:hidden"
      style={{ minHeight: "100vh", background: "linear-gradient(180deg, #090714 0%, #0D0A1E 60%, #100A1A 100%)", borderRight: "1px solid rgba(124,58,237,0.18)" }}>

      {/* Brand */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
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

      {/* Nav main */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] px-3 mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
          Piattaforma
        </p>
        {NAV_MAIN.map(item => (
          <NavItem key={item.href} item={item} active={location === item.href} assessed={assessed} />
        ))}

        <div className="pt-4 pb-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] px-3 mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            Sezioni Collaterali
          </p>
          {NAV_EXTRA.map(item => (
            <NavItem key={item.href} item={item as any} active={location === item.href} assessed={assessed} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: GRAD }}>
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.8)" }}>Marketing Team</p>
            <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>Q2 2025</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function AppLayout() {
  return (
    <div className="flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto" style={{ minHeight: "100vh" }}>
        <Switch>
          <Route path="/assessment"      component={Assessment} />
          <Route path="/"                component={Dashboard} />
          <Route path="/roi-calculator"  component={RoiCalculator} />
          <Route path="/ai-strategist"   component={AiStrategist} />
          <Route path="/piano-marketing" component={PianoMarketing} />
          <Route path="/import-dati"     component={ImportDati} />
          <Route path="/reporting"       component={Reporting} />
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
