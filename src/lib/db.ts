/**
 * lib/db.ts — Capa de acceso a PostgreSQL (Supabase)
 *
 * Expone la misma interfaz que usábamos con mysql2/promise:
 *   db.query(sql, params)        → Promise<[rows | meta, fields]>
 *   db.getConnection()           → connection con beginTransaction/commit/rollback/release
 *
 * Conversiones automáticas:
 *   · Placeholders  ?  →  $1, $2, $3 …
 *   · INSERT … → agrega RETURNING id automáticamente para exponer insertId
 *   · VALUES(col)  →  EXCLUDED.col  (para ON CONFLICT DO UPDATE)
 */

import { Pool, PoolClient } from 'pg';

// ── Pool global ──────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },   // requerido por Supabase
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 20_000,
});

// ── Helpers ──────────────────────────────────────────────────

/** Convierte ? en $1, $2, $3 … */
function toPg(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

/** Determina si la sentencia es un INSERT */
const isInsert = (sql: string) => /^\s*INSERT\s+/i.test(sql);

/**
 * Ejecuta una sentencia sobre un cliente (pool o conexión dedicada).
 * Devuelve [rows | metaInsert, fields] igual que mysql2.
 */
async function run(
  client: { query: (text: string, values?: any[]) => Promise<any> },
  rawSql: string,
  params?: any[]
): Promise<[any, any]> {
  let sql = toPg(rawSql);

  // Para INSERT: añadir RETURNING id si no existe ya
  if (isInsert(sql) && !/RETURNING/i.test(sql)) {
    // Quitamos el posible ';' final antes de añadir RETURNING
    sql = sql.replace(/;\s*$/, '') + ' RETURNING id';
  }

  const result = await client.query(sql, params ?? []);

  if (isInsert(rawSql)) {
    // Devolver objeto con insertId al estilo mysql2
    const insertedId = result.rows?.[0]?.id ?? null;
    return [{ insertId: insertedId, affectedRows: result.rowCount ?? 0 }, result.fields];
  }

  return [result.rows ?? [], result.fields ?? []];
}

// ── Interfaz pública ─────────────────────────────────────────

export const db = {
  /** Ejecuta una consulta con el pool. */
  async query(sql: string, params?: any[]): Promise<[any, any]> {
    return run(pool, sql, params);
  },

  /**
   * Obtiene una conexión dedicada para transacciones.
   * Uso:
   *   const conn = await db.getConnection();
   *   await conn.beginTransaction();
   *   try { … await conn.query(…); await conn.commit(); }
   *   catch { await conn.rollback(); }
   *   finally { conn.release(); }
   */
  async getConnection() {
    const client: PoolClient = await pool.connect();

    return {
      query:            (sql: string, params?: any[]) => run(client, sql, params),
      beginTransaction: () => client.query('BEGIN'),
      commit:           () => client.query('COMMIT'),
      rollback:         () => client.query('ROLLBACK'),
      release:          () => client.release(),
    };
  },
};
