# AI Handoff — EIS4P

Actualizat: 2026-08-12

## CURRENT STATE

Proiectul a primit structura canonică AI VOGO. Codul nu a fost atins. Serviciul de memorie este funcțional și verificat end-to-end pe MariaDB, dar nucleul lui nu este comis: 12 fișiere modificate sau neurmărite pe ramura `master`.

## LAST COMPLETED

Consolidarea contextului AI: `AGENTS.md`, `CLAUDE.md`, `ai\README.md`, `ai\CONTEXT.md`, `ai\DECISIONS.md`, `ai\TASKS.md`, `ai\RAG.md`, `ai\HANDOFF.md`, `ai\prompts\README.md`. Înregistrarea proiectului în `C:\VOGO\PROJECTS.md` cu codul `EIS4P`.

## CURRENT TASK

`T-001` — clarificarea tratamentului celor două documente mari din rădăcină. Blochează comiterea stării curente.

## FILES TO READ

1. `ai\CONTEXT.md` — starea și întrebările deschise.
2. `ai\RAG.md` — model de date, contract REST, unelte MCP, capcane.
3. `ai\TASKS.md` — sarcinile și starea lor.
4. `grund.md` — specificația originală, pentru orice discuție despre funcționalități amânate.

## FILES MODIFIED

Create în această sesiune: `AGENTS.md`, `CLAUDE.md`, `ai\` cu toate fișierele de mai sus. Modificat în workspace: `C:\VOGO\PROJECTS.md`.

Niciun fișier de cod nu a fost modificat.

## OPEN QUESTIONS

Cele patru întrebări din `ai\CONTEXT.md`: documentele mari, copia legacy `C:\sources\EIS4P`, relația cu proiectul `MARCEL`, unificarea denumirilor de unelte MCP.

## DO NOT CHANGE

- Nu înlocui `node:http` / `node:https` cu `fetch` în codul MCP — vezi `DECISIONS.md` → `D-004`.
- Nu da serverului MCP stdio acces direct la baza de date — `D-002`.
- Nu transforma scrierile în suprascrieri; versionarea și auditul sunt obligatorii — `D-003`.
- Nu adăuga fișiere peste 10 MB în Git fără aprobare explicită și Git LFS.
- Nu executa `git add`, `git commit` sau `git push` fără cerere explicită.

## NEXT ACTION

Cere utilizatorului răspunsul la `T-001` — ce se întâmplă cu cele două documente din rădăcină — apoi execută `T-003` și `T-004`, care sunt independente de acea decizie.
