"use client";

import { useAuth } from "@/context/auth-context";

export function AppHeader({ title }: { title: string }) {
  const { walletAddress } = useAuth();

  return (
    <header className="flex items-center justify-between mb-8">
      <h1 className="text-2xl md:text-3xl font-sentient text-foreground">
        {title}
      </h1>
      {walletAddress && (
        <div className="px-4 py-2 rounded-lg font-mono text-sm border bg-primary/10 border-primary text-primary pulse-azure">
          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </div>
      )}
    </header>
  );
}
