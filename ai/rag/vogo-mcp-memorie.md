# RAG — vogo-mcp, serviciul de memorie externă

Faptele stabile despre codul găzduit în acest repository. Rutat din `ai\RAG.md`.

Acest serviciu **nu face parte din produsul EIS4P**. Se află aici din motive istorice — vezi `ai\CONTEXT.md`, secțiunea „Codul găzduit". Se numește `vogo-mcp` în antetul fiecărui fișier sursă.

## Scop

Salvează memorie structurată pe trei niveluri — `global` → `project` → `chat` — într-o bază de date și o reîncarcă la începutul unei sesiuni noi, astfel încât un asistent AI să nu piardă contextul între conversații și instrumente.

Specificația originală este `grund.md` din rădăcina proiectului, scrisă pentru PostgreSQL. Implementarea a fost adaptată la MariaDB/MySQL.

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
- Stratul MCP stdio nu accesează baza de date direct; apelează REST API. Regulă din `grund.md`, secțiunea 9.
- Scrierile venite prin MCP stdio au implicit `status = draft`; `approved` se cere explicit.

## Componente în acest repository

| Componentă | Fișier | Rol |
|---|---|---|
| REST API | `src/backend/index.js` | Rutele HTTP, prefix `/api/v1`. `X-API-Key` obligatoriu, cu excepția `/health`. |
| Logica de memorie | `src/backend/memory.service.js` | Versionare, memorie efectivă, căutare full-text, audit. |
| Acces la date | `src/backend/db.js` | Pool `mysql2` către MariaDB. |
| Autentificare | `src/backend/auth.js` | Verificarea cheii API. |
| MCP stdio | `src/mcp/server.js` | Server MCP local. Apelează exclusiv REST API. |
| MCP remote | `src/mcp/http-server.js` | Server MCP peste Streamable HTTP. Importă direct `memory.service.js`. |
| MCP documente | `src/mcp/doc-server.js` | Conector stdio pentru depozitul de documente `rag-*.md` de la `vogo.me/mcp`. Nu atinge serviciul de memorie. |
| Schemă | `db/schema.sql` | `mcp_memory` și `mcp_memory_history`. |
| Verificare | `smoke.sh` | Probe end-to-end pe API. |

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

Câmpuri acceptate la salvare: `user_id`, `scope`, `project_id?`, `chat_id?`, `category`, `memory_key`, `content`, `title?`, `priority?`, `source_reference?`, `status?`.

## Unelte MCP

`src/mcp/server.js` — server stdio `vogo-mcp` `1.0.0`: `get_effective_memory`, `search_memory`, `save_global_memory`, `save_project_memory`, `save_chat_memory`.

`src/mcp/http-server.js` — MCP remote peste Streamable HTTP, endpoint `/mcp`, autentificare `Authorization: Bearer`, `X-API-Key` sau `?key=`: `memory_load`, `memory_list`, `memory_save`, `memory_replace`.

`src/mcp/doc-server.js` — conector pentru depozitul de documente de la `vogo.me/mcp`: `rag_list`, `rag_get`, `rag_save`. Cheile per proiect merg în antetul `X-API-Key`, niciodată în URL.

## Implementări paralele în afara acestui repository

În repository-ul `C:\VOGO\50-SOURCE\vogo.me` există implementări PHP ale acelorași funcții:

| Locație | Ce face |
|---|---|
| `vogo.me\ai-mcp\` | Același serviciu de memorie, în PHP: aceleași tabele `mcp_memory` / `mcp_memory_history`, aceeași logică `version+1` / `superseded` / audit, același `X-API-Key`. Servit la `https://vogo.me/ai-mcp/` ca director fizic în webroot-ul WordPress. Utilizatorul a declarat la 2026-08-12 că nu îl mai folosește. |
| `vogo.me\mcp\` | Depozitul de documente `rag-*.md`, cu login, chei per proiect, share și UI de admin. Este serverul cu care vorbește `doc-server.js` din acest repository. |

Afirmația din `README.md` al acestui proiect, potrivit căreia aplicația Node rulează la `vogo.me/ai-mcp` pe CloudLinux `alt-nodejs20`, contrazice comentariul din `vogo.me\public-ai-mcp.php`, care descrie același URL ca director PHP. Nu s-a verificat pe server care dintre ele răspunde efectiv. Nu trata niciuna dintre cele două afirmații ca fapt.

## Capcane verificate

- **`fetch` global nu este fiabil pe CloudLinux.** Parserul WASM din `undici` nu reușește alocarea sub limitele de memorie LVE. Codul MCP folosește `node:http` / `node:https`. Nu înlocui cu `fetch`.
- **Docker nu este aplicabil** pe găzduire partajată; `grund.md` îl prevedea.
- **PostgreSQL și `pgvector` nu sunt disponibile** pe găzduirea partajată; indexul GIN a devenit `FULLTEXT`.

## Surse

`grund.md` — specificația originală. `README.md` din rădăcină — documentația funcțională a serviciului, nu a produsului EIS4P. `db/schema.sql`, `smoke.sh`.
