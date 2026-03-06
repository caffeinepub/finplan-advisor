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
import { useListClients } from "@/hooks/useQueries";
import { formatINR, formatINRShort } from "@/utils/formatINR";
import { PieChart as PieIcon, Shield, Target, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const BUCKET_CONFIG = [
  {
    id: "short",
    label: "Short-Term Bucket",
    horizon: "0–3 Years",
    allocation: 0.2,
    icon: <Shield size={18} />,
    color: "oklch(0.68 0.15 185)",
    tailwind: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    description: "Liquid funds, FDs, short-duration bonds",
    goal: "Capital preservation & liquidity",
  },
  {
    id: "mid",
    label: "Mid-Term Bucket",
    horizon: "3–7 Years",
    allocation: 0.3,
    icon: <Target size={18} />,
    color: "oklch(0.82 0.18 75)",
    tailwind: "text-gold",
    bg: "bg-gold/10 border-gold/20",
    description: "Balanced funds, corporate bonds, REITs",
    goal: "Moderate growth with stability",
  },
  {
    id: "long",
    label: "Long-Term Bucket",
    horizon: "7+ Years",
    allocation: 0.5,
    icon: <TrendingUp size={18} />,
    color: "oklch(0.68 0.16 145)",
    tailwind: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    description: "Equity mutual funds, index funds, ELSS",
    goal: "Maximum long-term wealth creation",
  },
];

export default function RetirementBuckets() {
  const { data: clients, isLoading } = useListClients();
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const selectedClient = clients?.find(
    (c) => String(Number(c.id)) === selectedClientId,
  );
  const corpus = selectedClient?.targetCorpus ?? 0;

  const bucketData = BUCKET_CONFIG.map((b) => ({
    ...b,
    amount: corpus * b.allocation,
  }));

  const chartData = bucketData.map((b) => ({
    name: b.horizon,
    Amount: Math.round(b.amount),
    fill: b.color,
  }));

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Retirement Buckets
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Strategic corpus allocation across three time-horizon buckets
        </p>
      </motion.div>

      {/* Client selector */}
      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="max-w-sm space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Client
            </Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedClientId}
                onValueChange={setSelectedClientId}
              >
                <SelectTrigger
                  className="bg-background border-border"
                  data-ocid="buckets.client.select"
                >
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {(clients ?? []).map((c) => (
                    <SelectItem key={Number(c.id)} value={String(Number(c.id))}>
                      {c.name} — Target: {formatINRShort(c.targetCorpus)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {selectedClient && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Total Corpus</p>
                <p className="font-display font-bold text-gold text-lg">
                  {formatINRShort(corpus)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Age</p>
                <p className="font-semibold text-foreground">
                  {Number(selectedClient.currentAge)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Retirement Age</p>
                <p className="font-semibold text-foreground">
                  {Number(selectedClient.retirementAge)}
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

      {!selectedClientId && !isLoading && (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-lg">
          <PieIcon size={32} className="text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Select a client to view bucket allocation
          </p>
        </div>
      )}

      {selectedClientId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Bucket cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bucketData.map((bucket, i) => (
              <motion.div
                key={bucket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className={`bg-card border ${bucket.bg} relative overflow-hidden`}
                >
                  <div
                    className="absolute top-0 left-0 h-1 w-full"
                    style={{ background: bucket.color }}
                  />
                  <CardContent className="p-5 pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-2 rounded-lg border ${bucket.bg} ${bucket.tailwind}`}
                      >
                        {bucket.icon}
                      </div>
                      <span className="text-2xl font-display font-bold text-muted-foreground">
                        {(bucket.allocation * 100).toFixed(0)}%
                      </span>
                    </div>
                    <h3
                      className={`font-display font-bold text-base ${bucket.tailwind}`}
                    >
                      {bucket.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {bucket.horizon}
                    </p>
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <p
                        className={`text-xl font-display font-bold ${bucket.tailwind}`}
                      >
                        {formatINRShort(bucket.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatINR(bucket.amount)}
                      </p>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-foreground font-medium">
                        {bucket.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bucket.goal}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Chart + Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">
                  Bucket Allocation
                </CardTitle>
                <CardDescription className="text-xs">
                  Corpus distribution by time horizon
                </CardDescription>
              </CardHeader>
              <CardContent data-ocid="buckets.chart.canvas_target">
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
                        formatter={(value: number) => [
                          formatINR(value),
                          "Allocation",
                        ]}
                        contentStyle={{
                          backgroundColor: "oklch(0.18 0.025 255)",
                          border: "1px solid oklch(0.26 0.035 255)",
                          borderRadius: "8px",
                          color: "oklch(0.93 0.01 245)",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="Amount" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Allocation table */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">
                  Allocation Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  Detailed breakdown with suggested instruments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Bucket
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        %
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bucketData.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <p className={`font-semibold text-sm ${b.tailwind}`}>
                            {b.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {b.horizon}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-sm font-bold ${b.tailwind}`}>
                            {(b.allocation * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="font-bold font-mono text-foreground">
                            {formatINRShort(b.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {formatINR(b.amount)}
                          </p>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/20">
                      <td className="px-4 py-3 font-bold text-foreground">
                        Total
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gold">
                        100%
                      </td>
                      <td className="px-4 py-3 text-right font-bold font-mono text-gold">
                        {formatINRShort(corpus)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
