"use client";

import { AppHeader } from "@/components/app-header";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Proposal {
  id: string;
  title: string;
  description: string;
  requestedAmount: string;
  currentFunding: number;
  targetFunding: number;
  votes: number;
  votesYes: number;
  votesNo: number;
  status: "active" | "funded" | "expired";
  daysLeft: number;
  category?: string;
}

// ── MOCK FALLBACK DATA (12 proposals) ─────────────────────────────────────────
// Logic: Page initializes with these so UI is always populated.
// If backend returns real data → mocks are replaced.
// If backend is empty/unreachable → mocks stay, usingMock flag set to true.
const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "1",
    title: "Decentralized Carbon Credit Oracle",
    description: "Building a trustless oracle network for verifiable carbon credit data on-chain with real-time price feeds.",
    requestedAmount: "1.0060 ETH",
    currentFunding: 1.006,
    targetFunding: 1.006,
    votes: 19,
    votesYes: 17,
    votesNo: 2,
    status: "active",
    daysLeft: 30,
    category: "Infrastructure",
  },
  {
    id: "2",
    title: "ZK-Proof Identity Verification Layer",
    description: "Privacy-preserving identity protocol using zero-knowledge proofs for DAO governance and on-chain credentials.",
    requestedAmount: "2.5000 ETH",
    currentFunding: 1.32,
    targetFunding: 2.5,
    votes: 44,
    votesYes: 38,
    votesNo: 6,
    status: "active",
    daysLeft: 18,
    category: "Privacy",
  },
  {
    id: "3",
    title: "Cross-Chain Liquidity Bridge v2",
    description: "Upgrade existing bridge infrastructure to support 12 new EVM-compatible chains with enhanced security audits.",
    requestedAmount: "5.0000 ETH",
    currentFunding: 5.0,
    targetFunding: 5.0,
    votes: 91,
    votesYes: 74,
    votesNo: 17,
    status: "funded",
    daysLeft: 0,
    category: "DeFi",
  },
  {
    id: "4",
    title: "On-Chain Governance Analytics Dashboard",
    description: "Real-time analytics and transparency tooling for DAO proposal lifecycle tracking and voter participation metrics.",
    requestedAmount: "0.8000 ETH",
    currentFunding: 0.31,
    targetFunding: 0.8,
    votes: 12,
    votesYes: 9,
    votesNo: 3,
    status: "active",
    daysLeft: 7,
    category: "Governance",
  },
  {
    id: "5",
    title: "Decentralized IP Registry Protocol",
    description: "Immutable, censorship-resistant intellectual property registration on Ethereum mainnet with NFT-based ownership.",
    requestedAmount: "3.2000 ETH",
    currentFunding: 0.48,
    targetFunding: 3.2,
    votes: 5,
    votesYes: 3,
    votesNo: 2,
    status: "active",
    daysLeft: 45,
    category: "Legal",
  },
  {
    id: "6",
    title: "Quantum-Resistant Encryption Protocol",
    description: "Development of post-quantum cryptographic algorithms for blockchain security against future quantum computing threats.",
    requestedAmount: "500000",
    currentFunding: 380000,
    targetFunding: 500000,
    votes: 1247,
    votesYes: 1089,
    votesNo: 158,
    status: "active",
    daysLeft: 12,
    category: "Security",
  },
  {
    id: "7",
    title: "Decentralized Identity Framework",
    description: "Self-sovereign identity solution built on verifiable credentials and decentralized identifiers for Web3 onboarding.",
    requestedAmount: "250000",
    currentFunding: 250000,
    targetFunding: 250000,
    votes: 892,
    votesYes: 801,
    votesNo: 91,
    status: "funded",
    daysLeft: 0,
    category: "Identity",
  },
  {
    id: "8",
    title: "AI-Powered Patent Analysis Engine",
    description: "Machine learning system for automated prior art search and analysis, reducing IP litigation costs for Web3 projects.",
    requestedAmount: "150000",
    currentFunding: 89000,
    targetFunding: 150000,
    votes: 534,
    votesYes: 421,
    votesNo: 113,
    status: "active",
    daysLeft: 5,
    category: "AI/ML",
  },
  {
    id: "9",
    title: "Layer 2 MEV Protection Suite",
    description: "Commit-reveal scheme and private mempool infrastructure to eliminate maximal extractable value on rollup networks.",
    requestedAmount: "4.8000 ETH",
    currentFunding: 1.92,
    targetFunding: 4.8,
    votes: 67,
    votesYes: 52,
    votesNo: 15,
    status: "active",
    daysLeft: 22,
    category: "DeFi",
  },
  {
    id: "10",
    title: "DAO Treasury Diversification Fund",
    description: "Automated rebalancing strategy across stablecoins, ETH, and real-world assets to reduce treasury volatility exposure.",
    requestedAmount: "10.0000 ETH",
    currentFunding: 10.0,
    targetFunding: 10.0,
    votes: 203,
    votesYes: 188,
    votesNo: 15,
    status: "funded",
    daysLeft: 0,
    category: "Governance",
  },
  {
    id: "11",
    title: "Decentralized Science Publishing Platform",
    description: "Peer-reviewed research platform eliminating journal gatekeepers. Authors retain IP, reviewers earn token rewards.",
    requestedAmount: "2.0000 ETH",
    currentFunding: 0.22,
    targetFunding: 2.0,
    votes: 8,
    votesYes: 6,
    votesNo: 2,
    status: "active",
    daysLeft: 60,
    category: "Research",
  },
  {
    id: "12",
    title: "Smart Contract Audit Bounty Pool",
    description: "Community-funded bounty pool for independent security researchers to audit critical DeFi infrastructure code.",
    requestedAmount: "6.5000 ETH",
    currentFunding: 4.875,
    targetFunding: 6.5,
    votes: 149,
    votesYes: 131,
    votesNo: 18,
    status: "active",
    daysLeft: 3,
    category: "Security",
  },
];

