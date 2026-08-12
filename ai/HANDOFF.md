# AI Handoff — EIS4P

Actualizat: 2026-08-12

## CURRENT STATE

Arbore de lucru curat. `master` sincronizat cu `origin` la commit-ul `2d9b00e`. Nucleul funcțional al serviciului de memorie, contextul AI canonic și cele două documente ale produsului sunt publicate. Documentele trec prin Git LFS.

## LAST COMPLETED

- Structura canonică AI VOGO: `AGENTS.md`, `CLAUDE.md`, `ai\` complet, înregistrare în `C:\VOGO\PROJECTS.md`.
- `README.md` recodificat UTF-16LE → UTF-8; `description` din `package.json` reparat.
- Calea legacy din comentariul de configurare al `src/mcp/doc-server.js` înlocuită cu cea canonică.
- Git LFS configurat pentru `*.docx` și `*.pdf`; commit `2d9b00e`, 24 de fișiere, împins la `origin`.

## CURRENT TASK

`T-010` — clarificarea locului serverelor MCP, semnalată de utilizator: partea MCP „ar trebui mutată către `vogo.me/mcp`". Nu s-a mutat nimic; nu s-a atins niciun fișier pe baza acestei observații.

## FILES TO READ

1. `ai\CONTEXT.md` — starea și întrebările deschise.
2. `ai\RAG.md` — model de date, contract REST, uneltele celor trei servere MCP, capcane.
3. `ai\TASKS.md` — sarcinile și starea lor.
4. `grund.md` — specificația originală, pentru orice discuție despre funcționalități amânate.

## FILES MODIFIED

Sesiunea 2026-08-12: create `AGENTS.md`, `CLAUDE.md` și tot folderul `ai\`; modificate `README.md` (recodificare), `package.json` (`description`), `src/mcp/doc-server.js` (o linie de comentariu), `.gitattributes` (nou, LFS). În workspace: `C:\VOGO\PROJECTS.md`.

Logica de cod nu a fost modificată.

## OPEN QUESTIONS

Cele patru întrebări din `ai\CONTEXT.md`: locul serverelor MCP, copia legacy `C:\sources\EIS4P`, relația cu proiectul `MARCEL`, unificarea denumirilor de unelte MCP.

## DO NOT CHANGE

- Nu înlocui `node:http` / `node:https` cu `fetch` în codul MCP — `DECISIONS.md` → `D-004`.
- Nu da serverului MCP stdio acces direct la baza de date — `D-002`.
- Nu transforma scrierile în suprascrieri; versionarea și auditul sunt obligatorii — `D-003`.
- Nu salva `README.md` în UTF-16; a fost convertit deliberat la UTF-8.
- Nu scoate `*.docx` / `*.pdf` din LFS fără decizie explicită — `D-007`.
- Nu executa `git add`, `git commit` sau `git push` fără cerere explicită.

## NEXT ACTION

Obține de la utilizator răspunsul la `T-010` — ce componentă MCP se mută la `vogo.me/mcp` și în ce repository. Abia apoi se poate relua `T-007`.
