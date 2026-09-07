"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className, delay = 0 }: GlassCardProps) {
  const delayMs = delay * 1000;

  return (
    <div
      className={cn(
        "relative backdrop-blur-3xl bg-white/[0.02] border-t border-white/[0.15] rounded-2xl p-8",
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/[0.05] before:to-transparent before:pointer-events-none",
        "animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both",
        className
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
