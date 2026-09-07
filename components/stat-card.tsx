"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  detail?: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, subtitle, icon, detail, trend, trendUp }: StatCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -7, scale: 1.03 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="glass-card p-6 cursor-default relative overflow-hidden"
      style={{
        boxShadow: hovered
          ? "0 0 36px 8px rgba(0,123,255,0.22), 0 24px 48px rgba(0,0,0,0.45)"
          : "none",
        transition: "box-shadow 0.35s ease",
        borderTop: hovered
          ? "1px solid rgba(0,123,255,0.6)"
          : "1px solid rgba(255,255,255,0.15)",
      }}
    >
      {/* Hover shimmer overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        style={{
          background: "linear-gradient(135deg, rgba(0,123,255,0.10) 0%, transparent 60%)",
        }}
      />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <span className="font-mono text-xs text-muted uppercase tracking-wider">{title}</span>
        <motion.div
          animate={{ scale: hovered ? 1.2 : 1, rotate: hovered ? 8 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
          style={{
            boxShadow: hovered ? "0 0 16px rgba(0,123,255,0.6)" : "none",
            transition: "box-shadow 0.3s ease",
          }}
        >
          {icon}
        </motion.div>
      </div>

      <motion.div
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ duration: 0.25 }}
        className="text-3xl font-sentient text-foreground mb-1 relative z-10"
      >
        {value}
      </motion.div>

      <p className="font-mono text-xs text-muted relative z-10">{subtitle}</p>

      {/* Reveal panel on hover */}
      <AnimatePresence>
        {hovered && (detail || trend) && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden relative z-10"
          >
            <div className="mt-3 pt-3 border-t border-white/[0.07] flex items-center justify-between">
              {detail && <p className="font-mono text-xs text-primary/80">{detail}</p>}
              {trend && (
                <p className={`font-mono text-xs font-semibold ${trendUp ? "text-green-400" : "text-red-400"}`}>
                  {trendUp ? "▲" : "▼"} {trend}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
