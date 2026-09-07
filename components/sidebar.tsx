"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { name: "The Vault", href: "/vault", icon: VaultIcon },
  { name: "The Reveal", href: "/reveal", icon: RevealIcon },
  { name: "Funding DAO", href: "/dao", icon: DAOIcon },
  { name: "Network", href: "/network", icon: NetworkIcon },
];

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function VaultIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 9v-2" />
    </svg>
  );
}

function RevealIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function DAOIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18" />
      <path d="M3 12h18" />
    </svg>
  );
}

function NetworkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M12 7v5" />
      <path d="M5 17l7-5 7 5" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { walletAddress, disconnect } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 glass-card border-r border-card-border z-40 flex flex-col">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-card-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center azure-glow-subtle">
            <span className="text-primary font-bold text-lg">P</span>
          </div>
          <span className="hidden lg:block font-mono text-lg tracking-tight text-foreground">
            ProofFund
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary azure-glow-subtle"
                      : "text-muted hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive
                        ? "text-primary"
                        : "text-muted group-hover:text-foreground"
                    )}
                  />
                  <span className="hidden lg:block font-mono text-sm">
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: wallet info + disconnect */}
      <div className="p-4 border-t border-card-border space-y-3">
        {walletAddress && (
          <div className="hidden lg:block px-3 py-2 rounded-lg bg-white/[0.02] border border-card-border">
            <p className="font-mono text-xs text-muted uppercase mb-1">Connected</p>
            <p className="font-mono text-xs text-primary truncate">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
        )}
        <button
          onClick={() => {
            disconnect();
            window.location.href = "/";
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:border-white/20 transition-colors font-mono text-xs uppercase"
        >
          <LogoutIcon className="w-4 h-4 shrink-0" />
          <span className="hidden lg:block">Disconnect</span>
        </button>
      </div>
    </aside>
  );
}
