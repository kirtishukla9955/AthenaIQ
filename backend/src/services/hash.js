const crypto = require("crypto");

/**
 * Normalizes input and generates a SHA-256 hash
 * @param {string} input - The input string (e.g. file content, JSON metadata, or raw text)
 * @returns {string} The hex representation of the SHA-256 hash (64 characters)
 */
function generateHash(input) {
    const hash = crypto.createHash("sha256");
    hash.update(input);
    return hash.digest("hex");
}

module.exports = {
    generateHash
};
