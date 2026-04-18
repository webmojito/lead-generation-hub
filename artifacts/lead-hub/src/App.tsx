import { Switch, Route, Router as WouterRouter, useLocation, Link } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import RoiCalculator from "@/pages/RoiCalculator";
import AiStrategist from "@/pages/AiStrategist";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const NAV_ITEMS = [
  { href: "/",              label: "Dashboard",      icon: "📊" },
  { href: "/roi-calculator", label: "ROI Calculator", icon: "🧮" },
  { href: "/ai-strategist",  label: "AI Strategist",  icon: "🤖" },
];

function NavBar() {
  const [location] = useLocation();
  return (
    <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md print:hidden">
      <div className="max-w-[1400px] mx-auto px-5 flex items-center gap-1 h-12">
        <div className="flex items-center gap-1.5 mr-6">
          <span className="text-lg">🚀</span>
          <span className="font-extrabold text-sm tracking-tight text-foreground">Lead Hub</span>
        </div>
        {NAV_ITEMS.map(item => {
          const active = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={active
                ? { backgroundColor: "rgba(0,121,242,0.15)", color: "#0079F2" }
                : { color: "var(--muted-foreground)" }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <NavBar />
      <Switch>
        <Route path="/"               component={Dashboard} />
        <Route path="/roi-calculator" component={RoiCalculator} />
        <Route path="/ai-strategist"  component={AiStrategist} />
        <Route component={NotFound} />
      </Switch>
    </>
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
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
