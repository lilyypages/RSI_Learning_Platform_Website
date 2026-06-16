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
  const passwordHash = await bcrypt.hash("password123", 10);

  // ── User 1: Kepsek / Principal ──
  const kepsek = await prisma.user.upsert({
    where: { email: "kepsek@test.com" },
    update: {},
    create: {
      email: "kepsek@test.com",
      passwordHash,
      role: "PRINCIPAL",
      name: "Kepsek Sekolah",
      isActive: true,
    },
  });
  await prisma.principal.upsert({
    where: { userId: kepsek.id },
    update: {},
    create: { userId: kepsek.id, nip: "199001012010011001" },
  });

  // ── User 2: Guru / Teacher ──
  const guru = await prisma.user.upsert({
    where: { email: "guru@test.com" },
    update: {},
    create: {
      email: "guru@test.com",
      passwordHash,
      role: "TEACHER",
      name: "Guru Matematika",
      isActive: true,
    },
  });
  await prisma.teacher.upsert({
    where: { userId: guru.id },
    update: {},
    create: { userId: guru.id, nip: "198505152010012002" },
  });

  // ── User 3: Siswa / Student ──
  const siswa = await prisma.user.upsert({
    where: { email: "siswa@test.com" },
    update: {},
    create: {
      email: "siswa@test.com",
      passwordHash,
      role: "STUDENT",
      name: "Siswa Contoh",
      isActive: true,
    },
  });
  await prisma.student.upsert({
    where: { userId: siswa.id },
    update: {},
    create: { userId: siswa.id, nis: "1234567890" },
  });

  // ── User 4: Ortu / Parent ──
  const ortu = await prisma.user.upsert({
    where: { email: "ortu@test.com" },
    update: {},
    create: {
      email: "ortu@test.com",
      passwordHash,
      role: "PARENT",
      name: "Orang Tua Siswa",
      isActive: true,
    },
  });
  await prisma.parent.upsert({
    where: { userId: ortu.id },
    update: {},
    create: { userId: ortu.id, phone: "08123456789" },
  });

  console.log("✅ Seed selesai — 4 user test dibuat:");
  console.log(`   Kepsek: kepsek@test.com / password123`);
  console.log(`   Guru:   guru@test.com / password123`);
  console.log(`   Siswa:  siswa@test.com / password123`);
  console.log(`   Ortu:   ortu@test.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
