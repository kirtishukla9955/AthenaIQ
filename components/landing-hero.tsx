"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GL } from "./gl";
import { Pill } from "./pill";
import { Button } from "./ui/button";
import { ConnectWalletModal } from "./connect-wallet-modal";
import { useAuth } from "@/context/auth-context";

export function LandingHero() {
  const [hovering, setHovering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { authState } = useAuth();
  const router = useRouter();

  // Handle transition to dashboard when connected
  useEffect(() => {
    if (authState === "connected") {
      setIsModalOpen(false);
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [authState, router]);

  return (
    <>
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-500">
          <div className="text-center animate-in zoom-in-90 duration-500">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <div className="absolute inset-0 rounded-full shadow-azure animate-pulse" />
            </div>
            <p className="text-primary font-mono uppercase tracking-wider">Entering Protocol</p>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-svh justify-center relative">
        <GL hovering={hovering} />

        {/* Atmospheric Azure Halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-primary/8 blur-[200px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center px-4">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            <Pill className="mb-6">WEB3 PROTOCOL</Pill>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-sentient text-balance animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
            <span className="text-white">Secure.</span>{" "}
            <span className="text-primary">Verify.</span>{" "}
            <span className="text-white">Fund.</span>
          </h1>

          <p className="font-mono text-sm sm:text-base text-muted text-balance mt-8 max-w-[540px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
            The decentralized protocol for secure identity verification and transparent funding mechanisms
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
            <Button
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onClick={() => setIsModalOpen(true)}
            >
              [Launch App]
            </Button>
            <Button
              variant="secondary"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onClick={() => {
                document.getElementById("protocol")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              [Explore DAO]
            </Button>
          </div>
        </div>
      </div>

      <ConnectWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
