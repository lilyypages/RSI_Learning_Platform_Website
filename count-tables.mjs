import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const tables = [
  "users",
  "teachers",
  "students",
  "subjects",
  "classes"
];

for (const table of tables) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM ${table}`
  );

  console.log(table, result.rows[0].count);
}

await pool.end();