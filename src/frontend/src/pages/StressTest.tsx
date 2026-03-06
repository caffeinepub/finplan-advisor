import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useApplyStressTest, useListClients } from "@/hooks/useQueries";
import { formatINR, formatINRShort } from "@/utils/formatINR";
import {
  AlertTriangle,
  Flame,
  Info,
  Loader2,
  Percent,
  TrendingDown,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { StressTestResult } from "../backend.d";

const SCENARIOS = [
  {
    id: "MarketCrash",
    label: "Market Crash",
    subtitle: "−40% Portfolio Value",
    description:
      "Simulates a severe market downturn similar to 2008 GFC or 2020 crash",
    icon: <TrendingDown size={20} />,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
    activeBg: "bg-rose-500/20 border-rose-500/50",
    ocid: "stress.crash.button",
  },
  {
    id: "InflationSpike",
    label: "Inflation Spike",
    subtitle: "+3% Inflation Rate",
    description: "Models persistent high inflation eroding purchasing power",
    icon: <Flame size={20} />,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    activeBg: "bg-amber-500/20 border-amber-500/50",
    ocid: "stress.inflation.button",
  },
  {
    id: "RateRise",
    label: "Interest Rate Rise",
    subtitle: "+2% Rate Increase",
    description:
      "Impact of central bank rate hikes on bond portfolio and SIP returns",
    icon: <Percent size={20} />,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    activeBg: "bg-blue-500/20 border-blue-500/50",
    ocid: "stress.rate.button",
  },
];

export default function StressTest() {
  const { data: clients, isLoading: clientsLoading } = useListClients();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, StressTestResult>>({});

  const stressMutation = useApplyStressTest();

  const selectedClient = clients?.find(
    (c) => String(Number(c.id)) === selectedClientId,
  );

  async function handleScenario(scenarioId: string) {
    if (!selectedClient) {
      toast.error("Please select a client first");
      return;
    }
    setActiveScenario(scenarioId);
    try {
      const res = await stressMutation.mutateAsync({
        clientId: selectedClient.id,
        scenario: scenarioId,
      });
      if (res) {
        setResults((prev) => ({ ...prev, [scenarioId]: res }));
      } else {
        toast.error("No result returned for this scenario");
      }
    } catch {
      toast.error("Stress test failed. Please try again.");
    } finally {
      setActiveScenario(null);
    }
  }

  const hasAnyResult = Object.keys(results).length > 0;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Stress Testing
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analyze portfolio resilience across adverse market scenarios
        </p>
      </motion.div>

      {/* Client selector */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="max-w-sm space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Client
            </Label>
            {clientsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedClientId}
                onValueChange={(v) => {
                  setSelectedClientId(v);
                  setResults({});
                }}
              >
                <SelectTrigger
                  className="bg-background border-border"
                  data-ocid="stress.client.select"
                >
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {(clients ?? []).map((c) => (
                    <SelectItem key={Number(c.id)} value={String(Number(c.id))}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {selectedClient && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Target Corpus</p>
                <p className="font-display font-bold text-gold">
                  {formatINRShort(selectedClient.targetCorpus)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Savings</p>
                <p className="font-semibold text-foreground">
                  {formatINRShort(selectedClient.currentSavings)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Income</p>
                <p className="font-semibold text-foreground">
                  {formatINRShort(selectedClient.monthlyIncome)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Risk Profile</p>
                <p className="font-semibold text-foreground">
                  {selectedClient.riskProfile}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIOS.map((scenario, i) => {
          const hasResult = results[scenario.id];
          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className={`bg-card border transition-all ${hasResult ? scenario.activeBg : scenario.bg} hover:shadow-lg`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-2.5 rounded-lg border ${scenario.bg} ${scenario.color}`}
                    >
                      {scenario.icon}
                    </div>
                    {hasResult && (
                      <Badge
                        className={`text-[10px] border ${scenario.bg} ${scenario.color}`}
                      >
                        Tested
                      </Badge>
                    )}
                  </div>
                  <h3
                    className={`font-display font-bold text-base ${scenario.color}`}
                  >
                    {scenario.label}
                  </h3>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                    {scenario.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {scenario.description}
                  </p>

                  {hasResult && (
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Adjusted Corpus
                        </span>
                        <span
                          className={`font-mono font-semibold ${scenario.color}`}
                        >
                          {formatINRShort(hasResult.adjustedCorpus)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Adjusted SIP
                        </span>
                        <span className="font-mono font-semibold text-foreground">
                          {formatINRShort(hasResult.adjustedSIP)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Impact</span>
                        <span
                          className={`font-semibold ${hasResult.impactPercentage > 0 ? "text-rose-400" : "text-green-400"}`}
                        >
                          {hasResult.impactPercentage > 0 ? "−" : ""}
                          {Math.abs(hasResult.impactPercentage * 100).toFixed(
                            1,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleScenario(scenario.id)}
                    disabled={stressMutation.isPending || !selectedClientId}
                    data-ocid={scenario.ocid}
                    className={`w-full mt-4 border font-semibold text-xs h-9 ${scenario.bg} ${scenario.color} hover:opacity-90 bg-transparent`}
                    variant="outline"
                  >
                    {stressMutation.isPending &&
                    activeScenario === scenario.id ? (
                      <>
                        <Loader2 size={12} className="mr-1.5 animate-spin" />{" "}
                        Running...
                      </>
                    ) : (
                      <>
                        <Zap size={12} className="mr-1.5" /> Run Scenario
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison table */}
      <AnimatePresence>
        {hasAnyResult && selectedClient && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card
              className="bg-card border-border"
              data-ocid="stress.result.card"
            >
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base">
                  Before vs After Comparison
                </CardTitle>
                <CardDescription className="text-xs">
                  Impact analysis across all tested scenarios for{" "}
                  {selectedClient.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Scenario
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Base Corpus
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Stressed Corpus
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Base SIP
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Stressed SIP
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Impact
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {SCENARIOS.filter((s) => results[s.id]).map(
                        (scenario) => {
                          const res = results[scenario.id];
                          const baseSIP = Math.max(
                            0,
                            selectedClient.monthlyIncome -
                              selectedClient.monthlyExpenses,
                          );
                          return (
                            <tr
                              key={scenario.id}
                              className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors"
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <span className={scenario.color}>
                                    {scenario.icon}
                                  </span>
                                  <div>
                                    <p
                                      className={`font-semibold text-sm ${scenario.color}`}
                                    >
                                      {scenario.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {scenario.subtitle}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right font-mono text-foreground">
                                {formatINRShort(selectedClient.targetCorpus)}
                              </td>
                              <td className="px-4 py-4 text-right font-mono">
                                <span
                                  className={
                                    res.adjustedCorpus <
                                    selectedClient.targetCorpus
                                      ? "text-rose-400"
                                      : "text-green-400"
                                  }
                                >
                                  {formatINRShort(res.adjustedCorpus)}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right font-mono text-foreground">
                                {formatINRShort(baseSIP)}
                              </td>
                              <td className="px-4 py-4 text-right font-mono">
                                <span
                                  className={
                                    res.adjustedSIP > baseSIP
                                      ? "text-amber-400"
                                      : "text-foreground"
                                  }
                                >
                                  {formatINRShort(res.adjustedSIP)}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span
                                  className={`font-semibold text-sm ${res.impactPercentage > 0 ? "text-rose-400" : "text-green-400"}`}
                                >
                                  {res.impactPercentage > 0 ? "−" : ""}
                                  {Math.abs(res.impactPercentage * 100).toFixed(
                                    1,
                                  )}
                                  %
                                </span>
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedClientId && !clientsLoading && (
        <div className="flex flex-col items-center justify-center h-32 border border-dashed border-border rounded-lg">
          <AlertTriangle size={24} className="text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Select a client to run stress test scenarios
          </p>
        </div>
      )}

      {/* Info note */}
      <Card className="bg-muted/20 border-border">
        <CardContent className="flex gap-3 p-4">
          <Info size={16} className="text-gold shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-foreground">
              About Stress Testing
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Stress tests model extreme but plausible adverse scenarios to
              assess portfolio resilience. Results show the adjusted corpus and
              required SIP if the scenario materializes. Use these insights to
              build adequate financial buffers and diversify client portfolios.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
