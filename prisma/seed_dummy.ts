import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

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
  const kepsek = await prisma.user.findUnique({ where: { email: "kepsek@test.com" } });
  const guru = await prisma.user.findUnique({ where: { email: "guru@test.com" } });
  const siswa = await prisma.user.findUnique({ where: { email: "siswa@test.com" } });

  if (!kepsek || !guru || !siswa) {
    console.log("Jalanin seed dulu: npx tsx prisma/seed.ts");
    return;
  }

  // Hapus data lama biar bisa jalan berulang
  await prisma.studentProgress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.material.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();

  // 1. Kelas
  const kelas = await prisma.class.create({
    data: { name: "X-A", gradeLevel: 10, academicYear: 2026 },
  });

  // 2. Subject
  const mtk = await prisma.subject.upsert({
    where: { code: "MTK" },
    update: {},
    create: { name: "Matematika", code: "MTK" },
  });
  const ipa = await prisma.subject.upsert({
    where: { code: "IPA" },
    update: {},
    create: { name: "Ilmu Pengetahuan Alam", code: "IPA" },
  });

  // 3. Teacher
  const teacher = await prisma.teacher.findUnique({ where: { userId: guru.id } });
  if (!teacher) throw new Error("Teacher not found");

  // 4. ClassSubject
  const cs1 = await prisma.classSubject.create({
    data: {
      classId: kelas.id,
      subjectId: mtk.id,
      teacherId: teacher.id,
      semester: 1,
      academicYear: 2026,
    },
  });
  const cs2 = await prisma.classSubject.create({
    data: {
      classId: kelas.id,
      subjectId: ipa.id,
      teacherId: teacher.id,
      semester: 1,
      academicYear: 2026,
    },
  });

  // 5. Siswa ke kelas
  const student = await prisma.student.findUnique({ where: { userId: siswa.id } });
  if (student) {
    await prisma.student.update({
      where: { id: student.id },
      data: { classId: kelas.id },
    });
  }

  // 6. Materi
  const m1 = await prisma.material.create({
    data: {
      title: "Bilangan Bulat",
      classSubjectId: cs1.id,
      difficulty: "EASY",
      isPublished: true,
      orderIndex: 1,
    },
  });
  const m2 = await prisma.material.create({
    data: {
      title: "Tata Surya",
      classSubjectId: cs2.id,
      difficulty: "MEDIUM",
      isPublished: true,
      orderIndex: 1,
    },
  });

  // 7. Soal
  await prisma.question.create({
    data: {
      materialId: m1.id,
      questionText: "Berapa hasil dari 5 + 3?",
      options: ["5", "8", "10", "15"],
      correctAnswer: "8",
      difficulty: "EASY",
      orderIndex: 1,
    },
  });
  await prisma.question.create({
    data: {
      materialId: m1.id,
      questionText: "Berapa hasil dari 12 - 7?",
      options: ["4", "5", "6", "7"],
      correctAnswer: "5",
      difficulty: "EASY",
      orderIndex: 2,
    },
  });
  await prisma.question.create({
    data: {
      materialId: m2.id,
      questionText: "Planet terdekat dengan Matahari adalah?",
      options: ["Venus", "Merkurius", "Bumi", "Mars"],
      correctAnswer: "Merkurius",
      difficulty: "EASY",
      orderIndex: 1,
    },
  });

  // 8. Progress siswa
  if (student) {
    await prisma.studentProgress.create({
      data: {
        studentId: student.id,
        classSubjectId: cs1.id,
        completionPercent: 50,
        totalScore: 80,
        adaptiveLevel: "STANDARD",
      },
    });
    await prisma.studentProgress.create({
      data: {
        studentId: student.id,
        classSubjectId: cs2.id,
        completionPercent: 30,
        totalScore: 60,
        adaptiveLevel: "STANDARD",
      },
    });
  }

  console.log("Data dummy berhasil diisi!");
  console.log(`  Kelas: ${kelas.name}`);
  console.log(`  Mapel: ${mtk.name}, ${ipa.name}`);
  console.log(`  Materi: ${m1.title}, ${m2.title}`);
  console.log(`  Soal: 3 soal`);
  console.log(`  Siswa terdaftar di ${kelas.name}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
