# Decisions — EIS4P

## Format

```text
D-00N
Date: YYYY-MM-DD
Decision: ...
Reason: ...
Status: ACTIVE | SUPERSEDED | REVOKED
```

Deciziile `D-001`…`D-005` au fost luate anterior acestei consolidări și sunt reconstituite din cod, din `grund.md` și din `README.md`. Data indicată este data consolidării, nu data la care au fost luate.

---

```text
D-001
Date: 2026-08-12
Decision: Stocarea se face în MariaDB/MySQL, cu tabele prefixate `mcp_`, nu în PostgreSQL.
Reason: Găzduirea partajată vogo.me oferă MariaDB. Specificația din `grund.md` prevedea PostgreSQL cu index GIN și `pgvector`; schema a fost tradusă, iar indexul GIN a devenit `FULLTEXT`.
Consequences: `pgvector` și căutarea semantică sunt amânate. Unicitatea versiunii active per cheie se garantează la nivel de aplicație, nu prin index parțial.
Status: ACTIVE
```

```text
D-002
Date: 2026-08-12
Decision: Serverul MCP stdio apelează exclusiv REST API și nu accesează baza de date direct.
Reason: Regulă de arhitectură din `grund.md`, secțiunea 9. Menține o singură cale de validare, autentificare și audit.
Consequences: Serverul MCP stdio are nevoie de `MCP_API_BASE_URL` și `MCP_API_KEY`. Serverul MCP remote `src/mcp/http-server.js` face excepție deliberată: rulează pe același host cu API-ul și importă direct `memory.service.js`.
Status: ACTIVE
```

```text
D-003
Date: 2026-08-12
Decision: Scrierile nu suprascriu; fiecare actualizare inserează o versiune nouă, iar cea anterioară devine `superseded`. Fiecare scriere se oglindește în `mcp_memory_history`.
Reason: Memoria unui asistent AI trebuie să fie auditabilă și reversibilă; pierderea unei versiuni anterioare este nerecuperabilă.
Consequences: Tabelele cresc monoton. Va fi nevoie de o politică de arhivare, neimplementată încă.
Status: ACTIVE
```

```text
D-004
Date: 2026-08-12
Decision: Codul MCP folosește `node:http` / `node:https`, nu `fetch` global.
Reason: Parserul WASM din `undici` nu reușește alocarea sub limitele de memorie LVE ale CloudLinux, ceea ce face `fetch` nefiabil în producție.
Consequences: Cod HTTP propriu, cu promisiuni scrise manual. Nu se înlocuiește cu `fetch` la o eventuală refactorizare.
Status: ACTIVE
```

```text
D-005
Date: 2026-08-12
Decision: Amânarea funcționalităților `approve` / `promote` / `archive` ca endpointuri separate, a cheilor API multi-client cu hash (`mcp_api_client`), a `pgvector`, a suitei automate de teste și a Docker.
Reason: Nucleul — salvare versionată, citiri pe scope, memorie efectivă, căutare, autentificare, MCP stdio — a fost prioritizat și verificat end-to-end. Docker nu este aplicabil pe găzduire partajată.
Consequences: O singură cheie API, fără separare pe client. `status` se stabilește la scriere, fără flux de aprobare dedicat. Verificarea rămâne manuală, prin `smoke.sh`.
Status: ACTIVE
```

```text
D-006
Date: 2026-08-12
Decision: Proiectul adoptă structura canonică AI VOGO — `AGENTS.md`, `CLAUDE.md` și folderul `ai\` — și se înregistrează în `C:\VOGO\PROJECTS.md` cu codul `EIS4P`, aria DEVELOPMENT.
Reason: Cerință explicită a utilizatorului: aplicarea promptului canonic din `C:\VOGO\90-AI-SYSTEM` și la acest proiect. Proiectul lipsea din registru.
Consequences: Contextul AI persistent se ține în `ai\`. La finalul fiecărei etape se actualizează `CONTEXT.md`, `DECISIONS.md`, `TASKS.md` și `HANDOFF.md`.
Status: ACTIVE
```

```text
D-007
Date: 2026-08-12
Decision: Documentele `VOGO eBS Intellingence Suite 4 Production v.2.0.7.docx` (≈21 MB) și `.pdf` (≈2,9 MB) intră în repository, urmărite prin Git LFS. `.gitattributes` urmărește tiparele `*.docx` și `*.pdf`.
Reason: Aprobare explicită a utilizatorului la 2026-08-12. Politica VOGO cere ca fișierele mari aprobate să fie atribuite explicit Git LFS, nu adăugate direct în istoricul Git.
Consequences: Orice `.docx` sau `.pdf` adăugat ulterior trece automat prin LFS. Clonarea repository-ului necesită `git lfs` instalat. Traficul LFS al contului GitHub este consumat la fiecare clonare completă.
Status: ACTIVE
```
