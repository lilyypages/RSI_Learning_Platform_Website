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
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  await prisma.quizAnswer.deleteMany();
  await prisma.quizSession.deleteMany();
  await prisma.studentProgress.deleteMany();
  await prisma.pointLog.deleteMany();
  await prisma.question.deleteMany();
  await prisma.material.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.principal.deleteMany();
  await prisma.user.deleteMany();
  console.log("deleted old data");

  const ph = await bcrypt.hash("password123", 10);

  const uKepsek = await prisma.user.create({
    data: { email: "kepsek@test.com", passwordHash: ph, role: "PRINCIPAL", name: "Kepsek SD Nusantara" },
  });
  await prisma.principal.create({ data: { userId: uKepsek.id, nip: "197501012010011001" } });

  const uGuru = await prisma.user.create({
    data: { email: "guru@test.com", passwordHash: ph, role: "TEACHER", name: "Bu Dewi Guru Kelas" },
  });
  const teacher = await prisma.teacher.create({ data: { userId: uGuru.id, nip: "198505152010012002" } });

  const uSimon = await prisma.user.create({
    data: { email: "simon@test.com", passwordHash: ph, role: "STUDENT", name: "Simon Pratama" },
  });
  const uBudi = await prisma.user.create({
    data: { email: "siswa@test.com", passwordHash: ph, role: "STUDENT", name: "Budi Santoso" },
  });
  const uSiti = await prisma.user.create({
    data: { email: "siswa2@test.com", passwordHash: ph, role: "STUDENT", name: "Siti Rahmawati" },
  });

  const uOrtu = await prisma.user.create({
    data: { email: "ortu@test.com", passwordHash: ph, role: "PARENT", name: "Orang Tua Simon" },
  });
  const parent = await prisma.parent.create({ data: { userId: uOrtu.id, phone: "08123456789" } });

  const kelas6A = await prisma.class.create({ data: { name: "6-A", gradeLevel: 6, academicYear: 2026 } });

  const subjDefs = [
    { name: "Matematika", code: "MTK" },
    { name: "Ilmu Pengetahuan Alam", code: "IPA" },
    { name: "Bahasa Indonesia", code: "BINDO" },
    { name: "Ilmu Pengetahuan Sosial", code: "IPS" },
    { name: "PPKn", code: "PPKN" },
    { name: "Bahasa Inggris", code: "BING" },
  ];
  const subjects: Record<string, any> = {};
  for (const sd of subjDefs) {
    subjects[sd.code] = await prisma.subject.create({ data: sd });
  }

  const css: Record<string, any> = {};
  for (const sd of subjDefs) {
    css[sd.code] = await prisma.classSubject.create({
      data: { classId: kelas6A.id, subjectId: subjects[sd.code].id, teacherId: teacher.id, semester: 1, academicYear: 2026 },
    });
  }

  const simon = await prisma.student.create({
    data: { userId: uSimon.id, nis: "0061234567", classId: kelas6A.id, parentId: parent.id, birthdate: new Date("2014-05-12") },
  });
  const budi = await prisma.student.create({
    data: { userId: uBudi.id, nis: "0061234568", classId: kelas6A.id, birthdate: new Date("2014-03-20") },
  });
  const siti = await prisma.student.create({
    data: { userId: uSiti.id, nis: "0061234569", classId: kelas6A.id, birthdate: new Date("2014-07-15") },
  });

  type Q = { q: string; o: string[]; a: string; d: string };
  const M = (csKey: string, title: string, diff: string, qs: Q[]) => ({ csKey, title, diff, qs });

  const all = [
    // MTK
    M("MTK", "Bilangan Bulat", "EASY", [
      { q: "5 + 3 = ?", o: ["5","8","10","15"], a: "8", d: "EASY" },
      { q: "12 - 7 = ?", o: ["4","5","6","7"], a: "5", d: "EASY" },
      { q: "15 + 8 = ?", o: ["21","22","23","24"], a: "23", d: "EASY" },
      { q: "100 - 45 = ?", o: ["45","55","65","75"], a: "55", d: "EASY" },
      { q: "8 x 6 = ?", o: ["42","48","54","56"], a: "48", d: "EASY" },
      { q: "72 : 9 = ?", o: ["6","7","8","9"], a: "8", d: "EASY" },
      { q: "25 + 17 = ?", o: ["32","42","52","62"], a: "42", d: "EASY" },
      { q: "200 - 86 = ?", o: ["104","114","124","134"], a: "114", d: "EASY" },
      { q: "7 x 9 = ?", o: ["56","63","72","81"], a: "63", d: "EASY" },
      { q: "81 : 9 = ?", o: ["7","8","9","10"], a: "9", d: "EASY" },
    ]),
    M("MTK", "Pecahan", "MEDIUM", [
      { q: "1/2 + 1/4 = ?", o: ["1/6","2/6","3/4","1/4"], a: "3/4", d: "MEDIUM" },
      { q: "3/5 + 1/5 = ?", o: ["2/5","4/5","3/10","5/3"], a: "4/5", d: "MEDIUM" },
      { q: "5/6 - 1/3 = ?", o: ["1/2","4/6","2/3","3/6"], a: "1/2", d: "MEDIUM" },
      { q: "2/4 disederhanakan menjadi ?", o: ["1/4","1/2","2/8","4/2"], a: "1/2", d: "MEDIUM" },
      { q: "3/8 + 1/4 = ?", o: ["4/12","5/8","3/12","7/8"], a: "5/8", d: "MEDIUM" },
      { q: "7/10 - 2/5 = ?", o: ["3/10","5/5","9/10","1/2"], a: "3/10", d: "MEDIUM" },
      { q: "Bentuk desimal dari 3/4 = ?", o: ["0,25","0,5","0,75","1,25"], a: "0,75", d: "MEDIUM" },
      { q: "1/3 + 1/6 = ?", o: ["2/9","1/2","2/6","3/6"], a: "1/2", d: "MEDIUM" },
      { q: "4/5 - 1/10 = ?", o: ["3/5","7/10","3/10","8/10"], a: "7/10", d: "MEDIUM" },
      { q: "12% dari 200 = ?", o: ["12","24","36","48"], a: "24", d: "MEDIUM" },
    ]),
    M("MTK", "Bangun Datar", "HARD", [
      { q: "Luas persegi s = 5 cm ?", o: ["10 cm2","15 cm2","20 cm2","25 cm2"], a: "25 cm2", d: "HARD" },
      { q: "Keliling persegi panjang 6 x 4 cm ?", o: ["10 cm","20 cm","24 cm","30 cm"], a: "20 cm", d: "HARD" },
      { q: "Luas segitiga a = 8 cm, t = 6 cm ?", o: ["14 cm2","24 cm2","48 cm2","28 cm2"], a: "24 cm2", d: "HARD" },
      { q: "Luas lingkaran r = 7 cm (phi = 22/7) ?", o: ["154 cm2","44 cm2","77 cm2","308 cm2"], a: "154 cm2", d: "HARD" },
      { q: "Keliling lingkaran d = 14 cm ?", o: ["44 cm","22 cm","88 cm","66 cm"], a: "44 cm", d: "HARD" },
      { q: "Luas persegi panjang p = 15 cm, l = 6 cm ?", o: ["42 cm2","90 cm2","60 cm2","80 cm2"], a: "90 cm2", d: "HARD" },
      { q: "Keliling segitiga sama sisi s = 9 cm ?", o: ["18 cm","27 cm","36 cm","81 cm"], a: "27 cm", d: "HARD" },
      { q: "Volume kubus s = 4 cm ?", o: ["16 cm3","64 cm3","32 cm3","48 cm3"], a: "64 cm3", d: "HARD" },
      { q: "Volume balok 5 x 3 x 2 cm ?", o: ["10 cm3","15 cm3","30 cm3","25 cm3"], a: "30 cm3", d: "HARD" },
    ]),
    M("MTK", "KPK dan FPB", "MEDIUM", [
      { q: "FPB dari 12 dan 18 ?", o: ["2","3","6","9"], a: "6", d: "MEDIUM" },
      { q: "KPK dari 4 dan 6 ?", o: ["8","10","12","24"], a: "12", d: "MEDIUM" },
      { q: "FPB dari 24 dan 36 ?", o: ["4","6","12","18"], a: "12", d: "MEDIUM" },
      { q: "KPK dari 6 dan 8 ?", o: ["14","16","24","48"], a: "24", d: "MEDIUM" },
      { q: "FPB dari 15 dan 20 ?", o: ["3","4","5","10"], a: "5", d: "MEDIUM" },
    ]),
    M("MTK", "Skala dan Denah", "MEDIUM", [
      { q: "Skala 1:100.000, jarak peta 4 cm, jarak sebenarnya ?", o: ["4 km","40 km","400 km","0,4 km"], a: "4 km", d: "MEDIUM" },
      { q: "Jarak sebenarnya 6 km, skala 1:200.000, jarak peta ?", o: ["2 cm","3 cm","4 cm","5 cm"], a: "3 cm", d: "MEDIUM" },
      { q: "Denah skala 1:500, panjang rumah 8 cm, panjang asli ?", o: ["40 m","50 m","60 m","80 m"], a: "40 m", d: "MEDIUM" },
    ]),

    // IPA
    M("IPA", "Tata Surya", "EASY", [
      { q: "Planet terdekat dengan Matahari ?", o: ["Venus","Merkurius","Bumi","Mars"], a: "Merkurius", d: "EASY" },
      { q: "Bumi mengelilingi Matahari disebut ?", o: ["Rotasi","Revolusi","Presesi","Nutasi"], a: "Revolusi", d: "EASY" },
      { q: "Planet terbesar di tata surya ?", o: ["Saturnus","Jupiter","Neptunus","Uranus"], a: "Jupiter", d: "EASY" },
      { q: "Satelit alami Bumi ?", o: ["Matahari","Bulan","Bintang","Asteroid"], a: "Bulan", d: "EASY" },
      { q: "Planet yang bercincin ?", o: ["Jupiter","Uranus","Neptunus","Saturnus"], a: "Saturnus", d: "EASY" },
      { q: "Penyebab siang dan malam ?", o: ["Revolusi Bumi","Rotasi Bumi","Gerhana","Gravitasi"], a: "Rotasi Bumi", d: "EASY" },
      { q: "Planet yang disebut Bintang Kejora ?", o: ["Mars","Venus","Merkurius","Jupiter"], a: "Venus", d: "EASY" },
      { q: "Gerhana matahari terjadi saat ?", o: ["Bumi di antara M dan B","Bulan di antara M dan B","M di antara B dan B","Semua benar"], a: "Bulan di antara M dan B", d: "EASY" },
      { q: "Bumi berevolusi selama ... hari ?", o: ["360","365","366","370"], a: "365", d: "EASY" },
      { q: "Jumlah planet di tata surya ?", o: ["7","8","9","10"], a: "8", d: "EASY" },
    ]),
    M("IPA", "Makhluk Hidup", "EASY", [
      { q: "Ciri makhluk hidup adalah ?", o: ["Bergerak","Berpikir","Berbicara","Tertawa"], a: "Bergerak", d: "EASY" },
      { q: "Tumbuhan membuat makanan melalui ?", o: ["Fotosintesis","Respirasi","Fermentasi","Osmosis"], a: "Fotosintesis", d: "EASY" },
      { q: "Hewan pemakan daging disebut ?", o: ["Herbivor","Karnivor","Omnivor","Insektivor"], a: "Karnivor", d: "EASY" },
      { q: "Manusia bernapas mengeluarkan ?", o: ["Oksigen","CO2","Nitrogen","Hidrogen"], a: "CO2", d: "EASY" },
      { q: "Hewan berkembang biak dengan cara ?", o: ["Bertelur","Melahirkan","Keduanya","Semua benar"], a: "Semua benar", d: "EASY" },
      { q: "Kucing berkembang biak dengan cara ?", o: ["Bertelur","Melahirkan","Membelah diri","Tunas"], a: "Melahirkan", d: "EASY" },
    ]),
    M("IPA", "Rangka dan Otot", "MEDIUM", [
      { q: "Tulang yang melindungi otak ?", o: ["Tulang dada","Tulang rusuk","Tengkorak","Tulang belakang"], a: "Tengkorak", d: "MEDIUM" },
      { q: "Jumlah tulang rusuk manusia ?", o: ["12 pasang","24 pasang","6 pasang","18 pasang"], a: "12 pasang", d: "MEDIUM" },
      { q: "Otot yang bekerja tanpa sadar disebut ?", o: ["Otot lurik","Otot polos","Otot jantung","Otot rangka"], a: "Otot polos", d: "MEDIUM" },
      { q: "Fungsi rangka adalah ?", o: ["Melindungi organ","Membentuk tubuh","Tempat otot","Semua benar"], a: "Semua benar", d: "MEDIUM" },
    ]),
    M("IPA", "Sumber Daya Alam", "EASY", [
      { q: "SDA yang dapat diperbarui contohnya ?", o: ["Minyak bumi","Batu bara","Air","Emas"], a: "Air", d: "EASY" },
      { q: "Energi utama di Bumi berasal dari ?", o: ["Bulan","Bintang","Matahari","Api"], a: "Matahari", d: "EASY" },
      { q: "Minyak bumi termasuk SDA yang ?", o: ["Terbarukan","Tidak terbarukan","Hayati","Organik"], a: "Tidak terbarukan", d: "EASY" },
      { q: "Contoh energi alternatif ramah lingkungan ?", o: ["Batu bara","Solar","Tenaga surya","Bensin"], a: "Tenaga surya", d: "EASY" },
    ]),
    M("IPA", "Gaya dan Gerak", "EASY", [
      { q: "Gaya menyebabkan benda ?", o: ["Diam","Bergerak","Berubah bentuk","Semua benar"], a: "Semua benar", d: "EASY" },
      { q: "Satuan gaya dalam SI ?", o: ["Kg","Newton","Joule","Watt"], a: "Newton", d: "EASY" },
      { q: "Gaya tarik Bumi disebut ?", o: ["Listrik","Magnet","Gravitasi","Gesek"], a: "Gravitasi", d: "EASY" },
      { q: "Semakin besar massa benda, gaya gravitasi semakin ?", o: ["Kecil","Besar","Sama","Nol"], a: "Besar", d: "EASY" },
    ]),

    // BINDO
    M("BINDO", "Teks Deskripsi", "EASY", [
      { q: "Teks yang menggambarkan objek disebut ?", o: ["Narasi","Deskripsi","Eksposisi","Argumentasi"], a: "Deskripsi", d: "EASY" },
      { q: "Ciri teks deskripsi ?", o: ["Berisi percakapan","Menggambarkan detail","Berisi argumen","Berisi petunjuk"], a: "Menggambarkan detail", d: "EASY" },
      { q: "Tujuan teks deskripsi ?", o: ["Membujuk","Menggambarkan","Menjelaskan cara","Menceritakan"], a: "Menggambarkan", d: "EASY" },
      { q: "Sinonim indah ?", o: ["Jelek","Cantik","Kotor","Busuk"], a: "Cantik", d: "EASY" },
      { q: "Contoh kalimat deskripsi ?", o: ["Ibu pergi pasar","Rumah itu besar nyaman","Adik belajar","Ayah baca koran"], a: "Rumah itu besar nyaman", d: "EASY" },
      { q: "Kata yang sering muncul dalam deskripsi adalah kata ?", o: ["Sifat","Kerja","Tanya","Sambung"], a: "Sifat", d: "EASY" },
    ]),
    M("BINDO", "Pantun", "MEDIUM", [
      { q: "Pantun terdiri dari ... baris ?", o: ["2","3","4","5"], a: "4", d: "MEDIUM" },
      { q: "Baris 1-2 pantun disebut ?", o: ["Isi","Sampiran","Bait","Larik"], a: "Sampiran", d: "MEDIUM" },
      { q: "Baris 3-4 pantun disebut ?", o: ["Sampiran","Isi","Bait","Larik"], a: "Isi", d: "MEDIUM" },
      { q: "Rima akhir pantun yang benar ?", o: ["a-b-a-b","a-a-a-a","a-b-b-a","a-a-b-b"], a: "a-b-a-b", d: "MEDIUM" },
      { q: "Buah mangga buah pepaya termasuk bagian ?", o: ["Isi","Sampiran","Amanat","Judul"], a: "Sampiran", d: "MEDIUM" },
    ]),
    M("BINDO", "Cerita Fiksi", "EASY", [
      { q: "Cerita rekaan disebut ?", o: ["Fiksi","Nonfiksi","Biografi","Laporan"], a: "Fiksi", d: "EASY" },
      { q: "Tokoh dalam cerita fiksi bersifat ?", o: ["Nyata","Rekaan","Sejarah","Ilmiah"], a: "Rekaan", d: "EASY" },
      { q: "Kumpulan baris dalam puisi disebut ?", o: ["Larik","Bait","Rima","Irama"], a: "Bait", d: "EASY" },
      { q: "Pesan moral dalam cerita disebut ?", o: ["Latar","Amanat","Alur","Tokoh"], a: "Amanat", d: "EASY" },
      { q: "Alur cerita adalah ?", o: ["Latar","Jalan cerita","Tokoh","Tema"], a: "Jalan cerita", d: "EASY" },
    ]),
    M("BINDO", "Membaca Intensif", "MEDIUM", [
      { q: "Membaca intensif bertujuan ?", o: ["Hiburan","Memahami detail","Cepat","Santai"], a: "Memahami detail", d: "MEDIUM" },
      { q: "Gagasan utama paragraf disebut ?", o: ["Ide pokok","Penjelas","Kesimpulan","Judul"], a: "Ide pokok", d: "MEDIUM" },
      { q: "Kalimat penjelas berfungsi ?", o: ["Menjelaskan ide pokok","Membuka paragraf","Menutup paragraf","Menjadi judul"], a: "Menjelaskan ide pokok", d: "MEDIUM" },
    ]),
    M("BINDO", "Kata Baku", "MEDIUM", [
      { q: "Baku dari 'aktif' ?", o: ["Aktif","Aktip","Akstif","Aktif"], a: "Aktif", d: "MEDIUM" },
      { q: "Baku dari 'ijin' ?", o: ["Ijin","Izin","Idzin","Isin"], a: "Izin", d: "MEDIUM" },
      { q: "Baku dari 'apotik' ?", o: ["Apotik","Apotek","Apoteik","Apotik"], a: "Apotek", d: "MEDIUM" },
      { q: "Baku dari 'sistim' ?", o: ["Sistim","Sistem","Sistim","Sistem"], a: "Sistem", d: "MEDIUM" },
      { q: "Baku dari 'kwintal' ?", o: ["Kwintal","Kuintal","Kwintal","Kuintal"], a: "Kuintal", d: "MEDIUM" },
    ]),

    // IPS
    M("IPS", "Peta dan Globe", "EASY", [
      { q: "Peta gambaran bumi pada bidang ?", o: ["Lengkung","Datar","Miring","Vertikal"], a: "Datar", d: "EASY" },
      { q: "Penunjuk arah pada peta disebut ?", o: ["Legenda","Skala","Orientasi","Garis tepi"], a: "Orientasi", d: "EASY" },
      { q: "Skala 1:250.000 artinya 1 cm = ?", o: ["2,5 km","25 km","250 km","2.500 km"], a: "2,5 km", d: "EASY" },
      { q: "Warna hijau pada peta menunjukkan ?", o: ["Laut","Dataran rendah","Pegunungan","Gurun"], a: "Dataran rendah", d: "EASY" },
      { q: "Keterangan simbol pada peta disebut ?", o: ["Judul","Legenda","Arah","Skala"], a: "Legenda", d: "EASY" },
    ]),
    M("IPS", "Keragaman Budaya", "EASY", [
      { q: "Rumah adat Joglo berasal dari ?", o: ["Jawa Tengah","Sumatra Utara","Papua","Sulawesi"], a: "Jawa Tengah", d: "EASY" },
      { q: "Tari Kecak berasal dari ?", o: ["Jawa","Bali","Sunda","Sumatra"], a: "Bali", d: "EASY" },
      { q: "Angklung berasal dari ?", o: ["Jawa Barat","Jawa Timur","Bali","Sumatra Utara"], a: "Jawa Barat", d: "EASY" },
      { q: "Candi Borobudur terletak di ?", o: ["Jakarta","Yogya","Magelang","Solo"], a: "Magelang", d: "EASY" },
      { q: "Rendah makanan khas dari ?", o: ["Jawa","Sumbar","Sulawesi","Kalimantan"], a: "Sumbar", d: "EASY" },
    ]),
    M("IPS", "Sejarah Kemerdekaan", "MEDIUM", [
      { q: "Proklamasi kemerdekaan RI ?", o: ["16/8/1945","17/8/1945","18/8/1945","19/8/1945"], a: "17/8/1945", d: "MEDIUM" },
      { q: "Teks proklamasi diketik oleh ?", o: ["Soekarno","Hatta","Sayuti Melik","Ahmad Subarjo"], a: "Sayuti Melik", d: "MEDIUM" },
      { q: "Penjahit bendera Merah Putih ?", o: ["Fatmawati","Kartini","Cut Nyak Dien","RA Kartini"], a: "Fatmawati", d: "MEDIUM" },
      { q: "Lagu kebangsaan Indonesia ?", o: ["Indonesia Pusaka","Indonesia Raya","Tanah Air","Bagimu Negeri"], a: "Indonesia Raya", d: "MEDIUM" },
      { q: "Pembacaan proklamasi di ?", o: ["Istana Negara","Lapangan Ikada","Pegangsaan Timur 56","Gedung DPR"], a: "Pegangsaan Timur 56", d: "MEDIUM" },
    ]),
    M("IPS", "Kegiatan Ekonomi", "MEDIUM", [
      { q: "Kegiatan menghasilkan barang disebut ?", o: ["Produksi","Distribusi","Konsumsi","Promosi"], a: "Produksi", d: "MEDIUM" },
      { q: "Kegiatan menyalurkan barang disebut ?", o: ["Produksi","Distribusi","Konsumsi","Promosi"], a: "Distribusi", d: "MEDIUM" },
      { q: "Kegiatan menggunakan barang disebut ?", o: ["Produksi","Distribusi","Konsumsi","Promosi"], a: "Konsumsi", d: "MEDIUM" },
      { q: "Tempat bertemu penjual dan pembeli ?", o: ["Sekolah","Pasar","Rumah","Kantor"], a: "Pasar", d: "MEDIUM" },
    ]),
    M("IPS", "Letak Geografis", "EASY", [
      { q: "Indonesia antara dua benua ?", o: ["Asia dan Afrika","Asia dan Australia","Asia dan Eropa","Afrika dan Australia"], a: "Asia dan Australia", d: "EASY" },
      { q: "Indonesia antara dua samudra ?", o: ["Pasifik dan Atlantik","Pasifik dan Hindia","Atlantik dan Hindia","Pasifik dan Arktik"], a: "Pasifik dan Hindia", d: "EASY" },
      { q: "Jumlah pulau di Indonesia ?", o: ["5.000","10.000","17.000","20.000"], a: "17.000", d: "EASY" },
    ]),

    // PPKn
    M("PPKN", "Pancasila", "EASY", [
      { q: "Pancasila terdapat dalam ?", o: ["UUD 1945","Pembukaan UUD 1945","Batang Tubuh","Penjelasan"], a: "Pembukaan UUD 1945", d: "EASY" },
      { q: "Sila pertama Pancasila ?", o: ["Kemanusiaan","Ketuhanan YME","Persatuan","Keadilan"], a: "Ketuhanan YME", d: "EASY" },
      { q: "Lambang sila ke-2 Pancasila ?", o: ["Bintang","Rantai","Pohon beringin","Padi dan kapas"], a: "Rantai", d: "EASY" },
      { q: "Lambang pohon beringin sila ke ?", o: ["1","2","3","4"], a: "3", d: "EASY" },
      { q: "Bunyi sila ke-4 Pancasila ?", o: ["Ketuhanan YME","Kemanusiaan","Persatuan","Kerakyatan"], a: "Kerakyatan", d: "EASY" },
      { q: "Lambang sila ke-5 ?", o: ["Bintang","Rantai","Padi dan kapas","Pohon beringin"], a: "Padi dan kapas", d: "EASY" },
    ]),
    M("PPKN", "Hak dan Kewajiban", "MEDIUM", [
      { q: "Setiap anak berhak mendapat ?", o: ["Hukuman","Pendidikan","Pekerjaan","Kekuasaan"], a: "Pendidikan", d: "MEDIUM" },
      { q: "Kewajiban siswa adalah ?", o: ["Bermain","Belajar","Tidur","Liburan"], a: "Belajar", d: "MEDIUM" },
      { q: "Hak di rumah contohnya ?", o: ["Mendapat kasih sayang","Bermain terus","Tidak membantu","Makan seenaknya"], a: "Mendapat kasih sayang", d: "MEDIUM" },
      { q: "Kewajiban di rumah ?", o: ["Membantu orang tua","Bermain terus","Makan saja","Tidur terus"], a: "Membantu orang tua", d: "MEDIUM" },
    ]),
    M("PPKN", "Musyawarah", "EASY", [
      { q: "Musyawarah mengambil keputusan secara ?", o: ["Sendiri","Bersama","Paksa","Tertutup"], a: "Bersama", d: "EASY" },
      { q: "Hasil musyawarah dilaksanakan dengan ?", o: ["Terpaksa","Bersama","Diam","Tolak"], a: "Bersama", d: "EASY" },
      { q: "Musyawarah sesuai sila ke ?", o: ["2","3","4","5"], a: "4", d: "EASY" },
      { q: "Dalam musyawarah kita harus ?", o: ["Memaksakan","Menghargai pendapat","Diam saja","Marah-marah"], a: "Menghargai pendapat", d: "EASY" },
    ]),
    M("PPKN", "Bhinneka Tunggal Ika", "EASY", [
      { q: "Bhinneka Tunggal Ika artinya ?", o: ["Berbeda tetap satu","Satu untuk semua","Bersatu teguh","Berbeda indah"], a: "Berbeda tetap satu", d: "EASY" },
      { q: "Semboyan Bhinneka ada pada ?", o: ["Bendera","Lambang negara","UUD 1945","Pancasila"], a: "Lambang negara", d: "EASY" },
      { q: "Sikap tepat terhadap keberagaman ?", o: ["Toleransi","Diskriminasi","Etnosentrisme","Primordialisme"], a: "Toleransi", d: "EASY" },
    ]),
    M("PPKN", "NKRI", "MEDIUM", [
      { q: "Bentuk negara Indonesia ?", o: ["Federal","Kesatuan","Serikat","Konfederasi"], a: "Kesatuan", d: "MEDIUM" },
      { q: "Kepala negara Indonesia ?", o: ["Perdana Menteri","Presiden","Raja","Gubernur"], a: "Presiden", d: "MEDIUM" },
      { q: "Dasar hukum negara Indonesia ?", o: ["Pancasila","UUD 1945","Keduanya","Tap MPR"], a: "Keduanya", d: "MEDIUM" },
    ]),

    // BING
    M("BING", "Greetings", "EASY", [
      { q: "Selamat pagi in English ?", o: ["Good night","Good morning","Good evening","Good afternoon"], a: "Good morning", d: "EASY" },
      { q: "How are you dijawab ?", o: ["I am fine","I am student","I am from RI","I am 10"], a: "I am fine", d: "EASY" },
      { q: "Selamat siang in English ?", o: ["Good morning","Good afternoon","Good evening","Good night"], a: "Good afternoon", d: "EASY" },
      { q: "Saat berpisah kita bilang ?", o: ["Hello","Goodbye","How are you","Thank you"], a: "Goodbye", d: "EASY" },
      { q: "Thank you dijawab ?", o: ["You are welcome","Yes","No","Goodbye"], a: "You are welcome", d: "EASY" },
    ]),
    M("BING", "Daily Activities", "EASY", [
      { q: "I ... breakfast.", o: ["Eat","Have","Take","Make"], a: "Have", d: "EASY" },
      { q: "She ... to school.", o: ["Go","Goes","Going","Went"], a: "Goes", d: "EASY" },
      { q: "We ... homework.", o: ["Does","Do","Did","Done"], a: "Do", d: "EASY" },
      { q: "He ... up at 5 AM.", o: ["Wake","Wakes","Woke","Waking"], a: "Wakes", d: "EASY" },
      { q: "They ... TV.", o: ["Watch","Watches","Watched","Watching"], a: "Watch", d: "EASY" },
    ]),
    M("BING", "My School", "EASY", [
      { q: "I study at SD ...", o: ["Nusantara","Negeri","Internasional","Nasional"], a: "Nusantara", d: "EASY" },
      { q: "My teacher ... me.", o: ["Teach","Teaches","Teaching","Taught"], a: "Teaches", d: "EASY" },
      { q: "We ... in the classroom.", o: ["Learn","Learns","Learning","Learned"], a: "Learn", d: "EASY" },
      { q: "I ... Math on Monday.", o: ["Study","Studies","Studying","Studied"], a: "Study", d: "EASY" },
    ]),
    M("BING", "My Family", "EASY", [
      { q: "My mother is a ...", o: ["Teacher","Doctor","Nurse","Housewife"], a: "Housewife", d: "EASY" },
      { q: "My father is a ...", o: ["Policeman","Driver","Doctor","All can be"], a: "All can be", d: "EASY" },
      { q: "I have one ... and one sister.", o: ["Brother","Father","Mother","Uncle"], a: "Brother", d: "EASY" },
    ]),
    M("BING", "Numbers", "EASY", [
      { q: "20 + 10 = ?", o: ["Twenty","Thirty","Forty","Fifty"], a: "Thirty", d: "EASY" },
      { q: "The 12th month is ?", o: ["November","December","October","January"], a: "December", d: "EASY" },
      { q: "100 in words ?", o: ["Ten","One hundred","One thousand","Hundred"], a: "One hundred", d: "EASY" },
    ]),
  ];

  for (let i = 0; i < all.length; i++) {
    const def = all[i];
    const cs = css[def.csKey];
    const mat = await prisma.material.create({
      data: { title: def.title, classSubjectId: cs.id, difficulty: def.diff, isPublished: true, orderIndex: i + 1 },
    });
    for (const q of def.qs) {
      await prisma.question.create({
        data: {
          materialId: mat.id,
          questionText: q.q,
          options: q.o,
          correctAnswer: q.a,
          difficulty: q.d,
          orderIndex: def.qs.indexOf(q) + 1,
        },
      });
    }
    console.log(`  ${def.csKey} - ${def.title}: ${def.qs.length} soal`);
  }

  // student progress
  for (const st of [simon, budi, siti]) {
    for (const sd of subjDefs) {
      await prisma.studentProgress.create({
        data: { studentId: st.id, classSubjectId: css[sd.code].id, completionPercent: 10 + Math.floor(Math.random() * 50), totalScore: 10 + Math.floor(Math.random() * 80) },
      });
    }
  }

  console.log("\nSEED SD SELESAI!");
  console.log("kepsek@test.com / password123");
  console.log("guru@test.com / password123");
  console.log("simon@test.com / password123");
  console.log("ortu@test.com / password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
