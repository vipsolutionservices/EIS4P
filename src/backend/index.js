// vogo-mcp — AI memory REST API (Express 5, MariaDB).
// Exposes save + retrieve web services so an AI can persist structured memory
// per user/project/chat-code and reload it later. Prefix: /api/v1
import "dotenv/config";
import express from "express";
import { pingDb } from "./db.js";
import { requireApiKey } from "./auth.js";
import {
    saveMemory, getEffectiveMemory, getScopeMemory,
    searchMemory, getHistory,
} from "./memory.service.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

// Configurable CORS (comma-separated origins in CORS_ORIGINS, or * ).
const CORS = process.env.CORS_ORIGINS || "*";
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", CORS);
    res.header("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

const V1 = "/api/v1";

// ---- Health (public, no API key) ------------------------------------------
async function health(_req, res) {
    let db = "down";
    try { db = (await pingDb()) ? "ok" : "down"; } catch { db = "down"; }
    res.status(db === "ok" ? 200 : 503).json({
        status: db === "ok" ? "running" : "degraded",
        database: db,
        version: "1.0.0",
    });
}
app.get("/health", health);          // simple alias
app.get(`${V1}/health`, health);     // spec path (grund.md 7.1)

// Everything below requires the API key.
app.use(V1, requireApiKey);

// ---- Save (grund.md 7.4) --------------------------------------------------
app.post(`${V1}/memory`, wrap(async (req, res) => {
    const saved = await saveMemory(req.body || {});
    res.status(201).json(saved);
}));

// ---- Effective memory (grund.md 7.2) --------------------------------------
app.get(`${V1}/memory/effective`, wrap(async (req, res) => {
    const { user_id, project_id, chat_id } = req.query;
    res.json(await getEffectiveMemory({ user_id, project_id: project_id || null, chat_id: chat_id || null }));
}));

// ---- Scope reads (grund.md 7.3) -------------------------------------------
app.get(`${V1}/memory/global/:user_id`, wrap(async (req, res) => {
    res.json(await getScopeMemory({ user_id: req.params.user_id, scope: "global" }));
}));
app.get(`${V1}/memory/project/:user_id/:project_id`, wrap(async (req, res) => {
    res.json(await getScopeMemory({ user_id: req.params.user_id, scope: "project", project_id: req.params.project_id }));
}));
app.get(`${V1}/memory/chat/:user_id/:project_id/:chat_id`, wrap(async (req, res) => {
    res.json(await getScopeMemory({
        user_id: req.params.user_id, scope: "chat",
        project_id: req.params.project_id, chat_id: req.params.chat_id,
    }));
}));

// ---- Search (grund.md 7.9) ------------------------------------------------
app.get(`${V1}/memory/search`, wrap(async (req, res) => {
    const { user_id, query, project_id, chat_id, scope, category, limit, offset } = req.query;
    res.json(await searchMemory({
        user_id, query,
        project_id: project_id || null, chat_id: chat_id || null,
        scope: scope || null, category: category || null,
        limit: limit || 20, offset: offset || 0,
    }));
}));

// ---- History (grund.md 7.10) ----------------------------------------------
app.get(`${V1}/memory/:memory_id/history`, wrap(async (req, res) => {
    res.json(await getHistory(Number(req.params.memory_id)));
}));

// Central error handler: services throw Error with .status for client errors.
app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    if (status >= 500) console.error("[vogo-mcp]", err);
    res.status(status).json({ error: err.message || "internal error" });
});

function wrap(fn) {
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// LiteSpeed/Passenger injects PORT via env; fall back to 3000 for local runs.
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`vogo-mcp memory API listening on :${PORT}`));

export default app;
