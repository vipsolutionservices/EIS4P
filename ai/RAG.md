# Project RAG — EIS4P

Versiunea curentă și canonică a informației necesare recuperării contextului proiectului. Nu crea variante concurente precum `RAG-final` sau `RAG-v2`; istoricul aparține Git.

## Scope

Fapte stabile despre serviciul de memorie externă EIS4P: terminologie, model de date, contract REST, unelte MCP, mediu de rulare și capcane verificate. Starea de moment stă în `CONTEXT.md`, nu aici.

## Terminologie

| Termen | Înțeles |
|---|---|
| `scope` | Nivelul memoriei: `global`, `project` sau `chat`. |
| `memorie efectivă` | Reuniunea global + project + chat, deduplicată pe `category + memory_key`. |
| `chat-code` | Identificatorul conversației (`chat_id`), stabil între sesiuni. |
| `versiune` | Fiecare rând din `mcp_memory`. Actualizarea nu suprascrie; inserează `version + 1`. |
| `superseded` | Starea versiunii anterioare după o actualizare; devine inactivă. |

## Reguli de domeniu

- Precedență: `chat` are prioritate față de `project`, iar `project` față de `global`, pentru același `category + memory_key`.
- Scrierile nu suprascriu niciodată: versiunea veche devine `superseded` / inactivă și se inserează un rând nou cu `version + 1`.
- Fiecare scriere este oglindită în `mcp_memory_history` — audit complet.
- O singură versiune activă per cheie, garantată la nivel de aplicație (MariaDB nu are index parțial ca PostgreSQL).
- Stratul MCP stdio nu accesează baza de date direct; apelează REST API. Aceasta este o regulă de arhitectură din `grund.md`, secțiunea 9.
- Scrierile venite prin MCP stdio au implicit `status = draft`; `approved` se cere explicit.

## Model de date

Tabele cu prefixul `mcp_`, în `db/schema.sql`:

| Tabel | Rol |
|---|---|
| `mcp_memory` | Un rând per versiune de memorie. Index `FULLTEXT ft_content (title, content, memory_key, category)`. |
| `mcp_memory_history` | Jurnalul de audit al tuturor scrierilor. |

## Contract REST

Prefix `/api/v1`. Toate rutele, cu excepția celor de sănătate, cer antetul `X-API-Key`.

| Metodă | Cale | Scop |
|---|---|---|
| GET | `/health`, `/api/v1/health` | Disponibilitate + verificarea bazei de date |
| POST | `/api/v1/memory` | Salvează o memorie |
| GET | `/api/v1/memory/effective` | Memoria cumulativă, după `user_id`, `project_id`, `chat_id` |
| GET | `/api/v1/memory/global/:user_id` | Un singur scope |
| GET | `/api/v1/memory/project/:user_id/:project_id` | Un singur scope |
| GET | `/api/v1/memory/chat/:user_id/:project_id/:chat_id` | Un singur scope |
| GET | `/api/v1/memory/search` | Căutare full-text MariaDB |
| GET | `/api/v1/memory/:memory_id/history` | Traseul de audit |

Câmpurile acceptate la salvare: `user_id`, `scope`, `project_id?`, `chat_id?`, `category`, `memory_key`, `content`, `title?`, `priority?`, `source_reference?`, `status?`.

## Unelte MCP

`src/mcp/server.js` — server stdio `vogo-mcp`, versiunea `1.0.0`:

| Unealtă | Rol |
|---|---|
| `get_effective_memory` | Memoria cumulativă a unui utilizator. De apelat înainte de a răspunde despre un proiect. |
| `search_memory` | Căutare full-text pe titlu, conținut, cheie și categorie. |
| `save_global_memory` | Memorie la nivel de utilizator. |
| `save_project_memory` | Memorie la nivel de proiect. |
| `save_chat_memory` | Memorie la nivel de conversație. |

`src/mcp/http-server.js` — server MCP remote peste Streamable HTTP, endpoint `/mcp`, autentificare `Authorization: Bearer`, `X-API-Key` sau `?key=`. Unelte: `memory_load`, `memory_list`, `memory_save`, `memory_replace`.

`src/mcp/doc-server.js` — conector stdio pentru depozitul de documente `rag-*.md` de la `vogo.me/mcp`. Unelte: `rag_list`, `rag_get`, `rag_save`. Cheile per proiect se transmit prin antetul `X-API-Key`, niciodată în URL.

## Mediu de rulare

- Node.js 20, module ESM (`"type": "module"`).
- Dependențe: `express` 5, `mysql2`, `@modelcontextprotocol/sdk`, `zod`, `dotenv`.
- Scripturi: `npm start` (REST API), `npm run dev` (watch), `npm run mcp` (MCP stdio).
- Producție: `~/domains/vogo.me/ai-mcp`, aplicație LiteSpeed Node.js, redeploy prin `deploy.sh` (git pull → npm install → `touch tmp/restart.txt`), revenire prin `rollback.sh`. Scripturile respective există pe server, nu în acest repository.

## Capcane verificate

- **`fetch` global nu este fiabil pe CloudLinux.** Parserul WASM din `undici` nu reușește alocarea sub limitele de memorie LVE. Codul MCP folosește `node:http` / `node:https` cu promisiuni proprii. Nu înlocui cu `fetch`.
- **Docker nu este aplicabil** pe găzduire partajată; specificația din `grund.md` îl prevedea.
- **PostgreSQL și `pgvector` nu sunt disponibile**; schema a fost tradusă la MariaDB, indexul GIN devenind `FULLTEXT`.
- **`README.md` este salvat UTF-16LE**, ceea ce îl face greu de citit de unelte care presupun UTF-8; `package.json` are câmpul `description` corupt din aceeași cauză. Vezi `TASKS.md`.
- **`src/mcp/doc-server.js` conține în comentariu calea legacy** `C:\sources\EIS4P\src\mcp\doc-server.js`. Calea canonică este `C:\VOGO\50-SOURCE\EIS4P`.

## Sources

| Sursă | Ce conține |
|---|---|
| `grund.md` | Specificația originală a serviciului de memorie, pe PostgreSQL. |
| `README.md` | Documentația funcțională, contractul API, procedura de deploy. |
| `db/schema.sql` | Schema MariaDB. |
| `smoke.sh` | Probele end-to-end. |
| `VOGO eBS Intellingence Suite 4 Production v.2.0.7.docx` / `.pdf` | Documentația produsului eBS, netratată încă — vezi `CONTEXT.md`, întrebarea 1. |
| `C:\sources\EIS4P` | Copie legacy nemigrată; nu este sursă canonică. |
