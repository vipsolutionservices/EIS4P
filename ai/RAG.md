# Project RAG — EIS4P

Index și fapte comune. Proiectul are două teme distincte, care nu se amestecă; fiecare are propriul fișier în `ai\rag\`.

Nu crea variante concurente precum `RAG-final` sau `RAG-v2`; istoricul aparține Git.

## Rutare

| Temă | Fișier | Când se citește |
|---|---|---|
| Produsul care dă numele proiectului: VOGO eBS Intelligence Suite 4 Production — ETL, depozit de date, BI, Agentic AI pe producție | `ai\rag\eis4p-produs.md` | Orice discuție despre ce trebuie construit. |
| Codul găzduit în repository: `vogo-mcp`, serviciu de memorie externă pentru asistenți AI | `ai\rag\vogo-mcp-memorie.md` | Orice atingere a codului existent din `src\`, `db\` sau `smoke.sh`. |
| Cererea concretă pentru produs: PoC-ul clientului Marcel SRL — structura de date cerută și ce a livrat clientul | `C:\VOGO\30-PROJECTS\MARCEL SRL\ai\RAG.md` și `ai\rag\` de acolo | Orice discuție despre ce se construiește primul, ce se demonstrează sau ce se promite unui client. |

## Faptul comun cel mai important

**Numele repository-ului și conținutul lui descriu două lucruri diferite.** `EIS4P` este produsul de producție — ETL, BI, agentic AI. Codul din repository este serviciul de memorie `vogo-mcp`, care nu are legătură funcțională cu produsul. Nu deduce cerințe ale produsului din codul existent și nu presupune că o componentă a produsului este implementată pentru că repo-ul poartă numele lui.

Detaliul situației și motivele pentru care s-a decis păstrarea codului aici: `ai\CONTEXT.md` și `ai\DECISIONS.md` → `D-008`.

## Capcana terminologică

Acronimul `MCP` apare în ambele teme, cu înțelesuri diferite:

| Context | Înțeles |
|---|---|
| În produsul EIS4P | Servere MCP peste materii prime, stocuri, vânzări și trading. Neimplementate. |
| În codul găzduit | Servere MCP peste serviciul de memorie pentru asistenți AI. Implementate. |

Această suprapunere este cauza probabilă a plasării greșite a codului. Verifică întotdeauna despre care dintre ele este vorba înainte de a acționa.
