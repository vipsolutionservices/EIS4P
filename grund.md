# GRUND — Sistem extern de memorie pentru AI, proiecte și conversații

## 1. Rolul tău

Ești un senior software architect și senior backend developer. Construiește complet, funcțional și gata de rulare un serviciu de memorie externă pentru aplicații AI și servere MCP.

Nu livra pseudocod. Livrează cod executabil, migrații SQL, configurare, validări, autentificare, teste și documentație de instalare.

## 2. Obiectiv

Construiește un serviciu web care salvează și returnează memorie cumulativă pe trei niveluri:

```text
GLOBAL
  ↓
PROJECT
  ↓
CHAT
```

Memoria efectivă folosită de un model AI se calculează astfel:

```text
memorie globală a utilizatorului
+ memorie proiect
+ memorie chat curent
```

Regula de prioritate este:

```text
CHAT suprascrie PROJECT
PROJECT suprascrie GLOBAL
```

Sistemul trebuie să poată fi utilizat din orice proiect și orice chat, prin REST API și printr-un server MCP.

## 3. Stack tehnologic obligatoriu

Folosește:

- Python 3.12+
- FastAPI
- PostgreSQL 16+
- SQLAlchemy 2.x
- Alembic
- Pydantic v2
- psycopg 3
- Docker și Docker Compose
- pytest
- MCP Python SDK / FastMCP
- autentificare prin API Key în header
- OpenAPI generat automat de FastAPI

Nu folosi SQLite.

## 4. Identificatori principali

Orice memorie trebuie grupată prin:

```text
user_id
project_id
chat_id
```

Semnificație:

- `user_id` — proprietarul memoriei;
- `project_id` — proiectul din care face parte informația;
- `chat_id` — conversația concretă;
- `scope` — unul dintre `global`, `project`, `chat`.

Reguli:

- pentru `global`, `project_id` și `chat_id` trebuie să fie `NULL`;
- pentru `project`, `project_id` este obligatoriu și `chat_id` trebuie să fie `NULL`;
- pentru `chat`, `project_id` și `chat_id` sunt obligatorii.

## 5. Model de date

Creează tabelele de mai jos prin migrații Alembic.

### 5.1 Tabelul `ai_memory`

```sql
CREATE TABLE ai_memory (
    id BIGSERIAL PRIMARY KEY,

    user_id VARCHAR(100) NOT NULL,
    project_id VARCHAR(100),
    chat_id VARCHAR(150),

    scope VARCHAR(20) NOT NULL
        CHECK (scope IN ('global', 'project', 'chat')),

    category VARCHAR(100) NOT NULL,
    memory_key VARCHAR(200) NOT NULL,

    title VARCHAR(300),
    content TEXT NOT NULL,
    content_json JSONB,

    status VARCHAR(30) NOT NULL DEFAULT 'approved'
        CHECK (status IN ('draft', 'approved', 'superseded', 'archived')),

    priority INTEGER NOT NULL DEFAULT 100,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    source_type VARCHAR(50),
    source_reference TEXT,
    source_chat_id VARCHAR(150),

    approved_by VARCHAR(100),
    approved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_ai_memory_scope_keys CHECK (
        (scope = 'global' AND project_id IS NULL AND chat_id IS NULL)
        OR
        (scope = 'project' AND project_id IS NOT NULL AND chat_id IS NULL)
        OR
        (scope = 'chat' AND project_id IS NOT NULL AND chat_id IS NOT NULL)
    )
);
```

Adaugă:

```sql
CREATE INDEX idx_ai_memory_user_scope
ON ai_memory(user_id, scope, is_active, status);

CREATE INDEX idx_ai_memory_project
ON ai_memory(user_id, project_id, is_active, status);

CREATE INDEX idx_ai_memory_chat
ON ai_memory(user_id, project_id, chat_id, is_active, status);

CREATE INDEX idx_ai_memory_key
ON ai_memory(user_id, project_id, chat_id, memory_key);

CREATE INDEX idx_ai_memory_content_json_gin
ON ai_memory USING GIN(content_json);
```

Creează o regulă de unicitate pentru versiunea activă a aceleiași memorii, astfel încât să nu existe două înregistrări active cu aceeași combinație logică:

```text
user_id + scope + project_id + chat_id + category + memory_key
```

Folosește un index unic parțial pentru `is_active = TRUE` și `status IN ('draft', 'approved')`.

### 5.2 Tabelul `ai_memory_history`

Păstrează auditul complet al modificărilor.

