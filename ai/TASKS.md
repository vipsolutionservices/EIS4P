# Tasks — EIS4P

## NOW

- `T-001` — Clarificarea tratamentului celor două documente din rădăcină, `VOGO eBS Intellingence Suite 4 Production v.2.0.7.docx` (≈21 MB) și `.pdf` (≈2,9 MB). Următorul pas: decizia utilizatorului între Git LFS cu aprobare explicită, mutare în dosarul de proiect din `30-PROJECTS`, sau excludere prin `.gitignore`. Blocant pentru orice commit al stării curente.

## NEXT

- `T-002` — Comiterea nucleului funcțional necomis: `.env.example`, `db/`, `smoke.sh`, `src/backend/{auth,db,memory.service}.js`, `src/mcp/{server,http-server,doc-server}.js` și modificările din `README.md`, `package.json`, `src/backend/index.js`. Se execută numai la cererea explicită a dezvoltatorului și numai după `T-001`.
- `T-003` — Recodificarea `README.md` din UTF-16LE în UTF-8 și repararea câmpului `description` din `package.json`, corupt din aceeași cauză. Verificare: fișierele se citesc corect cu unelte care presupun UTF-8.
- `T-004` — Corectarea căii legacy `C:\sources\EIS4P\src\mcp\doc-server.js` din comentariul de configurare al `src/mcp/doc-server.js`, cu calea canonică `C:\VOGO\50-SOURCE\EIS4P`.
- `T-005` — Completarea sau eliminarea fișierelor și directoarelor goale: `docs/architecture/README.md`, `docs/requirements/README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, plus directoarele `deploy\`, `scripts\`, `tools\`, `tests\`, `.github\`.
- `T-006` — Versionarea în repository a scripturilor de operare `deploy.sh` și `rollback.sh`, existente în prezent doar pe server, în `~/domains/vogo.me/ai-mcp`.

## BLOCKED

- `T-007` — Unificarea denumirilor de unelte între serverul MCP stdio (`get_effective_memory`, `search_memory`, `save_*`) și cel remote (`memory_load`, `memory_list`, `memory_save`, `memory_replace`). Blocat de decizia dacă cele două contracte trebuie să coincidă — `CONTEXT.md`, întrebarea 4.
- `T-008` — Migrarea formală a copiei legacy `C:\sources\EIS4P` după procedura din promptul canonic, sau consemnarea faptului că folderul canonic o înlocuiește deja. Blocat de decizia utilizatorului — `CONTEXT.md`, întrebarea 2.
- `T-009` — Clarificarea relației cu proiectul `MARCEL` din registru, care vizează același produs eBS. Blocat de decizia utilizatorului — `CONTEXT.md`, întrebarea 3.

## DONE

- `T-000` — Aplicarea structurii canonice AI VOGO la acest proiect: `AGENTS.md`, `CLAUDE.md`, `ai\` complet, înregistrarea în `C:\VOGO\PROJECTS.md`. Finalizat 2026-08-12 — vezi `DECISIONS.md` → `D-006`.
