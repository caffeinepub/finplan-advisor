import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdvisorStats,
  Client,
  SIPResult,
  SimulationResult,
  StressTestResult,
} from "../backend.d";
import { useActor } from "./useActor";

export function useListClients() {
  const { actor, isFetching } = useActor();
  return useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listClients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetClient(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Client | null>({
    queryKey: ["client", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getClient(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAdvisorStats() {
  const { actor, isFetching } = useActor();
  return useQuery<AdvisorStats>({
    queryKey: ["advisorStats"],
    queryFn: async () => {
      if (!actor)
        return { totalAUM: 0, totalClients: BigInt(0), avgCorpusTarget: 0 };
      return actor.getAdvisorStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddClient() {
  const qc = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: (params: {
      name: string;
      age: bigint;
      riskProfile: string;
      monthlyIncome: number;
      monthlyExpenses: number;
      currentSavings: number;
      targetCorpus: number;
      retirementAge: bigint;
      currentAge: bigint;
      goals: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addClient(
        params.name,
        params.age,
        params.riskProfile,
        params.monthlyIncome,
        params.monthlyExpenses,
        params.currentSavings,
        params.targetCorpus,
        params.retirementAge,
        params.currentAge,
        params.goals,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["advisorStats"] });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: (params: {
      id: bigint;
      name: string;
      age: bigint;
      riskProfile: string;
      monthlyIncome: number;
      monthlyExpenses: number;
      currentSavings: number;
      targetCorpus: number;
      retirementAge: bigint;
      currentAge: bigint;
      goals: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateClient(
        params.id,
        params.name,
        params.age,
        params.riskProfile,
        params.monthlyIncome,
        params.monthlyExpenses,
        params.currentSavings,
        params.targetCorpus,
        params.retirementAge,
        params.currentAge,
        params.goals,
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client", vars.id.toString()] });
      qc.invalidateQueries({ queryKey: ["advisorStats"] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteClient(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["advisorStats"] });
    },
  });
}

export function useCalculateSIP() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: (params: {
      targetCorpus: number;
      currentSavings: number;
      years: bigint;
      annualReturn: number;
      inflationRate: number;
    }): Promise<SIPResult> => {
      if (!actor) throw new Error("Actor not ready");
      return actor.calculateSIP(
        params.targetCorpus,
        params.currentSavings,
        params.years,
        params.annualReturn,
        params.inflationRate,
      );
    },
  });
}

export function useRunMonteCarloSimulation() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: (params: {
      initialCorpus: number;
      monthlySIP: number;
      years: bigint;
      meanReturn: number;
      stdDev: number;
      simCount: bigint;
    }): Promise<SimulationResult> => {
      if (!actor) throw new Error("Actor not ready");
      return actor.runMonteCarloSimulation(
        params.initialCorpus,
        params.monthlySIP,
        params.years,
        params.meanReturn,
        params.stdDev,
        params.simCount,
      );
    },
  });
}

export function useApplyStressTest() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: (params: {
      clientId: bigint;
      scenario: string;
    }): Promise<StressTestResult | null> => {
      if (!actor) throw new Error("Actor not ready");
      return actor.applyStressTest(params.clientId, params.scenario);
    },
  });
}
