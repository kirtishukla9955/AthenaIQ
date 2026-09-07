"use client";

import { GlassCard } from "./glass-card";
import { Shield, Eye, Coins } from "lucide-react";

const protocols = [
  {
    icon: Shield,
    title: "Secure Verification",
    description: "Zero-knowledge proofs ensure your identity remains private while enabling trustless verification across the protocol.",
  },
  {
    icon: Eye,
    title: "Transparent Reveal",
    description: "Selective disclosure mechanisms allow you to reveal only what's necessary, maintaining control over your data.",
  },
  {
    icon: Coins,
    title: "Decentralized Funding",
    description: "DAO-governed funding pools enable community-driven capital allocation with full transparency and accountability.",
  },
];

export function GlassBridge() {
  return (
    <section id="protocol" className="relative py-32 px-4">
      {/* Background gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/5 blur-[200px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary font-mono uppercase tracking-wider text-sm">The Protocol</span>
          <h2 className="text-4xl sm:text-5xl font-sentient text-white mt-4 text-balance">
            The Glass Bridge
          </h2>
          <p className="text-muted font-mono mt-4 max-w-xl mx-auto">
            Three pillars that form the foundation of decentralized identity and funding
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {protocols.map((protocol, index) => (
            <GlassCard key={protocol.title} delay={index * 0.15}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <protocol.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-sentient text-white mb-3">{protocol.title}</h3>
              <p className="text-muted font-mono text-sm leading-relaxed">{protocol.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
