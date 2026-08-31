const express = require("express");
const authenticateToken = require("../middleware/auth");
const db = require("../db");
const blockchainService = require("../services/blockchain");

const router = express.Router();

router.get("/", (req, res) => {
    try {
        // Return all proposals
        res.json(db.proposals);
    } catch (error) {
        res.status(500).json({ error: "Server error fetching proposals" });
    }
});

router.post("/:id/vote", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { vote } = req.body;
        const userWallet = req.user.walletAddress;

        if (vote !== "yes" && vote !== "no") {
            return res.status(400).json({ error: "vote must be 'yes' or 'no'" });
        }

        const proposal = db.proposals.find(p => p.id.toString() === id);
        if (!proposal) {
            return res.status(404).json({ error: "Proposal not found" });
        }
        
        if (!proposal.active) {
            return res.status(400).json({ error: "Proposal is no longer active" });
        }

        // On-chain interaction
        try {
            await blockchainService.vote(proposal.id, vote === "yes");
        } catch (chainErr) {
            console.error("Vote on-chain failed (or no contract). updating off-chain state.");
        }

        // Update local DB
        if (vote === "yes") {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }

        db.activities.unshift({
            id: `act-${Date.now()}`,
            type: "PROPOSAL_VOTED",
            description: `Voted ${vote} on proposal '${proposal.title}'`,
            walletAddress: userWallet,
            timestamp: Date.now(),
            txHash: "0xmock"
        });

        res.json(proposal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error during voting" });
    }
});

router.post("/:id/fund", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, note } = req.body; // amount expects ETH string
        const userWallet = req.user.walletAddress;

        if (!amount || isNaN(Number(amount))) {
            return res.status(400).json({ error: "Valid amount (ETH string) required" });
        }

        const proposal = db.proposals.find(p => p.id.toString() === id);
        if (!proposal) {
            return res.status(404).json({ error: "Proposal not found" });
        }

        if (!proposal.active) {
            return res.status(400).json({ error: "Proposal is no longer active" });
        }

        // On-chain action
        let txHash = "0xmocktx";
        try {
            const tx = await blockchainService.fund(proposal.id, amount);
            txHash = tx.hash || tx;
        } catch (chainErr) {
            console.error("Fund on-chain failed (or no contract). updating off-chain state.");
        }

        // Update local state (Mock Wei addition)
        let totalEth = Number(proposal.totalFunds) / 1e18; // approx convert back to eth
        totalEth += Number(amount);
        proposal.totalFunds = (totalEth * 1e18).toString();

        db.activities.unshift({
            id: `act-${Date.now()}`,
            type: "PROPOSAL_FUNDED",
            description: `Funded ${amount} ETH to '${proposal.title}'${note ? ` - ${note}` : ''}`,
            walletAddress: userWallet,
            timestamp: Date.now(),
            txHash
        });

        res.json(proposal);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error during funding" });
    }
});

module.exports = router;
