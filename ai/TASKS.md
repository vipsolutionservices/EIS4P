# Tasks — EIS4P

## NOW

- `T-010` — Clarificarea locului serverelor MCP: utilizatorul a semnalat la 2026-08-12 că partea MCP „ar trebui mutată către `vogo.me/mcp`". Următorul pas: stabilirea a ce anume se mută — numai `doc-server.js`, sau și `http-server.js` / `server.js` — și unde anume, în repository-ul vogo.me sau într-un deployment separat. Până la clarificare, `T-007` rămâne fără obiect.

## NEXT

- `T-005` — Completarea sau eliminarea fișierelor și directoarelor goale: `docs/architecture/README.md`, `docs/requirements/README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, plus directoarele `deploy\`, `scripts\`, `tools\`, `tests\`, `.github\`.
- `T-006` — Versionarea în repository a scripturilor de operare `deploy.sh` și `rollback.sh`, existente în prezent doar pe server, în `~/domains/vogo.me/ai-mcp`.

## BLOCKED

- `T-007` — Unificarea denumirilor de unelte între serverul MCP stdio (`get_effective_memory`, `search_memory`, `save_*`) și cel remote (`memory_load`, `memory_list`, `memory_save`, `memory_replace`). Blocat de `T-010`: dacă serverele se mută, întrebarea se pune în alt context.
- `T-008` — Migrarea formală a copiei legacy `C:\sources\EIS4P` după procedura din promptul canonic, sau consemnarea faptului că folderul canonic o înlocuiește deja. Blocat de decizia utilizatorului — `CONTEXT.md`, întrebarea 2.
- `T-009` — Clarificarea relației cu proiectul `MARCEL` din registru, care vizează același produs eBS. Blocat de decizia utilizatorului — `CONTEXT.md`, întrebarea 3.

## DONE

- `T-000` — Aplicarea structurii canonice AI VOGO la acest proiect: `AGENTS.md`, `CLAUDE.md`, `ai\` complet, înregistrarea în `C:\VOGO\PROJECTS.md`. Finalizat 2026-08-12 — `DECISIONS.md` → `D-006`.
- `T-001` — Tratamentul documentelor mari din rădăcină. Rezolvat 2026-08-12: aprobare explicită a utilizatorului, ambele documente urmărite prin Git LFS — `DECISIONS.md` → `D-007`.
- `T-002` — Comiterea și publicarea nucleului funcțional. Finalizat 2026-08-12, commit `2d9b00e` pe `master`, 24 de fișiere, împins la `origin`. Arborele de lucru este curat.
- `T-003` — `README.md` recodificat din UTF-16LE în UTF-8; câmpul `description` din `package.json` reparat. Verificat: `README.md` a scăzut de la 9016 la 4543 octeți cu conținutul intact, iar `package.json` se parsează corect cu `node`.
- `T-004` — Calea legacy din comentariul de configurare al `src/mcp/doc-server.js` înlocuită cu cea canonică `C:\VOGO\50-SOURCE\EIS4P`.
