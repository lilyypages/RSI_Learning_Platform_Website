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
  console.log("Connecting...");

  const result = await pool.query("SELECT NOW();");

  console.log("SUCCESS");
  console.log(result.rows);

  await pool.end();
} catch (err) {
  console.error("FAILED");
  console.error(err);
}