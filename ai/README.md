# Harta contextului AI — EIS4P

Acest folder conține tot contextul AI persistent al proiectului.

Atenție: `README.md` și `grund.md` din rădăcină documentează serviciul de memorie `vogo-mcp` găzduit aici, **nu** produsul EIS4P. Vezi `CONTEXT.md`, secțiunea „Codul găzduit".

## Ordinea recomandată de citire

1. `CONTEXT.md`
2. `DECISIONS.md`
3. `TASKS.md`
4. `RAG.md`, apoi tema relevantă din `rag\`
5. `HANDOFF.md`

## Rolul fiecărei resurse

| Resursă | Conține | Nu conține |
|---|---|---|
| `CONTEXT.md` | Obiectiv, domeniu, arhitectură relevantă, componente, situație curentă, constrângeri, întrebări deschise. | Istoric de conversații. |
| `DECISIONS.md` | Jurnalul deciziilor aprobate: decizie, dată, motiv, alternative, consecințe. | Idei neaprobate prezentate ca decizii. |
| `TASKS.md` | Sarcini cu stare și următorul pas verificabil. | Sarcini fără pas următor. |
| `RAG.md` | Indexul temelor, faptele comune și capcana terminologică `MCP`. Rutează către `rag\`. | Detaliile unei singure teme. |
| `rag\eis4p-produs.md` | Produsul: zone funcționale, strat tehnic anunțat, stadiu de implementare. | Codul găzduit. |
| `rag\vogo-mcp-memorie.md` | Codul găzduit: model de date, contract REST, unelte MCP, capcane verificate. | Cerințe ale produsului. |
| `HANDOFF.md` | Predarea între sesiuni: făcut, verificat, rămas, blocaje, pași imediați. | Informație consolidabilă în celelalte fișiere. |
| `prompts\` | Prompturi reutilizabile și curățate, indexate în `prompts\README.md`. | Conversații brute. |
| `sessions\` | Înregistrări de lucru păstrate pentru trasabilitate. | Sursă canonică finală. |
| `skills\` | Fluxuri de lucru reutilizabile, fiecare cu `SKILL.md` propriu. | Reguli generale de proiect. |

## Reguli

- Nu se creează copii `AGENTS.md` sau `CLAUDE.md` în acest folder.
- Aceeași informație nu se duplică între fișiere; se leagă prin referințe.
- Nu se creează variante concurente de tip `RAG-final` sau `CONTEXT-v2`; istoricul aparține Git.
- Conținutul relevant din `sessions\` se extrage ulterior în fișierele consolidate.
- Codul sursă nu se copiază în fișierele de context; se referă prin cale relativă la rădăcina proiectului.
