import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME ?? "rsi_test_platform",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("password123", 10);

  // 1. Create student user
  const studentUser = await prisma.user.create({
    data: { email: "simon@test.com", passwordHash: hash, role: "STUDENT", name: "Simon", isActive: true },
  });

  // 2. Create student record
  const student = await prisma.student.create({
    data: { userId: studentUser.id, nis: "SIMON001", totalPoints: 0, currentStreak: 0, livesRemaining: 3 },
  });

  // 3. Create parent user
  const parentUser = await prisma.user.create({
    data: { email: "ortu.simon@test.com", passwordHash: hash, role: "PARENT", name: "Orang Tua Simon", isActive: true },
  });

  // 4. Create parent record linked to student
  const parent = await prisma.parent.create({
    data: { userId: parentUser.id, phone: "08123456789" },
  });

  // 5. Link student to parent
  await prisma.student.update({
    where: { id: student.id },
    data: { parentId: parent.id },
  });

  console.log("✅ Simon & Orang Tua Simon berhasil dibuat!");
  console.log("   Simon (siswa):  simon@test.com / password123");
  console.log("   Ortu Simon:     ortu.simon@test.com / password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
