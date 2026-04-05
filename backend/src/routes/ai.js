const express = require("express");
const aiService = require("../services/ai");
const tigergraphService = require("../services/tigergraph");

const router = express.Router();

router.post("/query", async (req, res) => {
    try {
        const { intent } = req.body;
        
        if (!intent) {
            return res.status(400).json({ error: "Missing 'intent' in request body" });
        }

        const aiResponse = await aiService.generateGSQLQuery(intent);

        if (aiResponse.error) {
            return res.status(400).json(aiResponse);
        }

     
        /* 
        if (aiResponse.gsql) {
           const dbResult = await tigergraphService.executeRawGSQL(aiResponse.gsql);
           aiResponse.results = dbResult;
        }
        */

        res.json(aiResponse);
    } catch (error) {
        console.error("AI Route Error:", error);
        res.status(500).json({ error: "Internal Server Error during AI execution" });
    }
});

module.exports = router;
