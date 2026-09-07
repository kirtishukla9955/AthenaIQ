"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { setToken } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type AuthState = "disconnected" | "connecting" | "verifying" | "connected";

interface AuthContextType {
  authState: AuthState;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>("disconnected");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    setAuthState("connecting");

    try {
      let address: string;
      let message: string;
      let signature: string;

      if ((window as any).ethereum) {
        // ── Real MetaMask flow ──────────────────────────────────────────
        const accounts: string[] = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        address = accounts[0];
        setAuthState("verifying");

        message = `Sign in to ProofFund: ${Date.now()}`;
        signature = await (window as any).ethereum.request({
          method: "personal_sign",
          params: [message, address],
        });
      } else {
        // ── Mock fallback (no MetaMask installed) ───────────────────────
        console.warn("MetaMask not found — using mock wallet for dev");
        await new Promise((r) => setTimeout(r, 1500));
        setAuthState("verifying");
        await new Promise((r) => setTimeout(r, 1000));

        address =
          "0x" +
          Array.from({ length: 40 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join("");
        message = `Sign in to ProofFund: ${Date.now()}`;
        signature = "0xmocksig";
      }

      // ── Send to backend ───────────────────────────────────────────────
      const res = await fetch(`${BASE_URL}/api/auth/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, signature, message }),
      });

      if (!res.ok) throw new Error("Auth failed");

      const data = await res.json();

      // ── Store JWT in both localStorage AND api.ts in-memory token ─────
      localStorage.setItem("pf_token", data.token);
      localStorage.setItem("pf_wallet", data.walletAddress);
      setToken(data.token); // syncs lib/api.ts authHeaders()

      setWalletAddress(data.walletAddress);
      setAuthState("connected");
    } catch (err) {
      console.error("Connection failed:", err);
      setAuthState("disconnected");
    }
  }, []);

  const disconnect = useCallback(async () => {
    const token = localStorage.getItem("pf_token");
    if (token) {
      await fetch(`${BASE_URL}/api/auth/disconnect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem("pf_token");
    localStorage.removeItem("pf_wallet");
    setToken(null); // clear api.ts token too
    setAuthState("disconnected");
    setWalletAddress(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ authState, walletAddress, connectWallet, disconnect }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