// ── Category color map ────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Infrastructure: "text-blue-300 border-blue-500/30 bg-blue-500/10",
  Privacy:        "text-purple-300 border-purple-500/30 bg-purple-500/10",
  DeFi:           "text-yellow-300 border-yellow-500/30 bg-yellow-500/10",
  Governance:     "text-cyan-300 border-cyan-500/30 bg-cyan-500/10",
  Legal:          "text-orange-300 border-orange-500/30 bg-orange-500/10",
  Security:       "text-red-300 border-red-500/30 bg-red-500/10",
  Identity:       "text-teal-300 border-teal-500/30 bg-teal-500/10",
  "AI/ML":        "text-pink-300 border-pink-500/30 bg-pink-500/10",
  Research:       "text-lime-300 border-lime-500/30 bg-lime-500/10",
};

function CategoryBadge({ category }: { category?: string }) {
  if (!category) return null;
  return (
    <span className={`font-mono text-xs px-2 py-1 rounded-full border ${CATEGORY_COLORS[category] ?? "text-muted border-card-border bg-white/5"}`}>
      {category}
    </span>
  );
}

// ── Filter Tabs ───────────────────────────────────────────────────────────────
type FilterKey = "all" | "active" | "funded" | "expired";

function FilterTabs({ active, onChange, counts }: { active: FilterKey; onChange: (v: FilterKey) => void; counts: Record<string, number> }) {
  const tabs: { key: FilterKey; label: string }[] = [
    { key: "all",     label: "All" },
    { key: "active",  label: "Active" },
    { key: "funded",  label: "Funded" },
    { key: "expired", label: "Expired" },
  ];
  return (
    <div className="flex items-center gap-2">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
            active === key
              ? "bg-primary/10 border-primary/50 text-primary"
              : "bg-white/[0.02] border-card-border text-muted hover:text-foreground hover:border-white/20"
          }`}
        >
          {label}
          <span className="ml-1.5 opacity-60">({counts[key] ?? 0})</span>
        </button>
      ))}
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ current, target }: { current: number; target: number }) {
  const pct = Math.min((current / (target > 0 ? target : 1)) * 100, 100);
  return (
    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-[#00BFFF] rounded-full progress-glow"
      />
    </div>
  );
}

// ── Vote Modal ────────────────────────────────────────────────────────────────
function VoteModal({ proposal, onClose, onVote }: {
  proposal: Proposal;
  onClose: () => void;
  onVote: (id: string, vote: "yes" | "no") => void;
}) {
  const [chosen, setChosen] = useState<"yes" | "no" | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const yesPercent = proposal.votes > 0 ? (proposal.votesYes / proposal.votes) * 100 : 0;

  const handleConfirm = () => {
    if (!chosen) return;
    onVote(proposal.id, chosen);
    setConfirmed(true);
    setTimeout(onClose, 1400);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md mx-4 glass-card p-8"
        style={{ border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!confirmed ? (
          <>
            <h3 className="font-sentient text-xl text-foreground mb-2">Cast Your Vote</h3>
            <p className="font-mono text-xs text-muted mb-6 leading-relaxed">{proposal.title}</p>

            <div className="mb-6 p-4 rounded-lg bg-white/[0.02] border border-card-border">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-xs text-green-400">YES — {proposal.votesYes.toLocaleString()}</span>
                <span className="font-mono text-xs text-red-400">NO — {proposal.votesNo.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${yesPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                  style={{ boxShadow: "0 0 8px rgba(34,197,94,0.6)" }}
                />
              </div>
              <p className="font-mono text-xs text-muted mt-2 text-center">
                {yesPercent.toFixed(1)}% approval · {proposal.votes.toLocaleString()} total votes
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {(["yes", "no"] as const).map((opt) => (
                <motion.button
                  key={opt}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setChosen(opt)}
                  className={`py-4 rounded-xl font-mono text-sm uppercase tracking-wider border transition-all duration-200 ${
                    chosen === opt
                      ? opt === "yes"
                        ? "bg-green-500/20 border-green-400 text-green-400"
                        : "bg-red-500/20 border-red-400 text-red-400"
                      : "bg-white/[0.02] border-card-border text-muted hover:border-white/30 hover:text-foreground"
                  }`}
                  style={{
                    boxShadow:
                      chosen === opt
                        ? opt === "yes"
                          ? "0 0 20px rgba(34,197,94,0.3)"
                          : "0 0 20px rgba(239,68,68,0.3)"
                        : "none",
                  }}
                >
                  {opt === "yes" ? "✓ Yes" : "✕ No"}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: chosen ? 1.02 : 1 }}
              whileTap={{ scale: chosen ? 0.98 : 1 }}
              onClick={handleConfirm}
              disabled={!chosen}
              className="w-full py-3 rounded-xl font-mono text-sm uppercase tracking-wider border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-primary/10 border-primary text-primary btn-glow hover:bg-primary/20"
            >
              Confirm Vote
            </motion.button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: chosen === "yes" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)" }}
            >
              <span className="text-2xl">{chosen === "yes" ? "✓" : "✕"}</span>
            </div>
            <h3 className="font-sentient text-lg text-foreground mb-1">Vote Recorded!</h3>
            <p className="font-mono text-xs text-muted">
              You voted <span className={chosen === "yes" ? "text-green-400" : "text-red-400"}>{chosen?.toUpperCase()}</span>
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Fund Modal ────────────────────────────────────────────────────────────────
function FundModal({ proposal, onClose, onFund }: {
  proposal: Proposal;
  onClose: () => void;
  onFund: (id: string, amount: number, wallet: string, note: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");

  const parsed = parseFloat(amount.replace(/,/g, "")) || 0;
  const remaining = proposal.targetFunding - proposal.currentFunding;
  const pct = Math.min((parsed / (remaining > 0 ? remaining : proposal.targetFunding)) * 100, 100);
  const isLarge = proposal.targetFunding > 100;

  const handleNext = () => { if (parsed > 0 && wallet) setStep("confirm"); };
  const handleConfirm = () => {
    onFund(proposal.id, parsed, wallet, note);
    setStep("success");
    setTimeout(onClose, 1800);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md mx-4 glass-card p-8"
        style={{ border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === "form" && (
          <>
            <h3 className="font-sentient text-xl text-foreground mb-1">Fund This Proposal</h3>
            <p className="font-mono text-xs text-muted mb-6 leading-relaxed">{proposal.title}</p>

            <div className="mb-6 p-4 rounded-lg bg-white/[0.02] border border-card-border">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-xs text-muted">Remaining</span>
                <span className="font-mono text-xs text-primary">
                  {isLarge ? `$${remaining.toLocaleString()}` : `${remaining.toFixed(4)} ETH`} needed
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-[#00BFFF] rounded-full progress-glow"
                  style={{ width: `${(proposal.currentFunding / proposal.targetFunding) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-2">
                  Amount {isLarge ? "(USD)" : "(ETH)"}
                </label>
                <input
                  type="number" min="0.001" step="0.001"
                  placeholder={isLarge ? "e.g. 5000" : "e.g. 0.5"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-primary/30 rounded-lg font-mono text-sm text-foreground placeholder:text-muted/40 focus:outline-none input-azure transition-all"
                />
                {parsed > 0 && (
                  <div className="mt-2">
                    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        animate={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                        style={{ boxShadow: "0 0 8px rgba(34,197,94,0.5)" }}
                      />
                    </div>
                    <p className="font-mono text-xs text-green-400 mt-1">Covers {pct.toFixed(1)}% of remaining goal</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-2">Wallet Address</label>
                <input
                  type="text" placeholder="0x..."
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-primary/30 rounded-lg font-mono text-sm text-foreground placeholder:text-muted/40 focus:outline-none input-azure transition-all"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-2">Note (Optional)</label>
                <input
                  type="text" placeholder="Supporting decentralized IP..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-primary/30 rounded-lg font-mono text-sm text-foreground placeholder:text-muted/40 focus:outline-none input-azure transition-all"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: parsed > 0 && wallet ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!(parsed > 0 && wallet)}
              className="w-full py-3 rounded-xl font-mono text-sm uppercase tracking-wider border disabled:opacity-40 disabled:cursor-not-allowed bg-primary/10 border-primary text-primary btn-glow hover:bg-primary/20 transition-all"
            >
              Review Transaction →
            </motion.button>
          </>
        )}

        {step === "confirm" && (
          <>
            <h3 className="font-sentient text-xl text-foreground mb-6">Confirm Transaction</h3>
            <div className="space-y-3 mb-8">
              {[
                { label: "Proposal",     val: proposal.title },
                { label: "Amount",       val: isLarge ? `$${parseFloat(amount).toLocaleString()}` : `${parseFloat(amount)} ETH` },
                { label: "From",         val: wallet.length > 16 ? wallet.slice(0, 8) + "..." + wallet.slice(-6) : wallet },
                { label: "Network Fee",  val: "~$2.40 (estimated)" },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-start justify-between p-3 rounded-lg bg-white/[0.02] border border-card-border">
                  <span className="font-mono text-xs text-muted uppercase">{label}</span>
                  <span className="font-mono text-xs text-foreground text-right max-w-[60%]">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 py-3 rounded-xl font-mono text-xs uppercase border border-card-border text-muted hover:text-foreground hover:border-white/20 transition-all"
              >
                ← Back
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl font-mono text-xs uppercase bg-primary/10 border border-primary text-primary btn-glow hover:bg-primary/20 transition-all"
              >
                Confirm & Fund
              </motion.button>
            </div>
          </>
        )}

        {step === "success" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/15 flex items-center justify-center"
              style={{ boxShadow: "0 0 24px rgba(34,197,94,0.3)" }}
            >
              <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-sentient text-lg text-foreground mb-1">Funded Successfully!</h3>
            <p className="font-mono text-xs text-muted">
              <span className="text-green-400">
                {isLarge ? `$${parseFloat(amount).toLocaleString()}` : `${parseFloat(amount)} ETH`}
              </span>{" "}
              committed to this proposal
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
// ── Create Proposal Modal ────────────────────────────────────────────────────
function CreateProposalModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, description: string, amount: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !amount) return;
    setSubmitting(true);
    await onCreate(title, description, amount);
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-md p-8 relative"
        style={{ border: "1px solid rgba(0,123,255,0.35)" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-foreground text-xs">✕</button>
        <h3 className="font-sentient text-lg text-foreground mb-6">Create New Proposal</h3>
        <div className="space-y-4">
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wider block mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Proposal title..."
              className="w-full px-3 py-2 bg-black border border-primary/30 rounded-lg font-mono text-sm text-foreground placeholder:text-muted/50 focus:outline-none input-azure"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wider block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your proposal..."
              rows={3}
              className="w-full px-3 py-2 bg-black border border-primary/30 rounded-lg font-mono text-sm text-foreground placeholder:text-muted/50 focus:outline-none input-azure resize-none"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-muted uppercase tracking-wider block mb-1">Requested Amount (ETH)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2.5"
              className="w-full px-3 py-2 bg-black border border-primary/30 rounded-lg font-mono text-sm text-foreground placeholder:text-muted/50 focus:outline-none input-azure"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting || !title || !amount}
            className="w-full py-3 rounded-lg font-mono text-sm uppercase tracking-wider bg-primary/10 border border-primary text-primary btn-glow hover:bg-primary/20 transition-all disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Proposal"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DAOPage() {
  const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [voteModal, setVoteModal] = useState<Proposal | null>(null);
  const [fundModal, setFundModal] = useState<Proposal | null>(null);
  const [createModal, setCreateModal] = useState(false);

  // ── Backend fetch ─────────────────────────────────────────────────────────
  // Logic: If backend returns real proposals → replace mocks entirely.
  // If empty or error → keep mocks, mark usingMock=true (shows Demo Mode badge).
  useEffect(() => {
    api.getProposals()
      .then((data: any[]) => {
        if (!data || data.length === 0) {
          setUsingMock(true);
        } else {
          setProposals(
            data.map((p) => {
              const current = Number(p.totalFunds) / 1e18;
              const target  = p.targetFunds ? Number(p.targetFunds) / 1e18 : Math.max(current, 1);
              return {
                id: String(p.id),
                title: p.title,
                description: p.description || p.ipfsHash || "",
                requestedAmount: `${target.toFixed(4)} ETH`,
                currentFunding: current,
                targetFunding: target,
                votes: (p.yesVotes || 0) + (p.noVotes || 0),
                votesYes: p.yesVotes || 0,
                votesNo: p.noVotes || 0,
                status: p.active ? "active" : "funded",
                daysLeft: p.active ? Math.max(0, Math.ceil((p.timestamp + 86400000 * 30 - Date.now()) / 86400000)) : 0,
                category: p.category || "Protocol",
              };
            })
          );
          setUsingMock(false);
        }
      })
      .catch(() => setUsingMock(true))
      .finally(() => setLoading(false));

    // Poll every 15s to pick up new votes/funding from other users
    const poll = setInterval(() => {
      api.getProposals()
        .then((data: any[]) => {
          if (data && data.length > 0) {
            setProposals(
              data.map((p) => {
                const current = Number(p.totalFunds) / 1e18;
                const target  = p.targetFunds ? Number(p.targetFunds) / 1e18 : Math.max(current, 1);
                return {
                  id: String(p.id),
                  title: p.title,
                  description: p.description || p.ipfsHash || "",
                  requestedAmount: `${target.toFixed(4)} ETH`,
                  currentFunding: current,
                  targetFunding: target,
                  votes: (p.yesVotes || 0) + (p.noVotes || 0),
                  votesYes: p.yesVotes || 0,
                  votesNo: p.noVotes || 0,
                  status: p.active ? "active" : "funded",
                  daysLeft: p.active ? Math.max(0, Math.ceil((p.timestamp + 86400000 * 30 - Date.now()) / 86400000)) : 0,
                  category: p.category || "Protocol",
                };
              })
            );
            setUsingMock(false);
          }
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(poll);
  }, []);

  // ── Vote handler ──────────────────────────────────────────────────────────
  // Logic: OPTIMISTIC — counters update instantly in UI so vote bar animates.
  // Backend call runs in background. On success, syncs canonical values.
  // On failure, optimistic state is kept (user already sees the change).
  const handleVote = async (proposalId: string, vote: "yes" | "no") => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        const newYes = vote === "yes" ? p.votesYes + 1 : p.votesYes;
        const newNo  = vote === "no"  ? p.votesNo  + 1 : p.votesNo;
        return { ...p, votesYes: newYes, votesNo: newNo, votes: newYes + newNo };
      })
    );
    if (!usingMock) {
      try {
        const updated = await api.voteProposal(proposalId, vote);
        if (!updated.error) {
          setProposals((prev) =>
            prev.map((p) =>
              p.id === proposalId
                ? { ...p, votesYes: updated.yesVotes, votesNo: updated.noVotes, votes: updated.yesVotes + updated.noVotes }
                : p
            )
          );
        }
      } catch (err) {
        console.error("Vote backend sync failed:", err);
      }
    }
  };

  // ── Fund handler ──────────────────────────────────────────────────────────
  // Logic: OPTIMISTIC — funding bar fills instantly. Status flips to "funded"
  // if target is reached. Backend syncs after; on failure local state remains.
  const handleFund = async (id: string, amount: number, walletAddress: string, note: string) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newFunding = Math.min(p.currentFunding + amount, p.targetFunding);
        return {
          ...p,
          currentFunding: newFunding,
          requestedAmount: p.targetFunding > 100
            ? `${newFunding.toLocaleString()}`
            : `${newFunding.toFixed(4)} ETH`,
          status: newFunding >= p.targetFunding ? "funded" : "active",
        };
      })
    );
    if (!usingMock) {
      try {
        const updated = await api.fundProposal(id, amount, walletAddress, note);
        if (!updated.error) {
          setProposals((prev) =>
            prev.map((p) => {
              if (p.id !== id) return p;
              const newFunding = Number(updated.totalFunds) / 1e18;
              return {
                ...p,
                currentFunding: newFunding,
                requestedAmount: `${newFunding.toFixed(4)} ETH`,
                status: updated.active ? "active" : "funded",
              };
            })
          );
        }
      } catch (err) {
        console.error("Fund backend sync failed:", err);
      }
    }
  };

  const handleCreate = async (title: string, description: string, amount: string) => {
    try {
      const newP = await api.createProposal(title, description, amount);
      if (newP && !newP.error) {
        const target = parseFloat(amount) || 1;
        setProposals((prev) => [{
          id:              String(newP.id),
          title:           newP.title,
          description:     newP.description || "",
          requestedAmount: `${target.toFixed(4)} ETH`,
          currentFunding:  0,
          targetFunding:   target,
          votes: 0, votesYes: 0, votesNo: 0,
          status:          "active",
          daysLeft:        30,
          category:        "Protocol",
        }, ...prev]);
        setUsingMock(false);
      }
    } catch (err) { console.error("Create proposal failed:", err); }
  };

  const counts = {
    all:     proposals.length,
    active:  proposals.filter((p) => p.status === "active").length,
    funded:  proposals.filter((p) => p.status === "funded").length,
    expired: proposals.filter((p) => p.status === "expired").length,
  };

  const filtered = filter === "all" ? proposals : proposals.filter((p) => p.status === filter);
  const totalVotes = proposals.reduce((s, p) => s + p.votes, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-0">
        <AppHeader title="Funding DAO" />
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => setCreateModal(true)}
          className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider bg-primary/10 border border-primary/50 text-primary btn-glow hover:bg-primary/20 transition-all flex items-center gap-2 mr-1"
        >
          <span className="text-lg leading-none">+</span> New Proposal
        </motion.button>
      </div>

      {/* ── Stats Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-4 mb-8 rounded-xl overflow-hidden border border-card-border"
      >
        {[
          { label: "Active",       value: counts.active,              color: "text-primary",    bg: "bg-primary/5" },
          { label: "Funded",       value: counts.funded,              color: "text-green-400",  bg: "bg-green-500/5" },
          { label: "Total Votes",  value: totalVotes.toLocaleString(), color: "text-yellow-300", bg: "bg-yellow-500/5" },
          { label: "Proposals",   value: proposals.length,           color: "text-cyan-300",   bg: "bg-cyan-500/5" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} p-4 text-center border-r border-card-border last:border-r-0`}>
            <p className={`font-mono text-xl font-bold ${color}`}>{value}</p>
            <p className="font-mono text-xs text-muted uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Filter row ── */}
      <div className="flex items-center justify-between mb-6">
        <FilterTabs active={filter} onChange={setFilter} counts={counts} />
        {usingMock && (
          <span className="font-mono text-xs text-yellow-400/70 border border-yellow-500/20 rounded px-2 py-1 bg-yellow-500/5">
            ◎ Demo Mode
          </span>
        )}
      </div>

      {/* ── Cards ── */}
      {loading && proposals.length === 0 ? (
        <p className="font-mono text-xs text-muted text-center py-12">Loading proposals...</p>
      ) : filtered.length === 0 ? (
        <p className="font-mono text-xs text-muted text-center py-12">No {filter} proposals found.</p>
      ) : (
        <div className="space-y-6">
          {filtered.map((proposal, index) => {
            const fundingPct  = Math.min((proposal.currentFunding / (proposal.targetFunding || 1)) * 100, 100);
            const approvalPct = proposal.votes > 0 ? (proposal.votesYes / proposal.votes) * 100 : 0;
            const isUrgent    = proposal.daysLeft > 0 && proposal.daysLeft <= 7;
            const isLarge     = proposal.targetFunding > 100;

            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="glass-card p-6 relative overflow-hidden"
                style={{ transition: "box-shadow 0.3s ease, border-color 0.3s ease" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px 4px rgba(0,123,255,0.14), 0 12px 32px rgba(0,0,0,0.4)";
                  (e.currentTarget as HTMLElement).style.borderTop = "1px solid rgba(0,123,255,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.borderTop = "1px solid rgba(255,255,255,0.15)";
                }}
              >
                {/* Urgent ribbon */}
                {isUrgent && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-red-500/20 border-b border-l border-red-500/40 text-red-400 font-mono text-xs px-3 py-1 rounded-bl-lg">
                      ⚡ {proposal.daysLeft}d left
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-sentient text-lg text-foreground">{proposal.title}</h3>
                      <span
                        className={`font-mono text-xs px-2 py-1 rounded-full border ${
                          proposal.status === "funded"
                            ? "bg-green-500/10 border-green-500/30 text-green-400"
                            : proposal.status === "expired"
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-primary/10 border-primary/30 text-primary"
                        }`}
                      >
                        {proposal.status.toUpperCase()}
                      </span>
                      <CategoryBadge category={proposal.category} />
                    </div>
                    <p className="font-mono text-sm text-muted leading-relaxed">{proposal.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-lg font-bold text-primary">{fundingPct.toFixed(0)}%</p>
                    <p className="font-mono text-xs text-muted">funded</p>
                  </div>
                </div>

                {/* Funding Progress */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-mono text-xs text-muted">Funding Progress</span>
                    <span className="font-mono text-xs text-primary">
                      {isLarge
                        ? `$${proposal.currentFunding.toLocaleString()} / $${proposal.targetFunding.toLocaleString()}`
                        : `${proposal.currentFunding.toFixed(4)} / ${proposal.requestedAmount}`}
                    </span>
                  </div>
                  <ProgressBar current={proposal.currentFunding} target={proposal.targetFunding} />
                </div>

                {/* Vote tally */}
                {proposal.votes > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-xs text-green-400">
                        YES {proposal.votesYes.toLocaleString()}
                        <span className="text-muted ml-1">({approvalPct.toFixed(0)}%)</span>
                      </span>
                      <span className="font-mono text-xs text-red-400">
                        NO {proposal.votesNo.toLocaleString()}
                        <span className="text-muted ml-1">({(100 - approvalPct).toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden flex">
                      <motion.div
                        animate={{ width: `${approvalPct}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full bg-green-500 rounded-l-full"
                        style={{ boxShadow: "0 0 6px rgba(34,197,94,0.5)" }}
                      />
                      <motion.div
                        animate={{ width: `${100 - approvalPct}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full bg-red-500 rounded-r-full"
                        style={{ boxShadow: "0 0 6px rgba(239,68,68,0.5)" }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats + Buttons */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="font-mono text-xs text-muted">Votes</p>
                      <p className="font-mono text-sm text-foreground">{proposal.votes.toLocaleString()}</p>
                    </div>
                    {proposal.daysLeft > 0 && (
                      <div>
                        <p className="font-mono text-xs text-muted">Days Left</p>
                        <p className={`font-mono text-sm ${isUrgent ? "text-red-400" : "text-foreground"}`}>
                          {proposal.daysLeft}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="font-mono text-xs text-muted">Approval</p>
                      <p className={`font-mono text-sm ${
                        approvalPct >= 70 ? "text-green-400" : approvalPct >= 50 ? "text-yellow-300" : "text-red-400"
                      }`}>
                        {approvalPct.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {proposal.status === "active" && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setFundModal(proposal)}
                          className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary font-mono text-xs btn-glow hover:bg-primary/20 transition-all duration-200"
                        >
                          Fund This
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setVoteModal(proposal)}
                          className="px-4 py-2 rounded-lg bg-white/[0.02] border border-card-border text-muted font-mono text-xs hover:text-foreground hover:border-white/30 transition-all duration-200"
                        >
                          Vote
                        </motion.button>
                      </>
                    )}
                    {proposal.status === "funded" && (
                      <span className="font-mono text-xs text-green-400 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Fully Funded
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {voteModal && (
          <VoteModal proposal={voteModal} onClose={() => setVoteModal(null)} onVote={handleVote} />
        )}
        {fundModal && (
          <FundModal proposal={fundModal} onClose={() => setFundModal(null)} onFund={handleFund} />
        )}
        {createModal && (
          <CreateProposalModal
            onClose={() => setCreateModal(false)}
            onCreate={async (title, desc, amt) => { await handleCreate(title, desc, amt); setCreateModal(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
