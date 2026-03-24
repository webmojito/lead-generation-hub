import { useState, useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetDashboardKpis,
  useGetFunnelVelocity,
  useGetChannelPerformance,
  useGetTopChannels,
} from "@workspace/api-client-react";
import { CSVLink } from "react-csv";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  RefreshCw,
  ChevronDown,
  Sun,
  Moon,
  Printer,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  AlertTriangle,
  Clock,
  Users
} from "lucide-react";

const CHART_COLORS = {
  blue: "#0079F2",
  purple: "#795EFF",
  green: "#009118",
  red: "#A60808",
  amber: "#F59E0B",
  pink: "#ec4899",
};

const DATA_SOURCES = ["App DB", "Salesforce", "Marketo"];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white rounded-md p-3 border border-gray-200 text-gray-900 text-[13px] shadow-sm">
      <div className="mb-2 font-medium flex items-center gap-1.5">
        {label}
      </div>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 mt-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}</span>
          <span className="ml-auto font-semibold">
            {typeof entry.value === "number" && entry.name.includes("Goal") 
              ? entry.value.toLocaleString()
              : typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload || payload.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] mt-2">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5 text-muted-foreground">
          <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [isDark, setIsDark] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Queries
  const kpisQuery = useGetDashboardKpis();
  const velocityQuery = useGetFunnelVelocity();
  const performanceQuery = useGetChannelPerformance();
  const topChannelsQuery = useGetTopChannels();

  const loading = kpisQuery.isLoading || kpisQuery.isFetching || 
                  velocityQuery.isLoading || velocityQuery.isFetching ||
                  performanceQuery.isLoading || performanceQuery.isFetching ||
                  topChannelsQuery.isLoading || topChannelsQuery.isFetching;

  // Dark mode effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Click outside for dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Spin animation effect
  useEffect(() => {
    if (loading) {
      setIsSpinning(true);
    } else {
      const t = setTimeout(() => setIsSpinning(false), 600);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const lastRefreshed = kpisQuery.dataUpdatedAt
    ? new Date(kpisQuery.dataUpdatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase() + " on " + new Date(kpisQuery.dataUpdatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  // Table Config
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "name",
      header: "CHANNEL NAME",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <span className="text-xl">{row.original.icon}</span>
          {row.original.name}
        </div>
      ),
    },
    { accessorKey: "mqls", header: "MQLs", cell: ({ getValue }) => (getValue() as number).toLocaleString() },
    { accessorKey: "sqls", header: "SQLs", cell: ({ getValue }) => (getValue() as number).toLocaleString() },
    {
      accessorKey: "conversionRate",
      header: "CONVERSION",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Progress value={row.original.conversionRate} className="h-2 w-16" />
          <span className="text-xs text-muted-foreground">{row.original.conversionRate.toFixed(1)}%</span>
        </div>
      ),
    },
    { accessorKey: "pipelineContribution", header: "% PIPELINE", cell: ({ getValue }) => `${(getValue() as number).toFixed(1)}%` },
    { accessorKey: "wonContribution", header: "% WON", cell: ({ getValue }) => `${(getValue() as number).toFixed(1)}%` },
    { accessorKey: "roi", header: "ROI", cell: ({ getValue }) => <span className="font-medium text-green-500">{getValue() as number}x</span> },
    {
      accessorKey: "trend",
      header: "TREND",
      cell: ({ row }) => {
        const t = row.original.trend;
        if (t === "up") return <ArrowUpRight className="w-4 h-4 text-green-500" />;
        if (t === "down") return <ArrowDownRight className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-gray-500" />;
      },
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

  const kpis = kpisQuery.data;
  const velocityData = velocityQuery.data || [];
  const topChannels = topChannelsQuery.data;

  const donutData = kpis ? [
    { name: "Achieved", value: kpis.performanceVsGoal },
    { name: "Remaining", value: 100 - kpis.performanceVsGoal }
  ] : [];

  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5";
  const tickColor = isDark ? "#98999C" : "#71717a";

  const renderTrend = (val: number, inverse = false) => {
    const isUp = val >= 0;
    const isPositive = inverse ? !isUp : isUp;
    const colorClass = isPositive ? "text-green-500" : "text-red-500";
    const Icon = isUp ? ArrowUp : ArrowDown;
    return (
      <div className={`flex items-center text-xs font-medium ${colorClass}`}>
        <Icon className="w-3 h-3 mr-0.5" />
        {Math.abs(val)}%
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-bold text-[32px] tracking-tight">Lead Intelligence Hub 🚀</h1>
            <p className="text-muted-foreground mt-1 text-[15px]">Real-time demand signals and funnel velocity tracking.</p>
            {DATA_SOURCES.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[12px] text-muted-foreground shrink-0">Data Sources:</span>
                {DATA_SOURCES.map((source) => (
                  <span
                    key={source}
                    className="text-[12px] font-semibold rounded px-2 py-0.5 truncate print:!bg-[rgb(229,231,235)] print:!text-[rgb(75,85,99)]"
                    style={{
                      maxWidth: "20ch",
                      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgb(229, 231, 235)",
                      color: isDark ? "#c8c9cc" : "rgb(75, 85, 99)",
                    }}
                  >
                    {source}
                  </span>
                ))}
              </div>
            )}
            {lastRefreshed && <p className="text-[12px] text-muted-foreground mt-1">Last refresh: {lastRefreshed}</p>}
          </div>

          <div className="flex flex-col items-end gap-3 print:hidden">
            <div className="flex bg-muted/50 rounded-lg p-1">
              {['7D', '30D', 'Q1', 'YTD'].map(lbl => (
                <button key={lbl} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${lbl === '30D' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {lbl}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative" ref={dropdownRef}>
                <div
                  className="flex items-center rounded-[6px] overflow-hidden h-[26px] text-[12px]"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }}
                >
                  <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-1 px-2 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50 font-medium">
                    <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                  <div className="w-px h-4 shrink-0" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }} />
                  <button onClick={() => setDropdownOpen((o) => !o)} className="flex items-center justify-center px-1.5 h-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-md shadow-md py-1 z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Auto-Refresh</div>
                    <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted">Every 5 min</button>
                    <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted">Every 15 min</button>
                    <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted">Every 1 hour</button>
                  </div>
                )}
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }}
                aria-label="Print Dashboard"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsDark((d) => !d)}
                className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }}
                aria-label="Toggle Dark Mode"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Avg. CPL
                <Activity className="w-4 h-4 opacity-50" />
              </div>
              {kpisQuery.isLoading || kpisQuery.isFetching ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <div className="flex items-baseline gap-2 mt-2">
                  <div className="text-3xl font-bold" style={{ color: CHART_COLORS.blue }}>${kpis?.avgCpl}</div>
                  {kpis && renderTrend(kpis.avgCplChange, true)}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2 font-medium">Efficiency vs LY</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                MQL → SQL
                <TrendingUp className="w-4 h-4 opacity-50" />
              </div>
              {kpisQuery.isLoading || kpisQuery.isFetching ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <div className="flex items-baseline gap-2 mt-2">
                  <div className="text-3xl font-bold" style={{ color: CHART_COLORS.blue }}>{kpis?.mqlToSqlRate}%</div>
                  {kpis && renderTrend(kpis.mqlToSqlChange)}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2 font-medium">Target: 22% Benchmark</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                SQL → Won
                <TrendingUp className="w-4 h-4 opacity-50" />
              </div>
              {kpisQuery.isLoading || kpisQuery.isFetching ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <div className="flex items-baseline gap-2 mt-2">
                  <div className="text-3xl font-bold" style={{ color: CHART_COLORS.blue }}>{kpis?.sqlToWonRate}%</div>
                  {kpis && renderTrend(kpis.sqlToWonChange)}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2 font-medium">High Velocity Segment</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Current ROI
                <Activity className="w-4 h-4 opacity-50" />
              </div>
              {kpisQuery.isLoading || kpisQuery.isFetching ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <div className="flex items-baseline gap-2 mt-2">
                  <div className="text-3xl font-bold" style={{ color: CHART_COLORS.blue }}>{kpis?.currentRoi}x</div>
                  {kpis && renderTrend(kpis.currentRoiChange)}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2 font-medium">$850k Generated</div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4" style={{ borderLeftColor: CHART_COLORS.blue }}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total MQLs</p>
                {kpisQuery.isLoading || kpisQuery.isFetching ? <Skeleton className="h-6 w-20 mt-1" /> : (
                  <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.blue }}>{kpis?.totalMqls.toLocaleString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4" style={{ borderLeftColor: CHART_COLORS.purple }}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total SQLs</p>
                {kpisQuery.isLoading || kpisQuery.isFetching ? <Skeleton className="h-6 w-20 mt-1" /> : (
                  <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.purple }}>{kpis?.totalSqls.toLocaleString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4" style={{ borderLeftColor: CHART_COLORS.amber }}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Pipeline</p>
                {kpisQuery.isLoading || kpisQuery.isFetching ? <Skeleton className="h-6 w-24 mt-1" /> : (
                  <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.amber }}>{kpis && formatCompact(kpis.totalPipeline)}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4" style={{ borderLeftColor: CHART_COLORS.green }}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Closed Won</p>
                {kpisQuery.isLoading || kpisQuery.isFetching ? <Skeleton className="h-6 w-24 mt-1" /> : (
                  <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.green }}>{kpis && formatCompact(kpis.totalClosedWon)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Funnel Velocity Bar Chart */}
          <Card className="flex flex-col">
            <CardHeader className="px-5 pt-5 pb-2 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Lead Funnel Velocity</CardTitle>
                <CardDescription>MQL vs SQL monthly progression</CardDescription>
              </div>
              {!loading && velocityData.length > 0 && (
                <CSVLink data={velocityData} filename="funnel-velocity.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export as CSV">
                  <Download className="w-3.5 h-3.5" />
                </CSVLink>
              )}
            </CardHeader>
            <CardContent className="p-5 flex-1 min-h-[350px]">
              {velocityQuery.isLoading || velocityQuery.isFetching ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%" debounce={0}>
                  <BarChart data={velocityData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(val) => formatCompact(val)} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} isAnimationActive={false} />
                    <Legend content={<CustomLegend />} />
                    <Bar dataKey="mql" name="MQL" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} barSize={32} isAnimationActive={false} />
                    <Bar dataKey="sql" name="SQL" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} barSize={32} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Performance Donut */}
          <Card className="flex flex-col">
            <CardHeader className="px-5 pt-5 pb-2 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Performance vs Objectives</CardTitle>
                <CardDescription>Progress towards end of month targets</CardDescription>
              </div>
              {!loading && kpis && (
                <CSVLink data={[{ performanceVsGoal: kpis.performanceVsGoal }]} filename="performance.csv" className="print:hidden flex items-center justify-center w-[26px] h-[26px] rounded-[6px] transition-colors hover:opacity-80" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F1F2", color: isDark ? "#c8c9cc" : "#4b5563" }} aria-label="Export as CSV">
                  <Download className="w-3.5 h-3.5" />
                </CSVLink>
              )}
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-center min-h-[350px]">
              {kpisQuery.isLoading || kpisQuery.isFetching ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <div className="relative w-full h-[240px] mb-4">
                  <ResponsiveContainer width="100%" height="100%" debounce={0}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={105}
                        cornerRadius={4}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={false}
                      >
                        <Cell fill={CHART_COLORS.blue} />
                        <Cell fill={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold" style={{ color: CHART_COLORS.blue }}>{kpis?.performanceVsGoal}%</span>
                    <span className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">Goal Reached</span>
                  </div>
                </div>
              )}
              
              {!loading && kpis && (
                <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Pipeline Generated</p>
                    <p className="text-xl font-bold" style={{ color: CHART_COLORS.amber }}>{formatCompact(kpis.totalPipeline)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Closed Won</p>
                    <p className="text-xl font-bold" style={{ color: CHART_COLORS.green }}>{formatCompact(kpis.totalClosedWon)}</p>
                  </div>
                  <div className="col-span-2 text-center mt-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Trending to EOFM Target</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Channel Performance Breakdown 📊</CardTitle>
              <CardDescription>Cross-channel efficiency and conversion tracking</CardDescription>
            </div>
            <Button variant="link" className="text-primary h-auto p-0">View Full Report &rarr;</Button>
          </CardHeader>
          <CardContent className="p-0">
            {performanceQuery.isLoading || performanceQuery.isFetching ? (
               <div className="p-5 space-y-3">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
               </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    {table.getHeaderGroups().map((hg) => (
                      <TableRow key={hg.id} className="border-b border-border hover:bg-transparent">
                        {hg.headers.map((h) => (
                          <TableHead key={h.id} className="text-xs font-semibold text-muted-foreground py-3 h-auto uppercase tracking-wider" onClick={h.column.getToggleSortingHandler()}>
                            {flexRender(h.column.columnDef.header, h.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="border-b border-border/50">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3.5">
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

        {/* Bottom Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" /> Top Channels
              </CardTitle>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">HIGH ROI 🔥</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {topChannelsQuery.isLoading || topChannelsQuery.isFetching ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {topChannels?.topChannels.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">{c.name.charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.subtitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{c.leads.toLocaleString()} Leads</p>
                        <p className="text-xs font-medium text-green-500">${c.cpl} CPL</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Underperforming
              </CardTitle>
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">ATTENTION REQUIRED ⚠️</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {topChannelsQuery.isLoading || topChannelsQuery.isFetching ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {topChannels?.underperformingChannels.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">{c.name.charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.subtitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{c.leads.toLocaleString()} Leads</p>
                        <p className="text-xs font-medium text-red-500">${c.cpl} CPL</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Stats */}
        <div className="flex flex-wrap items-center justify-end gap-6 text-sm text-muted-foreground pt-4 pb-8 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="font-medium text-foreground">{kpis?.totalContacts.toLocaleString()}</span> Total Contacts
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium text-foreground">{kpis?.avgConversionTimeDays} Days</span> Avg. Conversion
          </div>
        </div>

      </div>
    </div>
  );
}
