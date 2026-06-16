import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const classes = await prisma.class.findMany({ orderBy: { gradeLevel: "asc" } });
  console.log("=== CLASSES ===");
  for (const c of classes) console.log(`  ${c.id} | ${c.name} (Grade ${c.gradeLevel})`);

  const subjects = await prisma.subject.findMany();
  console.log("\n=== SUBJECTS ===");
  for (const s of subjects) console.log(`  ${s.id} | ${s.name} (${s.code})`);

  const cs = await prisma.classSubject.findMany({
    include: { class: true, subject: true },
    orderBy: [{ classId: "asc" }, { subjectId: "asc" }],
  });
  console.log("\n=== CLASS-SUBJECTS ===");
  for (const c of cs) console.log(`  ${c.id} | ${c.class.name} -> ${c.subject.name} (teacherId: ${c.teacherId ?? "null"})`);

  const mc = await prisma.material.count();
  console.log(`\n=== MATERIALS: ${mc} ===`);
  const ms = await prisma.material.findMany({ take: 10, include: { classSubject: { include: { class: true, subject: true } } } });
  for (const m of ms) console.log(`  ${m.id} | ${m.title} | ${m.classSubject.class.name} - ${m.classSubject.subject.name} | diff: ${m.difficulty} | published: ${m.isPublished}`);

  const vc = await prisma.video.count();
  console.log(`\n=== VIDEOS: ${vc} ===`);

  const qc = await prisma.question.count();
  console.log(`\n=== QUESTIONS: ${qc} ===`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