```sql
CREATE TABLE ai_memory_history (
    id BIGSERIAL PRIMARY KEY,
    memory_id BIGINT NOT NULL,
    operation VARCHAR(20) NOT NULL
        CHECK (operation IN ('create', 'update', 'approve', 'archive', 'delete', 'promote')),
    old_value JSONB,
    new_value JSONB,
    changed_by VARCHAR(100),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Adaugă index pe `memory_id` și `changed_at`.

### 5.3 Tabelul `api_client`

```sql
CREATE TABLE api_client (
    id BIGSERIAL PRIMARY KEY,
    client_name VARCHAR(150) NOT NULL,
    api_key_hash TEXT NOT NULL UNIQUE,
    user_id VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);
```

Cheia API nu se salvează în clar. Folosește hashing sigur.

## 6. Reguli funcționale

### 6.1 Citirea memoriei efective

Implementează operația:

```text
get_effective_memory(user_id, project_id, chat_id)
```

Aceasta trebuie să returneze cumulativ:

1. memoria globală aprobată și activă a utilizatorului;
2. memoria aprobată și activă a proiectului;
3. memoria aprobată și activă a chatului.

Ordinea de prioritate este:

```text
chat > project > global
```

Dacă aceeași cheie `category + memory_key` există la mai multe niveluri, se returnează doar varianta cu prioritatea cea mai mare.

Pentru rezultatul final, ordonează după:

1. prioritate efectivă de scope;
2. câmpul `priority`;
3. `updated_at` descrescător.

Răspunsul trebuie să includă și sursa fiecărei memorii:

```json
{
  "scope": "project",
  "category": "architecture",
  "memory_key": "eis4p_product_type",
  "content": "EIS4P este o platformă enterprise reutilizabilă.",
  "version": 3,
  "source_reference": "chat:abc123",
  "updated_at": "2026-08-01T18:50:00+02:00"
}
```

### 6.2 Salvarea unei memorii

Implementează salvarea pe fiecare scope:

```text
save_global_memory
save_project_memory
save_chat_memory
```

Reguli:

- nu salva conținut gol;
- validează combinația `scope/project_id/chat_id`;
- implicit, noile memorii sunt `draft`;
- o memorie devine `approved` numai printr-o operație separată;
- la actualizare, versiunea veche devine `superseded` și inactivă;
- noua versiune primește `version + 1`;
- toate modificările se scriu în `ai_memory_history`.

### 6.3 Promovarea memoriei

Implementează:

```text
promote_chat_memory_to_project
promote_project_memory_to_global
```

Promovarea nu mută fizic rândul existent. Creează o versiune nouă în scope-ul țintă, cu audit și referință către sursa inițială.

### 6.4 Actualizare, arhivare și ștergere logică

Implementează:

```text
update_memory
approve_memory
archive_memory
delete_memory
```

`delete_memory` trebuie să fie ștergere logică:

```text
is_active = false
status = archived
```

Nu șterge fizic înregistrările prin API.

### 6.5 Căutare

Implementează:

```text
search_memory(user_id, query, project_id?, chat_id?, scope?, category?)
```

Căutarea minimă trebuie să folosească PostgreSQL Full Text Search pe:

- `title`;
- `content`;
- `memory_key`;
- `category`.

Pregătește arhitectura astfel încât ulterior să poată fi adăugat `pgvector`, dar nu îl face obligatoriu în prima versiune.

## 7. REST API

Prefix obligatoriu:

```text
/api/v1
```

### 7.1 Health

```http
GET /api/v1/health
```

Răspuns:

```json
{
  "status": "ok",
  "database": "ok",
  "version": "1.0.0"
}
```

### 7.2 Memorie efectivă

```http
GET /api/v1/memory/effective
```

Query params:

```text
user_id
project_id
chat_id
```

`project_id` și `chat_id` pot lipsi, în funcție de nivelul cerut.

### 7.3 Memorie după scope

```http
GET /api/v1/memory/global/{user_id}
GET /api/v1/memory/project/{user_id}/{project_id}
GET /api/v1/memory/chat/{user_id}/{project_id}/{chat_id}
```

### 7.4 Salvare

```http
POST /api/v1/memory
```

Payload:

```json
{
  "user_id": "adrian",
  "project_id": "EIS4P",
  "chat_id": "general-turbo-001",
  "scope": "chat",
  "category": "architecture",
  "memory_key": "aps_engine",
  "title": "Motor APS aprobat",
  "content": "Timefold este motorul APS integrat în EIS4P.",
  "content_json": {
    "technology": "Timefold",
    "role": "APS solver"
  },
  "priority": 20,
  "source_type": "chat",
  "source_reference": "chat:general-turbo-001",
  "approved_by": null
}
```

### 7.5 Actualizare

```http
PUT /api/v1/memory/{memory_id}
```

Trebuie să creeze o versiune nouă, nu să suprascrie istoricul.

### 7.6 Aprobare

```http
POST /api/v1/memory/{memory_id}/approve
```

Payload:

```json
{
  "approved_by": "adrian"
}
```

### 7.7 Arhivare

```http
POST /api/v1/memory/{memory_id}/archive
```

### 7.8 Promovare

```http
POST /api/v1/memory/{memory_id}/promote
```

Payload:

```json
{
  "target_scope": "project",
  "approved_by": "adrian"
}
```

### 7.9 Căutare

```http
GET /api/v1/memory/search
```

Query params:

```text
user_id
query
project_id?
chat_id?
scope?
category?
limit?
offset?
```

### 7.10 Istoric

```http
GET /api/v1/memory/{memory_id}/history
```

## 8. Autentificare și securitate

Toate endpointurile, cu excepția `/health`, trebuie protejate cu:

```http
X-API-Key: <secret>
```

Cerințe:

- cheia se verifică în `api_client`;
- cheia se salvează doar hash-uit;
- actualizează `last_used_at`;
- returnează `401` pentru cheie lipsă sau invalidă;
- returnează `403` dacă un client încearcă să acceseze alt `user_id` decât cel permis;
- nu loga cheia API;
- validează toate inputurile cu Pydantic;
- limitează lungimea câmpurilor;
- folosește tranzacții pentru actualizare, aprobare și promovare;
- previne SQL injection prin ORM sau query-uri parametrizate;
- adaugă rate limiting configurabil;
- adaugă CORS configurabil din variabile de mediu.

## 9. Server MCP

Construiește un server MCP separat în același repository.

Acesta trebuie să apeleze REST API-ul, nu direct baza de date.

Expune următoarele tools:

```text
get_effective_memory
get_global_memory
get_project_memory
get_chat_memory
search_memory
save_global_memory
save_project_memory
save_chat_memory
update_memory
approve_memory
archive_memory
promote_chat_memory_to_project
promote_project_memory_to_global
get_memory_history
```

### 9.1 Tool MCP: get_effective_memory

Input:

```json
{
  "user_id": "adrian",
  "project_id": "EIS4P",
  "chat_id": "general-turbo-001"
}
```

Output:

```json
{
  "user_id": "adrian",
  "project_id": "EIS4P",
  "chat_id": "general-turbo-001",
  "memories": [],
  "resolved_count": 0
}
```

### 9.2 Tool MCP: save_project_memory

Input:

```json
{
  "user_id": "adrian",
  "project_id": "EIS4P",
  "category": "architecture",
  "memory_key": "product_type",
  "content": "EIS4P este o platformă enterprise reutilizabilă.",
  "priority": 10,
  "source_reference": "chat:general-turbo-001"
}
```

Memoria se salvează implicit cu status `draft`.

### 9.3 Regula MCP pentru scriere

Serverul MCP nu decide singur ce este adevărat. El doar expune instrumentele.

În documentație include instrucțiunea recomandată pentru modelul AI:

```text
Înainte de a răspunde la o întrebare despre un proiect, apelează get_effective_memory.

