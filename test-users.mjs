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

try {
  const result = await pool.query(`
    SELECT id, email, role
    FROM users
    LIMIT 5
  `);

  console.log(result.rows);
} catch (err) {
  console.error(err);
} finally {
  await pool.end();
}