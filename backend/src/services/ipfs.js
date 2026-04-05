const PinataSDK = require("pinata").PinataSDK;

let pinata;

if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY) {
    try {
        
        pinata = new PinataSDK({
          pinataJwt: process.env.PINATA_API_KEY, // Or configuring with keys below
          pinataGateway: "gateway.pinata.cloud"
        });
        
    } catch(err) {
        console.warn("Pinata init failed:", err.message);
    }
}

async function uploadJSONToIPFS(jsonMetadata) {
    if (!pinata) {
        console.warn("Pinata not configured. Returning mock IPFS URL.");
        return `ipfs://QmMock${Date.now()}`;
    }

    try {
        const upload = await pinata.upload.json(jsonMetadata);
        return `ipfs://${upload.IpfsHash}`;
    } catch (error) {
        console.error("IPFS Upload Error:", error);
        return `ipfs://QmFallback${Date.now()}`;
    }
}

module.exports = {
    uploadJSONToIPFS
};
