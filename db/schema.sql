-- ============================================================================
-- vogo-mcp — AI memory store schema (MariaDB 11.x)
-- Table namespace/prefix: mcp_   (lives in the vogo.me database)
-- Adapted from grund.md (PostgreSQL spec) to MariaDB:
--   BIGSERIAL     -> BIGINT AUTO_INCREMENT
--   JSONB         -> JSON
--   TIMESTAMPTZ   -> DATETIME (values stored in UTC by the app)
--   GIN / partial -> FULLTEXT index + app-level "one active version per key"
-- ============================================================================

CREATE TABLE IF NOT EXISTS mcp_memory (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id       VARCHAR(100)  NOT NULL,
    project_id    VARCHAR(100)  NULL,          -- project namespace
    chat_id       VARCHAR(150)  NULL,          -- "chat-code" (unique within user+project)

    scope         ENUM('global','project','chat') NOT NULL,

    category      VARCHAR(100)  NOT NULL DEFAULT 'general',
    memory_key    VARCHAR(200)  NOT NULL,

    title         VARCHAR(300)  NULL,
    content       MEDIUMTEXT    NOT NULL,
    content_json  JSON          NULL,

    status        ENUM('draft','approved','superseded','archived') NOT NULL DEFAULT 'approved',
    priority      INT           NOT NULL DEFAULT 100,
    version       INT           NOT NULL DEFAULT 1,
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,

    source_type       VARCHAR(50)  NULL,
    source_reference  TEXT         NULL,
    approved_by       VARCHAR(100) NULL,
    approved_at       DATETIME     NULL,

    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_user_scope (user_id, scope, is_active, status),
    INDEX idx_project    (user_id, project_id, is_active, status),
    INDEX idx_chat       (user_id, project_id, chat_id, is_active, status),
    INDEX idx_key        (user_id, project_id, chat_id, memory_key),
    FULLTEXT INDEX ft_content (title, content, memory_key, category),

    -- Enforce the scope/project/chat integrity rules from grund.md section 4.
    CONSTRAINT ck_mcp_scope_keys CHECK (
        (scope = 'global'  AND project_id IS NULL     AND chat_id IS NULL)
        OR (scope = 'project' AND project_id IS NOT NULL AND chat_id IS NULL)
        OR (scope = 'chat'    AND project_id IS NOT NULL AND chat_id IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Full audit trail of every write (create/update/approve/archive/delete/promote).
CREATE TABLE IF NOT EXISTS mcp_memory_history (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    memory_id   BIGINT NOT NULL,
    operation   ENUM('create','update','approve','archive','delete','promote') NOT NULL,
    old_value   JSON NULL,
    new_value   JSON NULL,
    changed_by  VARCHAR(100) NULL,
    changed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hist_mem (memory_id, changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
