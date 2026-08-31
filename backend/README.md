# ProofFund Backend

This is the backend for **ProofFund**, a decentralized idea protection and funding platform built on Polygon Amoy. 

## Features
- Smart contracts for hashing/verifying ideas and managing DAO funding
- Off-chain storage fallback and metadata persistence
- IPFS via Pinata for metadata/file storage
- Network graph generation via TigerGraph

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill it out:
   ```bash
   cp .env.example .env
   ```
   *Note: Ensure your `PRIVATE_KEY` has Amoy testnet MATIC to deploy smart contracts.*

3. **Deploy Smart Contracts:**
   ```bash
   npm run deploy:contracts
   ```
   This compiles and deploys the contracts to Polygon Amoy. It will automatically populate `contracts/addresses.json` but you need to manually copy those addresses to your `.env` for `IDEA_REGISTRY_ADDRESS` and `FUNDING_DAO_ADDRESS`.

4. **Setup TigerGraph:**
   Make sure your TigerGraph instance is up at `tgcloud.io` and credentials match in `.env`.
   ```bash
   npm run setup:tigergraph
   ```

5. **Run the server:**
   ```bash
   npm run dev
   ```

## Key Technologies
- Express.js
- Ethers v6
- Axios & Pinata
- Nodemon for dev velocity
