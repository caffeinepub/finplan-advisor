import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useListClients, useRunMonteCarloSimulation } from "@/hooks/useQueries";
import { formatINR, formatINRShort } from "@/utils/formatINR";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { SimulationResult } from "../backend.d";

export default function MonteCarlo() {
  const { data: clients, isLoading: clientsLoading } = useListClients();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [params, setParams] = useState({
    meanReturn: "12",
    stdDev: "15",
    years: "25",
    simCount: "1000",
  });
  const [result, setResult] = useState<SimulationResult | null>(null);

  const runSimulation = useRunMonteCarloSimulation();

  const selectedClient = clients?.find(
    (c) => String(Number(c.id)) === selectedClientId,
  );

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient) {
      toast.error("Please select a client first");
      return;
    }
    try {
      const res = await runSimulation.mutateAsync({
        initialCorpus: selectedClient.currentSavings,
        monthlySIP: Math.max(
          0,
          selectedClient.monthlyIncome - selectedClient.monthlyExpenses,
        ),
        years: BigInt(Number.parseInt(params.years) || 20),
        meanReturn: Number.parseFloat(params.meanReturn) / 100,
        stdDev: Number.parseFloat(params.stdDev) / 100,
        simCount: BigInt(Number.parseInt(params.simCount) || 1000),
      });
      setResult(res);
    } catch {
      toast.error("Simulation failed. Please try again.");
    }
  }

  const yearsCount = Number.parseInt(params.years) || 20;
  const chartData = result
    ? Array.from(
        { length: Math.min(result.percentile50.length, yearsCount) },
        (_, i) => ({
          year: `Y${i + 1}`,
          P10: Math.round(result.percentile10[i] ?? 0),
          P50: Math.round(result.percentile50[i] ?? 0),
          P90: Math.round(result.percentile90[i] ?? 0),
        }),
      )
    : [];

  const successLevel = result
    ? result.successProbability >= 0.8
      ? {
          label: "High Confidence",
          color: "text-green-400",
          bg: "bg-green-500/10 border-green-500/20",
        }
      : result.successProbability >= 0.6
        ? {
            label: "Moderate Confidence",
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
          }
        : {
            label: "Low Confidence",
            color: "text-rose-400",
            bg: "bg-rose-500/10 border-rose-500/20",
          }
    : null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Monte Carlo Simulation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Probabilistic portfolio projections across thousands of market
          scenarios
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border sticky top-6">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center">
                  <Activity size={16} className="text-gold" />
                </div>
                <div>
                  <CardTitle className="font-display text-base">
                    Simulation Setup
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRun} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Client
                  </Label>
                  {clientsLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={selectedClientId}
                      onValueChange={setSelectedClientId}
                    >
                      <SelectTrigger
                        className="bg-background border-border"
                        data-ocid="monte.client.select"
                      >
                        <SelectValue placeholder="Select client..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {(clients ?? []).map((c) => (
                          <SelectItem
                            key={Number(c.id)}
                            value={String(Number(c.id))}
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedClient && (
                    <div className="mt-2 p-3 rounded-md bg-muted/30 border border-border text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Initial Corpus
                        </span>
                        <span className="font-mono text-gold">
                          {formatINRShort(selectedClient.currentSavings)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Monthly SIP
                        </span>
                        <span className="font-mono text-foreground">
                          {formatINRShort(
                            Math.max(
                              0,
                              selectedClient.monthlyIncome -
                                selectedClient.monthlyExpenses,
                            ),
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mean Annual Return (%)
                  </Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    max={50}
                    step={0.1}
                    value={params.meanReturn}
                    onChange={(e) =>
                      setParams({ ...params, meanReturn: e.target.value })
                    }
                    className="bg-background border-border"
                    data-ocid="monte.mean.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Standard Deviation (%)
                  </Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    max={50}
                    step={0.1}
                    value={params.stdDev}
                    onChange={(e) =>
                      setParams({ ...params, stdDev: e.target.value })
                    }
                    className="bg-background border-border"
                    data-ocid="monte.stddev.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Simulation Years
                  </Label>
                  <Input
                    type="number"
                    required
                    min={1}
                    max={50}
                    value={params.years}
                    onChange={(e) =>
                      setParams({ ...params, years: e.target.value })
                    }
                    className="bg-background border-border"
                    data-ocid="monte.years.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Simulation Count
                  </Label>
                  <Input
                    type="number"
                    required
                    min={100}
                    max={10000}
                    step={100}
                    value={params.simCount}
                    onChange={(e) =>
                      setParams({ ...params, simCount: e.target.value })
                    }
                    className="bg-background border-border"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={runSimulation.isPending || !selectedClientId}
                  data-ocid="monte.run.button"
                  className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-semibold"
                >
                  {runSimulation.isPending ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />{" "}
                      Running...
                    </>
                  ) : (
                    <>
                      <Activity size={14} className="mr-2" /> Run Simulation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {runSimulation.isPending && (
            <Card
              className="bg-card border-border"
              data-ocid="monte.loading_state"
            >
              <CardContent className="flex items-center justify-center p-16">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <Loader2 size={40} className="animate-spin text-gold" />
                  </div>
                  <p className="font-display font-semibold text-foreground">
                    Running {params.simCount} simulations...
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Modeling market scenarios with Monte Carlo method
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {runSimulation.isError && (
            <Card
              className="bg-destructive/10 border-destructive/30"
              data-ocid="monte.error_state"
            >
              <CardContent className="flex items-center gap-3 p-4">
                <AlertTriangle
                  size={18}
                  className="text-destructive shrink-0"
                />
                <p className="text-sm">
                  Simulation failed. Please check your inputs and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {result && !runSimulation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Success probability */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-card border-border sm:col-span-1">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Success Probability
                    </p>
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-3xl font-display font-bold ${successLevel?.color}`}
                      >
                        {(result.successProbability * 100).toFixed(1)}%
                      </p>
                      {result.successProbability >= 0.6 ? (
                        <CheckCircle2 size={18} className="text-green-400" />
                      ) : (
                        <AlertTriangle size={18} className="text-amber-400" />
                      )}
                    </div>
                    {successLevel && (
                      <Badge
                        className={`mt-2 text-[11px] border ${successLevel.bg} ${successLevel.color}`}
                      >
                        {successLevel.label}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      P50 Final Value
                    </p>
                    <p className="text-xl font-display font-bold text-foreground">
                      {formatINRShort(
                        result.percentile50[result.percentile50.length - 1] ??
                          0,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Median scenario
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      P90 Final Value
                    </p>
                    <p className="text-xl font-display font-bold text-green-400">
                      {formatINRShort(
                        result.percentile90[result.percentile90.length - 1] ??
                          0,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Optimistic scenario
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Area chart */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-base">
                    Portfolio Projection
                  </CardTitle>
                  <CardDescription className="text-xs">
                    P10 / P50 / P90 percentiles over {params.years} years
                  </CardDescription>
                </CardHeader>
                <CardContent data-ocid="monte.chart.canvas_target">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorP90"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="oklch(0.68 0.16 145)"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="oklch(0.68 0.16 145)"
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorP50"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="oklch(0.82 0.18 75)"
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="95%"
                              stopColor="oklch(0.82 0.18 75)"
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorP10"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="oklch(0.62 0.22 25)"
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor="oklch(0.62 0.22 25)"
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="oklch(0.26 0.035 255)"
                        />
                        <XAxis
                          dataKey="year"
                          tick={{ fill: "oklch(0.6 0.02 245)", fontSize: 11 }}
                          interval={Math.floor(chartData.length / 8)}
                        />
                        <YAxis
                          tickFormatter={(v) => formatINRShort(v)}
                          tick={{ fill: "oklch(0.6 0.02 245)", fontSize: 11 }}
                          width={90}
                        />
                        <RechartsTooltip
                          formatter={(value: number, name: string) => [
                            formatINR(value),
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "oklch(0.18 0.025 255)",
                            border: "1px solid oklch(0.26 0.035 255)",
                            borderRadius: "8px",
                            color: "oklch(0.93 0.01 245)",
                            fontSize: "12px",
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            fontSize: "12px",
                            color: "oklch(0.6 0.02 245)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="P90"
                          name="P90 (Optimistic)"
                          stroke="oklch(0.68 0.16 145)"
                          fill="url(#colorP90)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="P50"
                          name="P50 (Median)"
                          stroke="oklch(0.82 0.18 75)"
                          fill="url(#colorP50)"
                          strokeWidth={2.5}
                        />
                        <Area
                          type="monotone"
                          dataKey="P10"
                          name="P10 (Conservative)"
                          stroke="oklch(0.62 0.22 25)"
                          fill="url(#colorP10)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Interpretation */}
              <Card className="bg-muted/30 border-border">
                <CardContent className="flex gap-3 p-4">
                  <Info size={16} className="text-gold shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      Reading the Chart
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-400 font-medium">P90</span> —
                      Best 10% of scenarios.{" "}
                      <span className="text-gold font-medium">P50</span> —
                      Median/expected outcome.{" "}
                      <span className="text-rose-400 font-medium">P10</span> —
                      Worst 10% of scenarios. Success probability reflects the
                      percentage of simulations that reached the target corpus.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!result && !runSimulation.isPending && !runSimulation.isError && (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-lg">
              <Activity size={32} className="text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Select a client and run the simulation
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                P10/P50/P90 projections will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
