const axios = require('axios');

class TigerGraphService {
    constructor() {
        this.host = process.env.TIGERGRAPH_HOST;
        this.username = process.env.TIGERGRAPH_USERNAME;
        this.password = process.env.TIGERGRAPH_PASSWORD;
        this.graph = process.env.TIGERGRAPH_GRAPH || "ProofFundGraph";
    }

    async request(method, endpoint, data = null) {
        if (!this.host) return null;
        const url = `${this.host}:9000${endpoint}`;
        try {
            const response = await axios({
                method,
                url,
                auth: {
                    username: this.username,
                    password: this.password
                },
                data
            });
            return response.data;
        } catch (err) {
            console.error(`TigerGraph API Error (${method} ${url}):`, err.response?.data || err.message);
            throw err;
        }
    }

    async addIPAsset(id, label, type, detail) {
        if (!this.host) return; // Fallback handled gracefully
        const payload = {
            vertices: {
                IPAsset: {
                    [id]: {
                        label: { value: label },
                        type: { value: type },
                        detail: { value: detail },
                        connections: { value: 0 }
                    }
                }
            }
        };
        try {
            await this.request("POST", `/graph/${this.graph}`, payload);
        } catch (e) {
            console.error("Failed to add IPAsset to TigerGraph");
        }
    }

    async getGraph() {
        if (!this.host) return this.getMockGraph();

        try {
            // Call the installed GSQL query
            const res = await this.request("GET", `/query/${this.graph}/get_ip_graph`);
            if (res && res.error === false && res.results) {
                const results = res.results[0]; // standard tg response format
                
                const nodes = (results["@@vertices"] || []).map(v => ({
                    id: v.v_id,
                    label: v.attributes?.label || v.v_id,
                    type: v.attributes?.type || "unknown",
                    detail: v.attributes?.detail || "",
                    connections: v.attributes?.connections || 0
                }));

                const edges = (results["@@edges"] || []).map(e => ({
                    source: e.from_id,
                    target: e.to_id,
                    weight: e.attributes?.weight || 1.0
                }));

                return { nodes, edges };
            }
        } catch (error) {
            console.error("TigerGraph getGraph query failed. Falling back to mock data.");
        }

        return this.getMockGraph();
    }

    getMockGraph() {
        return {
            nodes: [
                { id: "asset-1", label: "DeFi Protocol Idea", type: "idea", detail: "A new AMM", connections: 2 },
                { id: "asset-2", label: "ZKP Auth Patent", type: "patent", detail: "Zero-knowledge auth", connections: 2 },
                { id: "asset-3", label: "Layer 2 Research", type: "research", detail: "Optimistic rollups", connections: 2 },
            ],
            edges: [
                { source: "asset-1", target: "asset-2", weight: 0.8 },
                { source: "asset-1", target: "asset-3", weight: 0.5 },
            ]
        };
    }
}

module.exports = new TigerGraphService();
