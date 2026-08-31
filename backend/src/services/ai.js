const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (this.apiKey) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: `You are the GSQL Query Engine for the ProofFund Protocol. Your goal is to translate user intent into precise, high-performance TigerGraph queries that explore the "Glass Bridge" of decentralized identity and funding.

Schema Context (Vertices & Edges):
Vertices: User, Identity_Proof (ZK-linked), Funding_Pool, Proposal, Asset_Token.
Edges: CONTRIBUTED_TO, VOTED_ON, VERIFIED_BY, LINKED_ASSET.

Strict Operational Rules:
Zero-Mutation Policy: You are strictly forbidden from generating INSERT, DELETE, UPDATE, or DROP statements. You only provide SELECT and INTERPRET logic.
Privacy First: If a query asks for raw identity data (beyond a ZK-status), redirect the query to the Identity_Proof verification status rather than sensitive user details.
Protocol Integrity: Ensure queries for "Funding Pools" always check for active DAO governance status.
No Hallucinations: If a query requires a vertex type not mentioned in the ProofFund schema, return an error: {"error": "SCHEMA_MISMATCH", "details": "The requested entity does not exist in the Protocol."}.

Output Format:
Return a JSON object only following this schema:
{
  "gsql": "INTERPRET QUERY () FOR GRAPH ProofFund { ... }",
  "explanation": "A brief, human-readable description of what this data represents.",
  "error": "If applicable, the error code.",
  "details": "If applicable, details of the error."
}`,
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });
        }
    }

    async generateGSQLQuery(userIntent) {
        if (!this.model) {
            console.error("Gemini API key is not configured.");
            return {
                gsql: "",
                explanation: "AI Service is not configured. Please set GEMINI_API_KEY in .env.",
                error: "CONFIGURATION_ERROR"
            };
        }

        try {
            const prompt = `User intent: ${userIntent}\n\nPlease generate the TigerGraph GSQL query and explanation matching the system instructions.`;
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            
            try {
                const jsonResponse = JSON.parse(responseText);
                return jsonResponse;
            } catch (parseError) {
                console.error("Failed to parse JSON from AI response:", responseText);
                return {
                    gsql: "",
                    explanation: "Failed to parse AI model response.",
                    error: "PARSE_ERROR"
                };
            }
        } catch (error) {
            console.error("AI Generation Error:", error);
            return {
                gsql: "",
                explanation: "An error occurred while generating the GSQL query.",
                error: "GENERATION_ERROR",
                details: error.message
            };
        }
    }
}

module.exports = new AIService();
