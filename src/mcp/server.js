// vogo-mcp — MCP server (stdio) that an AI client (Claude Code, etc.) connects
// to so it never loses memory. Every tool calls the REST API over HTTPS; the
// MCP layer never touches the database directly (grund.md section 9).
//
// Run:  node src/mcp/server.js
// Env:  MCP_API_BASE_URL (e.g. https://vogo.me/ai-mcp/api/v1 or http://127.0.0.1:3000/api/v1)
//       MCP_API_KEY      (the memory service API key)
import "dotenv/config";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = (process.env.MCP_API_BASE_URL || "http://127.0.0.1:3000/api/v1").replace(/\/$/, "");
const KEY = process.env.MCP_API_KEY || process.env.API_KEY || "";

// Use Node's http/https (not global fetch): undici's WASM parser fails to
// allocate under CloudLinux/LVE memory limits, so fetch is unreliable there.
function httpRequest(method, urlStr, { headers = {}, body } = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL(urlStr);
        const mod = u.protocol === "https:" ? https : http;
        const payload = body ? Buffer.from(JSON.stringify(body)) : null;
        const opts = {
            method,
            hostname: u.hostname,
            port: u.port || (u.protocol === "https:" ? 443 : 80),
            path: u.pathname + u.search,
            headers: { ...headers },
        };
        if (payload) opts.headers["Content-Length"] = payload.length;
        const req = mod.request(opts, (res) => {
            let text = "";
            res.setEncoding("utf8");
            res.on("data", (c) => (text += c));
            res.on("end", () => resolve({ status: res.statusCode, text }));
        });
        req.on("error", reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function api(method, path, { query, body } = {}) {
    let url = BASE + path;
    if (query) {
        const q = new URLSearchParams(
            Object.entries(query).filter(([, v]) => v !== undefined && v !== null)
        ).toString();
        if (q) url += `?${q}`;
    }
    const res = await httpRequest(method, url, {
        headers: { "Content-Type": "application/json", "X-API-Key": KEY },
        body,
    });
    let data;
    try { data = res.text ? JSON.parse(res.text) : null; } catch { data = { raw: res.text }; }
    if (res.status < 200 || res.status >= 300) throw new Error(`API ${res.status}: ${JSON.stringify(data)}`);
    return data;
}

function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

const server = new McpServer({ name: "vogo-mcp", version: "1.0.0" });

// ---- Reads ----------------------------------------------------------------
server.registerTool(
    "get_effective_memory",
    {
        title: "Get effective memory",
        description: "Cumulative global+project+chat memory for a user, deduped by key (chat>project>global). Call this before answering about a project.",
        inputSchema: { user_id: z.string(), project_id: z.string().optional(), chat_id: z.string().optional() },
    },
    async ({ user_id, project_id, chat_id }) => ok(await api("GET", "/memory/effective", { query: { user_id, project_id, chat_id } }))
);

server.registerTool(
    "search_memory",
    {
        title: "Search memory",
        description: "Full-text search across the user's memories (title/content/key/category).",
        inputSchema: {
            user_id: z.string(), query: z.string(),
            project_id: z.string().optional(), chat_id: z.string().optional(),
            scope: z.enum(["global", "project", "chat"]).optional(), category: z.string().optional(),
            limit: z.number().int().optional(),
        },
    },
    async (a) => ok(await api("GET", "/memory/search", { query: a }))
);

// ---- Writes (default status draft on the MCP side, per grund.md 9.2/9.3) ---
const saveShape = {
    user_id: z.string(),
    category: z.string().default("general"),
    memory_key: z.string(),
    content: z.string(),
    title: z.string().optional(),
    priority: z.number().int().optional(),
    source_reference: z.string().optional(),
    status: z.enum(["draft", "approved"]).default("draft"),
};

server.registerTool(
    "save_global_memory",
    { title: "Save global memory", description: "Persist a user-level memory (applies across all projects).", inputSchema: saveShape },
    async (a) => ok(await api("POST", "/memory", { body: { ...a, scope: "global" } }))
);
server.registerTool(
    "save_project_memory",
    { title: "Save project memory", description: "Persist a project-level memory.", inputSchema: { ...saveShape, project_id: z.string() } },
    async (a) => ok(await api("POST", "/memory", { body: { ...a, scope: "project" } }))
);
server.registerTool(
    "save_chat_memory",
    { title: "Save chat memory", description: "Persist a memory scoped to one chat-code within a project.", inputSchema: { ...saveShape, project_id: z.string(), chat_id: z.string() } },
    async (a) => ok(await api("POST", "/memory", { body: { ...a, scope: "chat" } }))
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`vogo-mcp MCP server ready -> ${BASE}`);
