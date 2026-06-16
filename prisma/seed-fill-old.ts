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

const extraQuestions: Record<string, { q: string; o: string[]; a: string; d: string }[]> = {
  "Bilangan Bulat": [
    { q: "-8 + 12 = ?", o: ["-20","4","20","-4"], a: "4", d: "EASY" },
    { q: "36 : (-6) = ?", o: ["6","-6","-30","30"], a: "-6", d: "EASY" },
    { q: "-15 - (-8) = ?", o: ["-23","-7","7","23"], a: "-7", d: "EASY" },
    { q: "125 + (-75) = ?", o: ["200","50","-200","-50"], a: "50", d: "EASY" },
    { q: "(-12) x 3 = ?", o: ["36","-36","9","-9"], a: "-36", d: "EASY" },
  ],
  "Pecahan": [
    { q: "1 1/2 + 2 1/4 = ?", o: ["3 1/4","3 3/4","4 1/4","2 3/4"], a: "3 3/4", d: "MEDIUM" },
    { q: "3/8 + 1/2 = ?", o: ["4/10","5/8","7/8","3/4"], a: "7/8", d: "MEDIUM" },
    { q: "2 2/5 - 1 1/3 = ?", o: ["1 1/2","1 1/15","1 1/5","1 2/15"], a: "1 1/15", d: "MEDIUM" },
    { q: "0,25 + 0,75 = ?", o: ["0,5","1","1,5","2"], a: "1", d: "MEDIUM" },
    { q: "12% dari 200 = ?", o: ["12","24","36","48"], a: "24", d: "MEDIUM" },
    { q: "4/7 + 3/7 = ?", o: ["1","7/14","7/7","1/7"], a: "1", d: "MEDIUM" },
    { q: "9/10 - 3/5 = ?", o: ["2/5","6/10","3/10","6/5"], a: "3/10", d: "MEDIUM" },
    { q: "Bentuk pecahan dari 0,6 adalah ?", o: ["6/10","3/5","6/100","3/10"], a: "3/5", d: "MEDIUM" },
  ],
  "Bangun Datar": [
    { q: "Luas belah ketupat d1=8 cm, d2=6 cm ?", o: ["24 cm²","48 cm²","14 cm²","28 cm²"], a: "24 cm²", d: "HARD" },
    { q: "Luas layang-layang d1=12 cm, d2=9 cm ?", o: ["54 cm²","108 cm²","42 cm²","84 cm²"], a: "54 cm²", d: "HARD" },
    { q: "Keliling persegi dengan luas 49 cm² ?", o: ["14 cm","28 cm","21 cm","35 cm"], a: "28 cm", d: "HARD" },
    { q: "Luas lingkaran d=20 cm (π=3,14) ?", o: ["314 cm²","628 cm²","157 cm²","1256 cm²"], a: "314 cm²", d: "HARD" },
    { q: "Panjang busur sudut 60° r=7 cm (π=22/7) ?", o: ["7,33 cm","14,67 cm","22 cm","44 cm"], a: "7,33 cm", d: "HARD" },
    { q: "Luas segitiga siku-siku dengan sisi 3,4,5 ?", o: ["6 cm²","12 cm²","10 cm²","20 cm²"], a: "6 cm²", d: "HARD" },
    { q: "Luas persegi panjang dengan p=15 cm l=6 cm ?", o: ["42 cm²","90 cm²","60 cm²","80 cm²"], a: "90 cm²", d: "HARD" },
    { q: "Keliling lingkaran r=21 cm (π=22/7) ?", o: ["66 cm","132 cm","44 cm","154 cm"], a: "132 cm", d: "HARD" },
    { q: "Luas permukaan kubus s=10 cm ?", o: ["100 cm²","200 cm²","600 cm²","1000 cm²"], a: "600 cm²", d: "HARD" },
  ],
  "Tata Surya": [
    { q: "Planet terpanas di tata surya ?", o: ["Merkurius","Venus","Mars","Jupiter"], a: "Venus", d: "EASY" },
    { q: "Jumlah planet di tata surya ?", o: ["7","8","9","10"], a: "8", d: "EASY" },
    { q: "Planet yang dijuluki Planet Merah ?", o: ["Venus","Mars","Jupiter","Saturnus"], a: "Mars", d: "EASY" },
    { q: "Asteroid terletak di antara orbit ?", o: ["Mars-Jupiter","Bumi-Mars","Jupiter-Saturnus","Venus-Bumi"], a: "Mars-Jupiter", d: "EASY" },
    { q: "Bumi membutuhkan waktu ... hari untuk berevolusi ?", o: ["360","365","366","370"], a: "365", d: "EASY" },
    { q: "Satelit terbesar Jupiter bernama ?", o: ["Titan","Europa","Ganymede","Io"], a: "Ganymede", d: "EASY" },
    { q: "Gerhana bulan terjadi saat ?", o: ["Bumi di antara M dan B","Bulan di antara M dan B","M di antara B dan B","Semua benar"], a: "Bumi di antara M dan B", d: "EASY" },
    { q: "Pasang surut air laut dipengaruhi oleh ?", o: ["Matahari","Bulan","Angin","Gempa"], a: "Bulan", d: "EASY" },
  ],
  "Teks Deskripsi": [
    { q: "Objek yang dideskripsikan dapat berupa ?", o: ["Orang, hewan, tempat","Hanya orang","Hanya tempat","Hanya peristiwa"], a: "Orang, hewan, tempat", d: "EASY" },
    { q: "Kata kerja yang sering muncul dalam deskripsi ?", o: ["Kata kerja aksi","Kata kerja mental","Kata kerja material","Semua benar"], a: "Kata kerja mental", d: "EASY" },
    { q: "Penggunaan kata depan 'di' yang benar dalam deskripsi ?", o: ["Dirumah","di rumah","Di rumah","diRumah"], a: "Di rumah", d: "EASY" },
    { q: "Kalimat 'Pemandangannya sangat indah' termasuk ?", o: ["Fakta","Opini","Data","Informasi"], a: "Opini", d: "EASY" },
    { q: "Kata sinonim 'elok' adalah ?", o: ["Jelek","Indah","Biasa","Kotor"], a: "Indah", d: "EASY" },
    { q: "Contoh kata sifat warna adalah ?", o: ["Biru","Berlari","Dengan","Dan"], a: "Biru", d: "EASY" },
    { q: "Teks deskripsi menggunakan kalimat ?", o: ["Tanya","Perintah","Berita","Seru"], a: "Berita", d: "EASY" },
    { q: "Fungsi deskripsi bagi pembaca adalah ?", o: ["Membayangkan objek","Membuat cerita","Menyusun argumen","Mencari data"], a: "Membayangkan objek", d: "EASY" },
    { q: "Bagian identifikasi (ID) berisi ?", o: ["Nama objek","Detail objek","Kesan penulis","Penutup"], a: "Nama objek", d: "EASY" },
  ],
};

async function main() {
  const cls = await prisma.class.findFirst({ where: { name: "X-A" } });
  if (!cls) { console.error("Kelas X-A tidak ditemukan"); return; }

  for (const [title, questions] of Object.entries(extraQuestions)) {
    const material = await prisma.material.findFirst({
      where: { title, classSubject: { classId: cls.id } },
    });
    if (!material) { console.log(`  Materi "${title}" tidak ditemukan`); continue; }

    const existingCount = await prisma.question.count({ where: { materialId: material.id } });

    if (existingCount >= 10) { console.log(`  "${title}" sudah ${existingCount} soal, skip`); continue; }

    let added = 0;
    for (const q of questions) {
      const exists = await prisma.question.findFirst({
        where: { materialId: material.id, questionText: q.q },
      });
      if (!exists) {
        await prisma.question.create({
          data: {
            materialId: material.id,
            questionText: q.q,
            options: q.o,
            correctAnswer: q.a,
            difficulty: q.d,
            orderIndex: existingCount + added + 1,
          },
        });
        added++;
      }
    }
    console.log(`  "${title}" → +${added} soal (total ${existingCount + added})`);
  }

  console.log("\n✅ Semua materi lama sudah dilengkapi!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
