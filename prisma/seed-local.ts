import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME ?? "rsi_local",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const hash = await bcrypt.hash("123456", 10);

  const k = await prisma.user.create({
    data: { email: "kepsek@rsi.sch.id", passwordHash: hash, role: "PRINCIPAL", name: "Kepsek Sekolah", isActive: true, }
  });
  await prisma.principal.create({ data: { userId: k.id, nip: "199001012010011001" } });

  const g = await prisma.user.create({
    data: { email: "guru@rsi.sch.id", passwordHash: hash, role: "TEACHER", name: "Guru Matematika", isActive: true, }
  });
  await prisma.teacher.create({ data: { userId: g.id, nip: "198505152010012002" } });

  const s = await prisma.user.create({
    data: { email: "siswa@rsi.sch.id", passwordHash: hash, role: "STUDENT", name: "Siswa Contoh", isActive: true, }
  });
  await prisma.student.create({ data: { userId: s.id, nis: "1234567890" } });

  const o = await prisma.user.create({
    data: { email: "ortu@rsi.sch.id", passwordHash: hash, role: "PARENT", name: "Orang Tua Siswa", isActive: true, }
  });
  await prisma.parent.create({ data: { userId: o.id, phone: "08123456789" } });

  console.log("Seed selesai! Semua pake password: 123456");
  console.log("kepsek@rsi.sch.id (PRINCIPAL)");
  console.log("guru@rsi.sch.id (TEACHER)");
  console.log("siswa@rsi.sch.id (STUDENT)");
  console.log("ortu@rsi.sch.id (PARENT)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
