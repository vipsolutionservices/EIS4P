// MariaDB/MySQL connection pool for the vogo-mcp memory service.
// Credentials come from the environment (see .env). The table prefix keeps the
// mcp_* tables cleanly namespaced inside the shared vogo.me database.
import mysql from "mysql2/promise";

export const PREFIX = process.env.DB_TABLE_PREFIX || "mcp_";
export const T = {
    memory: `${PREFIX}memory`,
    history: `${PREFIX}memory_history`,
};

export const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL || 5),
    charset: "utf8mb4",
    // Return JSON columns as parsed objects, DATETIME as strings.
    dateStrings: true,
});

// Lightweight connectivity probe used by /health.
export async function pingDb() {
    const [rows] = await pool.query("SELECT 1 AS ok");
    return rows[0]?.ok === 1;
}
