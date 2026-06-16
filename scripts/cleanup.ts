import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🧹 Membersihkan data seed lama & duplikat MTK...\n");

  // 1. Hapus data anak-anak (FK dulu)
  console.log("  Hapus video_watches...");
  await prisma.videoWatch.deleteMany({});
  console.log("  Hapus quiz_answers...");
  await prisma.quizAnswer.deleteMany({});
  console.log("  Hapus quiz_sessions...");
  await prisma.quizSession.deleteMany({});
  console.log("  Hapus questions...");
  await prisma.question.deleteMany({});
  console.log("  Hapus videos...");
  await prisma.video.deleteMany({});
  console.log("  Hapus student_progress...");
  await prisma.studentProgress.deleteMany({});
  console.log("  Hapus materials...");
  await prisma.material.deleteMany({});
  console.log("  Hapus point_logs...");
  await prisma.pointLog.deleteMany({});
  console.log("  Hapus weekly_reports...");
  await prisma.weeklyReport.deleteMany({});

  // 2. Cari subject MTK
  const mtk = await prisma.subject.findFirst({ where: { code: "MTK" } });
  if (mtk) {
    console.log(`  Hapus class_subjects dengan subject MTK (${mtk.id})...`);
    await prisma.classSubject.deleteMany({ where: { subjectId: mtk.id } });
    console.log("  Hapus subject MTK...");
    await prisma.subject.delete({ where: { id: mtk.id } });
  }

  // 3. Verifikasi
  const remaining = await prisma.subject.findMany({ orderBy: { code: "asc" } });
  console.log(`\n✅ Sisa subjects (${remaining.length}):`);
  for (const s of remaining) console.log(`   ${s.code} - ${s.name}`);

  const cs = await prisma.classSubject.count();
  console.log(`\n   Class-subjects tersisa: ${cs}`);

  const counts = {
    materials: await prisma.material.count(),
    videos: await prisma.video.count(),
    questions: await prisma.question.count(),
  };
  console.log("   Materials:", counts.materials, "Videos:", counts.videos, "Questions:", counts.questions);
  console.log("\n🎉 Cleanup selesai!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
