# Project Context — EIS4P

Context consolidat, verificat și actual, la 2026-08-12. Nu copia aici istoricul conversațiilor.

## Identificare

| | |
|---|---|
| Cod proiect | `EIS4P` |
| Produs | VOGO eBS — Enterprise Business Suite 4 Production |
| Arie | DEVELOPMENT |
| Folder canonic | `C:\VOGO\50-SOURCE\EIS4P` |
| Repository | `https://github.com/vipsolutionservices/EIS4P.git`, ramura `master` |
| Copie legacy | `C:\sources\EIS4P` — nemigrată, nu este sursă canonică |

## Obiectiv

Platformă integrată pentru producție: optimizarea planificării, integrare Enterprise, optimizarea comenzilor și analiza inteligentă a datelor în timp real, cu componentă AI. Acoperă trei zone — PRODUCȚIE, TRADING, MATERIE PRIMĂ.

Stratul tehnic anunțat: ETL cu Apache NiFi, depozit de date PostgreSQL, Business Intelligence și dashboarding, WSO2 Integrator pentru API și ESB, agentic AI antrenat pe documentele și datele de producție, RAG pe rețete și istoric, servere MCP pe materii prime, stocuri, vânzări și trading, prognoză cu sezonalitate, planificare optimizată APS, detecție anomalii, predicția rebuturilor, control calitate prin computer vision, analiză OEE și asistent conversațional pe datele din producție.

Detaliile complete: `01-AI\rag\eis4p-produs.md`.

## Stare curentă a produsului

Nimic implementat. Niciun element din stratul tehnic de mai sus nu are cod în acest repository, în niciun commit din istoric.

Scheletul de directoare al produsului — `src/memory\`, `src/rag\`, `docs/architecture\`, `docs/requirements\` — a fost creat gol la 2026-08-01, commit `74e4ab8`. Toate fișierele `README.md` din el au 0 octeți. La fel `CHANGELOG.md`, `CONTRIBUTING.md` și `LICENSE`.

Singurul material al produsului este prezentarea de o pagină `VOGO eBS Intellingence Suite 4 Production v.2.0.7`, în format `.docx` și `.pdf`, urmărită prin Git LFS. Nu există specificație funcțională, arhitecturală sau tehnică.

## Codul găzduit

Repository-ul conține codul serviciului `vogo-mcp` — memorie externă pentru asistenți AI, REST API pe Node/Express peste MariaDB, plus trei servere MCP. Acest cod **nu face parte din produsul EIS4P** și nu implementează niciuna dintre componentele lui.

Cum a ajuns aici, din istoricul Git — toate commit-urile sunt din 2026-08-01:

```
a660743  Initial commit                            README de 20 octeți
e89df84  Initial project structure                 .gitignore, LICENSE — goale
d73e326  Add MCP memory server specification       grund.md, 774 linii
74e4ab8  Create canonical EIS4P project structure  8 fișiere, toate 0 octeți
9efbbef  Initialize Node.js backend
4a39229  Checkpoint - Initial EIS4P AI MCP Platform
```

Repository-ul a fost deschis pentru produs și, în aceeași zi, folosit ca gazdă pentru serviciul de memorie. Codul nu se numește nicăieri EIS4P; fiecare fișier își spune `vogo-mcp` în antet. Cauza probabilă a confuziei este acronimul `MCP`, prezent în ambele — vezi `01-AI\RAG.md`, secțiunea „Capcana terminologică".

Codul rămâne aici prin decizie explicită, `DECISIONS.md` → `D-008`. Descrierea lui: `01-AI\rag\vogo-mcp-memorie.md`.

## Relația cu proiectul MARCEL

`MARCEL` — `C:\VOGO\30-PROJECTS\MARCEL SRL`, aria SALES — este **proiectul de vânzare al acestui produs** și, în acest moment, singura lui cerere concretă. Marcel SRL produce și distribuie produse din carne printr-o rețea de magazine proprii; procesele vizate sunt exact lanțul materie primă → producție → trading al suitei.

| Aspect | Cum se leagă |
|---|---|
| Rol | `MARCEL` cere, `EIS4P` livrează. PoC-ul pentru client se construiește din componentele acestui produs. |
| Cadru | NDA semnat VOGO ↔ Marcel SRL. Datele clientului nu se publică și nu se folosesc în afara proiectului `MARCEL`. |
| Material de prezentare | `VOGO eBS Intellingence Suite 4 Production v.2.0.7.docx` / `.pdf` există în ambele proiecte. **Sursa canonică este aici**, urmărită prin Git LFS; copiile din `MARCEL` sunt derivate. |
| Structura de date a PoC-ului | `Template_PoC_EIS4P_Marcel_Date_Excel.xlsx` — nouă foi cerute clientului. Detaliile se citesc din proiectul `MARCEL`. |
| Date reale primite | Un singur fișier, `falticeni.csv`, comandă a magazinului Fălticeni, cod `32875`, nomenclator de 190 de articole, fără cantități. Acoperă parțial două din cele nouă foi. Detaliile se citesc din proiectul `MARCEL`. |

Consecința pentru acest proiect: **scopul PoC-ului din `MARCEL` este cel care stabilește ce componentă a produsului se construiește prima.** Nu porni implementarea din materialul de prezentare — acela enumeră tot, fără prioritate. Vezi `TASKS.md` → `T-011` și `T-012`.

Constrângerea inversă, valabilă la citirea proiectului `MARCEL`: nimic din produs nu este implementat, deci ce se poate demonstra clientului se limitează la ce se construiește explicit pentru PoC.

## Constrângeri

Pentru produs, deocamdată niciuna verificată — nu există implementare, mediu de rulare sau infrastructură.

Pentru codul găzduit:

- Găzduire partajată: fără Docker, fără PostgreSQL, fără `pgvector`.
- `fetch` global nu este fiabil sub limitele de memorie LVE ale CloudLinux; codul folosește `node:http` / `node:https`.
- Secretele stau numai în `.env` local sau în mediul serverului. În repository rămâne exclusiv `.env.example`.

Pentru repository, indiferent de temă:

- Fișierele peste 10 MB nu intră în Git fără aprobare explicită și Git LFS — `C:\VOGO\90-AI-SYSTEM\GIT-LARGE-FILES-APPROVAL.md`. `.gitattributes` urmărește `*.docx` și `*.pdf`.
- Operațiunile Git se execută numai la cerere explicită a dezvoltatorului.

## Întrebări deschise

1. Când și cum se separă cele două teme: serviciul `vogo-mcp` într-un repository propriu, în repository-ul vogo.me, sau rămâne definitiv aici? Decizia `D-008` este explicit provizorie.
2. Care implementare a serviciului de memorie răspunde efectiv la `https://vogo.me/ai-mcp/` — cea Node din acest repository sau cea PHP din `vogo.me\ai-mcp\`? Cele două afirmații din surse se contrazic și nu s-a verificat pe server. Utilizatorul a declarat la 2026-08-12 că nu mai folosește `ai-mcp`.
3. Scopul exact al PoC-ului Marcel: ce se demonstrează, pe ce foi din template și cu ce criteriu de acceptare. Este întrebarea deschisă 3 din `MARCEL\01-AI\CONTEXT.md` și, până la răspuns, blochează stabilirea primei componente de construit aici.
4. Copia legacy `C:\sources\EIS4P` se migrează formal după procedura din promptul canonic, sau se consideră deja înlocuită?
5. De unde pornește implementarea produsului: specificație funcțională, arhitectură, sau o primă componentă verticală extrasă din nevoia PoC-ului Marcel?
