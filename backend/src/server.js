require("dotenv").config();
const http = require("http");
const app = require("./app");

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`ProofFund backend running at http://localhost:${PORT}`);
});
