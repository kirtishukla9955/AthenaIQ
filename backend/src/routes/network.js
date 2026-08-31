const express = require("express");
const tigergraphService = require("../services/tigergraph");

const router = express.Router();

router.get("/graph", async (req, res) => {
    try {
        const graphData = await tigergraphService.getGraph();
        res.json(graphData);
    } catch (error) {
        console.error("Graph Error:", error);
        // Ensure graceful failure
        res.status(500).json(tigergraphService.getMockGraph());
    }
});

module.exports = router;
