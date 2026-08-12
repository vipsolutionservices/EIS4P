# AI Handoff — EIS4P

Actualizat: 2026-08-12

## CURRENT STATE

Contextul AI a fost rescris pe identitatea reală a proiectului. **EIS4P este produsul VOGO eBS — Enterprise Business Suite 4 Production**: ETL, depozit de date, Business Intelligence și agentic AI pe date de producție. Produsul nu are nicio implementare în repository.

Codul din repository este serviciul de memorie `vogo-mcp`, fără legătură funcțională cu produsul. Rămâne aici provizoriu, prin `DECISIONS.md` → `D-008`.

Produsul are un singur consumator: proiectul de vânzare `MARCEL` — `C:\VOGO\30-PROJECTS\MARCEL SRL` —, PoC pentru clientul Marcel SRL. Legătura este documentată în ambele sensuri: `ai\CONTEXT.md` → „Relația cu proiectul MARCEL" și, de acolo, `MARCEL\ai\RAG.md`.

## LAST COMPLETED

Sesiunea 2026-08-12, în trei etape:

1. Aplicarea structurii canonice AI VOGO și înregistrarea în `C:\VOGO\PROJECTS.md`.
2. Corecții și publicare: `README.md` recodificat UTF-16LE → UTF-8, `description` din `package.json` reparat, cale legacy corectată în `src/mcp/doc-server.js`, Git LFS pentru `*.docx` / `*.pdf`. Commit-uri `2d9b00e` și `ecf935d`, împinse la `origin`.
3. Corectarea identității proiectului, după clarificarea utilizatorului. Contextul scris la etapele 1 și 2 descria greșit EIS4P drept serviciu de memorie.

## CURRENT TASK

`T-011` — stabilirea punctului de pornire al implementării produsului. Depinde de `T-012`: prioritatea nu se citește din materialul de prezentare, ci din scopul PoC-ului Marcel, care nu este încă stabilit.

## FILES TO READ

1. `ai\CONTEXT.md` — identitatea, starea și întrebările deschise.
2. `ai\RAG.md` — indexul temelor și capcana terminologică `MCP`.
3. `ai\rag\eis4p-produs.md` — ce este produsul și ce anunță.
4. `ai\TASKS.md` — sarcinile, marcate `[produs]` sau `[găzduit]`.

## FILES MODIFIED

Sesiunea 2026-08-12: create `AGENTS.md`, `CLAUDE.md`, tot folderul `ai\` inclusiv `ai\rag\`; modificate `README.md` (recodificare), `package.json` (`description`), `src/mcp/doc-server.js` (o linie de comentariu), `.gitattributes` (nou). În workspace: `C:\VOGO\PROJECTS.md`.

Logica de cod nu a fost modificată. Niciun fișier nu a fost mutat între repository-uri.

## OPEN QUESTIONS

Cele cinci întrebări din `ai\CONTEXT.md`: separarea temelor, ce răspunde la `vogo.me/ai-mcp`, relația cu proiectul `MARCEL`, copia legacy `C:\sources\EIS4P`, punctul de pornire al produsului.

## DO NOT CHANGE

- Nu trata codul din `src\` drept implementare a produsului EIS4P. Nu deduce cerințe ale produsului din el.
- Nu confunda cele două înțelesuri ale acronimului `MCP` — `ai\RAG.md`, secțiunea „Capcana terminologică".
- Nu înlocui `node:http` / `node:https` cu `fetch` în codul MCP — `D-004`.
- Nu da serverului MCP stdio acces direct la baza de date — `D-002`.
- Nu transforma scrierile în suprascrieri; versionarea și auditul sunt obligatorii — `D-003`.
- Nu salva `README.md` în UTF-16; a fost convertit deliberat la UTF-8.
- Nu scoate `*.docx` / `*.pdf` din LFS fără decizie explicită — `D-007`.
- Nu executa `git add`, `git commit` sau `git push` fără cerere explicită.

## NEXT ACTION

Obține de la utilizator răspunsul la `T-011`. Până atunci nu se scrie cod de produs — nu există specificație din care să pornească.
