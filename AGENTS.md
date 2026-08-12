# AGENTS — EIS4P

Bootstrap unic pentru orice agent AI care lucrează la acest proiect: Claude Code, Codex, ChatGPT sau altul. Conține numai instrucțiuni de pornire și pointeri. Nu reproduce conținutul fișierelor indicate.

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
| Arie | DEVELOPMENT |
| Folder canonic | `C:\VOGO\50-SOURCE\EIS4P` |
| Repository | `https://github.com/vipsolutionservices/EIS4P.git` |
| Ramura curentă | `master` |
| Copie legacy | `C:\sources\EIS4P` — nemigrată, nu este sursă canonică |

## Rutare pe subiecte

| Subiect | Unde se citește |
|---|---|
| Stare, componente, constrângeri | `ai\CONTEXT.md` |
| Decizii aprobate | `ai\DECISIONS.md` |
| Sarcini deschise și blocate | `ai\TASKS.md` |
| Model de date, contract API, unelte MCP, capcane verificate | `ai\RAG.md` |
| Starea lăsată de sesiunea anterioară | `ai\HANDOFF.md` |
| Specificația originală a serviciului de memorie | `grund.md` |
| Documentația funcțională a produsului | `README.md`, `docs\` |

## Reguli

Regulile de lucru și cele Anti-LLM sunt definite în promptul canonic VOGO și în memoria globală. Nu se duplică aici.

Constrângeri proprii acestui proiect, detaliate în `ai\CONTEXT.md` și `ai\DECISIONS.md`:

- `git add`, `git commit` și `git push` se execută exclusiv la cererea explicită a dezvoltatorului.
- Fișierele mari din rădăcină (`*.docx`, `*.pdf` peste 10 MB) nu se adaugă în Git fără aprobare explicită și configurare Git LFS — vezi `C:\VOGO\90-AI-SYSTEM\GIT-LARGE-FILES-APPROVAL.md`.
- Secretele (`DB_*`, `API_KEY`, `MCP_API_KEY`, `DOC_KEYS`) stau numai în `.env` local sau în mediul de pe server; în repository rămâne doar `.env.example`.
- Stratul MCP stdio nu accesează baza de date direct; apelează REST API.
- Modificările se limitează strict la ce s-a cerut.

La finalul fiecărei etape de lucru se actualizează `ai\CONTEXT.md`, `ai\DECISIONS.md`, `ai\TASKS.md` și `ai\HANDOFF.md`.
