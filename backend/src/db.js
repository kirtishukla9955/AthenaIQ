// db.js — in-memory store with optional MongoDB persistence
// If MONGO_URL is set in env, data persists across Railway restarts.
// If not set, falls back gracefully to in-memory (resets on restart).

const SEED_PROPOSALS = [
    {
        id: 1,
        title: "Decentralized Carbon Credit Oracle",
        description: "Connecting IoT sensors directly to Polygon via API3.",
        creator: "0x1234567890abcdef1234567890abcdef12345678",
        totalFunds: "1000000000000000000",
        yesVotes: 15,
        noVotes: 2,
        active: true,
        milestones: [
            { percentage: 30, released: true, approved: true },
            { percentage: 40, released: false, approved: false },
            { percentage: 30, released: false, approved: false }
        ],
        ipfsHash: "QmOracleIPFS",
        targetFunds: "1000000000000000000",
        timestamp: Date.now() - 86400000 * 5,
    },
    {
        id: 2,
        title: "ZK-Proof Identity Verification Layer",
        description: "Privacy-preserving identity protocol using zero-knowledge proofs for DAO governance and on-chain credentials.",
        creator: "0xabcdef1234567890abcdef1234567890abcdef12",
        totalFunds: "1320000000000000000",
        yesVotes: 38,
        noVotes: 6,
        active: true,
        milestones: [
            { percentage: 25, released: true, approved: true },
            { percentage: 35, released: false, approved: false },
            { percentage: 40, released: false, approved: false }
        ],
        ipfsHash: "QmZKProofIPFS",
        targetFunds: "2500000000000000000",
        timestamp: Date.now() - 86400000 * 3,
    },
    {
        id: 3,
        title: "Cross-Chain Liquidity Bridge v2",
        description: "Upgrade existing bridge infrastructure to support 12 new EVM-compatible chains with enhanced security.",
        creator: "0x9876543210abcdef9876543210abcdef98765432",
        totalFunds: "5000000000000000000",
        yesVotes: 74,
        noVotes: 17,
        active: false,
        milestones: [
            { percentage: 33, released: true, approved: true },
            { percentage: 33, released: true, approved: true },
            { percentage: 34, released: false, approved: false }
        ],
        ipfsHash: "QmBridgeIPFS",
        targetFunds: "5000000000000000000",
        timestamp: Date.now() - 86400000 * 12,
    },
    {
        id: 4,
        title: "AI-Powered Patent Analysis Engine",
        description: "Machine learning system for automated prior art search, reducing IP litigation costs for Web3 projects.",
        creator: "0x1111222233334444555566667777888899990000",
        totalFunds: "890000000000000000",
        yesVotes: 29,
        noVotes: 8,
        active: true,
        milestones: [
            { percentage: 50, released: false, approved: false },
            { percentage: 50, released: false, approved: false }
        ],
        ipfsHash: "QmAIPatentIPFS",
        targetFunds: "1500000000000000000",
        timestamp: Date.now() - 86400000 * 1,
    },
    {
        id: 5,
        title: "On-Chain Governance Analytics Dashboard",
        description: "Real-time analytics for DAO proposal lifecycle tracking and voter participation metrics.",
        creator: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        totalFunds: "310000000000000000",
        yesVotes: 9,
        noVotes: 3,
        active: true,
        milestones: [
            { percentage: 50, released: false, approved: false },
            { percentage: 50, released: false, approved: false }
        ],
        ipfsHash: "QmDashboardIPFS",
        targetFunds: "800000000000000000",
        timestamp: Date.now() - 86400000 * 2,
    }
];

const SEED_VAULT = [
    {
        id: "vlt-101",
        title: "Gen-Z DeFi Strategy",
        description: "Automated yields for small wallets.",
        fileHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        ipfsUrl: "ipfs://QmXYZ123",
        txHash: "0xabc123",
        timestamp: Date.now() - 86400000 * 2,
        verified: true,
        ownerAddress: "0xMockUserAddress"
    }
];

const SEED_ACTIVITIES = [
    {
        id: "act-1",
        type: "IDEA_COMMITTED",
        description: "Committed new idea 'Gen-Z DeFi Strategy'",
        walletAddress: "0xMockUserAddress",
        timestamp: Date.now() - 86400000 * 2,
        txHash: "0xabc123"
    },
    {
        id: "act-2",
        type: "PROPOSAL_CREATED",
        description: "Created proposal for Carbon Credit Oracle",
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
        timestamp: Date.now() - 86400000 * 5,
        txHash: "0xdef456"
    }
];

// ── In-memory store (always available) ──────────────────────────────────────
const db = {
    vaultItems: [...SEED_VAULT],
    proposals: JSON.parse(JSON.stringify(SEED_PROPOSALS)),
    verifications: [
        {
            id: "ver-1",
            hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            matchFound: true,
            originalOwner: "0xMockUserAddress",
            timestamp: Date.now() - 86400000,
            txHash: "0xabc123def456"
        }
    ],
    activities: [...SEED_ACTIVITIES],
    tokenBlacklist: new Set(),
};

// ── Optional MongoDB persistence ─────────────────────────────────────────────
if (process.env.MONGO_URL) {
    (async () => {
        try {
            const mongoose = require("mongoose");
            await mongoose.connect(process.env.MONGO_URL);
            console.log("MongoDB connected — data will persist across restarts");

            // Simple schema to store the whole db as a single JSON document
            const StoreSchema = new mongoose.Schema({
                key: { type: String, unique: true },
                value: mongoose.Schema.Types.Mixed,
            });
            const Store = mongoose.model("Store", StoreSchema);

            // Load persisted data
            const load = async (key, fallback) => {
                const doc = await Store.findOne({ key });
                return doc ? doc.value : fallback;
            };

            db.proposals = await load("proposals", db.proposals);
            db.vaultItems = await load("vaultItems", db.vaultItems);
            db.verifications = await load("verifications", db.verifications);
            db.activities = await load("activities", db.activities);

            // Patch db to auto-save on mutation
            const save = async (key, value) => {
                await Store.findOneAndUpdate(
                    { key },
                    { value },
                    { upsert: true, new: true }
                );
            };

            db._save = save; // expose for routes to call when they mutate data

            console.log("MongoDB: loaded persisted data");
        } catch (err) {
            console.warn("MongoDB connection failed, staying in-memory:", err.message);
        }
    })();
} else {
    console.log("MONGO_URL not set — using in-memory db (data resets on restart)");
    db._save = async () => {}; // no-op so routes don't have to check
}

module.exports = db;
