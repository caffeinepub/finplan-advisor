import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useAddClient,
  useDeleteClient,
  useListClients,
  useUpdateClient,
} from "@/hooks/useQueries";
import { formatINRShort } from "@/utils/formatINR";
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Client } from "../backend.d";

const RISK_COLORS: Record<string, string> = {
  Conservative: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Moderate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Aggressive: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

interface ClientFormData {
  name: string;
  age: string;
  riskProfile: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  currentSavings: string;
  targetCorpus: string;
  retirementAge: string;
  currentAge: string;
  goals: string;
}

const emptyForm: ClientFormData = {
  name: "",
  age: "",
  riskProfile: "Moderate",
  monthlyIncome: "",
  monthlyExpenses: "",
  currentSavings: "",
  targetCorpus: "",
  retirementAge: "60",
  currentAge: "",
  goals: "",
};

export default function Clients() {
  const { data: clients, isLoading } = useListClients();
  const addMutation = useAddClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [sortField, setSortField] = useState<
    "name" | "targetCorpus" | "currentAge"
  >("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = (clients ?? [])
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "targetCorpus")
        cmp = a.targetCorpus - b.targetCorpus;
      else if (sortField === "currentAge")
        cmp = Number(a.currentAge) - Number(b.currentAge);
      return sortDir === "asc" ? cmp : -cmp;
    });

  function openAddDialog() {
    setEditingClient(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(client: Client) {
    setEditingClient(client);
    setForm({
      name: client.name,
      age: String(Number(client.age)),
      riskProfile: client.riskProfile,
      monthlyIncome: String(client.monthlyIncome),
      monthlyExpenses: String(client.monthlyExpenses),
      currentSavings: String(client.currentSavings),
      targetCorpus: String(client.targetCorpus),
      retirementAge: String(Number(client.retirementAge)),
      currentAge: String(Number(client.currentAge)),
      goals: client.goals,
    });
    setDialogOpen(true);
  }

  function handleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ageVal = BigInt(Number.parseInt(form.currentAge) || 0);
    const params = {
      name: form.name,
      age: ageVal,
      riskProfile: form.riskProfile,
      monthlyIncome: Number.parseFloat(form.monthlyIncome) || 0,
      monthlyExpenses: Number.parseFloat(form.monthlyExpenses) || 0,
      currentSavings: Number.parseFloat(form.currentSavings) || 0,
      targetCorpus: Number.parseFloat(form.targetCorpus) || 0,
      retirementAge: BigInt(Number.parseInt(form.retirementAge) || 60),
      currentAge: ageVal,
      goals: form.goals,
    };

    try {
      if (editingClient) {
        await updateMutation.mutateAsync({ id: editingClient.id, ...params });
        toast.success("Client updated successfully");
      } else {
        await addMutation.mutateAsync(params);
        toast.success("Client added successfully");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save client");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Client deleted");
    } catch {
      toast.error("Failed to delete client");
    } finally {
      setDeleteId(null);
    }
  }

  const isSaving = addMutation.isPending || updateMutation.isPending;

  function SortIcon({ field }: { field: string }) {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="ml-1 inline" />
    ) : (
      <ChevronDown size={12} className="ml-1 inline" />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl font-bold text-foreground">
            Clients
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients?.length ?? 0} total clients
          </p>
        </motion.div>
        <Button
          onClick={openAddDialog}
          data-ocid="clients.add.open_modal_button"
          className="bg-gold hover:bg-gold/90 text-primary-foreground gap-2 font-semibold"
        >
          <Plus size={16} />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border"
          data-ocid="clients.search_input"
        />
      </div>

      {/* Table */}
      <div
        className="rounded-lg border border-border overflow-hidden bg-card"
        data-ocid="clients.table"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className="hover:text-foreground transition-colors"
                  >
                    Client <SortIcon field="name" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  <button
                    type="button"
                    onClick={() => handleSort("currentAge")}
                    className="hover:text-foreground transition-colors"
                  >
                    Age <SortIcon field="currentAge" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Risk
                </th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Income / mo
                </th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort("targetCorpus")}
                    className="hover:text-foreground transition-colors"
                  >
                    Target Corpus <SortIcon field="targetCorpus" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Retire At
                </th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                ["sk1", "sk2", "sk3", "sk4"].map((sk) => (
                  <tr key={sk} className="border-b border-border last:border-0">
                    {["c1", "c2", "c3", "c4", "c5", "c6", "c7"].map((col) => (
                      <td key={col} className="px-4 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center"
                    data-ocid="clients.empty_state"
                  >
                    <p className="text-muted-foreground text-sm">
                      {search
                        ? "No clients match your search"
                        : "No clients yet. Add your first client to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((client, idx) => (
                  <motion.tr
                    key={Number(client.id)}
                    data-ocid={`clients.row.item.${idx + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-gold">
                            {client.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {client.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {client.goals || "No goals set"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-foreground hidden md:table-cell">
                      {Number(client.currentAge)}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <Badge
                        className={`text-[11px] border ${RISK_COLORS[client.riskProfile] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {client.riskProfile}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right text-foreground font-mono hidden md:table-cell">
                      {formatINRShort(client.monthlyIncome)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-gold font-mono">
                      {formatINRShort(client.targetCorpus)}
                    </td>
                    <td className="px-4 py-4 text-right text-foreground hidden lg:table-cell">
                      Age {Number(client.retirementAge)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(client)}
                          data-ocid={`clients.edit_button.${idx + 1}`}
                          className="h-8 w-8 text-muted-foreground hover:text-gold hover:bg-gold/10"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(client.id)}
                          data-ocid={`clients.delete_button.${idx + 1}`}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="client.form.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {editingClient ? "Edit Client" : "Add New Client"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Rajesh Kumar Sharma"
                  className="bg-background border-border"
                  data-ocid="client.name.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="currentAge"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Current Age
                </Label>
                <Input
                  id="currentAge"
                  type="number"
                  required
                  min={18}
                  max={100}
                  value={form.currentAge}
                  onChange={(e) =>
                    setForm({ ...form, currentAge: e.target.value })
                  }
                  placeholder="35"
                  className="bg-background border-border"
                  data-ocid="client.current_age.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="retirementAge"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Retirement Age
                </Label>
                <Input
                  id="retirementAge"
                  type="number"
                  required
                  min={40}
                  max={80}
                  value={form.retirementAge}
                  onChange={(e) =>
                    setForm({ ...form, retirementAge: e.target.value })
                  }
                  placeholder="60"
                  className="bg-background border-border"
                  data-ocid="client.retirement_age.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="riskProfile"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Risk Profile
                </Label>
                <Select
                  value={form.riskProfile}
                  onValueChange={(v) => setForm({ ...form, riskProfile: v })}
                >
                  <SelectTrigger
                    id="riskProfile"
                    className="bg-background border-border"
                    data-ocid="client.risk.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="Conservative">Conservative</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="monthlyIncome"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Monthly Income (₹)
                </Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  required
                  min={0}
                  value={form.monthlyIncome}
                  onChange={(e) =>
                    setForm({ ...form, monthlyIncome: e.target.value })
                  }
                  placeholder="150000"
                  className="bg-background border-border"
                  data-ocid="client.income.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="monthlyExpenses"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Monthly Expenses (₹)
                </Label>
                <Input
                  id="monthlyExpenses"
                  type="number"
                  required
                  min={0}
                  value={form.monthlyExpenses}
                  onChange={(e) =>
                    setForm({ ...form, monthlyExpenses: e.target.value })
                  }
                  placeholder="80000"
                  className="bg-background border-border"
                  data-ocid="client.expenses.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="currentSavings"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Current Savings (₹)
                </Label>
                <Input
                  id="currentSavings"
                  type="number"
                  required
                  min={0}
                  value={form.currentSavings}
                  onChange={(e) =>
                    setForm({ ...form, currentSavings: e.target.value })
                  }
                  placeholder="2500000"
                  className="bg-background border-border"
                  data-ocid="client.savings.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="targetCorpus"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Target Corpus (₹)
                </Label>
                <Input
                  id="targetCorpus"
                  type="number"
                  required
                  min={0}
                  value={form.targetCorpus}
                  onChange={(e) =>
                    setForm({ ...form, targetCorpus: e.target.value })
                  }
                  placeholder="50000000"
                  className="bg-background border-border"
                  data-ocid="client.corpus.input"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label
                  htmlFor="goals"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Financial Goals
                </Label>
                <Textarea
                  id="goals"
                  value={form.goals}
                  onChange={(e) => setForm({ ...form, goals: e.target.value })}
                  placeholder="Retirement at 60, children's education, home purchase..."
                  className="bg-background border-border resize-none"
                  rows={3}
                  data-ocid="client.goals.textarea"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="client.form.cancel_button"
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                data-ocid="client.save.submit_button"
                className="bg-gold hover:bg-gold/90 text-primary-foreground font-semibold"
              >
                {isSaving && (
                  <Loader2 size={14} className="mr-2 animate-spin" />
                )}
                {isSaving
                  ? "Saving..."
                  : editingClient
                    ? "Update Client"
                    : "Add Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent
          className="bg-card border-border"
          data-ocid="clients.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Client
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the client and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border"
              data-ocid="clients.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              data-ocid="clients.delete.confirm_button"
            >
              {deleteMutation.isPending && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
