# AthenaIQ (ProofFund)
> Own It. Prove It. Fund It.

AthenaIQ (formerly ProofFund) is a decentralized IP-protection and milestone-locked crowdfunding platform. It provides a trustless financial infrastructure for creators to confidently share their ideas and for investors to fund them safely. By eliminating idea theft and funding fraud, AthenaIQ bridges the gap between raw innovation and secure capital allocation.

## The Problem
- **Idea Theft:** Creators are afraid to share early-stage concepts or seek funding out of fear that their intellectual property will be stolen.
- **Funding Fraud:** Investors are hesitant to back anonymous or high-risk projects without guarantees that their funds will be used appropriately.
- **Lack of Transparency:** Traditional crowdfunding lacks enforced accountability, often leaving backers with no recourse if a project fails to deliver.

## How It Works
1. **Commit Idea:** Creators hash their project files and metadata, committing a cryptographic proof of existence without revealing the actual contents.
2. **Certify Ownership:** A time-stamped record is anchored on-chain, proving the creator's ownership of the idea from that exact moment.
3. **Submit for Funding:** Creators open a funding proposal to raise capital from backers.
4. **Milestone-Based Release:** Raised funds are locked in a smart contract and released in tranches (e.g., 30% / 40% / 30%) only as the creator delivers verifiable project milestones.
5. **Optional Reveal:** Creators can choose when and to whom they reveal the underlying idea contents securely.

## Key Features
- **Zero-Knowledge IP Protection:** Prove you had an idea first by hashing it on-chain without exposing the underlying data.
- **Milestone-Locked Treasury:** Smart contracts release investor funds in stages based on community approval, eliminating rug pulls.
- **Real-Time Network Graph:** Visualize the flow of ideas, funding, and verified identities dynamically.
- **AI-Powered Discovery:** Search and analyze the ecosystem of proposals using natural language queries.
- **Decentralized Storage:** Permanent, tamper-proof storage of public proposal metadata using IPFS.

## Tech Stack
**Frontend**
- Next.js (App Router)
- React & Tailwind CSS
- Framer Motion (Animations)
- React Three Fiber / WebGL (3D visualizations)

**Backend**
- Node.js & Express
- Ethers.js
- MongoDB (Data persistence)

**Blockchain & Storage**
- Polygon Amoy Testnet
- Solidity Smart Contracts
- IPFS / Pinata (Decentralized storage)

**AI & Data**
- Google Gemini API (Natural language querying)
- TigerGraph (Graph database for relationship mapping)

## Project Structure
```text
AthenaIQ/
├── app/               # Next.js frontend pages and layouts (App Router)
├── components/        # Reusable React components and WebGL visualizers
├── context/           # React context providers (state management, wallet)
├── lib/               # Frontend utilities and shared helpers
├── backend/           # Node.js/Express server and API routes
│   ├── contracts/     # Solidity smart contracts (IdeaRegistry.sol, FundingDAO.sol)
│   ├── src/           # API controllers, database setup, and middleware
│   └── scripts/       # Deployment scripts for contracts and graph DB
└── public/            # Static assets and public resources
```

## Getting Started / Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/AthenaIQ.git
cd AthenaIQ
```

### 2. Frontend Setup
The frontend uses Next.js and npm.
```bash
npm install

npm run dev
```
The frontend will run at `http://localhost:3000`.

### 3. Backend Setup
The backend requires a `.env` file to connect to the blockchain, IPFS, and AI services.
```bash
cd backend
npm install

# Copy the example environment file and fill in your keys
cp .env.example .env
```
Ensure your `.env` contains the required values like `JWT_SECRET`, and optionally `RPC_URL`, `PRIVATE_KEY`, `MONGO_URL`, `GEMINI_API_KEY`, etc. (Check `.env.example` for reference).

```bash
npm run dev
```
The backend server will run at `http://localhost:4000`.

## Smart Contracts
The platform operates on the **Polygon Amoy Testnet** using two primary smart contracts:
- **`IdeaRegistry.sol`**: Manages the commit-reveal scheme, logging the hashes of ideas and tying them to creator addresses and timestamps.
- **`FundingDAO.sol`**: Handles the creation of funding proposals, voting logic, and the milestone-based release of capital.

## Screenshots / Demo
*(Placeholder for project screenshots, GIFs, or a demo video. Drop your media files here!)*

## Contributors
*(Placeholder - Add your names, roles, and GitHub profiles here)*

## License
This project is licensed under the [MIT License](LICENSE).
