"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function RevealPage() {
  const [hash1, setHash1] = useState("");
  const [hash2, setHash2] = useState("");
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<"match" | "mismatch" | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);

  // Load recent verifications on mount and after each comparison
  useEffect(() => {
    api.getVerifications()
      .then((data: any[]) => { if (Array.isArray(data)) setVerifications(data); })
      .catch(() => {});
  }, [result]); // refresh after each comparison

  const handleCompare = async () => {
    if (!hash1 || !hash2) return;

    setComparing(true);
    setResult(null);
    setOwner(null);
    setTimestamp(null);

    try {
      const data = await api.compareHashes(hash1, hash2);
      setResult(data.match ? "match" : "mismatch");
      if (data.owner) setOwner(data.owner);
      if (data.timestamp) setTimestamp(data.timestamp);
    } catch {
      setResult("mismatch");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AppHeader title="The Reveal" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-xl font-sentient text-foreground mb-2">Verification Tool</h2>
          <p className="font-mono text-sm text-muted">
            Compare cryptographic hashes to verify the authenticity of IP assets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Hash Input 1 */}
          <div>
            <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-2">
              Original Hash
            </label>
            <textarea
              value={hash1}
              onChange={(e) => setHash1(e.target.value)}
              placeholder="Enter original hash..."
              rows={3}
              className="w-full px-4 py-3 bg-black border border-primary/30 rounded-lg font-mono text-sm text-foreground placeholder:text-muted/50 focus:outline-none input-azure transition-all duration-300 resize-none"
            />
          </div>

          {/* Hash Input 2 */}
          <div>
            <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-2">
              Comparison Hash
            </label>
            <textarea
              value={hash2}
              onChange={(e) => setHash2(e.target.value)}
              placeholder="Enter hash to compare..."
              rows={3}
              className="w-full px-4 py-3 bg-black border border-primary/30 rounded-lg font-mono text-sm text-foreground placeholder:text-muted/50 focus:outline-none input-azure transition-all duration-300 resize-none"
            />
          </div>
        </div>

        {/* Compare Button */}
        <button
          onClick={handleCompare}
          disabled={comparing || !hash1 || !hash2}
          className="w-full py-4 rounded-lg font-mono text-sm uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-primary/10 border border-primary text-primary btn-glow hover:bg-primary/20"
        >
          {comparing ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Verifying on-chain...
            </span>
          ) : (
            "Compare Hashes"
          )}
        </button>

        {/* Result Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-6 p-6 rounded-lg border text-center ${
              result === "match"
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                result === "match" ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              {result === "match" ? (
                <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
            <h3 className={`text-lg font-sentient mb-2 ${result === "match" ? "text-green-400" : "text-red-400"}`}>
              {result === "match" ? "Hashes Match" : "Hashes Do Not Match"}
            </h3>
            <p className="font-mono text-sm text-muted">
              {result === "match"
                ? "The cryptographic signatures are identical. IP authenticity verified."
                : "The signatures differ. This may indicate modification or different source."}
            </p>

            {/* On-chain owner + timestamp if returned */}
            {result === "match" && owner && (
              <div className="mt-4 space-y-2 text-left">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-card-border">
                  <p className="font-mono text-xs text-muted mb-1">Original Owner</p>
                  <p className="font-mono text-xs text-primary break-all">{owner}</p>
                </div>
                {timestamp && (
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-card-border">
                    <p className="font-mono text-xs text-muted mb-1">Registered On</p>
                    <p className="font-mono text-xs text-foreground">
                      {new Date(timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Recent Verifications — real data from backend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card p-6 mt-6"
      >
        <h3 className="font-mono text-sm text-muted mb-4 uppercase tracking-wider">
          Recent Verifications
        </h3>
        <div className="space-y-3">
          {verifications.length === 0 ? (
            <p className="font-mono text-xs text-muted text-center py-4">No verifications yet</p>
          ) : (
            verifications.map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-card-border"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.matchFound ? "bg-green-400" : "bg-red-400"}`} />
                  <div>
                    <p className="font-mono text-sm text-foreground">
                      {item.hash ? `0x${item.hash.slice(0, 16)}...` : "Unknown hash"}
                    </p>
                    <p className="font-mono text-xs text-muted">
                      {item.originalOwner ? `${item.originalOwner.slice(0, 10)}...` : ""}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs text-muted">
                  {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ""}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
