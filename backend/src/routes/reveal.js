const express = require("express");
const authenticateToken = require("../middleware/auth");
const db = require("../db");
const blockchainService = require("../services/blockchain");

const router = express.Router();

router.get("/verifications", authenticateToken, (req, res) => {
    try {
        const userWallet = req.user.walletAddress;
        
        const userVerifications = db.verifications.filter(v => 
            v.originalOwner.toLowerCase() === userWallet.toLowerCase()
        );

        res.json(userVerifications);
    } catch (error) {
        res.status(500).json({ error: "Server error fetching verifications" });
    }
});

router.post("/compare", async (req, res) => {
    try {
        const { hash1, hash2 } = req.body;

        if (!hash1 || !hash2) {
            return res.status(400).json({ error: "hash1 and hash2 are required" });
        }

        const match = hash1.toLowerCase() === hash2.toLowerCase();

        if (match) {
            let onChainInfo = await blockchainService.verifyIdea(hash1);
            
            if (!onChainInfo) {
                const item = db.vaultItems.find(v => v.fileHash.toLowerCase() === hash1.toLowerCase());
                if (item) {
                    onChainInfo = {
                        owner: item.ownerAddress,
                        timestamp: item.timestamp
                    };
                }
            }

            if (onChainInfo) {
                const newVerf = {
                    id: `ver-${Date.now()}`,
                    hash: hash1,
                    matchFound: true,
                    originalOwner: onChainInfo.owner,
                    timestamp: onChainInfo.timestamp,
                    txHash: "0xmock"
                };
                db.verifications.push(newVerf);

                return res.json({
                    match: true,
                    owner: onChainInfo.owner,
                    timestamp: onChainInfo.timestamp
                });
            }
        }

        res.json({
            match,
            owner: null,
            timestamp: null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error comparing hashes" });
    }
});

module.exports = router;
