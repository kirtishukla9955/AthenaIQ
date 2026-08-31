const fs = require("fs");
const path = require("path");
const ethers = require("ethers");
require("dotenv").config();

async function main() {
  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    console.error("Missing RPC_URL or PRIVATE_KEY in .env");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying contracts with the account:", wallet.address);

  try {
    const solc = require("solc");

    // 1. Read Contracts
    const ideaRegistryPath = path.resolve(__dirname, "../contracts/IdeaRegistry.sol");
    const fundingDAOPath = path.resolve(__dirname, "../contracts/FundingDAO.sol");
    const ideaRegistrySource = fs.readFileSync(ideaRegistryPath, "utf8");
    const fundingDAOSource = fs.readFileSync(fundingDAOPath, "utf8");

    // 2. Compile Contracts
    const input = {
      language: "Solidity",
      sources: {
        "IdeaRegistry.sol": { content: ideaRegistrySource },
        "FundingDAO.sol": { content: fundingDAOSource },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode"],
          },
        },
      },
    };

    console.log("Compiling contracts...");
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
      console.error(output.errors);
      output.errors.forEach((err) => {
        if (err.severity === "error") throw new Error("Compilation failed");
      });
    }

    const ideaRegistryData = output.contracts["IdeaRegistry.sol"]["IdeaRegistry"];
    const fundingDAOData = output.contracts["FundingDAO.sol"]["FundingDAO"];

    // 3. Deploy
    console.log("Deploying IdeaRegistry...");
    const IdeaRegistryFactory = new ethers.ContractFactory(
      ideaRegistryData.abi,
      ideaRegistryData.evm.bytecode.object,
      wallet
    );
    const ideaReg = await IdeaRegistryFactory.deploy();
    await ideaReg.waitForDeployment();
    const ideaRegAddress = await ideaReg.getAddress();
    console.log("IdeaRegistry deployed to:", ideaRegAddress);

    console.log("Deploying FundingDAO...");
    const FundingDAOFactory = new ethers.ContractFactory(
      fundingDAOData.abi,
      fundingDAOData.evm.bytecode.object,
      wallet
    );
    const fundingDAO = await FundingDAOFactory.deploy();
    await fundingDAO.waitForDeployment();
    const fundingDAOAddress = await fundingDAO.getAddress();
    console.log("FundingDAO deployed to:", fundingDAOAddress);

    // 4. Save Addresses
    const addresses = {
      IdeaRegistry: ideaRegAddress,
      FundingDAO: fundingDAOAddress,
    };
    fs.writeFileSync(
      path.resolve(__dirname, "../contracts/addresses.json"),
      JSON.stringify(addresses, null, 2)
    );
    console.log("Saved addresses to contracts/addresses.json");
    
    console.log("Add 'npm i solc' if you run into missing dependency, or run via Hardhat.");

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('solc')) {
      console.error("Please run `npm install solc` to compile contracts during deployment.");
    } else {
      console.error("Deployment error:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
