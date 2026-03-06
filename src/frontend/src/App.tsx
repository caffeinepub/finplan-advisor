import Layout, { type Page } from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";
import Clients from "@/pages/Clients";
import Dashboard from "@/pages/Dashboard";
import MonteCarlo from "@/pages/MonteCarlo";
import RetirementBuckets from "@/pages/RetirementBuckets";
import SIPCalculator from "@/pages/SIPCalculator";
import StressTest from "@/pages/StressTest";
import { useState } from "react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "clients":
        return <Clients />;
      case "sip-calculator":
        return <SIPCalculator />;
      case "retirement-buckets":
        return <RetirementBuckets />;
      case "monte-carlo":
        return <MonteCarlo />;
      case "stress-test":
        return <StressTest />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  }

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.18 0.025 255)",
            border: "1px solid oklch(0.26 0.035 255)",
            color: "oklch(0.93 0.01 245)",
          },
        }}
      />
    </>
  );
}
