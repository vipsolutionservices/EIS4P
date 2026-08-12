# AGENTS — EIS4P

Bootstrap unic pentru orice agent AI care lucrează la acest proiect: Claude Code, Codex, ChatGPT sau altul. Conține numai instrucțiuni de pornire și pointeri. Nu reproduce conținutul fișierelor indicate.

## Avertisment de identitate — citește înainte de orice

Numele repository-ului și conținutul lui descriu două lucruri diferite.

- **EIS4P** este produsul **VOGO eBS — Enterprise Business Suite 4 Production**: ETL, depozit de date, Business Intelligence și agentic AI pentru producție. Nu are nicio implementare în acest repository.
- **Codul din repository** este `vogo-mcp`, un serviciu de memorie externă pentru asistenți AI. Nu face parte din produs.

Nu deduce cerințe ale produsului din codul existent. Nu presupune că o componentă a produsului este implementată pentru că repo-ul poartă numele lui. Situația este descrisă în `ai\CONTEXT.md` și decisă în `ai\DECISIONS.md` → `D-008`.

## Ordinea de citire

1. `C:\VOGO\90-AI-SYSTEM\prompt-canonic-ai-vogo.md` — politica canonică VOGO și regulile Anti-LLM.
2. `C:\VOGO\90-AI-SYSTEM\memory\GLOBAL.md` — memoria globală.
3. `C:\VOGO\90-AI-SYSTEM\memory\areas\DEVELOPMENT.md` — memoria ariei.
4. `C:\VOGO\PROJECTS.md` — registrul proiectelor.
5. `ai\README.md` — harta contextului AI al proiectului, apoi fișierele indicate acolo.

## Identificare

| | |
|---|---|
| Cod proiect | `EIS4P` |
| Produs | VOGO eBS — Enterprise Business Suite 4 Production |
| Arie | DEVELOPMENT |
| Folder canonic | `C:\VOGO\50-SOURCE\EIS4P` |
| Repository | `https://github.com/vipsolutionservices/EIS4P.git` |
| Ramura curentă | `master` |
| Copie legacy | `C:\sources\EIS4P` — nemigrată, nu este sursă canonică |
| Proiect de vânzare legat | `MARCEL` — `C:\VOGO\30-PROJECTS\MARCEL SRL`, aria SALES. PoC-ul acestui produs pentru clientul Marcel SRL. |

## Rutare pe subiecte

| Subiect | Unde se citește |
|---|---|
| Stare, componente, constrângeri, întrebări deschise | `ai\CONTEXT.md` |
| Decizii aprobate | `ai\DECISIONS.md` |
| Sarcini deschise și blocate | `ai\TASKS.md` |
| Indexul temelor și capcana terminologică `MCP` | `ai\RAG.md` |
| Produsul: zone funcționale, strat tehnic, stadiu | `ai\rag\eis4p-produs.md` |
| Codul găzduit: model de date, contract REST, unelte MCP, capcane | `ai\rag\vogo-mcp-memorie.md` |
| Ce cere clientul, ce s-a promis, ce date există | `ai\CONTEXT.md` → „Relația cu proiectul MARCEL", apoi `C:\VOGO\30-PROJECTS\MARCEL SRL\ai\RAG.md` |
| Starea lăsată de sesiunea anterioară | `ai\HANDOFF.md` |
| Specificația originală a serviciului de memorie | `grund.md` — aparține codului găzduit, nu produsului |

## Reguli

Regulile de lucru și cele Anti-LLM sunt definite în promptul canonic VOGO și în memoria globală. Nu se duplică aici.

Constrângeri proprii acestui proiect, detaliate în `ai\CONTEXT.md` și `ai\DECISIONS.md`:

- `git add`, `git commit` și `git push` se execută exclusiv la cererea explicită a dezvoltatorului.
- Fișierele mari din rădăcină (`*.docx`, `*.pdf`) sunt urmărite prin Git LFS. Nu adăuga alte fișiere peste 10 MB fără aprobare explicită — `C:\VOGO\90-AI-SYSTEM\GIT-LARGE-FILES-APPROVAL.md`.
- Secretele (`DB_*`, `API_KEY`, `MCP_API_KEY`, `DOC_KEYS`) stau numai în `.env` local sau în mediul de pe server; în repository rămâne doar `.env.example`.
- Stratul MCP stdio al codului găzduit nu accesează baza de date direct; apelează REST API.
- Modificările se limitează strict la ce s-a cerut.

La finalul fiecărei etape de lucru se actualizează `ai\CONTEXT.md`, `ai\DECISIONS.md`, `ai\TASKS.md` și `ai\HANDOFF.md`.
