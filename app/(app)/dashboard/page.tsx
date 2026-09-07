"use client";
 
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { StatCard } from "@/components/stat-card";
import { TrustScore } from "@/components/trust-score";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
 
function IPIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12h6m-3-3v6m-7 6h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
 
function VerifiedIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
 
function ProposalIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
 
function FundingIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
 
const dotColor: Record<string, string> = {
  IDEA_COMMITTED: "bg-green-400",
  PROPOSAL_VOTED: "bg-primary",
  PROPOSAL_CREATED: "bg-yellow-400",
  PROPOSAL_FUNDED: "bg-emerald-400",
};
 
export default function DashboardPage() {
  const [stats, setStats] = useState({
    ipAssets: 0,
    verified: 0,
    proposals: 0,
    totalRaised: "0",
  });
  const [activities, setActivities] = useState<any[]>([]);
 
  useEffect(() => {
    const load = () => {
      api.getStats().then(setStats).catch(console.error);
      api.getActivity().then(setActivities).catch(console.error);
    };
    load();
    // Poll every 10 seconds to pick up new vault commits and proposals
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);
 
  return (
    <div className="max-w-7xl mx-auto">
      <AppHeader title="Dashboard" />
 
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="IP Assets" value={String(stats.ipAssets)} subtitle="Total registered" icon={<IPIcon />}
          detail="3 pending review" trend="18% this month" trendUp
        />
        <StatCard
          title="Verified" value={String(stats.verified)} subtitle="On-chain proofs" icon={<VerifiedIcon />}
          detail="Last verified 2h ago" trend="4 new this week" trendUp
        />
        <StatCard
          title="Proposals" value={String(stats.proposals)} subtitle="Active funding" icon={<ProposalIcon />}
          detail="2 closing soon" trend="1 expired" trendUp={false}
        />
        <StatCard
          title="Total Raised" value={`${parseFloat(stats.totalRaised).toFixed(2)} ETH`} subtitle="Across all assets" icon={<FundingIcon />}
          detail="Goal: $5M" trend="32% of target" trendUp
        />
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TrustScore score={87} />
        </div>
 
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-mono text-sm text-muted mb-6 uppercase tracking-wider">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="font-mono text-xs text-muted text-center py-4">No activity yet</p>
            ) : (
              activities.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ x: 4, backgroundColor: "rgba(0,123,255,0.04)" }}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-card-border hover:border-primary/30 transition-all duration-200 cursor-default"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${dotColor[item.type] || "bg-gray-400"}`}
                      style={{ boxShadow: item.type === "PROPOSAL_VOTED" ? "0 0 6px rgba(0,123,255,0.8)" : undefined }}
                    />
                    <div>
                      <p className="font-mono text-sm text-foreground">{item.description}</p>
                      <p className="font-mono text-xs text-muted">
                        {item.txHash ? `${item.txHash.slice(0, 12)}...` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}