import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  database: "rsi_ian",
  user: "postgres",
  password: "postgres",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Seed user ──
  const passwordHash = await bcrypt.hash("password123", 10);

  const uKepsek = await prisma.user.create({
    data: { email: "kepsek@test.com", passwordHash, role: "PRINCIPAL", name: "Kepsek Sekolah", isActive: true },
  });
  await prisma.principal.create({ data: { userId: uKepsek.id, nip: "199001012010011001" } });

  const uGuru = await prisma.user.create({
    data: { email: "guru@test.com", passwordHash, role: "TEACHER", name: "Guru Matematika", isActive: true },
  });
  const teacher = await prisma.teacher.create({ data: { userId: uGuru.id, nip: "198505152010012002" } });

  const uSiswa1 = await prisma.user.create({
    data: { email: "siswa@test.com", passwordHash, role: "STUDENT", name: "Budi Santoso", isActive: true },
  });
  const uSiswa2 = await prisma.user.create({
    data: { email: "siswa2@test.com", passwordHash, role: "STUDENT", name: "Siti Rahmawati", isActive: true },
  });
  const uSiswa3 = await prisma.user.create({
    data: { email: "siswa3@test.com", passwordHash, role: "STUDENT", name: "Ahmad Fauzi", isActive: true },
  });

  const uOrtu = await prisma.user.create({
    data: { email: "ortu@test.com", passwordHash, role: "PARENT", name: "Orang Tua Budi", isActive: true },
  });
  await prisma.parent.create({ data: { userId: uOrtu.id, phone: "08123456789" } });

  console.log("✓ 5 user test dibuat");

  // ── Kelas ──
  const kelasA = await prisma.class.create({ data: { name: "X-A", gradeLevel: 10, academicYear: 2026 } });
  const kelasB = await prisma.class.create({ data: { name: "X-B", gradeLevel: 10, academicYear: 2026 } });

  // ── Subject ──
  const mtk = await prisma.subject.create({ data: { name: "Matematika", code: "MTK" } });
  const ipa = await prisma.subject.create({ data: { name: "Ilmu Pengetahuan Alam", code: "IPA" } });
  const bindo = await prisma.subject.create({ data: { name: "Bahasa Indonesia", code: "BINDO" } });
  const ips = await prisma.subject.create({ data: { name: "Ilmu Pengetahuan Sosial", code: "IPS" } });

  console.log("✓ 2 kelas, 4 mapel dibuat");

  // ── ClassSubject ──
  const cs1 = await prisma.classSubject.create({
    data: { classId: kelasA.id, subjectId: mtk.id, teacherId: teacher.id, semester: 1, academicYear: 2026 },
  });
  const cs2 = await prisma.classSubject.create({
    data: { classId: kelasA.id, subjectId: ipa.id, teacherId: teacher.id, semester: 1, academicYear: 2026 },
  });
  const cs3 = await prisma.classSubject.create({
    data: { classId: kelasA.id, subjectId: bindo.id, teacherId: teacher.id, semester: 1, academicYear: 2026 },
  });
  const cs4 = await prisma.classSubject.create({
    data: { classId: kelasB.id, subjectId: mtk.id, teacherId: teacher.id, semester: 1, academicYear: 2026 },
  });

  console.log("✓ 4 ClassSubject dibuat");

  // ── Siswa ──
  const s1 = await prisma.student.create({ data: { userId: uSiswa1.id, nis: "1234567890", classId: kelasA.id } });
  const s2 = await prisma.student.create({ data: { userId: uSiswa2.id, nis: "1234567891", classId: kelasA.id } });
  const s3 = await prisma.student.create({ data: { userId: uSiswa3.id, nis: "1234567892", classId: kelasB.id } });

  console.log("✓ 3 siswa dibuat");

  // ── Materi ──
  const m_mtk_1 = await prisma.material.create({
    data: { title: "Bilangan Bulat", classSubjectId: cs1.id, difficulty: "EASY", isPublished: true, orderIndex: 1 },
  });
  const m_mtk_2 = await prisma.material.create({
    data: { title: "Pecahan", classSubjectId: cs1.id, difficulty: "MEDIUM", isPublished: true, orderIndex: 2 },
  });
  const m_mtk_3 = await prisma.material.create({
    data: { title: "Bangun Datar", classSubjectId: cs1.id, difficulty: "HARD", isPublished: true, orderIndex: 3 },
  });
  const m_ipa_1 = await prisma.material.create({
    data: { title: "Tata Surya", classSubjectId: cs2.id, difficulty: "EASY", isPublished: true, orderIndex: 1 },
  });
  const m_ipa_2 = await prisma.material.create({
    data: { title: "Sistem Pencernaan", classSubjectId: cs2.id, difficulty: "MEDIUM", isPublished: true, orderIndex: 2 },
  });
  const m_bindo_1 = await prisma.material.create({
    data: { title: "Teks Deskripsi", classSubjectId: cs3.id, difficulty: "EASY", isPublished: true, orderIndex: 1 },
  });

  console.log("✓ 6 materi dibuat");

  // ── Soal ──
  const soalData = [
    { m: m_mtk_1.id, q: "Berapa hasil dari 5 + 3?", o: ["5", "8", "10", "15"], a: "8", d: "EASY", i: 1 },
    { m: m_mtk_1.id, q: "Berapa hasil dari 12 - 7?", o: ["4", "5", "6", "7"], a: "5", d: "EASY", i: 2 },
    { m: m_mtk_1.id, q: "Hasil dari -3 + 7 adalah...", o: ["-10", "-4", "4", "10"], a: "4", d: "MEDIUM", i: 3 },
    { m: m_mtk_1.id, q: "25 + (-10) = ...", o: ["-35", "15", "35", "-15"], a: "15", d: "MEDIUM", i: 4 },
    { m: m_mtk_2.id, q: "1/2 + 1/4 = ...", o: ["1/6", "2/6", "3/4", "1/4"], a: "3/4", d: "MEDIUM", i: 1 },
    { m: m_mtk_2.id, q: "2/3 dari 90 adalah...", o: ["45", "60", "30", "75"], a: "60", d: "MEDIUM", i: 2 },
    { m: m_mtk_3.id, q: "Luas persegi dengan sisi 5 cm adalah...", o: ["10 cm²", "15 cm²", "20 cm²", "25 cm²"], a: "25 cm²", d: "HARD", i: 1 },
    { m: m_ipa_1.id, q: "Planet terdekat dengan Matahari adalah?", o: ["Venus", "Merkurius", "Bumi", "Mars"], a: "Merkurius", d: "EASY", i: 1 },
    { m: m_ipa_1.id, q: "Bumi mengelilingi Matahari disebut...", o: ["Rotasi", "Revolusi", "Presesi", "Nutasi"], a: "Revolusi", d: "MEDIUM", i: 2 },
    { m: m_ipa_2.id, q: "Organ pencernaan yang menghasilkan enzim amilase adalah...", o: ["Lambung", "Hati", "Pankreas", "Usus"], a: "Pankreas", d: "HARD", i: 1 },
    { m: m_bindo_1.id, q: "Teks yang menggambarkan suatu objek disebut...", o: ["Narasi", "Deskripsi", "Eksposisi", "Argumentasi"], a: "Deskripsi", d: "EASY", i: 1 },
  ];

  for (const s of soalData) {
    await prisma.question.create({
      data: { materialId: s.m, questionText: s.q, options: s.o, correctAnswer: s.a, difficulty: s.d, orderIndex: s.i },
    });
  }

  console.log("✓ 11 soal dibuat");

  // ── StudentProgress ──
  const students = [s1, s2, s3];
  const classSubjects = [cs1, cs2, cs3];
  for (const st of students) {
    for (const cs of classSubjects) {
      if (st.classId === kelasB.id && cs.classId !== kelasB.id) continue;
      if (st.classId !== kelasB.id && cs.classId === kelasB.id) continue;

      await prisma.studentProgress.create({
        data: {
          studentId: st.id,
          classSubjectId: cs.id,
          completionPercent: Math.floor(Math.random() * 80) + 10,
          totalScore: Math.floor(Math.random() * 100),
          adaptiveLevel: ["STANDARD", "MEDIUM", "HARD"][Math.floor(Math.random() * 3)],
        },
      });
    }
  }

  console.log("✓ StudentProgress dibuat");

  // ── Quiz Sessions ──
  const q1 = await prisma.quizSession.create({
    data: {
      studentId: s1.id, classSubjectId: cs1.id, materialId: m_mtk_1.id,
      score: 80, correctCount: 2, wrongCount: 0, livesUsed: 0, streakCount: 2, resultLevel: "STANDARD",
    },
  });
  const q2 = await prisma.quizSession.create({
    data: {
      studentId: s1.id, classSubjectId: cs2.id, materialId: m_ipa_1.id,
      score: 60, correctCount: 1, wrongCount: 0, livesUsed: 1, streakCount: 1, resultLevel: "STANDARD",
    },
  });
  const q3 = await prisma.quizSession.create({
    data: {
      studentId: s2.id, classSubjectId: cs1.id, materialId: m_mtk_1.id,
      score: 100, correctCount: 2, wrongCount: 0, livesUsed: 0, streakCount: 3, resultLevel: "STANDARD",
    },
  });

  const qEasy = await prisma.question.findFirst({ where: { materialId: m_mtk_1.id, difficulty: "EASY" } });
  const qIpa = await prisma.question.findFirst({ where: { materialId: m_ipa_1.id, difficulty: "EASY" } });
  const qMed = await prisma.question.findFirst({ where: { materialId: m_mtk_1.id, difficulty: "MEDIUM" } });

  await prisma.quizAnswer.create({ data: { session: { connect: { id: q1.id } }, question: { connect: { id: qEasy!.id } }, answerGiven: "8", isCorrect: true } });
  await prisma.quizAnswer.create({ data: { session: { connect: { id: q2.id } }, question: { connect: { id: qIpa!.id } }, answerGiven: "Merkurius", isCorrect: true } });
  await prisma.quizAnswer.create({ data: { session: { connect: { id: q3.id } }, question: { connect: { id: qMed!.id } }, answerGiven: "4", isCorrect: true } });

  console.log("✓ 3 Quiz Sessions + jawaban dibuat");

  console.log("\n✅ SEED SELESAI!");
  console.log("   Kepsek: kepsek@test.com / password123");
  console.log("   Guru:   guru@test.com / password123");
  console.log("   Siswa:  siswa@test.com / password123");
  console.log("   Siswa2: siswa2@test.com / password123");
  console.log("   Siswa3: siswa3@test.com / password123");
  console.log("   Ortu:   ortu@test.com / password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
