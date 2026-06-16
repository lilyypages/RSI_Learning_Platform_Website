/**
 * fix-neon-users.mjs
 * Jalankan sekali untuk:
 *  1. Rename email @rsi.sch.id → @test.com
 *  2. Reset semua password demo ke admin123
 *
 * Usage:
 *   node scripts/fix-neon-users.mjs
 */

import bcrypt from "bcryptjs";
import pg from "pg";

const { Client } = pg;

const NEON_URL =
  "postgresql://neondb_owner:npg_0hQMWPETdG3Y@ep-proud-truth-aiia0vxl.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const client = new Client({ connectionString: NEON_URL });

// Email mapping: lama → baru
const EMAIL_MAP = [
  { old: "kepsek@rsi.sch.id", new: "kepsek@test.com" },
  { old: "guru@rsi.sch.id",   new: "guru@test.com"   },
  { old: "ortu@rsi.sch.id",   new: "ortu@test.com"   },
  { old: "siswa@rsi.sch.id",  new: "siswa@test.com"  },
];

async function main() {
  await client.connect();
  console.log("✅ Connected to Neon\n");

  // Hash password admin123
  const hash = await bcrypt.hash("admin123", 12);
  console.log("🔑 Password hash generated for admin123\n");

  for (const mapping of EMAIL_MAP) {
    // Cek apakah email lama ada
    const check = await client.query(
      "SELECT id, email FROM users WHERE email = $1",
      [mapping.old]
    );

    if (check.rows.length === 0) {
      console.log(`⚠️  Tidak ditemukan: ${mapping.old} — skip`);
      continue;
    }

    const userId = check.rows[0].id;

    // Cek apakah email baru sudah ada (hindari conflict)
    const conflict = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [mapping.new]
    );

    if (conflict.rows.length > 0 && conflict.rows[0].id !== userId) {
      console.log(`⚠️  ${mapping.new} sudah ada (ID berbeda) — skip rename, hanya reset password`);
      await client.query(
        "UPDATE users SET password_hash = $1 WHERE email = $2",
        [hash, mapping.new]
      );
      console.log(`   ✅ Password direset untuk ${mapping.new}`);
      continue;
    }

    // Update email + password sekaligus
    await client.query(
      "UPDATE users SET email = $1, password_hash = $2 WHERE id = $3",
      [mapping.new, hash, userId]
    );

    console.log(`✅ ${mapping.old} → ${mapping.new}  (password: admin123)`);
  }

  console.log("\n🎉 Selesai! Akun yang bisa dipakai di Vercel:");
  console.log("   kepsek@test.com  / admin123  (PRINCIPAL)");
  console.log("   guru@test.com    / admin123  (TEACHER)");
  console.log("   ortu@test.com    / admin123  (PARENT)");
  console.log("   siswa@test.com   / admin123  (STUDENT)");

  await client.end();
}

main().catch((err) => {
  console.error("❌ Error:", err);
  client.end();
  process.exit(1);
});
