"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function VaultPage() {
  const [isHashing, setIsHashing] = useState(false);
  const [hashComplete, setHashComplete] = useState(false);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null as File | null,
  });

  // Load vault items on mount, after each successful commit, and poll every 10s
  useEffect(() => {
    const load = () =>
      api.getVault()
        .then((data) => { if (Array.isArray(data)) setVaultItems(data); else setVaultItems([]); })
        .catch(() => setVaultItems([]));
    load();
    const poll = setInterval(load, 10000);
    return () => clearInterval(poll);
  }, [hashComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.file) return;

    setIsHashing(true);
    setHashComplete(false);
    setFileHash(null);

    try {
      // 1. Hash the file client-side
      const buffer = await formData.file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const generatedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      setFileHash(generatedHash);

      // 2. POST to backend
      const result = await api.commitIP(formData.title, formData.description, generatedHash);

      if (result.error) throw new Error(result.error);

      setIsHashing(false);
      setHashComplete(true);

      setTimeout(() => {
        setHashComplete(false);
        setFormData({ title: "", description: "", file: null });
        setFileHash(null);
      }, 3000);
    } catch (err) {
      console.error(err);
      setIsHashing(false);
      alert("Failed to commit to vault. Are you logged in?");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <AppHeader title="The Vault" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-xl font-sentient text-foreground mb-2">Register Your IP</h2>
          <p className="font-mono text-sm text-muted">
            Commit your intellectual property to the blockchain for immutable proof of existence
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-2">
              Asset Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter IP asset name..."
              className="w-full px-4 py-3 bg-black border border-primary/30 rounded-lg font-mono text-sm text-foreground placeholder:text-muted/50 focus:outline-none input-azure transition-all duration-300"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your intellectual property..."
              rows={4}
              className="w-full px-4 py-3 bg-black border border-primary/30 rounded-lg font-mono text-sm text-foreground placeholder:text-muted/50 focus:outline-none input-azure transition-all duration-300 resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-2">
              Attach File (Optional)
            </label>
            <div className="relative border border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="pointer-events-none">
                <svg className="w-8 h-8 mx-auto text-primary/50 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="font-mono text-sm text-muted">
                  {formData.file ? formData.file.name : "Drop file here or click to upload"}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isHashing || !formData.title || !formData.file}
            className="w-full py-4 rounded-lg font-mono text-sm uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-primary/10 border border-primary text-primary btn-glow hover:bg-primary/20"
          >
            {isHashing ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Hashing & Committing...
              </span>
            ) : hashComplete ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Committed Successfully
              </span>
            ) : (
              "Commit to Blockchain"
            )}
          </button>
        </form>

        {/* Hash Preview */}
        {(isHashing || hashComplete) && fileHash && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 p-4 rounded-lg bg-white/[0.02] border border-card-border"
          >
            <p className="font-mono text-xs text-muted mb-2">Generated Hash</p>
            <p className="font-mono text-sm text-primary break-all">
              0x{fileHash}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Your Vault — real data from backend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="glass-card p-6 mt-6"
      >
        <h3 className="font-mono text-sm text-muted mb-4 uppercase tracking-wider">Your Vault</h3>
        <div className="space-y-3">
          {vaultItems.length === 0 ? (
            <p className="font-mono text-xs text-muted text-center py-4">No items committed yet</p>
          ) : (
            vaultItems.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-card-border hover:border-primary/30 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-mono text-sm text-foreground truncate">{item.title}</p>
                    {item.verified && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono bg-green-500/15 text-green-400 border border-green-500/25">
                        ✓ verified
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-primary truncate">
                    {item.fileHash ? `0x${item.fileHash.slice(0, 16)}...` : item.txHash?.slice(0, 18)}
                  </p>
                  {item.ipfsUrl && (
                    <p className="font-mono text-[10px] text-muted truncate mt-0.5">{item.ipfsUrl}</p>
                  )}
                </div>
                <span className="font-mono text-xs text-muted shrink-0 ml-4">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
