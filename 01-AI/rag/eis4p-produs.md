# RAG — EIS4P, produsul

Faptele stabile despre produsul care dă numele acestui proiect. Rutat din `01-AI\RAG.md`.

## Identitate

**VOGO eBS — Enterprise Business Suite 4 Production**, versiunea de prezentare `v.2.0.7`.

Platformă integrată pentru optimizarea planificării producției, integrare Enterprise, optimizarea comenzilor și analiza inteligentă a datelor în timp real, cu componentă AI.

Poziționare din materialul de prezentare: „One Suite. Unlimited possibilities." — `AI, ETL & BUSINESS INTELLIGENCE`.

## Zone funcționale

| Zonă | Acoperire |
|---|---|
| PRODUCȚIE | Planificare producție • Rețete • Produse finite • Semifabricate • Comenzi de producție • Costuri directe și indirecte • Consumuri |
| TRADING | Vânzări • Rețea proprie • Distribuitori • Export • Logistică • Livrări • Facturare • Analiză comercială • Portal parteneri • Aplicații mobile |
| MATERIE PRIMĂ | Aprovizionare • Achiziții • Stocuri • Recepții • Loturi și termene de valabilitate • Trasabilitate • Depozit • Management |

## Stratul tehnic anunțat

| Componentă | Tehnologie sau descriere din material |
|---|---|
| Integrare și orchestrare date (ETL) | Apache NiFi |
| Depozit de date | PostgreSQL |
| Business Intelligence | Dashboarding avansat |
| Integrare API, ESB și management | WSO2 Integrator |
| Agentic AI | Antrenat pe datele și documentele de producție |
| RAG | Pe rețete și istoric |
| MCP | Materii prime, stocuri, vânzări și trading |
| Prognoză | Cerere cu sezonalitate |
| Planificare | Programare optimizată (APS) |
| Analitică de proces | Detecție anomalii • Predicția și minimizarea rebuturilor • Analiză cauze rădăcină (OEE) |
| Control calitate | Computer vision |
| Optimizare | Rețete și randamente |
| Interfață conversațională | Asistent pe datele din producție |

## Stadiu de implementare

Zero. Niciun element din lista de mai sus nu are implementare în acest repository, în niciun commit din istoric. Scheletul de directoare `src/memory\`, `src/rag\`, `docs/architecture\`, `docs/requirements\` a fost creat gol la 2026-08-01, commit `74e4ab8`, și a rămas gol — toate fișierele `README.md` din ele au 0 octeți.

## Cererea concretă existentă

Singura cerere reală pentru acest produs vine din proiectul `MARCEL` — `C:\VOGO\30-PROJECTS\MARCEL SRL`, aria SALES: un PoC pentru Marcel SRL, producător și distribuitor de produse din carne cu rețea de magazine proprii.

Ce înseamnă asta pentru lista de mai sus: **prioritatea nu se citește din materialul de prezentare**, care enumeră toate componentele fără ierarhie, ci din ce cere PoC-ul. Structura de date cerută clientului acoperă nouă seturi, descrise în proiectul `MARCEL`. Clientul a livrat până acum un singur fișier, o comandă de magazin fără cantități, care acoperă parțial două dintre ele.

Scopul exact al PoC-ului nu este încă stabilit. Până când este, nicio componentă a produsului nu are un criteriu de acceptare.

## Precizare despre MCP

Materialul de prezentare listează MCP ca parte a produsului: servere MCP peste materii prime, stocuri, vânzări și trading. Acesta **nu** este serviciul de memorie pentru asistenți AI descris în `vogo-mcp-memorie.md`. Sunt două lucruri diferite care poartă același acronim, iar confuzia dintre ele este cauza pentru care codul serviciului de memorie a ajuns în acest repository.

## Sursă

`VOGO eBS Intellingence Suite 4 Production v.2.0.7.docx` și `.pdf` din rădăcina proiectului, urmărite prin Git LFS. Un material de prezentare de o pagină. Denumirea fișierului conține greșeala de tipar „Intellingence"; se păstrează ca atare pentru că este numele real al fișierului.

Nu există specificație funcțională, arhitecturală sau tehnică a produsului în acest repository.
