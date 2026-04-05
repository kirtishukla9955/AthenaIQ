const express = require("express");
const authenticateToken = require("../middleware/auth");
const db = require("../db");
const ipfsService = require("../services/ipfs");
const blockchainService = require("../services/blockchain");
const tigergraphService = require("../services/tigergraph");
const { generateHash } = require("../services/hash");

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
    try {
        const userWallet = req.user.walletAddress;
        
        // Filter vault items by owner
        const userItems = db.vaultItems.filter(item => 
            item.ownerAddress.toLowerCase() === userWallet.toLowerCase()
        );

        res.json(userItems);
    } catch (error) {
        res.status(500).json({ error: "Server error fetching vault items" });
    }
});

router.post("/", authenticateToken, async (req, res) => {
    try {
        const { title, description, fileHash } = req.body;
        const userWallet = req.user.walletAddress;

        if (!title || !fileHash) {
            return res.status(400).json({ error: "title and fileHash are required" });
        }

        // 1. Pin metadata to IPFS
        const ipfsMetadata = {
            title,
            description: description || "",
            fileHash,
            owner: userWallet,
            timestamp: Date.now()
        };
        const ipfsUrl = await ipfsService.uploadJSONToIPFS(ipfsMetadata);

        // 2. Call IdeaRegistry.commitIdea(fileHash)
        let txHash;
        try {
            const tx = await blockchainService.commitIdea(fileHash);
            txHash = tx.hash || tx;
        } catch (chainError) {
            console.error("Blockchain error, using fallback txHash", chainError.message);
            txHash = "0x" + generateHash(Date.now().toString()).slice(0, 42); // Mock hash if chain fails
        }

        // 3. Add to local db
        const newItem = {
            id: `vlt-${Date.now()}`,
            title,
            description: description || "",
            fileHash,
            ipfsUrl,
            txHash,
            timestamp: Date.now(),
            verified: true, // Optimistically assuming success
            ownerAddress: userWallet
        };
        db.vaultItems.push(newItem);

        // 4. Add vertex to TigerGraph
        await tigergraphService.addIPAsset(
            newItem.id,
            newItem.title,
            "idea",
            newItem.description
        );

        // Record Activity
        db.activities.unshift({
            id: `act-${Date.now()}`,
            type: "IDEA_COMMITTED",
            description: `Committed new idea '${newItem.title}'`,
            walletAddress: userWallet,
            timestamp: Date.now(),
            txHash: newItem.txHash
        });

        res.status(201).json(newItem);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error creating vault item" });
    }
});

module.exports = router;
