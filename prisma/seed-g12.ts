import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME ?? "rsi_learning_platform",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

type Q = { q: string; o: string[]; a: string; d: string };

function fill10(qs: Q[]): Q[] {
  const r = [...qs];
  const DS = ["EASY", "MEDIUM", "HARD"];
  let fi = 0;
  while (r.length < 10) { const d = DS[fi++ % 3]; r.push({ q: `Soal ${r.length + 1} ?`, o: ["A","B","C","D"], a: "B", d }); }
  return r;
}
const M = (cs: string, title: string, diff: string, qs: Q[]) => ({ cs, title, diff, qs: fill10(qs) });
const mc = (q: string, a: number, o: string[], d: string): Q => ({ q, o, a: o[a], d });

const G1: ReturnType<typeof M>[] = [
  M("MTK", "Angka dan Berhitung", "EASY", [
    mc("2 + 3 = ?", 1, ["4","5","6","7"], "EASY"),
    mc("5 + 4 = ?", 2, ["7","8","9","10"], "EASY"),
    mc("10 - 3 = ?", 2, ["5","6","7","8"], "EASY"),
    mc("8 + 2 = ?", 3, ["8","9","10","11"], "EASY"),
    mc("6 - 2 = ?", 1, ["2","4","6","8"], "EASY"),
    mc("3 + 6 = ?", 2, ["7","8","9","10"], "EASY"),
    mc("9 - 5 = ?", 1, ["2","4","6","8"], "EASY"),
    mc("7 + 1 = ?", 2, ["6","7","8","9"], "EASY"),
    mc("4 + 4 = ?", 2, ["6","7","8","9"], "EASY"),
    mc("10 - 7 = ?", 0, ["3","4","5","6"], "EASY"),
  ]),
  M("MTK", "Bilangan dan Pola", "EASY", [
    mc("Angka 7 lebih ... dari 5", 0, ["besar","kecil","sama","bedil"], "EASY"),
    mc("Urutan 1,2,3,4, ...", 0, ["5","6","7","8"], "EASY"),
    mc("Angka genap: 2,4,6,...", 2, ["7","8","9","10"], "EASY"),
    mc("Angka ganjil: 1,3,5,...", 2, ["6","7","8","9"], "EASY"),
    mc("Berapa jari tanganmu?", 0, ["10","5","20","15"], "EASY"),
    mc("9 + 0 = ?", 2, ["8","7","9","10"], "EASY"),
    mc("8 lebih kecil dari ?", 3, ["5","6","7","10"], "EASY"),
    mc("3 + 3 + 3 = ?", 2, ["6","7","9","12"], "EASY"),
    mc("10 - 0 = ?", 3, ["8","9","5","10"], "EASY"),
    mc("Mana yang lebih besar 12 atau 8?", 0, ["12","8","sama","nggak tau"], "EASY"),
  ]),
  M("MTK", "Bentuk Geometri", "EASY", [
    mc("Lingkaran bentuknya ?", 0, ["Bulat","Kotak","Segitiga","Panjang"], "EASY"),
    mc("Persegi punya ? sisi", 0, ["4","3","5","6"], "EASY"),
    mc("Segitiga punya ? sudut", 1, ["2","3","4","5"], "EASY"),
    mc("Bola bentuknya ?", 0, ["Bulat","Kotak","Segitiga","Tabung"], "EASY"),
    mc("Kotak pensil bentuk ?", 1, ["Bulat","Panjang","Segitiga","Lingkaran"], "EASY"),
    mc("Uang logam bentuk ?", 0, ["Lingkaran","Kotak","Segitiga","Bintang"], "EASY"),
    mc("Pintu rumah bentuk ?", 0, ["Persegi panjang","Lingkaran","Segitiga","Tabung"], "EASY"),
    mc("Meja biasanya bentuk ?", 0, ["Persegi","Bulat","Segitiga","Bintang"], "EASY"),
    mc("Roda sepeda bentuk ?", 0, ["Lingkaran","Kotak","Segitiga","Oval"], "EASY"),
    mc("Atap rumah bentuk ?", 2, ["Bulat","Persegi","Segitiga","Tabung"], "EASY"),
  ]),
  M("IPA", "Tubuhku", "EASY", [
    mc("Kepala ada di ? tubuh", 0, ["Atas","Bawah","Samping","Belakang"], "EASY"),
    mc("Mata untuk ?", 2, ["Mendengar","Meraba","Melihat","Mencium"], "EASY"),
    mc("Telinga untuk ?", 0, ["Mendengar","Melihat","Berbicara","Berjalan"], "EASY"),
    mc("Hidung untuk ?", 0, ["Mencium","Melihat","Mendengar","Merasa"], "EASY"),
    mc("Mulut untuk ?", 0, ["Makan","Melihat","Berjalan","Mendengar"], "EASY"),
    mc("Kaki untuk ?", 0, ["Berjalan","Menulis","Melihat","Berbicara"], "EASY"),
    mc("Tangan untuk ?", 0, ["Memegang","Berjalan","Melihat","Mendengar"], "EASY"),
    mc("Lidah untuk ?", 0, ["Merasakan","Melihat","Mendengar","Mencium"], "EASY"),
    mc("Kulit untuk ?", 0, ["Meraba","Melihat","Mendengar","Mencium"], "EASY"),
    mc("Rambut tumbuh di ?", 0, ["Kepala","Mata","Hidung","Mulut"], "EASY"),
  ]),
  M("IPA", "Hewan dan Tumbuhan", "EASY", [
    mc("Ayam berkaki ?", 1, ["1","2","4","6"], "EASY"),
    mc("Ikan hidup di ?", 1, ["Darat","Air","Udara","Pohon"], "EASY"),
    mc("Kucing suka makan ?", 0, ["Ikan","Rumput","Batu","Kayu"], "EASY"),
    mc("Pohon punya ?", 0, ["Akar","Kaki","Mata","Telinga"], "EASY"),
    mc("Bunga mawar warnanya ?", 0, ["Merah","Hijau","Biru","Hitam"], "EASY"),
    mc("Sapi memberi ?", 1, ["Telur","Susu","Madu","Wol"], "EASY"),
    mc("Ulat jadi ?", 0, ["Kupu-kupu","Burung","Ikan","Kucing"], "EASY"),
    mc("Burung terbang pakai ?", 0, ["Sayap","Kaki","Sirip","Tangan"], "EASY"),
    mc("Daun biasanya warna ?", 1, ["Merah","Hijau","Biru","Kuning"], "EASY"),
    mc("Kambing makan ?", 0, ["Rumput","Daging","Ikan","Batu"], "EASY"),
  ]),
  M("BINDO", "Membaca dan Menulis", "EASY", [
    mc("Hari pertama sekolah adalah ?", 0, ["Senin","Selasa","Rabu","Kamis"], "EASY"),
    mc("A-B-C-D adalah ?", 0, ["Huruf","Angka","Gambar","Warna"], "EASY"),
    mc("1-2-3-4 adalah ?", 1, ["Huruf","Angka","Gambar","Warna"], "EASY"),
    mc("Budi ... buku di perpustakaan", 0, ["Membaca","Menulis","Bernyanyi","Berlari"], "EASY"),
    mc("Ibu ... nasi di dapur", 0, ["Memasak","Mencuci","Menulis","Membaca"], "EASY"),
    mc("Ayah ... koran setiap pagi", 0, ["Membaca","Menulis","Memasak","Berlari"], "EASY"),
    mc("Siswa ... di sekolah", 0, ["Belajar","Tidur","Makan","Main"], "EASY"),
    mc("Guru ... di depan kelas", 0, ["Mengajar","Tidur","Makan","Berlari"], "EASY"),
    mc("Kami ... di halaman sekolah", 0, ["Bermain","Belajar","Tidur","Makan"], "EASY"),
    mc("Adik ... susu setiap pagi", 0, ["Minum","Makan","Berlari","Tidur"], "EASY"),
  ]),
  M("BINDO", "Kosakata", "EASY", [
    mc("Sinonim pandai = ?", 1, ["Bodoh","Pintar","Malas","Rajin"], "EASY"),
    mc("Lawan kata besar = ?", 1, ["Besar","Kecil","Tinggi","Lebar"], "EASY"),
    mc("Sinonim rajin = ?", 0, ["Giat","Malas","Bodoh","Pandai"], "EASY"),
    mc("Lawan kata jauh = ?", 2, ["Dekat","Tinggi","Deket","Pendek"], "EASY"),
    mc("Sinonim cepat = ?", 0, ["Laju","Lambat","Pelan","Berat"], "EASY"),
    mc("Lawan kata tinggi = ?", 0, ["Pendek","Panjang","Lebar","Berat"], "EASY"),
    mc("Sinonim senang = ?", 0, ["Gembira","Sedih","Marah","Benci"], "EASY"),
    mc("Lawan kata terang = ?", 1, ["Cerah","Gelap","Panas","Dingin"], "EASY"),
    mc("Sinonim indah = ?", 1, ["Buruk","Cantik","Kotor","Jelek"], "EASY"),
    mc("Lawan kata hidup = ?", 1, ["Ada","Mati","Bangun","Gerak"], "EASY"),
  ]),
  M("PPKN", "Aturan dan Keluarga", "EASY", [
    mc("Aturan di sekolah harus ?", 0, ["Dipatuhi","Dilanggar","Diabaikan","Dihapus"], "EASY"),
    mc("Anggota keluarga terkecil disebut ?", 0, ["Anak","Ibu","Ayah","Kakek"], "EASY"),
    mc("Kepala keluarga adalah ?", 0, ["Ayah","Ibu","Anak","Kakek"], "EASY"),
    mc("Sekolah tempat ?", 0, ["Belajar","Tidur","Bermain","Makan"], "EASY"),
    mc("Hormati ? di sekolah", 0, ["Guru","Teman","Kakak","Adik"], "EASY"),
    mc("Bangun tidur harus ?", 0, ["Merapikan","Tidur lagi","Bermain","Makan"], "EASY"),
    mc("Gosok gigi setelah ?", 0, ["Makan","Tidur","Bermain","Bangun"], "EASY"),
    mc("Cuci tangan sebelum ?", 0, ["Makan","Tidur","Bermain","Belajar"], "EASY"),
    mc("Buang sampah di ?", 0, ["Tempat sampah","Lantai","Meja","Kursi"], "EASY"),
    mc("Minta izin saat ?", 0, ["Keluar kelas","Masuk kelas","Tidur","Makan"], "EASY"),
  ]),
  M("PPKN", "Lambang Negara", "EASY", [
    mc("Warna bendera Indonesia ?", 0, ["Merah putih","Biru putih","Hijau putih","Kuning"], "EASY"),
    mc("Bendera dikibarkan saat ?", 0, ["Upacara","Belajar","Tidur","Makan"], "EASY"),
    mc("Lagu Indonesia Raya ciptaan ?", 0, ["WR Supratman","Hatta","Sudirman","Pancasila"], "EASY"),
    mc("Garuda Pancasila burung ?", 0, ["Garuda","Merpati","Elang","Gagak"], "EASY"),
    mc("Pancasila dasar negara ?", 0, ["Indonesia","Malaysia","Jepang","Cina"], "EASY"),
    mc("Sila pertama Pancasila = ?", 1, ["Kemanusiaan","Ketuhanan","Persatuan","Keadilan"], "EASY"),
    mc("Sila kedua Pancasila = ?", 0, ["Kemanusiaan","Ketuhanan","Persatuan","Keadilan"], "EASY"),
    mc("Sila ketiga Pancasila = ?", 2, ["Keadilan","Ketuhanan","Persatuan","Kerakyatan"], "EASY"),
    mc("Gotong royong nilai ?", 0, ["Kebersamaan","Sendiri","Egois","Malas"], "EASY"),
    mc("Bhinneka Tunggal Ika artinya ?", 1, ["Satu Untuk Semua","Berbeda-beda tetap satu","Bersatu kita teguh","Satu nusa"], "EASY"),
  ]),
  M("IPS", "Lingkungan", "EASY", [
    mc("Rumah tempat kita ?", 0, ["Tinggal","Belajar","Bermain","Makan"], "EASY"),
    mc("Sekolah tempat ?", 0, ["Belajar","Tidur","Makan","Bermain"], "EASY"),
    mc("Pasar tempat ?", 0, ["Jual beli","Belajar","Tidur","Bermain"], "EASY"),
    mc("Alat transportasi darat ?", 0, ["Mobil","Kapal","Pesawat","Helikopter"], "EASY"),
    mc("Alat transportasi air ?", 0, ["Kapal","Mobil","Kereta","Pesawat"], "EASY"),
    mc("Alat transportasi udara ?", 3, ["Mobil","Kapal","Kereta","Pesawat"], "EASY"),
    mc("Keluarga terdiri dari ayah, ibu, ?", 0, ["Anak","Guru","Dokter","Polisi"], "EASY"),
    mc("Tetangga adalah orang yang tinggal ?", 0, ["Dekat rumah","Jauh","Luar kota","Luar negeri"], "EASY"),
    mc("Hidup rukun membuat ?", 0, ["Damai","Ribut","Bertengkar","Marah"], "EASY"),
    mc("Menolong sesama perbuatan ?", 0, ["Baik","Jahat","Buruk","Salah"], "EASY"),
  ]),
  M("IPS", "Pekerjaan", "EASY", [
    mc("Dokter bekerja di ?", 0, ["Rumah sakit","Sekolah","Pasar","Kantor"], "EASY"),
    mc("Guru bekerja di ?", 1, ["Rumah sakit","Sekolah","Pasar","Kantor polisi"], "EASY"),
    mc("Polisi menjaga ?", 0, ["Keamanan","Kesehatan","Pendidikan","Pertanian"], "EASY"),
    mc("Petani bekerja di ?", 0, ["Sawah","Sekolah","Rumah sakit","Kantor"], "EASY"),
    mc("Nelayan bekerja di ?", 0, ["Laut","Kota","Gunung","Hutan"], "EASY"),
    mc("Supir mengemudikan ?", 0, ["Kendaraan","Pesawat","Kapal","Kereta"], "EASY"),
    mc("Koki bekerja di ?", 0, ["Dapur","Kelas","Ruang makan","Garasi"], "EASY"),
    mc("Tukang kayu membuat ?", 0, ["Meja","Baju","Sepatu","Makanan"], "EASY"),
    mc("Penjahit membuat ?", 1, ["Meja","Baju","Sepatu","Rumah"], "EASY"),
    mc("Semua pekerjaan harus ?", 0, ["Dihargai","Diejek","Direndahkan","Ditinggalkan"], "EASY"),
  ]),
  M("BING", "Alphabet and Numbers", "EASY", [
    mc("A is for ?", 0, ["Apple","Ball","Cat","Dog"], "EASY"),
    mc("B is for ?", 1, ["Apple","Ball","Cat","Dog"], "EASY"),
    mc("C is for ?", 2, ["Apple","Ball","Cat","Dog"], "EASY"),
    mc("One means ?", 0, ["Satu","Dua","Tiga","Empat"], "EASY"),
    mc("Two means ?", 1, ["Satu","Dua","Tiga","Empat"], "EASY"),
    mc("Three means ?", 2, ["Satu","Dua","Tiga","Empat"], "EASY"),
    mc("I love you = Aku ? kamu", 1, ["Suka","Cinta","Benci","Sayang"], "EASY"),
    mc("My name is Budi = Namaku ?", 0, ["Budi","Bambang","Bowo","Bagus"], "EASY"),
    mc("Good morning = Selamat ?", 0, ["Pagi","Siang","Sore","Malam"], "EASY"),
    mc("Goodbye = Selamat ?", 1, ["Pagi","Tinggal","Siang","Malam"], "EASY"),
  ]),
  M("BING", "Colors and Animals", "EASY", [
    mc("Red in Indonesian is ?", 0, ["Merah","Biru","Kuning","Hijau"], "EASY"),
    mc("Blue in Indonesian is ?", 1, ["Merah","Biru","Kuning","Hijau"], "EASY"),
    mc("Green in Indonesian is ?", 2, ["Merah","Biru","Kuning","Hijau"], "EASY"),
    mc("Yellow in Indonesian is ?", 0, ["Kuning","Pink","Ungu","Abu-abu"], "EASY"),
    mc("Cat in Indonesian is ?", 0, ["Kucing","Anjing","Ikan","Burung"], "EASY"),
    mc("Dog in Indonesian is ?", 1, ["Kucing","Anjing","Ikan","Burung"], "EASY"),
    mc("Fish in Indonesian is ?", 2, ["Kucing","Anjing","Ikan","Burung"], "EASY"),
    mc("Bird in Indonesian is ?", 3, ["Kucing","Anjing","Ikan","Burung"], "EASY"),
    mc("Cow in Indonesian is ?", 0, ["Sapi","Kambing","Ayam","Bebek"], "EASY"),
    mc("Chicken in Indonesian is ?", 2, ["Sapi","Kambing","Ayam","Bebek"], "EASY"),
  ]),
];

async function main() {
  const classes = await prisma.class.findMany({ orderBy: { gradeLevel: "asc" } });
  const subjects = await prisma.subject.findMany();

  for (const cls of classes) {
    if (cls.gradeLevel > 2) continue;

    for (const def of G1) {
      const subj = subjects.find(s => s.code === def.cs);
      if (!subj) continue;

      const cs = await prisma.classSubject.findFirst({
        where: { classId: cls.id, subjectId: subj.id },
      });
      if (!cs) continue;

      const existing = await prisma.material.findFirst({
        where: { classSubjectId: cs.id, title: def.title },
      });
      if (existing) continue;

      const mat = await prisma.material.create({
        data: {
          title: def.title,
          classSubjectId: cs.id,
          difficulty: def.diff,
          isPublished: true,
          orderIndex: G1.indexOf(def) + 1,
        },
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
      console.log(`  ${cls.name} ${def.cs} - ${def.title}: ${def.qs.length} soal`);
    }
  }
  console.log("\nGrades 1-2 seeded!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
