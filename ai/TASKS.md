# Tasks — EIS4P

Sarcinile sunt marcate cu tema de care aparțin: `[produs]` pentru VOGO eBS Intelligence Suite 4 Production, `[găzduit]` pentru serviciul de memorie `vogo-mcp`. Distincția este explicată în `CONTEXT.md`.

## NOW

- `T-011` `[produs]` — Stabilirea punctului de pornire al implementării. Repository-ul nu conține nimic din produs, iar singurul material este prezentarea de o pagină, care enumeră toate componentele fără prioritate. Prioritatea reală vine din PoC-ul Marcel, deci depinde de `T-012`. Următorul pas: utilizatorul alege între specificație funcțională, arhitectură tehnică, sau o primă componentă verticală extrasă din nevoia PoC-ului.

## NEXT

- `T-012` `[produs]` — Stabilirea scopului PoC-ului Marcel: ce se demonstrează, pe ce foi din template și cu ce criteriu de acceptare. Este aceeași întrebare cu deschisa 3 din `C:\VOGO\30-PROJECTS\MARCEL SRL\ai\CONTEXT.md`; se rezolvă acolo, iar rezultatul se consumă aici. Determină `T-011`.
- `T-013` `[găzduit]` — Verificarea pe server a ce răspunde efectiv la `https://vogo.me/ai-mcp/`: aplicația Node din acest repository sau implementarea PHP din `vogo.me\ai-mcp\`. Sursele se contrazic. Următorul pas: `curl -I https://vogo.me/ai-mcp/` și inspecția directorului de pe găzduire.
- `T-005` `[găzduit]` — Completarea sau eliminarea fișierelor și directoarelor goale: `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, `src/backend/README.md`, `src/mcp/README.md`, plus directoarele `deploy\`, `scripts\`, `tools\`, `tests\`, `.github\`. Scheletul produsului — `src/memory\`, `src/rag\`, `docs/architecture\`, `docs/requirements\` — se păstrează gol până la `T-011`.
- `T-006` `[găzduit]` — Versionarea scripturilor de operare `deploy.sh` și `rollback.sh`, existente în prezent doar pe server. Depinde de `T-013`: dacă aplicația Node nu mai rulează acolo, sarcina dispare.

## BLOCKED

- `T-014` `[ambele]` — Separarea celor două teme: extragerea serviciului `vogo-mcp` într-un repository propriu sau mutarea lui în vogo.me. Blocat prin decizie: `DECISIONS.md` → `D-008` a ales păstrarea provizorie. Se redeschide la cererea utilizatorului.
- `T-007` `[găzduit]` — Unificarea denumirilor de unelte între serverul MCP stdio (`get_effective_memory`, `search_memory`, `save_*`) și cel remote (`memory_load`, `memory_list`, `memory_save`, `memory_replace`). Blocat de `T-013` și `T-014`.
- `T-008` `[ambele]` — Migrarea formală a copiei legacy `C:\sources\EIS4P`, sau consemnarea faptului că folderul canonic o înlocuiește deja. Blocat de decizia utilizatorului — `CONTEXT.md`, întrebarea 4.

## DONE

- `T-000` — Aplicarea structurii canonice AI VOGO: `AGENTS.md`, `CLAUDE.md`, `ai\` complet, înregistrare în `C:\VOGO\PROJECTS.md`. Finalizat 2026-08-12 — `DECISIONS.md` → `D-006`.
- `T-001` `[găzduit]` — Tratamentul documentelor mari din rădăcină. Rezolvat 2026-08-12: aprobare explicită, ambele urmărite prin Git LFS — `D-007`.
- `T-002` `[găzduit]` — Comiterea și publicarea nucleului funcțional. Commit `2d9b00e` pe `master`, 24 de fișiere, împins la `origin`.
- `T-003` `[găzduit]` — `README.md` recodificat UTF-16LE → UTF-8; `description` din `package.json` reparat. Verificat: 9016 → 4543 octeți cu conținut intact, `package.json` se parsează cu `node`.
- `T-004` `[găzduit]` — Calea legacy din comentariul de configurare al `src/mcp/doc-server.js` înlocuită cu cea canonică.
- `T-010` — Clarificarea identității proiectului. Rezolvat 2026-08-12: EIS4P este produsul de producție, nu serviciul de memorie. Contextul AI a fost rescris — `D-008`, `D-009`.
