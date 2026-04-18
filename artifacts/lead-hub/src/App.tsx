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
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const PRIMARY = "#2563EB";

const NAV_ITEMS = [
  { href: "/",                label: "Dashboard",       icon: "📊", desc: "KPI & Funnel" },
  { href: "/roi-calculator",  label: "ROI Calculator",  icon: "🧮", desc: "Simulatore" },
  { href: "/ai-strategist",   label: "AI Strategist",   icon: "🤖", desc: "Analisi AI" },
  { href: "/piano-marketing", label: "Piano Marketing", icon: "🗺️", desc: "Strategia" },
  { href: "/import-dati",     label: "Import Dati",     icon: "📥", desc: "CSV / Excel" },
];

function Sidebar() {
  const [location] = useLocation();
  return (
    <aside className="w-[220px] shrink-0 flex flex-col border-r border-border bg-card print:hidden" style={{ minHeight: "100vh" }}>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: PRIMARY }}>
            L
          </div>
          <div>
            <p className="font-extrabold text-[15px] tracking-tight leading-none">Lead Hub</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Intelligence Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-3">
          Navigazione
        </p>
        {NAV_ITEMS.map(item => {
          const active = location === item.href;
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
              style={active
                ? { backgroundColor: `${PRIMARY}12`, color: PRIMARY, fontWeight: 700 }
                : {}}>
              <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-[13px] leading-none truncate" style={active ? { color: PRIMARY, fontWeight: 700 } : { color: "var(--foreground)", fontWeight: 500 }}>
                  {item.label}
                </p>
                <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>
                  {item.desc}
                </p>
              </div>
              {active && (
                <div className="ml-auto w-1.5 h-5 rounded-full shrink-0" style={{ backgroundColor: PRIMARY }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer sidebar */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: PRIMARY }}>
            MK
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold truncate">Marketing Team</p>
            <p className="text-[10px] text-muted-foreground truncate">Q2 2025</p>
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
          <Route path="/"                component={Dashboard} />
          <Route path="/roi-calculator"  component={RoiCalculator} />
          <Route path="/ai-strategist"   component={AiStrategist} />
          <Route path="/piano-marketing" component={PianoMarketing} />
          <Route path="/import-dati"     component={ImportDati} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

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
