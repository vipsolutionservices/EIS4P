// vogo-mcp — REMOTE MCP server over Streamable HTTP (for ChatGPT custom MCP
// connectors / any remote MCP client). Unlike src/mcp/server.js (stdio, local),
// this speaks the MCP protocol over HTTPS and talks to MariaDB directly.
//
// Endpoint: POST/GET/DELETE /mcp
// Auth: Authorization: Bearer <API_KEY>  (or X-API-Key, or ?key=)
// Run:  node src/mcp/http-server.js   (PORT from env)
import "dotenv/config";
import express from "express";
import crypto from "node:crypto";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
    saveMemory, getEffectiveMemory, getScopeMemory, searchMemory,
} from "../backend/memory.service.js";

const DEFAULT_USER = process.env.DEFAULT_USER || "adrian";

function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

// Build a fresh MCP server instance (one per session) with the memory tools.
function buildServer() {
    const server = new McpServer({ name: "vogo-mcp", version: "1.0.0" });

    server.registerTool("memory_load", {
        title: "Load memory",
        description: "Load cumulative memory (global+project+chat) for a project and chat-code. Call before answering about a project.",
        inputSchema: {
            user_id: z.string().default(DEFAULT_USER),
            project_id: z.string().optional(),
            chat_id: z.string().optional(),
        },
    }, async ({ user_id, project_id, chat_id }) =>
        ok(await getEffectiveMemory({ user_id: user_id || DEFAULT_USER, project_id: project_id || null, chat_id: chat_id || null })));

    server.registerTool("memory_list", {
        title: "List / search memory",
        description: "List memories of one scope, or full-text search when 'query' is given.",
        inputSchema: {
            user_id: z.string().default(DEFAULT_USER),
            scope: z.enum(["global", "project", "chat"]).optional(),
            project_id: z.string().optional(),
            chat_id: z.string().optional(),
            query: z.string().optional(),
        },
    }, async ({ user_id, scope, project_id, chat_id, query }) => {
        const u = user_id || DEFAULT_USER;
        if (query) return ok(await searchMemory({ user_id: u, query, project_id: project_id || null, chat_id: chat_id || null, scope: scope || null }));
        if (scope) return ok(await getScopeMemory({ user_id: u, scope, project_id: project_id || null, chat_id: chat_id || null }));
        return ok(await getEffectiveMemory({ user_id: u, project_id: project_id || null, chat_id: chat_id || null }));
    });

    const saveShape = {
        user_id: z.string().default(DEFAULT_USER),
        scope: z.enum(["global", "project", "chat"]),
        project_id: z.string().optional(),
        chat_id: z.string().optional(),
        category: z.string().default("general"),
        memory_key: z.string(),
        content: z.string(),
        priority: z.number().int().optional(),
        source_reference: z.string().optional(),
    };

    // memory_save and memory_replace share the same versioned upsert: re-saving
    // the same (scope,project,chat,category,memory_key) supersedes the old
    // active version and inserts version+1. Both are provided to match the
    // requested tool names; "replace" is documented as overwriting the value.
    const doSave = async (a) => ok(await saveMemory({ ...a, user_id: a.user_id || DEFAULT_USER, project_id: a.project_id || null, chat_id: a.chat_id || null }));
    server.registerTool("memory_save", {
        title: "Save memory",
        description: "Persist a memory (scope global/project/chat). Re-saving the same memory_key creates a new version and keeps history.",
        inputSchema: saveShape,
    }, doSave);
    server.registerTool("memory_replace", {
        title: "Replace memory",
        description: "Overwrite the value of a memory_key (same as memory_save; supersedes the previous active version).",
        inputSchema: saveShape,
    }, doSave);

    return server;
}

// ---- Streamable HTTP transport (session-based, per MCP spec) ---------------
const app = express();
app.use(express.json({ limit: "1mb" }));

// Auth guard for the MCP endpoint.
function authed(req) {
    const expected = process.env.API_KEY || "";
    if (!expected) return false;
    let tok = "";
    const auth = req.get("authorization") || "";
    if (auth.toLowerCase().startsWith("bearer ")) tok = auth.slice(7).trim();
    if (!tok) tok = req.get("x-api-key") || req.query.key || "";
    const a = Buffer.from(String(tok)), b = Buffer.from(String(expected));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const transports = {}; // sessionId -> transport

app.post("/mcp", async (req, res) => {
    if (!authed(req)) return res.status(401).json({ jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null });
    const sid = req.headers["mcp-session-id"];
    let transport;
    if (sid && transports[sid]) {
        transport = transports[sid];
    } else if (!sid && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (id) => { transports[id] = transport; },
        });
        transport.onclose = () => { if (transport.sessionId) delete transports[transport.sessionId]; };
        await buildServer().connect(transport);
    } else {
        return res.status(400).json({ jsonrpc: "2.0", error: { code: -32000, message: "No valid session ID" }, id: null });
    }
    await transport.handleRequest(req, res, req.body);
});

// GET (SSE stream) + DELETE (terminate) reuse the existing session.
async function sessionReq(req, res) {
    if (!authed(req)) return res.status(401).send("Unauthorized");
    const sid = req.headers["mcp-session-id"];
    if (!sid || !transports[sid]) return res.status(400).send("Invalid or missing session ID");
    await transports[sid].handleRequest(req, res);
}
app.get("/mcp", sessionReq);
app.delete("/mcp", sessionReq);

// Plain liveness (no MCP, no auth) for LiteSpeed/monitoring.
app.get("/health", (_req, res) => res.json({ status: "running", transport: "streamable-http" }));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`vogo-mcp remote MCP (streamable-http) on :${PORT}/mcp`));
