const { ethers } = require("ethers");

const IDEA_REGISTRY_ABI = [
    "function commitIdea(bytes32 ideaHash) public",
    "function verifyIdea(bytes32 ideaHash) public view returns (address owner, uint256 timestamp)"
];

const FUNDING_DAO_ABI = [
    "function createProposal(string title, string ipfsHash) public",
    "function vote(uint256 proposalId, bool support) public",
    "function fund(uint256 proposalId) public payable",
    "function approveMilestone(uint256 proposalId, uint8 milestoneIndex) public",
    "function releaseMilestone(uint256 proposalId, uint8 milestoneIndex) public",
    "function proposals(uint256) public view returns (uint256 id, string title, string ipfsHash, address creator, uint256 totalFunds, uint256 yesVotes, uint256 noVotes, bool active, uint8 currentMilestone)",
    "function proposalCount() public view returns (uint256)"
];

class BlockchainService {
    constructor() {
        // Guard: only init provider/wallet if env vars exist
        if (process.env.RPC_URL && process.env.PRIVATE_KEY) {
            try {
                this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
                this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

                if (process.env.IDEA_REGISTRY_ADDRESS) {
                    this.ideaRegistry = new ethers.Contract(
                        process.env.IDEA_REGISTRY_ADDRESS,
                        IDEA_REGISTRY_ABI,
                        this.wallet
                    );
                }

                if (process.env.FUNDING_DAO_ADDRESS) {
                    this.fundingDAO = new ethers.Contract(
                        process.env.FUNDING_DAO_ADDRESS,
                        FUNDING_DAO_ABI,
                        this.wallet
                    );
                }

                console.log("BlockchainService: connected to RPC");
            } catch (err) {
                console.warn("BlockchainService: failed to init provider:", err.message);
                this.provider = null;
                this.wallet = null;
            }
        } else {
            console.warn("BlockchainService: RPC_URL or PRIVATE_KEY not set — running in mock mode");
            this.provider = null;
            this.wallet = null;
        }
    }

    verifySignature(walletAddress, signature, message) {
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
        } catch (error) {
            console.error("Signature verification failed:", error);
            return false;
        }
    }

    async commitIdea(fileHashHex) {
        if (!this.ideaRegistry) {
            console.warn("IdeaRegistry not configured, using mock.");
            return { hash: "0xmocktxhash" };
        }
        try {
            const hash32 = "0x" + fileHashHex;
            const tx = await this.ideaRegistry.commitIdea(hash32);
            await tx.wait();
            return tx;
        } catch (error) {
            console.error("commitIdea error:", error);
            throw error;
        }
    }

    async verifyIdea(fileHashHex) {
        if (!this.ideaRegistry) return null;
        try {
            const hash32 = "0x" + fileHashHex;
            const [owner, timestamp] = await this.ideaRegistry.verifyIdea(hash32);
            return { owner, timestamp: Number(timestamp) * 1000 };
        } catch (error) {
            console.error("verifyIdea error:", error.message);
            return null;
        }
    }

    async vote(proposalId, support) {
        if (!this.fundingDAO) return { hash: "0xmocktxhash" };
        const tx = await this.fundingDAO.vote(proposalId, support);
        await tx.wait();
        return tx;
    }

    async fund(proposalId, amountEth) {
        if (!this.fundingDAO) return { hash: "0xmocktxhash" };
        const value = ethers.parseEther(amountEth.toString());
        const tx = await this.fundingDAO.fund(proposalId, { value });
        await tx.wait();
        return tx;
    }
}

module.exports = new BlockchainService();
