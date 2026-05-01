const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const vaultRoutes = require("./routes/vault");
const proposalsRoutes = require("./routes/proposals");
const revealRoutes = require("./routes/reveal");
const networkRoutes = require("./routes/network");
const dashboardRoutes = require("./routes/dashboard");
const aiRoutes = require("./routes/ai");

const app = express();

// ── CORS: allow any *.vercel.app URL + localhost + any custom domain ──────────
const ALLOWED_ORIGINS = [
    "https://aura-five-ashy.vercel.app",
    "http://localhost:3000",
    "http://localhost:4000",
];

// If FRONTEND_URL env var is set on Railway, add it too
if (process.env.FRONTEND_URL) {
    ALLOWED_ORIGINS.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        // Allow any *.vercel.app preview URL automatically
        if (origin.endsWith(".vercel.app")) return callback(null, true);
        // Allow explicit list
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error("CORS: origin not allowed — " + origin));
    },
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
    res.json({ message: "ProofFund API is running ✓", version: "1.0.0" });
});

// Health check endpoint for Railway
app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
