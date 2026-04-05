const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/stats", (req, res) => {
    try {
        const ipAssetsCount = db.vaultItems.length;
        const verifiedCount = db.vaultItems.filter(v => v.verified).length;
        const proposalsCount = db.proposals.length;
        
        let totalRaisedWei = db.proposals.reduce((total, p) => {
            return total + Number(p.totalFunds);
        }, 0);
        
        const totalRaisedEth = (totalRaisedWei / 1e18).toString();

        res.json({
            ipAssets: ipAssetsCount,
            verified: verifiedCount,
            proposals: proposalsCount,
            totalRaised: totalRaisedEth
        });
    } catch (error) {
        res.status(500).json({ error: "Server error fetching stats" });
    }
});

router.get("/activity", (req, res) => {
    try {
        // Return latest 20 activities
        const latestActivies = db.activities
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 20);

        res.json(latestActivies);
    } catch (error) {
        res.status(500).json({ error: "Server error fetching activity" });
    }
});

module.exports = router;
