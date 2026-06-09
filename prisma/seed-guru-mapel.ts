import dotenv from "dotenv";
import path from "path";
// Paksa dotenv mencari file .env di root folder proyek
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Sederhanakan Pool langsung menggunakan DATABASE_URL agar aman dan tidak typo port
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// ... sisa kode main() di bawahnya tetap sama ...

const SUBJECT_TEACHERS = [
  { name: "Bu Aizawa",   email: "aizawa@test.com",   subjectCode: "MTK" },
  { name: "Bu Kitagawa", email: "kitagawa@test.com", subjectCode: "IPA" },
  { name: "Pak Shino",   email: "shino@test.com",    subjectCode: "BINDO" },
  { name: "Pak Oni",     email: "oni@test.com",      subjectCode: "IPS" },
  { name: "Pak Deku",    email: "deku@test.com",     subjectCode: "PPKN" },
  { name: "Bu Cherine",  email: "cherine@test.com",  subjectCode: "BING" },
];

async function main() {
  const ph = await bcrypt.hash("password123", 12);
  const subjects = await prisma.subject.findMany();
  const classes = await prisma.class.findMany();

  // Remove Bu Dewi from all classSubjects first
  const buDewi = await prisma.teacher.findFirst({
    where: { user: { email: "guru@test.com" } },
  });
  if (buDewi) {
    await prisma.classSubject.updateMany({
      where: { teacherId: buDewi.id },
      data: { teacherId: null },
    });
    console.log("Cleared Bu Dewi from all class subjects");
  }

  for (const def of SUBJECT_TEACHERS) {
    const subj = subjects.find(s => s.code === def.subjectCode);
    if (!subj) { console.warn(`Subject ${def.subjectCode} not found`); continue; }

    // Check if teacher already exists
    let teacher = await prisma.teacher.findFirst({
      where: { user: { email: def.email } },
    });

    if (!teacher) {
      const user = await prisma.user.create({
        data: { email: def.email, passwordHash: ph, role: "TEACHER", name: def.name },
      });
      teacher = await prisma.teacher.create({
        data: { userId: user.id, nip: `1985${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}` },
      });
      console.log(`Created: ${def.name} (${def.email})`);
    }

    // Assign to subject for all classes
    for (const cls of classes) {
      const cs = await prisma.classSubject.findFirst({
        where: { classId: cls.id, subjectId: subj.id },
      });
      if (cs && !cs.teacherId) {
        await prisma.classSubject.update({
          where: { id: cs.id },
          data: { teacherId: teacher.id },
        });
        console.log(`  ${def.name} -> ${subj.name} (${cls.name})`);
      }
    }
  }

  // Assign Bu Dewi as homeroom teacher for all classes
  if (buDewi) {
    for (const cls of classes) {
      if (!cls.homeroomTeacherId) {
        await prisma.class.update({
          where: { id: cls.id },
          data: { homeroomTeacherId: buDewi.id },
        });
        console.log(`Bu Dewi -> Wali Kelas ${cls.name}`);
      }
    }
  }

  console.log("\nDone! Subject teachers assigned.");
  await prisma.$disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
