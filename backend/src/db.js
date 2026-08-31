
const db = {
    vaultItems: [
        {
            id: "vlt-101",
            title: "Gen-Z DeFi Strategy",
            description: "Automated yields for small wallets.",
            fileHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            ipfsUrl: "ipfs://QmXYZ123",
            txHash: "0xabc123",
            timestamp: Date.now() - 86400000 * 2, // 2 days ago
            verified: true,
            ownerAddress: "0xMockUserAddress" 
        }
    ],
    proposals: [
        {
            id: 1,
            title: "Decentralized Carbon Credit Oracle",
            description: "Connecting IoT sensors directly to Polygon via API3.",
            creator: "0x1234567890abcdef1234567890abcdef12345678",
            totalFunds: "1000000000000000000", // 1 ETH in Wei
            yesVotes: 15,
            noVotes: 2,
            active: true,
            milestones: [
                { percentage: 30, released: true, approved: true },
                { percentage: 40, released: false, approved: false },
                { percentage: 30, released: false, approved: false }
            ],
            ipfsHash: "QmOracleIPFS",
            timestamp: Date.now() - 86400000 * 5,
        }
    ],
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
    activities: [
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
    ],
    tokenBlacklist: new Set(),
};

module.exports = db;
