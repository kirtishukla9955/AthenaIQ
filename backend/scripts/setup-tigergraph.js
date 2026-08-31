require("dotenv").config();
const axios = require("axios");

const host = process.env.TIGERGRAPH_HOST;
const username = process.env.TIGERGRAPH_USERNAME;
const password = process.env.TIGERGRAPH_PASSWORD;
const graph = process.env.TIGERGRAPH_GRAPH || "ProofFundGraph";

if (!host || !password) {
  console.error("TigerGraph credentials missing in .env");
  process.exit(1);
}

async function tgRequest(method, endpoint, data = null) {
  const url = `${host}:9000${endpoint}`;
  try {
    const response = await axios({
      method,
      url,
      auth: { username, password },
      data,
    });
    return response.data;
  } catch (err) {
    console.error(`Error with TG request ${method} ${endpoint}:`, err.response?.data || err.message);
    throw err;
  }
}

async function gsql(queryText) {
  const url = `${host}:14240/gsqlserver/gsql/file`;
  try {
    const response = await axios.post(url, queryText, {
      auth: { username, password },
      headers: { "Content-Type": "text/plain" },
    });
    if (response.data.error) {
      console.error("GSQL Error:", response.data.message);
    }
    return response.data;
  } catch (err) {
    console.error("Error executing GSQL:", err.response?.data || err.message);
    throw err;
  }
}

async function setup() {
  console.log("Setting up TigerGraph Schema for Glass Bridge ProofFund Protocol...");

  const schemaQuery = `
    USE GLOBAL
    CREATE VERTEX User (PRIMARY_ID id STRING, walletAddress STRING, type STRING)
    CREATE VERTEX Identity_Proof (PRIMARY_ID id STRING, zkStatus STRING, provider STRING)
    CREATE VERTEX Funding_Pool (PRIMARY_ID id STRING, daoGovernanceStatus STRING, totalFunds DOUBLE)
    CREATE VERTEX Proposal (PRIMARY_ID id STRING, title STRING, active BOOL)
    CREATE VERTEX Asset_Token (PRIMARY_ID id STRING, symbol STRING, contractAddress STRING)

    CREATE UNDIRECTED EDGE VERIFIED_BY (FROM User, TO Identity_Proof, timestamp INT)
    CREATE DIRECTED EDGE CONTRIBUTED_TO (FROM User, TO Funding_Pool, amount DOUBLE)
    CREATE DIRECTED EDGE VOTED_ON (FROM User, TO Proposal, voteType STRING)
    CREATE UNDIRECTED EDGE LINKED_ASSET (FROM Funding_Pool, TO Asset_Token)

    CREATE GRAPH ${graph} (User, Identity_Proof, Funding_Pool, Proposal, Asset_Token, VERIFIED_BY, CONTRIBUTED_TO, VOTED_ON, LINKED_ASSET)
  `;

  try {
    await gsql(schemaQuery);
    console.log("Schema created.");
  } catch (e) {
    console.log("Schema might already exist. Proceeding...");
  }

  console.log("Installing Glass Bridge Query...");
  const installQuery = `
    USE GRAPH ${graph}
    CREATE QUERY get_prooffund_bridgenetwork() FOR GRAPH ${graph} {
      SetAccum<VERTEX> @@vertices;
      SetAccum<EDGE> @@edges;
      start = {ANY};
      res = SELECT v FROM start:v ACCUM @@vertices += v;
      edges = SELECT s FROM start:s -(VERIFIED_BY:e)-> :t ACCUM @@edges += e;
      PRINT @@vertices, @@edges;
    }
    INSTALL QUERY get_prooffund_bridgenetwork
  `;

  try {
    await gsql(installQuery);
    console.log("Queries installed.");
  } catch (e) {
    console.log("Query might already exist. Proceeding...");
  }

  console.log("Seeding sample data for Glass Bridge...");

  const seedPayload = {
    vertices: {
      User: {
        "user-1": { walletAddress: { value: "0x123abc" }, type: { value: "contributor" } },
        "user-2": { walletAddress: { value: "0x456def" }, type: { value: "creator" } }
      },
      Identity_Proof: {
        "proof-1": { zkStatus: { value: "verified" }, provider: { value: "PolygonID" } }
      },
      Funding_Pool: {
        "pool-1": { daoGovernanceStatus: { value: "active" }, totalFunds: { value: 15.5 } }
      },
      Proposal: {
        "prop-1": { title: { value: "DeFi SDK Integration" }, active: { value: true } }
      },
      Asset_Token: {
        "token-1": { symbol: { value: "USDC" }, contractAddress: { value: "0xTokenAddr" } }
      }
    },
    edges: {
      User: {
        "user-1": {
          VERIFIED_BY: {
            "Identity_Proof": {
              "proof-1": { timestamp: { value: Date.now() / 1000 } }
            }
          },
          CONTRIBUTED_TO: {
            "Funding_Pool": {
              "pool-1": { amount: { value: 5.0 } }
            }
          },
          VOTED_ON: {
            "Proposal": {
              "prop-1": { voteType: { value: "YES" } }
            }
          }
        }
      },
      Funding_Pool: {
        "pool-1": {
          LINKED_ASSET: {
            "Asset_Token": {
              "token-1": {}
            }
          }
        }
      }
    }
  };

  try {
    const res = await tgRequest("POST", `/graph/${graph}`, seedPayload);
    console.log("Sample data seeded:", res.message || res);
  } catch (e) {
    console.log("Failed to seed data. It's okay if this was already done.");
  }

  console.log("TigerGraph setup complete for ProofFund Glass Bridge.");
}

setup();
