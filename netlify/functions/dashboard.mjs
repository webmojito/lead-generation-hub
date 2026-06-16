const json = (body) => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const kpis = {
  avgCpl: 42.5,
  avgCplChange: -12,
  mqlToSqlRate: 24.8,
  mqlToSqlChange: 3.2,
  sqlToWonRate: 18.2,
  sqlToWonChange: 1.5,
  currentRoi: 4.8,
  currentRoiChange: 8,
  totalMqls: 2410,
  totalSqls: 598,
  totalPipeline: 1240000,
  totalClosedWon: 420000,
  performanceVsGoal: 75,
  pipelineGoal: 1600000,
  closedWonGoal: 560000,
  totalContacts: 18340,
  avgConversionTimeDays: 32,
};

const funnelVelocity = [
  { month: "JANUARY", mql: 380, sql: 95, mqlGoal: 450, sqlGoal: 120 },
  { month: "FEBRUARY", mql: 420, sql: 110, mqlGoal: 480, sqlGoal: 130 },
  { month: "MARCH", mql: 460, sql: 125, mqlGoal: 520, sqlGoal: 140 },
  { month: "APRIL", mql: 510, sql: 140, mqlGoal: 550, sqlGoal: 150 },
  { month: "MAY", mql: 490, sql: 128, mqlGoal: 600, sqlGoal: 160 },
];

const channelPerformance = [
  { name: "Sito Web", icon: "globe", mqls: 842, sqls: 210, conversionRate: 24.9, pipelineContribution: 32, wonContribution: 28, roi: 5.2, trend: "up", avgConversionDays: 28 },
  { name: "Email Marketing", icon: "mail", mqls: 654, sqls: 185, conversionRate: 28.3, pipelineContribution: 22, wonContribution: 25, roi: 4.8, trend: "up", avgConversionDays: 21 },
  { name: "Advertising", icon: "megaphone", mqls: 1210, sqls: 302, conversionRate: 24.9, pipelineContribution: 28, wonContribution: 22, roi: 3.9, trend: "flat", avgConversionDays: 35 },
  { name: "Webinar", icon: "video", mqls: 320, sqls: 112, conversionRate: 35.0, pipelineContribution: 8, wonContribution: 12, roi: 6.5, trend: "up", avgConversionDays: 18 },
  { name: "Eventi", icon: "calendar", mqls: 145, sqls: 42, conversionRate: 29.0, pipelineContribution: 5, wonContribution: 4, roi: 2.1, trend: "down", avgConversionDays: 45 },
  { name: "Outbound", icon: "phone", mqls: 210, sqls: 68, conversionRate: 32.4, pipelineContribution: 5, wonContribution: 9, roi: 4.2, trend: "up", avgConversionDays: 42 },
];

const topChannels = {
  topChannels: [
    { name: "Paid Search (Google)", subtitle: "High intent signals", leads: 420, cpl: 24.1, trend: "up" },
    { name: "LinkedIn Ads", subtitle: "Enterprise ABM focus", leads: 315, cpl: 62.4, trend: "up" },
    { name: "Email Outreach", subtitle: "Warm sequence conversion", leads: 280, cpl: 18.8, trend: "up" },
  ],
  underperformingChannels: [
    { name: "Meta Ads", subtitle: "Relevance score fatigue", leads: 45, cpl: 145.0, trend: "down" },
    { name: "YouTube Content", subtitle: "Tracking pixel leakage", leads: 12, cpl: 310.0, trend: "down" },
    { name: "Affiliate Network B", subtitle: "Quality score decay", leads: 68, cpl: 98.5, trend: "down" },
  ],
};

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const path = event.path.replace(/^\/\.netlify\/functions\/dashboard\/?/, "");

  if (path === "kpis") return json(kpis);
  if (path === "funnel-velocity") return json(funnelVelocity);
  if (path === "channel-performance") return json(channelPerformance);
  if (path === "top-channels") return json(topChannels);

  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Not found" }),
  };
}