Salvează o memorie numai când utilizatorul cere explicit memorarea sau aprobă explicit o decizie.

Salvează inițial cu status draft.
Aprobă separat numai după confirmarea explicită a utilizatorului.

Nu salva ipoteze, brainstorm-uri, variante respinse sau informații neverificate ca memorii aprobate.
```

## 10. Structura repository-ului

Creează o structură clară:

```text
ai-memory-service/
├── app/
│   ├── api/
│   │   ├── dependencies.py
│   │   ├── routes_health.py
│   │   ├── routes_memory.py
│   │   └── routes_search.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── logging.py
│   ├── db/
│   │   ├── base.py
│   │   ├── session.py
│   │   └── models/
│   ├── schemas/
│   ├── repositories/
│   ├── services/
│   ├── main.py
│   └── __init__.py
├── mcp_server/
│   ├── client.py
│   ├── server.py
│   └── __init__.py
├── alembic/
├── tests/
│   ├── unit/
│   └── integration/
├── scripts/
│   ├── create_api_key.py
│   └── seed_demo_data.py
├── .env.example
├── alembic.ini
├── docker-compose.yml
├── Dockerfile
├── pyproject.toml
├── README.md
└── Makefile
```

## 11. Docker Compose

Creează servicii pentru:

```text
postgres
api
mcp
```

Cerințe:

- volume persistent pentru PostgreSQL;
- healthcheck pentru PostgreSQL și API;
- API pe portul `8080`;
- MCP pe port configurabil;
- variabile în `.env`;
- nu hardcoda parole.

## 12. Variabile de mediu

Creează `.env.example` cu:

```env
APP_NAME=AI Memory Service
APP_VERSION=1.0.0
ENVIRONMENT=development
LOG_LEVEL=INFO

