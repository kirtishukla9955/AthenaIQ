const express = require("express");
const jwt = require("jsonwebtoken");
const blockchainService = require("../services/blockchain");
const authenticateToken = require("../middleware/auth");
const db = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod";

router.post("/connect", (req, res) => {
    try {
        const { walletAddress, signature, message } = req.body;

        if (!walletAddress || !signature || !message) {
            return res.status(400).json({ error: "Missing auth parameters" });
        }

        // Verify the signature
        const isValid = blockchainService.verifySignature(walletAddress, signature, message);
        
        if (!isValid) {
            // For testing convenience when blockchain isn't actually verifying correctly,
            // we could skip it, but spec says: verify signature with ethers.js
            return res.status(401).json({ error: "Invalid signature" });
        }

        // Generate JWT
        const token = jwt.sign({ walletAddress: walletAddress.toLowerCase() }, JWT_SECRET, {
            expiresIn: "7d"
        });

        res.json({
            walletAddress: walletAddress.toLowerCase(),
            token
        });
    } catch (error) {
        res.status(500).json({ error: "Server error during authentication" });
    }
});

router.post("/disconnect", authenticateToken, (req, res) => {
    try {
        const token = req.token;
        if (token) {
            db.tokenBlacklist.add(token);
        }
        res.json({});
    } catch (error) {
        res.status(500).json({ error: "Server error during disconnect" });
    }
});

module.exports = router;
