// API-key authentication. Every route except /api/v1/health requires a valid
// X-API-Key header. v1 checks against a single key in the environment; the
// mcp_api_client table (schema.sql) is reserved for multi-client hashed keys.
import crypto from "crypto";

function timingSafeEqual(a, b) {
    const ba = Buffer.from(String(a));
    const bb = Buffer.from(String(b));
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
}

export function requireApiKey(req, res, next) {
    const expected = process.env.API_KEY;
    if (!expected) return res.status(500).json({ error: "server API_KEY not configured" });
    const provided = req.get("X-API-Key") || "";
    if (!provided || !timingSafeEqual(provided, expected)) {
        return res.status(401).json({ error: "missing or invalid API key" });
    }
    next();
}
