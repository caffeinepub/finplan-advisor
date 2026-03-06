import type { Page } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdvisorStats, useListClients } from "@/hooks/useQueries";
import { formatINRShort } from "@/utils/formatINR";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calculator,
  DollarSign,
  PieChart,
  Plus,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const RISK_COLORS: Record<string, string> = {
  Conservative: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Moderate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Aggressive: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: stats, isLoading: statsLoading } = useAdvisorStats();
  const { data: clients, isLoading: clientsLoading } = useListClients();

  const recentClients = clients?.slice(-5).reverse() ?? [];

  const kpis = [
    {
      label: "Total Clients",
      value: statsLoading ? null : Number(stats?.totalClients ?? 0),
      icon: <Users size={20} />,
      format: (v: number) => v.toString(),
      sub: "Active portfolios",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total AUM",
      value: statsLoading ? null : (stats?.totalAUM ?? 0),
      icon: <DollarSign size={20} />,
      format: (v: number) => formatINRShort(v),
      sub: "Assets under management",
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      label: "Avg Corpus Target",
      value: statsLoading ? null : (stats?.avgCorpusTarget ?? 0),
      icon: <Target size={20} />,
      format: (v: number) => formatINRShort(v),
      sub: "Per client target",
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Avg Savings Rate",
      value:
        clients && clients.length > 0
          ? clients.reduce(
              (acc, c) =>
                acc + (c.currentSavings / (c.monthlyIncome * 12 || 1)) * 100,
              0,
            ) / clients.length
          : null,
      icon: <TrendingUp size={20} />,
      format: (v: number) => `${v.toFixed(1)}%`,
      sub: "Savings to income ratio",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl font-bold text-foreground">
            Advisor Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>
        <Button
          onClick={() => onNavigate("clients")}
          data-ocid="dashboard.add_client.button"
          className="bg-gold hover:bg-gold/90 text-primary-foreground gap-2 font-semibold"
        >
          <Plus size={16} />
          Add Client
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
          >
            <Card className="bg-card border-border hover:border-gold/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {kpi.label}
                    </p>
                    {kpi.value === null ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <p
                        className={`text-2xl font-display font-bold ${kpi.color}`}
                      >
                        {kpi.format(kpi.value)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                  </div>
                  <div className={`${kpi.bg} ${kpi.color} p-2.5 rounded-lg`}>
                    {kpi.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent clients */}
        <div className="xl:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="font-display text-base font-semibold">
                Recent Clients
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("clients")}
                className="text-gold hover:text-gold/80 gap-1 text-xs"
              >
                View All <ArrowRight size={12} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {clientsLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : recentClients.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  data-ocid="clients.empty_state"
                >
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Users size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    No clients yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your first client to get started
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate("clients")}
                    className="mt-4 border-gold/30 text-gold hover:bg-gold/10"
                  >
                    <Plus size={14} className="mr-1" /> Add Client
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentClients.map((client) => (
                    <div
                      key={Number(client.id)}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-accent/30 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-gold">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Age {Number(client.currentAge)} · Target{" "}
                          {formatINRShort(client.targetCorpus)}
                        </p>
                      </div>
                      <Badge
                        className={`text-[11px] border ${RISK_COLORS[client.riskProfile] ?? "bg-muted text-muted-foreground border-border"}`}
                      >
                        {client.riskProfile}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                {
                  label: "Run SIP Calculator",
                  icon: <Calculator size={16} />,
                  page: "sip-calculator" as Page,
                  desc: "Calculate required SIP",
                },
                {
                  label: "Monte Carlo Sim",
                  icon: <Activity size={16} />,
                  page: "monte-carlo" as Page,
                  desc: "Portfolio simulation",
                },
                {
                  label: "Stress Test",
                  icon: <AlertCircle size={16} />,
                  page: "stress-test" as Page,
                  desc: "Scenario analysis",
                },
                {
                  label: "Retirement Buckets",
                  icon: <PieChart size={16} />,
                  page: "retirement-buckets" as Page,
                  desc: "Corpus allocation",
                },
              ].map((action) => (
                <button
                  key={action.page}
                  type="button"
                  onClick={() => onNavigate(action.page)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-border hover:border-gold/30 hover:bg-accent/30 transition-all text-left group"
                >
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-gold/10 group-hover:text-gold transition-colors shrink-0">
                    {action.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-gold transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {action.desc}
                    </p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Portfolio health summary */}
          {clients && clients.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base font-semibold">
                  Portfolio Mix
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Conservative", "Moderate", "Aggressive"].map((profile) => {
                  const count = clients.filter(
                    (c) => c.riskProfile === profile,
                  ).length;
                  const pct =
                    clients.length > 0 ? (count / clients.length) * 100 : 0;
                  return (
                    <div key={profile} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{profile}</span>
                        <span className="font-medium text-foreground">
                          {count} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            profile === "Conservative"
                              ? "bg-blue-400"
                              : profile === "Moderate"
                                ? "bg-amber-400"
                                : "bg-rose-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
