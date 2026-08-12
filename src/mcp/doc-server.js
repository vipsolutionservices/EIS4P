// vogo-mcp — MCP connector (stdio) for Claude Desktop: read/write the rag-*.md
// document store at vogo.me/mcp. Runs locally; talks to the server over HTTPS
// with the per-project key sent as the X-API-Key header (never in the URL).
//
// Claude Desktop config (claude_desktop_config.json):
//   "vogo-rag": {
//     "command": "node",
//     "args": ["C:\\VOGO\\50-SOURCE\\EIS4P\\src\\mcp\\doc-server.js"],
//     "env": {
//       "DOC_BASE": "https://vogo.me/mcp",
//       "DOC_KEYS": "{\"egov\":\"<128-char key>\"}"
//     }
//   }
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = (process.env.DOC_BASE || "https://vogo.me/mcp").replace(/\/$/, "");
let KEYS = {};
try { KEYS = JSON.parse(process.env.DOC_KEYS || "{}"); } catch { KEYS = {}; }
if (process.env.DOC_PROJECT && process.env.DOC_KEY) KEYS[process.env.DOC_PROJECT] = process.env.DOC_KEY;

function keyFor(project) {
    const k = KEYS[project];
    if (!k) throw new Error(`no key configured for project "${project}" (set DOC_KEYS)`);
    return k;
}

function req(method, path, { query, key, body } = {}) {
    return new Promise((resolve, reject) => {
        let urlStr = BASE + path;
        if (query) {
            const q = new URLSearchParams(Object.entries(query).filter(([, v]) => v != null)).toString();
            if (q) urlStr += `?${q}`;
        }
        const u = new URL(urlStr);
        const mod = u.protocol === "https:" ? https : http;
        const payload = body ? Buffer.from(JSON.stringify(body)) : null;
        const headers = { "X-API-Key": key };
        if (payload) { headers["Content-Type"] = "application/json"; headers["Content-Length"] = payload.length; }
        const r = mod.request({ method, hostname: u.hostname, port: u.port || (u.protocol === "https:" ? 443 : 80), path: u.pathname + u.search, headers }, (res) => {
            let t = ""; res.setEncoding("utf8"); res.on("data", (c) => (t += c)); res.on("end", () => resolve({ status: res.statusCode, text: t }));
        });
        r.on("error", reject);
        if (payload) r.write(payload);
        r.end();
    });
}

function text(t) { return { content: [{ type: "text", text: t }] }; }

const server = new McpServer({ name: "vogo-rag", version: "1.0.0" });

server.registerTool("rag_list", {
    title: "List RAG documents",
    description: "List the rag-*.md context documents of a project on vogo.me/mcp.",
    inputSchema: { project: z.string() },
}, async ({ project }) => {
    const r = await req("GET", "/doc/list/", { query: { project }, key: keyFor(project) });
    return text(r.text);
});

server.registerTool("rag_get", {
    title: "Get a RAG document",
    description: "Read the full markdown of one rag-*.md document (use to resume a project's context).",
    inputSchema: { project: z.string(), name: z.string() },
}, async ({ project, name }) => {
    const r = await req("GET", "/doc/get/", { query: { project, name }, key: keyFor(project) });
    return text(r.status === 200 ? r.text : `error ${r.status}: ${r.text}`);
});

server.registerTool("rag_save", {
    title: "Save/append a RAG document",
    description: "Create, overwrite (mode=overwrite) or append (mode=append) a rag-*.md context document. Use this for 'SAVE STATE' — compact the session (files touched, decisions, what worked, what needed rework) into a rag-<topic>.md.",
    inputSchema: {
        project: z.string(),
        name: z.string().describe("file name, e.g. rag-egov-backend.md"),
        content: z.string(),
        mode: z.enum(["overwrite", "append"]).default("overwrite"),
    },
}, async ({ project, name, content, mode }) => {
    const r = await req("POST", "/doc/save/", { key: keyFor(project), body: { project, name, content, mode } });
    return text(r.text);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`vogo-rag MCP connector -> ${BASE} (projects: ${Object.keys(KEYS).join(", ") || "none"})`);