DATABASE_URL=postgresql+psycopg://memory_user:change_me@postgres:5432/ai_memory

API_HOST=0.0.0.0
API_PORT=8080
API_KEY_HASH_ALGORITHM=sha256

MCP_API_BASE_URL=http://api:8080/api/v1
MCP_API_KEY=change_me

CORS_ORIGINS=http://localhost:3000
RATE_LIMIT_PER_MINUTE=120
```

Nu salva o cheie reală în repository.

## 13. Teste obligatorii

Scrie teste automate pentru:

1. creare memorie globală;
2. creare memorie de proiect;
3. creare memorie de chat;
4. validarea combinațiilor scope/project/chat;
5. calcularea memoriei cumulative;
6. suprascrierea global → project → chat;
7. versionarea la update;
8. aprobarea unei memorii;
9. promovarea chat → project;
10. promovarea project → global;
11. arhivarea logică;
12. audit history;
13. autentificare cu API key;
14. izolarea datelor între utilizatori;
15. căutarea full-text;
16. apelurile MCP către API.

Ținta minimă de coverage: 85%.

## 14. Date demo

Creează script de seed cu:

```text
user_id: adrian
project_id: EIS4P
chat_id: general-turbo-001
```

Memorie globală:

```text
category: response_style
memory_key: concise_and_concrete
content: Răspunsurile trebuie să fie concrete, logice și fără complicații inutile.
```

Memorie proiect:

```text
category: architecture
memory_key: eis4p_product_type
content: EIS4P este o platformă enterprise reutilizabilă, nu o soluție punctuală pentru un singur client.
```

Memorie chat:

```text
category: scope
memory_key: general_turbo_current_focus
content: Pentru General Turbo, focusul curent este PoC-ul pentru planificarea cap-coadă a unei comenzi reale de reparație rotor.
```

## 15. Exemple curl

README-ul trebuie să conțină comenzi complete pentru:

- creare API key;
- pornire Docker;
- rulare migrații;
- seed demo;
- salvare memorie;
- aprobare memorie;
- citire memorie efectivă;
- promovare memorie;
- căutare;
- rulare MCP.

Exemplu obligatoriu:

```bash
curl -X GET \
  "http://localhost:8080/api/v1/memory/effective?user_id=adrian&project_id=EIS4P&chat_id=general-turbo-001" \
  -H "X-API-Key: YOUR_API_KEY"
```

## 16. Criterii de acceptanță

Soluția este acceptată numai dacă:

- pornește prin `docker compose up --build`;
- migrațiile rulează fără intervenție manuală;
- API-ul este disponibil pe `http://localhost:8080/docs`;
- memoria efectivă combină corect global + project + chat;
- chat suprascrie project, iar project suprascrie global;
- actualizarea creează versiune nouă;
- istoricul este păstrat;
- autentificarea funcționează;
- MCP poate citi și scrie prin REST API;
- testele trec;
- README-ul permite instalarea de către o persoană care nu cunoaște proiectul.

## 17. Reguli de implementare

- Nu simplifica cerințele fără acord.
- Nu elimina auditul sau versionarea.
- Nu folosi update direct peste versiunea existentă.
- Nu salva parole sau chei în cod.
- Nu expune direct PostgreSQL către internet.
- Nu folosi memorie internă în proces pentru date persistente.
- Nu amesteca datele între utilizatori.
- Nu considera `chat_id` unic global; unicitatea sa este în contextul `user_id + project_id`.
- Orice operație de scriere trebuie să fie tranzacțională.
- Returnează erori clare și coduri HTTP corecte.

## 18. Livrabile finale

Livrează:

1. repository complet;
2. toate fișierele sursă;
3. migrațiile Alembic;
4. Dockerfile și docker-compose;
5. server REST API;
6. server MCP;
7. testele;
8. README complet;
9. `.env.example`;
10. exemple curl;
11. schemă OpenAPI;
12. script de seed;
13. script pentru generarea unei chei API;
14. explicația scurtă a arhitecturii și a deciziilor tehnice.

Începe implementarea direct. Nu cere confirmări pentru alegeri deja definite în acest document. Pentru orice detaliu minor nedefinit, alege o soluție standard, sigură și simplă și documenteaz-o în README.
