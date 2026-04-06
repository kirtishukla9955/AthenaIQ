# ProofFund

**Own It. Prove It. Fund It.**

A decentralized platform where innovators protect their intellectual property on-chain before pitching, then raise funding through a DAO-governed, milestone-locked smart contract system — eliminating idea theft and rug pulls simultaneously.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [File Structure](#file-structure)
- [How It Works](#how-it-works)
- [TigerGraph Integration](#tigergraph-integration)
- [Setup and Installation](#setup-and-installation)
- [Deployment](#deployment)
- [Team](#team)

---

## Overview

ProofFund solves two critical problems in the Web3 innovation space:

1. **The Idea Theft Paradox** — Innovators cannot share ideas with investors without an NDA, but investors rarely sign NDAs for pitches. ProofFund lets creators commit a SHA-256 hash of their idea to the blockchain before any pitch — creating immutable, timestamped proof of ownership.

2. **The Rug Pull Risk** — In most DAOs, founders receive 100% of funds upfront and disappear. ProofFund holds funds in a smart contract and releases them only when the DAO votes that a milestone has been completed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, Three.js, Framer Motion |
| Blockchain | Polygon Amoy Testnet, Solidity, Ethers.js v6 |
| Smart Contracts | IdeaRegistry.sol, FundingDAO.sol |
| Backend | Node.js, Express.js, JWT Authentication |
| Storage | IPFS via Pinata |
| Graph Database | TigerGraph Cloud |
| AI | Google Gemini API |
| Deployment | Vercel (frontend), Render (backend) |

---

## File Structure
ProofFund/
│
├── app/                                  # Next.js App Router pages
│   ├── (app)/                            # Authenticated app routes
│   │   ├── dao/
│   │   │   └── page.tsx                  # DAO proposals and voting
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # User dashboard and activity feed
│   │   ├── network/
│   │   │   └── page.tsx                  # TigerGraph trust network visualizer
│   │   ├── reveal/
│   │   │   └── page.tsx                  # Reveal committed idea publicly
│   │   ├── vault/
│   │   │   └── page.tsx                  # Commit and manage IP assets
│   │   └── layout.tsx                    # Shared authenticated layout
│   ├── globals.css                       # Global styles
│   ├── layout.tsx                        # Root layout with AuthProvider
│   └── page.tsx                          # Landing page
│
├── components/                           # Reusable UI components
│   ├── gl/                               # Three.js WebGL components
│   │   ├── azure-gl.tsx
│   │   ├── azure-particles.tsx
│   │   ├── index.tsx
│   │   ├── particles.tsx
│   │   └── shaders/
│   │       ├── azurePointMaterial.ts
│   │       ├── pointMaterial.ts
│   │       ├── simulationMaterial.ts
│   │       ├── utils.ts
│   │       └── vignetteShader.ts
│   ├── ui/
│   │   └── button.tsx
│   ├── app-header.tsx
│   ├── connect-wallet-modal.tsx
│   ├── glass-bridge.tsx
│   ├── glass-card.tsx
│   ├── header.tsx
│   ├── landing-hero.tsx
│   ├── pill.tsx
│   ├── sidebar.tsx
│   ├── stat-card.tsx
│   ├── trust-score.tsx
│   └── utils.ts
│
├── context/
│   └── auth-context.tsx                  # Wallet auth state and JWT management
│
├── lib/
│   └── utils.ts                          # Shared utility functions
│
├── public/                               # Static assets
│   ├── Sentient-Extralight.woff
│   ├── Sentient-LightItalic.woff
│   └── placeholder assets
│
├── backend/                              # Express.js API server
│   ├── contracts/
│   │   ├── FundingDAO.sol                # DAO voting and milestone fund release
│   │   ├── IdeaRegistry.sol              # On-chain idea hash commitment
│   │   └── addresses.json               # Deployed contract addresses
│   │
│   ├── scripts/
│   │   ├── deploy.js                     # Hardhat deployment script
│   │   └── setup-tigergraph.js           # TigerGraph schema initializer
│   │
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js                   # JWT verification middleware
│   │   │
│   │   ├── routes/
│   │   │   ├── ai.js                     # Gemini AI analysis endpoint
│   │   │   ├── auth.js                   # Wallet connect and disconnect
│   │   │   ├── dashboard.js              # Stats and activity feed
│   │   │   ├── network.js                # TigerGraph graph query endpoints
│   │   │   ├── proposals.js              # DAO proposals, voting, funding
│   │   │   ├── reveal.js                 # Public reveal of committed ideas
│   │   │   └── vault.js                  # IP asset creation and retrieval
│   │   │
│   │   ├── services/
│   │   │   ├── ai.js                     # Gemini API integration
│   │   │   ├── blockchain.js             # Ethers.js contract interactions
│   │   │   ├── hash.js                   # SHA-256 hashing utility
│   │   │   ├── ipfs.js                   # Pinata IPFS upload service
│   │   │   └── tigergraph.js             # TigerGraph REST API service
│   │   │
│   │   ├── app.js                        # Express app with CORS and routes
│   │   ├── db.js                         # In-memory data store
│   │   └── server.js                     # Server entry point
│   │
│   ├── .env                              # Backend environment variables
│   ├── package.json
│   └── README.md
│
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── pnpm-lock.yaml
---

## How It Works

### 1. Wallet Authentication
The user connects their MetaMask wallet. The frontend requests a personal signature from the wallet, sends the wallet address, message, and signature to `POST /api/auth/connect`, where the backend verifies the signature using Ethers.js and returns a signed JWT. All subsequent requests carry this token.

### 2. IP Commitment (The Vault)
The user submits a title, description, and optional file. The frontend hashes the file using the Web Crypto API (SHA-256) and sends the hash to `POST /api/vault`. The backend does three things in sequence:
- Uploads the metadata JSON to IPFS via Pinata and gets a content-addressed URL
- Calls `IdeaRegistry.commitIdea(fileHash)` on the Polygon Amoy blockchain, creating an immutable, timestamped on-chain record
- Adds an IP asset vertex to TigerGraph representing this idea in the trust graph

The actual idea content never leaves the user's device unless they choose to reveal it later. Only the hash goes on-chain.

### 3. Proposal and DAO Voting
Committed ideas can be submitted as funding proposals. DAO members vote yes or no via `POST /api/proposals/:id/vote`, which updates the on-chain vote tally through `FundingDAO.sol`. Funds sent via `POST /api/proposals/:id/fund` are held by the smart contract and only released when the DAO approves a milestone completion.

### 4. AI Trust Scoring
When an idea is submitted, the Gemini API analyzes its title and description and returns a trust score and recommendation. This helps DAO members evaluate proposals with an AI-assisted signal before voting.

### 5. Public Reveal
Once a creator is ready to pitch or publish, they use the Reveal page to expose the original idea content. The on-chain hash acts as proof that the content existed before the reveal date, establishing prior art without a lawyer or NDA.

---

## TigerGraph Integration

TigerGraph serves as the relationship intelligence layer of ProofFund. While IPFS stores the proof of content and the blockchain stores the hash, TigerGraph stores the connections — who created what, what was funded by whom, and how trust flows across the ecosystem.

### Graph Schema

The graph `ProofFundGraph` contains the following vertex and edge types:
Vertices:
IPAsset     — represents a committed idea (id, title, type, description)
Creator     — represents a wallet address
Proposal    — represents a funding proposal
Edges:
CREATED_BY  — connects IPAsset to Creator
FUNDED_BY   — connects Proposal to Creator (funder wallet)
BACKED_BY   — connects IPAsset to Proposal
### How It Is Used

**On idea commitment** — `tigergraphService.addIPAsset()` is called inside the vault route. It sends a REST API request to the TigerGraph Cloud endpoint to upsert an `IPAsset` vertex with the idea's metadata. This happens immediately after the blockchain transaction, so every on-chain commitment has a corresponding graph node.

**On the Network page** — The frontend calls `GET /api/network`, which queries TigerGraph for all vertices and edges in the graph and returns them as a node-link structure. The frontend renders this as an interactive graph visualization, showing creators, their ideas, and funding relationships as a live trust network.

**For relationship queries** — TigerGraph's native graph traversal allows queries that a relational database cannot express efficiently, such as finding all ideas connected within two hops of a given wallet, or identifying clusters of creators who have co-funded proposals. This is the foundation for the platform's fraud detection and reputation scoring roadmap.

### Why TigerGraph and Not a Relational Database

A traditional SQL database stores rows. TigerGraph stores relationships natively, meaning traversal across connected nodes — which is the core operation for trust scoring — runs in constant time per hop regardless of dataset size. As ProofFund scales to thousands of creators and ideas, graph queries remain fast while equivalent SQL joins would degrade exponentially.

### Setup

The schema is initialized by running:
```bash
cd backend
node scripts/setup-tigergraph.js
```

This script connects to the TigerGraph Cloud instance using the credentials in `.env` and creates the graph schema if it does not already exist.

---

## Setup and Installation

### Prerequisites
- Node.js 18 or higher
- pnpm
- MetaMask browser extension
- A funded Polygon Amoy testnet wallet

### Frontend
```bash
# Install dependencies
pnpm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local

# Start development server
pnpm dev
```

### Backend
```bash
cd backend

# Install dependencies
npm install

# Copy and fill environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables
PORT=4000
JWT_SECRET=your_jwt_secret
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://rpc-amoy.polygon.technology
IDEA_REGISTRY_ADDRESS=deployed_contract_address
FUNDING_DAO_ADDRESS=deployed_contract_address
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret
TIGERGRAPH_HOST=your_tg_cloud_url
TIGERGRAPH_USERNAME=tigergraph
TIGERGRAPH_PASSWORD=your_password
TIGERGRAPH_GRAPH=ProofFundGraph
GEMINI_API_KEY=your_gemini_key
### Deploy Smart Contracts
```bash
cd backend
node scripts/deploy.js
```

Update `contracts/addresses.json` with the deployed addresses, then add them to `.env`.

---

## Deployment

| Service | Platform | Configuration |
|---|---|---|
| Frontend | Vercel | Set `NEXT_PUBLIC_API_URL` to backend URL |
| Backend | Render | Set all `.env` variables in dashboard, root directory set to `backend/` |
| Smart Contracts | Polygon Amoy | Deployed via `scripts/deploy.js` |
| Graph Database | TigerGraph Cloud | Managed cloud instance |

---

## Team

Built by Kirti and Harshita for the ProofFund hackathon submission.
