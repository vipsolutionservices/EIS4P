# Project Context — EIS4P

Context consolidat, verificat și actual, la 2026-08-12. Nu copia aici istoricul conversațiilor.

## Identificare

| | |
|---|---|
| Cod proiect | `EIS4P` |
| Arie | DEVELOPMENT |
| Folder canonic | `C:\VOGO\50-SOURCE\EIS4P` |
| Repository | `https://github.com/vipsolutionservices/EIS4P.git`, ramura `master` |
| Găzduire | `vogo.me/ai-mcp` — Hostinger shared, CloudLinux `alt-nodejs20`, aplicație LiteSpeed Node.js |

## Obiectiv

Serviciu de memorie externă pentru asistenți AI: salvează memorie structurată pe trei niveluri (`global` → `project` → `chat`) într-o bază de date și o reîncarcă la începutul unei sesiuni noi, astfel încât un model AI să nu piardă contextul între conversații, instrumente și dispozitive.

Specificația originală este `grund.md` (scrisă pentru PostgreSQL). Implementarea a fost adaptată la MariaDB/MySQL, baza de date partajată de pe găzduirea vogo.me.

## Domeniu și arhitectură

Trei suprafețe de acces peste același strat de servicii:

| Componentă | Fișier | Rol |
|---|---|---|
| REST API | `src/backend/index.js` | Rutele HTTP, prefix `/api/v1`. Autentificare prin `X-API-Key`, cu excepția `/health`. |
| Logica de memorie | `src/backend/memory.service.js` | Versionare, calculul memoriei efective, căutare full-text, audit. |
| Acces la date | `src/backend/db.js` | Pool `mysql2` către MariaDB. |
| Autentificare | `src/backend/auth.js` | Verificarea cheii API. |
| MCP stdio | `src/mcp/server.js` | Server MCP local pentru Claude Code și clienți similari. Apelează exclusiv REST API, niciodată baza de date. |
| MCP remote | `src/mcp/http-server.js` | Server MCP peste Streamable HTTP, pentru conectori MCP la distanță. Apelează direct `memory.service.js`. |
| MCP documente | `src/mcp/doc-server.js` | Conector stdio pentru Claude Desktop peste depozitul de documente `rag-*.md` de la `vogo.me/mcp`. Componentă distinctă de serviciul de memorie. |
| Schemă | `db/schema.sql` | `mcp_memory` și `mcp_memory_history`. |
| Verificare | `smoke.sh` | Probe end-to-end pe API. |

Modelul de date, contractul REST, uneltele MCP și regulile de precedență sunt descrise în `ai\RAG.md`.

## Stare curentă

Funcțional și verificat end-to-end pe MariaDB: salvare versionată cu audit, citiri pe scope și memorie efectivă, căutare full-text, autentificare prin cheie API, server MCP stdio.

Amânat față de `grund.md`: endpointuri separate `approve` / `promote` / `archive`, chei API multi-client cu hash (`mcp_api_client`), `pgvector`, suită automată de teste, Docker (neaplicabil pe găzduire partajată).

Starea repository-ului la 2026-08-12: arbore de lucru curat, `master` sincronizat cu `origin` la commit-ul `2d9b00e`. Nucleul funcțional al serviciului, contextul AI canonic și cele două documente ale produsului — acestea din urmă prin Git LFS — sunt publicate.

Directoarele `deploy\`, `scripts\`, `tools\`, `tests\` și `.github\` există dar sunt goale. Fișierele din `docs\architecture` și `docs\requirements` sunt goale. `CHANGELOG.md`, `CONTRIBUTING.md` și `LICENSE` sunt goale.

## Constrângeri

- Găzduire partajată: fără Docker, fără PostgreSQL, fără `pgvector`. Procesul este ținut în viață de aplicația LiteSpeed Node.js, nu de PM2.
- `fetch` global nu este fiabil sub limitele de memorie LVE ale CloudLinux; codul folosește `node:http` / `node:https` — vezi `ai\RAG.md`.
- HTTPS se termină la marginea Hostinger (AutoSSL); aplicația citește `PORT` din mediu.
- Secretele stau numai în `.env` local sau în mediul serverului. În repository rămâne exclusiv `.env.example`.
- Fișierele peste 10 MB nu intră în Git fără aprobare explicită și Git LFS — `C:\VOGO\90-AI-SYSTEM\GIT-LARGE-FILES-APPROVAL.md`.
- Operațiunile Git se execută numai la cerere explicită a dezvoltatorului.

## Întrebări deschise

1. Locul serverelor MCP. Utilizatorul a semnalat la 2026-08-12 că partea MCP „ar trebui mutată către `vogo.me/mcp`". Rămâne de stabilit ce se mută — numai `doc-server.js`, care deja vorbește cu `vogo.me/mcp`, sau și `http-server.js` / `server.js` — și unde anume. Vezi `TASKS.md` → `T-010`.
2. Copia legacy `C:\sources\EIS4P` se migrează formal după procedura din promptul canonic, sau se consideră deja înlocuită de folderul canonic din `50-SOURCE`?
3. Relația dintre acest repository și proiectul `MARCEL` din registru — `MARCEL SRL — PoC VOGO eBS Intelligence Suite 4 Production` — trebuie clarificată: produsul menționat în documentele din rădăcină este același, dar codul din acest repository implementează serviciul de memorie MCP, nu suita eBS.
4. Suprapunerea dintre `src/mcp/server.js` și `src/mcp/http-server.js`: uneltele au nume diferite (`get_effective_memory` / `save_*` față de `memory_load` / `memory_list` / `memory_save` / `memory_replace`). Se unifică denumirile sau se păstrează două contracte distincte? Depinde de întrebarea 1.

Întrebarea inițială despre cele două documente ale produsului a fost închisă prin `DECISIONS.md` → `D-007`.
