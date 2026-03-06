import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SIPResult {
    feasibilityScore: number;
    sipGap: number;
    requiredMonthlySIP: number;
}
export interface AdvisorStats {
    totalAUM: number;
    totalClients: bigint;
    avgCorpusTarget: number;
}
export interface StressTestResult {
    impactPercentage: number;
    scenario: string;
    adjustedSIP: number;
    adjustedCorpus: number;
}
export interface SimulationResult {
    percentile10: Array<number>;
    percentile50: Array<number>;
    percentile90: Array<number>;
    successProbability: number;
}
export interface Client {
    id: bigint;
    age: bigint;
    owner: Principal;
    name: string;
    createdAt: bigint;
    retirementAge: bigint;
    targetCorpus: number;
    goals: string;
    riskProfile: string;
    currentSavings: number;
    currentAge: bigint;
    monthlyExpenses: number;
    monthlyIncome: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addClient(name: string, age: bigint, riskProfile: string, monthlyIncome: number, monthlyExpenses: number, currentSavings: number, targetCorpus: number, retirementAge: bigint, currentAge: bigint, goals: string): Promise<bigint>;
    applyStressTest(clientId: bigint, scenario: string): Promise<StressTestResult | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateSIP(targetCorpus: number, currentSavings: number, years: bigint, annualReturn: number, inflationRate: number): Promise<SIPResult>;
    deleteClient(id: bigint): Promise<boolean>;
    getAdvisorStats(): Promise<AdvisorStats>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClient(id: bigint): Promise<Client | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listClients(): Promise<Array<Client>>;
    runMonteCarloSimulation(initialCorpus: number, monthlySIP: number, years: bigint, _meanReturn: number, _stdDev: number, _simCount: bigint): Promise<SimulationResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateClient(id: bigint, name: string, age: bigint, riskProfile: string, monthlyIncome: number, monthlyExpenses: number, currentSavings: number, targetCorpus: number, retirementAge: bigint, currentAge: bigint, goals: string): Promise<boolean>;
}
