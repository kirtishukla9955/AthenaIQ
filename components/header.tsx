"use client";

import Link from "next/link";
import { useState } from "react";
import { ConnectWalletModal } from "./connect-wallet-modal";
import { useAuth } from "@/context/auth-context";

export const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authState, walletAddress } = useAuth();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <div className="fixed z-50 pt-8 md:pt-14 top-0 left-0 w-full">
        <header className="flex items-center justify-between container">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-sm bg-primary" />
            </div>
            <span className="font-sentient text-xl text-white">ProofFund</span>
          </Link>
          <nav className="flex max-lg:hidden absolute left-1/2 -translate-x-1/2 items-center justify-center gap-x-10">
            {["Protocol", "Docs", "Governance", "Community"].map((item) => (
              <Link
                className="uppercase inline-block font-mono text-sm text-foreground/60 hover:text-foreground/100 duration-150 transition-colors ease-out"
                href={`#${item.toLowerCase()}`}
                key={item}
              >
                {item}
              </Link>
            ))}
          </nav>
          {authState === "connected" && walletAddress ? (
            <div className="uppercase max-lg:hidden transition-colors ease-out duration-150 font-mono text-sm text-primary">
              {truncateAddress(walletAddress)}
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="uppercase max-lg:hidden transition-colors ease-out duration-150 font-mono text-sm text-primary hover:text-primary/80"
            >
              Connect Wallet
            </button>
          )}
          {/* Mobile menu button */}
          <button className="lg:hidden text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
      </div>
      <ConnectWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
