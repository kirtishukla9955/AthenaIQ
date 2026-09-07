"use client";

import { useAuth } from "@/context/auth-context";
import { X } from "lucide-react";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { authState, connectWallet } = useAuth();

  const handleConnect = async () => {
    await connectWallet();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-300"
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="relative backdrop-blur-3xl bg-white/[0.02] border border-white/[0.15] rounded-2xl p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {authState === "disconnected" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-2xl font-sentient text-white mb-2">Connect Wallet</h3>
              <p className="text-muted mb-8">Connect your wallet to access the ProofFund protocol</p>

              <button
                onClick={handleConnect}
                className="w-full py-4 px-6 bg-[#f6851b] hover:bg-[#e2761b] text-white font-mono uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                  <path d="M32.9583 8.125L21.2917 16.6667L23.5417 11.5833L32.9583 8.125Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.04169 8.125L18.625 16.75L16.4584 11.5833L7.04169 8.125Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M28.5417 26.0417L25.4167 30.9167L32.2917 32.8333L34.2917 26.1667L28.5417 26.0417Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.70837 26.1667L7.70837 32.8333L14.5834 30.9167L11.4584 26.0417L5.70837 26.1667Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.125 18.7917L12.2084 21.625L18.9584 21.9167L18.7084 14.6667L14.125 18.7917Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M25.875 18.7917L21.2084 14.5833L21.0417 21.9167L27.7917 21.625L25.875 18.7917Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.5834 30.9167L18.5417 29L15.125 26.2083L14.5834 30.9167Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21.4584 29L25.4167 30.9167L24.875 26.2083L21.4584 29Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                MetaMask
              </button>
            </div>
          )}

          {authState === "connecting" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <h3 className="text-xl font-sentient text-white mb-2">Connecting...</h3>
              <p className="text-muted">Please confirm in your wallet</p>
            </div>
          )}

          {authState === "verifying" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 relative">
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse" />
                <div className="absolute inset-0 rounded-full shadow-azure animate-pulse" />
              </div>
              <h3 className="text-xl font-sentient text-white mb-2">Verifying Signature...</h3>
              <p className="text-muted">Authenticating your wallet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
