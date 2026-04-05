const jwt = require("jsonwebtoken");
const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod";

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access token missing or invalid" });
    }

    if (db.tokenBlacklist.has(token)) {
        return res.status(403).json({ error: "Token has been revoked" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token is expired or invalid" });
        }
        
        // user should contain inner payload like { walletAddress: '0x...', iat: ..., exp: ... }
        req.user = user;
        req.token = token;
        next();
    });
}

module.exports = authenticateToken;
