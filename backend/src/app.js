const express = require("express");
const cors = require("cors");

// Routes imports
const authRoutes = require("./routes/auth");
const vaultRoutes = require("./routes/vault");
const proposalsRoutes = require("./routes/proposals");
const revealRoutes = require("./routes/reveal");
const networkRoutes = require("./routes/network");
const dashboardRoutes = require("./routes/dashboard");
const aiRoutes = require("./routes/ai");

const app = express();

app.use(cors({
    origin: ["https://aura-five-ashy.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vault", vaultRoutes);
app.use("/api/proposals", proposalsRoutes);
app.use("/api/reveal", revealRoutes);
app.use("/api/network", networkRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to ProofFund API" });
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
