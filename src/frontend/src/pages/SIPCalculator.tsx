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
import { useCalculateSIP } from "@/hooks/useQueries";
import { formatINR, formatINRShort } from "@/utils/formatINR";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Info,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type { SIPResult } from "../backend.d";

export default function SIPCalculator() {
  const [form, setForm] = useState({
    targetCorpus: "50000000",
    currentSavings: "2000000",
    years: "25",
    annualReturn: "12",
    inflationRate: "6",
  });
  const [result, setResult] = useState<SIPResult | null>(null);

  const calculateMutation = useCalculateSIP();

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await calculateMutation.mutateAsync({
        targetCorpus: Number.parseFloat(form.targetCorpus) || 0,
        currentSavings: Number.parseFloat(form.currentSavings) || 0,
        years: BigInt(Number.parseInt(form.years) || 20),
        annualReturn: Number.parseFloat(form.annualReturn) / 100,
        inflationRate: Number.parseFloat(form.inflationRate) / 100,
      });
      setResult(res);
    } catch {
      toast.error("Calculation failed. Please try again.");
    }
  }

  const chartData = result
    ? [
        {
          name: "Monthly SIP",
          Required: Math.round(result.requiredMonthlySIP),
          Gap: Math.max(0, Math.round(result.sipGap)),
        },
        {
          name: "Annual",
          Required: Math.round(result.requiredMonthlySIP * 12),
          Gap: Math.max(0, Math.round(result.sipGap * 12)),
        },
      ]
    : [];

  const feasibilityLabel = result
    ? result.feasibilityScore >= 0.8
      ? {
          text: "Excellent",
          color: "text-green-400",
          bg: "bg-green-500/10 border-green-500/20",
        }
      : result.feasibilityScore >= 0.6
        ? {
            text: "Good",
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
          }
        : result.feasibilityScore >= 0.4
          ? {
              text: "Fair",
              color: "text-orange-400",
              bg: "bg-orange-500/10 border-orange-500/20",
            }
          : {
              text: "Challenging",
              color: "text-rose-400",
              bg: "bg-rose-500/10 border-rose-500/20",
            }
    : null;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          SIP Calculator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Calculate the required monthly SIP to achieve a target retirement
          corpus
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border sticky top-6">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center">
                  <Calculator size={16} className="text-gold" />
                </div>
                <div>
                  <CardTitle className="font-display text-base">
                    Calculator Inputs
                  </CardTitle>
                  <CardDescription className="text-xs">
                    All amounts in Indian Rupees
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Target Corpus (₹)
                  </Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={form.targetCorpus}
                    onChange={(e) =>
                      setForm({ ...form, targetCorpus: e.target.value })
                    }
                    placeholder="50000000"
                    className="bg-background border-border font-mono"
                    data-ocid="sip.target.input"
                  />
                  {form.targetCorpus && (
                    <p className="text-xs text-gold">
                      {formatINRShort(
                        Number.parseFloat(form.targetCorpus) || 0,
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Current Savings (₹)
                  </Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={form.currentSavings}
                    onChange={(e) =>
                      setForm({ ...form, currentSavings: e.target.value })
                    }
                    placeholder="2000000"
                    className="bg-background border-border font-mono"
                    data-ocid="sip.savings.input"
                  />
                  {form.currentSavings && (
                    <p className="text-xs text-gold">
                      {formatINRShort(
                        Number.parseFloat(form.currentSavings) || 0,
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Investment Horizon (Years)
                  </Label>
                  <Input
                    type="number"
                    required
                    min={1}
                    max={50}
                    value={form.years}
                    onChange={(e) =>
                      setForm({ ...form, years: e.target.value })
                    }
                    placeholder="25"
                    className="bg-background border-border"
                    data-ocid="sip.years.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Expected Annual Return (%)
                  </Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    max={50}
                    step={0.1}
                    value={form.annualReturn}
                    onChange={(e) =>
                      setForm({ ...form, annualReturn: e.target.value })
                    }
                    placeholder="12"
                    className="bg-background border-border"
                    data-ocid="sip.return.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Inflation Rate (%)
                  </Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    max={30}
                    step={0.1}
                    value={form.inflationRate}
                    onChange={(e) =>
                      setForm({ ...form, inflationRate: e.target.value })
                    }
                    placeholder="6"
                    className="bg-background border-border"
                    data-ocid="sip.inflation.input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={calculateMutation.isPending}
                  data-ocid="sip.calculate.button"
                  className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-semibold"
                >
                  {calculateMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />{" "}
                      Calculating...
                    </>
                  ) : (
                    <>
                      <TrendingUp size={14} className="mr-2" /> Calculate SIP
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {calculateMutation.isError && (
            <Card
              className="bg-destructive/10 border-destructive/30"
              data-ocid="sip.error_state"
            >
              <CardContent className="flex items-center gap-3 p-4">
                <AlertTriangle
                  size={18}
                  className="text-destructive shrink-0"
                />
                <p className="text-sm text-foreground">
                  Calculation failed. Please check your inputs and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {calculateMutation.isPending && (
            <Card
              className="bg-card border-border"
              data-ocid="sip.loading_state"
            >
              <CardContent className="flex items-center justify-center p-12">
                <div className="text-center">
                  <Loader2
                    size={32}
                    className="animate-spin text-gold mx-auto mb-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    Computing optimal SIP...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && !calculateMutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
              data-ocid="sip.result.card"
            >
              {/* KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Required Monthly SIP
                    </p>
                    <p className="text-2xl font-display font-bold text-gold">
                      {formatINRShort(result.requiredMonthlySIP)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatINR(result.requiredMonthlySIP)}/month
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      SIP Gap
                    </p>
                    <p
                      className={`text-2xl font-display font-bold ${result.sipGap > 0 ? "text-rose-400" : "text-green-400"}`}
                    >
                      {result.sipGap > 0 ? formatINRShort(result.sipGap) : "₹0"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.sipGap > 0
                        ? "Additional SIP needed"
                        : "On track!"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Feasibility Score
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p
                        className={`text-2xl font-display font-bold ${feasibilityLabel?.color}`}
                      >
                        {(result.feasibilityScore * 100).toFixed(0)}%
                      </p>
                      {result.feasibilityScore >= 0.6 ? (
                        <CheckCircle2 size={16} className="text-green-400" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-400" />
                      )}
                    </div>
                    {feasibilityLabel && (
                      <Badge
                        className={`text-[11px] mt-1 border ${feasibilityLabel.bg} ${feasibilityLabel.color}`}
                      >
                        {feasibilityLabel.text}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-base">
                    SIP Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Monthly vs Annual SIP requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="oklch(0.26 0.035 255)"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "oklch(0.6 0.02 245)", fontSize: 12 }}
                        />
                        <YAxis
                          tickFormatter={(v) => formatINRShort(v)}
                          tick={{ fill: "oklch(0.6 0.02 245)", fontSize: 11 }}
                          width={80}
                        />
                        <RechartsTooltip
                          formatter={(value: number) => formatINR(value)}
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
                        <Bar
                          dataKey="Required"
                          fill="oklch(0.82 0.18 75)"
                          radius={[4, 4, 0, 0]}
                          name="Required SIP"
                        />
                        <Bar
                          dataKey="Gap"
                          fill="oklch(0.62 0.22 25)"
                          radius={[4, 4, 0, 0]}
                          name="Gap"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Advisory note */}
              <Card className="bg-muted/30 border-border">
                <CardContent className="flex gap-3 p-4">
                  <Info size={16} className="text-gold shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      Advisory Note
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This calculation assumes a constant return of{" "}
                      {form.annualReturn}% p.a. with {form.inflationRate}%
                      inflation. Actual returns may vary. Consider step-up SIP
                      to account for income growth. Review annually.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!result &&
            !calculateMutation.isPending &&
            !calculateMutation.isError && (
              <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-lg">
                <Calculator size={32} className="text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  Enter parameters and click Calculate
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Results will appear here
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
