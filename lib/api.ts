// lib/api.ts
// Central API client for ProofFund backend
// Set NEXT_PUBLIC_API_URL in .env.local to your deployed backend URL

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ── Token storage (in-memory, survives page nav but not refresh) ──────────────
let _token: string | null = null;

export function setToken(t: string | null) { _token = t; }
export function getToken() { return _token; }

function authHeaders(): HeadersInit {
  return _token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${_token}` }
    : { "Content-Type": "application/json" };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
// The backend verifies a real MetaMask signature.
// For now we pass a mock signature — works because backend gracefully handles it.
export const api = {

  connectWallet: async (walletAddress: string) => {
    const message = `ProofFund login: ${walletAddress}`;
    // In production: replace "0xmocksig" with await window.ethereum.request(...)
    const res = await fetch(`${BASE}/api/auth/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress,
        signature: "0xmocksig",
        message,
      }),
    });
    // NOTE: backend will reject invalid signature in strict mode.
    // For demo, backend can be relaxed OR use real MetaMask signing.
    if (!res.ok) return null;
    const data = await res.json();
    if (data.token) setToken(data.token);
    return data;
  },

  disconnect: () =>
    fetch(`${BASE}/api/auth/disconnect`, {
      method: "POST",
      headers: authHeaders(),
    }).finally(() => setToken(null)),

  // ── Proposals ──────────────────────────────────────────────────────────────
  getProposals: () =>
    fetch(`${BASE}/api/proposals`).then((r) => r.json()),

  voteProposal: (id: string, vote: "yes" | "no") =>
    fetch(`${BASE}/api/proposals/${id}/vote`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ vote }),
    }).then((r) => r.json()),

  fundProposal: (id: string, amount: number, walletAddress: string, note: string) =>
    fetch(`${BASE}/api/proposals/${id}/fund`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ amount: amount.toString(), walletAddress, note }),
    }).then((r) => r.json()),

  // ── Vault ──────────────────────────────────────────────────────────────────
  getVault: () =>
    fetch(`${BASE}/api/vault`, { headers: authHeaders() }).then((r) => r.json()),

  commitIP: (title: string, description: string, fileHash: string) =>
    fetch(`${BASE}/api/vault`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ title, description, fileHash }),
    }).then((r) => r.json()),

  // ── Network / TigerGraph ───────────────────────────────────────────────────
  getGraph: () =>
    fetch(`${BASE}/api/network/graph`).then((r) => r.json()),

  // ── Dashboard ─────────────────────────────────────────────────────────────
  getStats: () =>
    fetch(`${BASE}/api/dashboard/stats`).then((r) => r.json()),

  getActivity: () =>
    fetch(`${BASE}/api/dashboard/activity`).then((r) => r.json()),

  // ── Reveal ────────────────────────────────────────────────────────────────
  compareHashes: (hash1: string, hash2: string) =>
    fetch(`${BASE}/api/reveal/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash1, hash2 }),
    }).then((r) => r.json()),

  getVerifications: () => {
    const token = _token;
    return fetch(`${BASE}/api/reveal/verifications`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    }).then((r) => r.ok ? r.json() : []);
  },

  createProposal: (title: string, description: string, requestedAmount: string) =>
    fetch(`${BASE}/api/proposals`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ title, description, requestedAmount }),
    }).then((r) => r.json()),
};
