import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Activity,
  Calculator,
  ChevronRight,
  LayoutDashboard,
  Menu,
  PieChart,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Page =
  | "dashboard"
  | "clients"
  | "sip-calculator"
  | "retirement-buckets"
  | "monte-carlo"
  | "stress-test";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  ocid: string;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    ocid: "nav.dashboard.link",
  },
  {
    id: "clients",
    label: "Clients",
    icon: <Users size={18} />,
    ocid: "nav.clients.link",
  },
  {
    id: "sip-calculator",
    label: "SIP Calculator",
    icon: <Calculator size={18} />,
    ocid: "nav.sip.link",
  },
  {
    id: "retirement-buckets",
    label: "Retirement Buckets",
    icon: <PieChart size={18} />,
    ocid: "nav.buckets.link",
  },
  {
    id: "monte-carlo",
    label: "Monte Carlo",
    icon: <Activity size={18} />,
    ocid: "nav.monte-carlo.link",
  },
  {
    id: "stress-test",
    label: "Stress Test",
    icon: <Zap size={18} />,
    ocid: "nav.stress.link",
  },
];

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

export default function Layout({
  currentPage,
  onNavigate,
  children,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-sidebar">
        <SidebarContent currentPage={currentPage} onNavigate={onNavigate} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-border bg-sidebar lg:hidden"
            >
              <div className="flex justify-end p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X size={18} />
                </Button>
              </div>
              <SidebarContent
                currentPage={currentPage}
                onNavigate={(page) => {
                  onNavigate(page);
                  setSidebarOpen(false);
                }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex lg:hidden items-center gap-3 border-b border-border px-4 py-3 bg-sidebar">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </Button>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-gold" />
            <span className="font-display font-semibold text-foreground">
              FinPlan Advisor
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-6 py-3 bg-sidebar text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

function SidebarContent({
  currentPage,
  onNavigate,
}: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15 border border-gold/30">
          <TrendingUp size={18} className="text-gold" />
        </div>
        <div>
          <p className="font-display font-bold text-sm text-foreground leading-none">
            FinPlan
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Advisor Pro</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-2 mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-ocid={item.ocid}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-gold/15 text-gold border border-gold/25"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent",
              )}
            >
              <span
                className={cn(
                  "transition-colors",
                  active
                    ? "text-gold"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
              {active && (
                <ChevronRight size={14} className="ml-auto text-gold" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="rounded-lg bg-gold/10 border border-gold/20 px-3 py-3">
          <p className="text-xs font-semibold text-gold">Professional Suite</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Monte Carlo • SIP • Buckets
          </p>
        </div>
      </div>
    </div>
  );
}

export type { Page };
