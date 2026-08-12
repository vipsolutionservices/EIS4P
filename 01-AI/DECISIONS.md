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

Ele privesc **serviciul de memorie `vogo-mcp` găzduit în acest repository, nu produsul EIS4P**. Distincția este explicată în `CONTEXT.md` și decisă în `D-008`.

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
Decision: Proiectul adoptă structura canonică AI VOGO — `AGENTS.md`, `CLAUDE.md` și folderul `01-AI\` — și se înregistrează în `C:\VOGO\PROJECTS.md` cu codul `EIS4P`, aria DEVELOPMENT.
Reason: Cerință explicită a utilizatorului: aplicarea promptului canonic din `C:\VOGO\90-AI-SYSTEM` și la acest proiect. Proiectul lipsea din registru.
Consequences: Contextul AI persistent se ține în `01-AI\`. La finalul fiecărei etape se actualizează `CONTEXT.md`, `DECISIONS.md`, `TASKS.md` și `HANDOFF.md`.
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

```text
D-008
Date: 2026-08-12
Decision: Codul serviciului de memorie `vogo-mcp` rămâne deocamdată în repository-ul EIS4P. Nu se mută nici într-un repository propriu, nici în vogo.me. În schimb, contextul AI consemnează explicit că repository-ul găzduiește un produs străin, iar identitatea reală a EIS4P este documentată separat.
Reason: Identificarea inițială a proiectului a fost greșită: contextul AI scris la 2026-08-12 descria EIS4P ca fiind serviciul de memorie. Utilizatorul a clarificat că EIS4P este VOGO eBS Intelligence Suite 4 Production — ETL, BI și agentic AI pe date de producție —, confirmat de materialul de prezentare v.2.0.7 din rădăcină. Dintre variantele propuse, utilizatorul a ales corectarea contextului fără mutare de cod, ca pas minim care oprește propagarea informației false.
Alternatives: Extragerea serviciului într-un repository propriu `C:\VOGO\50-SOURCE\vogo-mcp`; mutarea lui în repository-ul vogo.me, unde există deja o implementare PHP echivalentă.
Consequences: Repository-ul rămâne cu două teme fără legătură funcțională. `01-AI\RAG.md` devine index și rutează către `01-AI\rag\eis4p-produs.md` și `01-AI\rag\vogo-mcp-memorie.md`. Orice agent trebuie să verifice despre care temă este vorba înainte de a acționa. Decizia este explicit provizorie — separarea rămâne întrebarea deschisă 1 din `CONTEXT.md`.
Status: ACTIVE
```

```text
D-009
Date: 2026-08-12
Decision: Deciziile `D-001`…`D-005` se păstrează în acest jurnal, marcate ca aparținând codului găzduit, nu produsului.
Reason: Sunt decizii reale, luate și implementate; ștergerea lor ar pierde trasabilitatea. Fără marcaj însă, un agent le-ar citi drept decizii de arhitectură ale produsului EIS4P.
Consequences: Dacă serviciul `vogo-mcp` se mută într-un repository propriu, `D-001`…`D-005` și `D-007` îl însoțesc, iar aici rămân numai `D-006`, `D-008` și `D-009`.
Status: ACTIVE
```

```text
D-010
Date: 2026-08-12
Decision: Folderul de context a fost redenumit din `ai\` în `01-AI\`, iar proiectul a primit folderele obligatorii `00-INBOX\`, `10-PM\`, `20-DOC\` cu cele șase subfoldere de etapă și `80-ARCHIVE\`.
Reason: Promptul canonic VOGO a fost extins cu secțiunile „Folderele obligatorii ale unui proiect" și „Redenumirea unui folder `ai` existent". Numele canonic este `01-AI`, numerotat ca să apară primul în orice listare, imediat după `00-INBOX`. Alinierea era întârziată de acest proiect și bloca rescrierea referințelor din proiectul `MARCEL`.
Consequences: Redenumirea s-a făcut cu `git mv`, deci istoricul fișierelor se păstrează. 52 de referințe de forma cale au fost rescrise în 8 fișiere ale proiectului. Un fals pozitiv a fost prins și reparat: expresia `coderabbit.ai/` dintr-un README din `node_modules`, unde `ai` era parte de domeniu, nu segment de cale. Fișierele goale poartă `dummy.txt`, ca Git să le urmărească.
Status: ACTIVE
```

```text
D-011
Date: 2026-08-12
Decision: Din acest proiect se pointează către alt proiect numai prin folderul lui canonic și, la nevoie, prin `AGENTS.md` al lui. Nu se scriu căi către fișiere din interiorul altui proiect.
Reason: Simetric cu `D-007` din proiectul `MARCEL`, stabilită de utilizator la 2026-08-12. Motivul s-a văzut imediat: referințele adânci scrise de aici către fișiere din `MARCEL` și cele scrise de acolo către fișiere din acest proiect au devenit greșite la prima redenumire de folder, fiindcă structura internă a unui proiect se schimbă fără ca celălalt să afle. `AGENTS.md` este singurul punct de intrare stabil.
Consequences: Șase referințe adânci către `MARCEL` au fost rescrise în `AGENTS.md`, `01-AI\CONTEXT.md`, `01-AI\RAG.md`, `01-AI\TASKS.md`, `01-AI\HANDOFF.md` și `01-AI\rag\eis4p-produs.md`. Faptele despre PoC rămân descrise aici doar în măsura în care privesc produsul; detaliul aparține proiectului `MARCEL` și se citește de acolo.
Status: ACTIVE
```
