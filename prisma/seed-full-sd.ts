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

type Q = { q: string; o: string[]; a: string; d: string };

function fill10(qs: Q[]): Q[] {
  const result = [...qs];
  const difficulties = ["EASY", "MEDIUM", "HARD"];
  let fallbackIdx = 0;
  while (result.length < 10) {
    const last = result[result.length - 1];
    const d = difficulties[fallbackIdx % 3];
    fallbackIdx++;
    result.push({
      q: `Soal ${String.fromCharCode(65 + (result.length % 26))}${result.length} ?`,
      o: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      a: "Pilihan B",
      d,
    });
  }
  return result;
}

const SUBJECT_DEFS = [
  { name: "Matematika", code: "MTK" },
  { name: "Ilmu Pengetahuan Alam", code: "IPA" },
  { name: "Bahasa Indonesia", code: "BINDO" },
  { name: "Ilmu Pengetahuan Sosial", code: "IPS" },
  { name: "PPKn", code: "PPKN" },
  { name: "Bahasa Inggris", code: "BING" },
];

const GRADE6_MATERIALS = [
  // MTK
  { cs: "MTK", title: "Bilangan Bulat", diff: "EASY", qs: fill10([
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
  ])},
  { cs: "MTK", title: "Pecahan", diff: "MEDIUM", qs: fill10([
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
  ])},
  { cs: "MTK", title: "Bangun Datar", diff: "HARD", qs: fill10([
    { q: "Luas persegi s = 5 cm ?", o: ["10 cm2","15 cm2","20 cm2","25 cm2"], a: "25 cm2", d: "HARD" },
    { q: "Keliling persegi panjang 6 x 4 cm ?", o: ["10 cm","20 cm","24 cm","30 cm"], a: "20 cm", d: "HARD" },
    { q: "Luas segitiga a = 8 cm t = 6 cm ?", o: ["14 cm2","24 cm2","48 cm2","28 cm2"], a: "24 cm2", d: "HARD" },
    { q: "Luas lingkaran r = 7 cm (phi = 22/7) ?", o: ["154 cm2","44 cm2","77 cm2","308 cm2"], a: "154 cm2", d: "HARD" },
    { q: "Keliling lingkaran d = 14 cm ?", o: ["44 cm","22 cm","88 cm","66 cm"], a: "44 cm", d: "HARD" },
    { q: "Luas persegi panjang p = 15 cm l = 6 cm ?", o: ["42 cm2","90 cm2","60 cm2","80 cm2"], a: "90 cm2", d: "HARD" },
    { q: "Keliling segitiga sama sisi s = 9 cm ?", o: ["18 cm","27 cm","36 cm","81 cm"], a: "27 cm", d: "HARD" },
    { q: "Volume kubus s = 4 cm ?", o: ["16 cm3","64 cm3","32 cm3","48 cm3"], a: "64 cm3", d: "HARD" },
    { q: "Volume balok 5 x 3 x 2 cm ?", o: ["10 cm3","15 cm3","30 cm3","25 cm3"], a: "30 cm3", d: "HARD" },
    { q: "Luas layang2 d1=12 cm d2=9 cm ?", o: ["54 cm2","108 cm2","42 cm2","84 cm2"], a: "54 cm2", d: "HARD" },
  ])},
  { cs: "MTK", title: "KPK dan FPB", diff: "MEDIUM", qs: fill10([
    { q: "FPB dari 12 dan 18 ?", o: ["2","3","6","9"], a: "6", d: "MEDIUM" },
    { q: "KPK dari 4 dan 6 ?", o: ["8","10","12","24"], a: "12", d: "MEDIUM" },
    { q: "FPB dari 24 dan 36 ?", o: ["4","6","12","18"], a: "12", d: "MEDIUM" },
    { q: "KPK dari 6 dan 8 ?", o: ["14","16","24","48"], a: "24", d: "MEDIUM" },
    { q: "FPB dari 15 dan 20 ?", o: ["3","4","5","10"], a: "5", d: "MEDIUM" },
    { q: "KPK dari 3 dan 5 ?", o: ["8","10","15","20"], a: "15", d: "MEDIUM" },
    { q: "FPB dari 8 dan 12 ?", o: ["2","3","4","6"], a: "4", d: "MEDIUM" },
    { q: "KPK dari 9 dan 12 ?", o: ["18","24","36","48"], a: "36", d: "MEDIUM" },
    { q: "FPB dari 30 dan 45 ?", o: ["3","5","9","15"], a: "15", d: "MEDIUM" },
    { q: "KPK dari 8 dan 10 ?", o: ["18","20","40","80"], a: "40", d: "MEDIUM" },
  ])},
  { cs: "MTK", title: "Skala dan Denah", diff: "MEDIUM", qs: fill10([
    { q: "Skala 1:100.000, jarak peta 4 cm ?", o: ["4 km","40 km","400 km","0,4 km"], a: "4 km", d: "MEDIUM" },
    { q: "Jarak 6 km skala 1:200.000, peta ?", o: ["2 cm","3 cm","4 cm","5 cm"], a: "3 cm", d: "MEDIUM" },
    { q: "Skala 1:500, panjang 8 cm asli ?", o: ["40 m","50 m","60 m","80 m"], a: "40 m", d: "MEDIUM" },
    { q: "Skala 1:50.000, 10 cm peta = ? km", o: ["5","10","15","20"], a: "5", d: "MEDIUM" },
    { q: "Jarak 12 km skala 1:300.000, peta ?", o: ["2 cm","3 cm","4 cm","5 cm"], a: "4 cm", d: "MEDIUM" },
    { q: "Skala 1:1.000.000, 3 cm peta = ? km", o: ["10","20","30","40"], a: "30", d: "MEDIUM" },
    { q: "Denah 1:200, lebar 5 cm asli ?", o: ["5 m","10 m","15 m","20 m"], a: "10 m", d: "MEDIUM" },
    { q: "Lebar 8 m skala 1:100, denah ?", o: ["6 cm","7 cm","8 cm","9 cm"], a: "8 cm", d: "MEDIUM" },
    { q: "Skala 1:250.000, 2 cm = ? km", o: ["2,5","5","7,5","10"], a: "5", d: "MEDIUM" },
    { q: "Panjang 200 m skala 1:400, denah ?", o: ["40 cm","50 cm","60 cm","80 cm"], a: "50 cm", d: "MEDIUM" },
  ])},

  // IPA
  { cs: "IPA", title: "Tata Surya", diff: "EASY", qs: fill10([
    { q: "Planet terdekat Matahari ?", o: ["Venus","Merkurius","Bumi","Mars"], a: "Merkurius", d: "EASY" },
    { q: "Bumi mengelilingi Matahari disebut ?", o: ["Rotasi","Revolusi","Presesi","Nutasi"], a: "Revolusi", d: "EASY" },
    { q: "Planet terbesar ?", o: ["Saturnus","Jupiter","Neptunus","Uranus"], a: "Jupiter", d: "EASY" },
    { q: "Satelit alami Bumi ?", o: ["Matahari","Bulan","Bintang","Asteroid"], a: "Bulan", d: "EASY" },
    { q: "Planet bercincin ?", o: ["Jupiter","Uranus","Neptunus","Saturnus"], a: "Saturnus", d: "EASY" },
    { q: "Penyebab siang malam ?", o: ["Revolusi Bumi","Rotasi Bumi","Gerhana","Gravitasi"], a: "Rotasi Bumi", d: "EASY" },
    { q: "Planet Bintang Kejora ?", o: ["Mars","Venus","Merkurius","Jupiter"], a: "Venus", d: "EASY" },
    { q: "Gerhana matahari saat ?", o: ["Bumi di antara M dan B","Bulan di antara M dan B","M di antara B dan B","Semua"], a: "Bulan di antara M dan B", d: "EASY" },
    { q: "Bumi berevolusi ... hari ?", o: ["360","365","366","370"], a: "365", d: "EASY" },
    { q: "Jumlah planet ?", o: ["7","8","9","10"], a: "8", d: "EASY" },
  ])},
  { cs: "IPA", title: "Makhluk Hidup", diff: "EASY", qs: fill10([
    { q: "Ciri makhluk hidup ?", o: ["Bergerak","Berpikir","Berbicara","Tertawa"], a: "Bergerak", d: "EASY" },
    { q: "Tumbuhan membuat makanan via ?", o: ["Fotosintesis","Respirasi","Fermentasi","Osmosis"], a: "Fotosintesis", d: "EASY" },
    { q: "Hewan pemakan daging disebut ?", o: ["Herbivor","Karnivor","Omnivor","Insektivor"], a: "Karnivor", d: "EASY" },
    { q: "Manusia bernapas keluarkan ?", o: ["Oksigen","CO2","Nitrogen","Hidrogen"], a: "CO2", d: "EASY" },
    { q: "Hewan berkembang biak ?", o: ["Bertelur","Melahirkan","Keduanya","Semua"], a: "Semua", d: "EASY" },
    { q: "Kucing berkembang biak ?", o: ["Bertelur","Melahirkan","Membelah","Tunas"], a: "Melahirkan", d: "EASY" },
    { q: "Ayam berkembang biak ?", o: ["Bertelur","Melahirkan","Tunas","Membelah"], a: "Bertelur", d: "EASY" },
    { q: "Tumbuhan hijau disebut ?", o: ["Produsen","Konsumen","Pengurai","Herbivor"], a: "Produsen", d: "EASY" },
    { q: "Manusia alat gerak ?", o: ["Kaki + tangan","Sayap","Sirip","Perut"], a: "Kaki + tangan", d: "EASY" },
    { q: "Ikan bernapas dengan ?", o: ["Paru","Insang","Kulit","Trakea"], a: "Insang", d: "EASY" },
  ])},
  { cs: "IPA", title: "Rangka dan Otot", diff: "MEDIUM", qs: fill10([
    { q: "Tulang melindungi otak ?", o: ["Dada","Rusuk","Tengkorak","Belakang"], a: "Tengkorak", d: "MEDIUM" },
    { q: "Jumlah tulang rusuk ?", o: ["12","24","6","18"], a: "12", d: "MEDIUM" },
    { q: "Otot tak sadar disebut ?", o: ["Lurik","Polos","Jantung","Rangka"], a: "Polos", d: "MEDIUM" },
    { q: "Fungsi rangka ?", o: ["Melindungi","Membentuk tubuh","Tempat otot","Semua"], a: "Semua", d: "MEDIUM" },
    { q: "Otot jantung bekerja ?", o: ["Sadar","Tak sadar","Cepat","Lambat"], a: "Tak sadar", d: "MEDIUM" },
    { q: "Tulang terbesar manusia ?", o: ["Tulang paha","Tengkorak","Rusuk","Hidung"], a: "Tulang paha", d: "MEDIUM" },
    { q: "Persendian penghubung ?", o: ["Otot","Tulang","Syaraf","Darah"], a: "Tulang", d: "MEDIUM" },
    { q: "Otot lurik melekat pada ?", o: ["Rangka","Organ","Jantung","Pembuluh"], a: "Rangka", d: "MEDIUM" },
    { q: "Kontraksi otot menghasilkan ?", o: ["Gerak","Panask","Suara","Cahaya"], a: "Gerak", d: "MEDIUM" },
    { q: "Tulang rawr fleksibel di ?", o: ["Hidung+telinga","Kaki","Tangan","Paha"], a: "Hidung+telinga", d: "MEDIUM" },
  ])},
  { cs: "IPA", title: "Sumber Daya Alam", diff: "EASY", qs: fill10([
    { q: "SDA terbarukan contohnya ?", o: ["Minyak bumi","Batu bara","Air","Emas"], a: "Air", d: "EASY" },
    { q: "Energi utama Bumi ?", o: ["Bulan","Bintang","Matahari","Api"], a: "Matahari", d: "EASY" },
    { q: "Minyak bumi termasuk SDA ?", o: ["Terbarukan","Tidak terbarukan","Hayati","Organik"], a: "Tidak terbarukan", d: "EASY" },
    { q: "Energi alternatif ramah ?", o: ["Batu bara","Solar","Tenaga surya","Bensin"], a: "Tenaga surya", d: "EASY" },
    { q: "PLTA memanfaatkan ?", o: ["Pasang","Arus sungai","Bendungan","Gelombang"], a: "Bendungan", d: "EASY" },
    { q: "Re boisasi artinya ?", o: ["Menebang","Menanam","Membakar","Melindungi"], a: "Menanam", d: "EASY" },
    { q: "Hutan fungsi ?", o: ["Paru dunia","Sumber O2","Habitat","Semua"], a: "Semua", d: "EASY" },
    { q: "SDA hayati berasal dari ?", o: ["Makhluk hidup","Batuan","Cahaya","Angin"], a: "Makhluk hidup", d: "EASY" },
    { q: "Batu bara energi ?", o: ["Terbarukan","Fosil","Nuklir","Listrik"], a: "Fosil", d: "EASY" },
    { q: "Energi panas bumi dari ?", o: ["Matahari","Inti bumi","Air","Api"], a: "Inti bumi", d: "EASY" },
  ])},
  { cs: "IPA", title: "Gaya dan Gerak", diff: "EASY", qs: fill10([
    { q: "Gaya menyebabkan benda ?", o: ["Diam","Bergerak","Berubah","Semua"], a: "Semua", d: "EASY" },
    { q: "Satuan gaya SI ?", o: ["Kg","Newton","Joule","Watt"], a: "Newton", d: "EASY" },
    { q: "Gaya tarik Bumi disebut ?", o: ["Listrik","Magnet","Gravitasi","Gesek"], a: "Gravitasi", d: "EASY" },
    { q: "Makin besar massa, gravitasi makin ?", o: ["Kecil","Besar","Sama","Nol"], a: "Besar", d: "EASY" },
    { q: "Gaya gesek berlawanan ?", o: ["Arah gerak","Permukaan","Berat","Semua"], a: "Arah gerak", d: "EASY" },
    { q: "Sepeda direm termasuk ?", o: ["GLB","GLBB dipercepat","GLBB diperlambat","Melingkar"], a: "GLBB diperlambat", d: "EASY" },
    { q: "Pengaruh gaya pegas ?", o: ["Memanjang","Memendek","Kembali","Melenting"], a: "Melenting", d: "EASY" },
    { q: "Gaya magnet menarik ?", o: ["Plastik","Logam","Kertas","Kayu"], a: "Logam", d: "EASY" },
    { q: "Gaya listrik statis ?", o: ["Rambut + sisir","Magnet","Baterai","Dynamo"], a: "Rambut + sisir", d: "EASY" },
    { q: "Gaya otot dilakukan ?", o: ["Mesin","Manusia","Angin","Air"], a: "Manusia", d: "EASY" },
  ])},

  // BINDO
  { cs: "BINDO", title: "Teks Deskripsi", diff: "EASY", qs: fill10([
    { q: "Teks menggambarkan objek disebut ?", o: ["Narasi","Deskripsi","Eksposisi","Argumentasi"], a: "Deskripsi", d: "EASY" },
    { q: "Ciri teks deskripsi ?", o: ["Percakapan","Detail","Argumen","Petunjuk"], a: "Detail", d: "EASY" },
    { q: "Tujuan teks deskripsi ?", o: ["Membujuk","Menggambarkan","Cara","Cerita"], a: "Menggambarkan", d: "EASY" },
    { q: "Sinonim indah ?", o: ["Jelek","Cantik","Kotor","Busuk"], a: "Cantik", d: "EASY" },
    { q: "Contoh kalimat deskripsi ?", o: ["Ibu pergi","Rumah besar nyaman","Adik belajar","Ayah baca"], a: "Rumah besar nyaman", d: "EASY" },
    { q: "Kata sering muncul di deskripsi ?", o: ["Sifat","Kerja","Tanya","Sambung"], a: "Sifat", d: "EASY" },
    { q: "Struktur deskripsi ?", o: ["ID + deskripsi","Orientasi-krisis","Tesis-argumen","Goal-step"], a: "ID + deskripsi", d: "EASY" },
    { q: "Pantai pasir putih termasuk ?", o: ["Narasi","Deskripsi","Eksposisi","Persuasi"], a: "Deskripsi", d: "EASY" },
    { q: "Kata depan di benar ?", o: ["Dirumah","di rumah","Di rumah","diRumah"], a: "Di rumah", d: "EASY" },
    { q: "Objek deskripsi bisa ?", o: ["Orang","Hewan","Tempat","Semua"], a: "Semua", d: "EASY" },
  ])},
  { cs: "BINDO", title: "Pantun", diff: "MEDIUM", qs: fill10([
    { q: "Pantun terdiri ... baris ?", o: ["2","3","4","5"], a: "4", d: "MEDIUM" },
    { q: "Baris 1-2 pantun disebut ?", o: ["Isi","Sampiran","Bait","Larik"], a: "Sampiran", d: "MEDIUM" },
    { q: "Baris 3-4 pantun disebut ?", o: ["Sampiran","Isi","Bait","Larik"], a: "Isi", d: "MEDIUM" },
    { q: "Rima akhir pantun ?", o: ["a-b-a-b","a-a-a-a","a-b-b-a","a-a-b-b"], a: "a-b-a-b", d: "MEDIUM" },
    { q: "Buah mangga buah pepaya bagian ?", o: ["Isi","Sampiran","Amanat","Judul"], a: "Sampiran", d: "MEDIUM" },
    { q: "Pantun termasuk puisi ?", o: ["Lama","Baru","Modern","Bebas"], a: "Lama", d: "MEDIUM" },
    { q: "Setiap baris pantun ... suku kata", o: ["8-10","8-12","10-14","6-8"], a: "8-12", d: "MEDIUM" },
    { q: "Pantun jenaka bertujuan ?", o: ["Nasihat","Humor","Cinta","Agama"], a: "Humor", d: "MEDIUM" },
    { q: "Pantun nasihat berisi ?", o: ["Hiburan","Pesan moral","Cerita","Lelucon"], a: "Pesan moral", d: "MEDIUM" },
    { q: "Kalau ada jarum patah termasuk ?", o: ["Isi","Sampiran","Amanat","Judul"], a: "Sampiran", d: "MEDIUM" },
  ])},
  { cs: "BINDO", title: "Cerita Fiksi", diff: "EASY", qs: fill10([
    { q: "Cerita rekaan disebut ?", o: ["Fiksi","Nonfiksi","Biografi","Laporan"], a: "Fiksi", d: "EASY" },
    { q: "Tokoh fiksi bersifat ?", o: ["Nyata","Rekaan","Sejarah","Ilmiah"], a: "Rekaan", d: "EASY" },
    { q: "Kumpulan baris puisi disebut ?", o: ["Larik","Bait","Rima","Irama"], a: "Bait", d: "EASY" },
    { q: "Pesan moral disebut ?", o: ["Latar","Amanat","Alur","Tokoh"], a: "Amanat", d: "EASY" },
    { q: "Alur cerita adalah ?", o: ["Latar","Jalan cerita","Tokoh","Tema"], a: "Jalan cerita", d: "EASY" },
    { q: "Tokoh antagonis bersifat ?", o: ["Baik","Jahat","Lucu","Pintar"], a: "Jahat", d: "EASY" },
    { q: "Tokoh protagonis bersifat ?", o: ["Baik","Jahat","Licik","Kasar"], a: "Baik", d: "EASY" },
    { q: "Latar tempat contoh ?", o: ["Pagi hari","Di sekolah","Sedih","Cinta"], a: "Di sekolah", d: "EASY" },
    { q: "Latar suasana contoh ?", o: ["Di rumah","Mencekam","Tahun 2020","Jakarta"], a: "Mencekam", d: "EASY" },
    { q: "Contoh cerita fiksi ?", o: ["Biografi","Dongeng","Laporan","Berita"], a: "Dongeng", d: "EASY" },
  ])},
  { cs: "BINDO", title: "Membaca Intensif", diff: "MEDIUM", qs: fill10([
    { q: "Membaca intensif bertujuan ?", o: ["Hiburan","Memahami detail","Cepat","Santai"], a: "Memahami detail", d: "MEDIUM" },
    { q: "Gagasan utama paragraf ?", o: ["Ide pokok","Penjelas","Kesimpulan","Judul"], a: "Ide pokok", d: "MEDIUM" },
    { q: "Kalimat penjelas fungsi ?", o: ["Menjelaskan ide","Membuka","Menutup","Judul"], a: "Menjelaskan ide", d: "MEDIUM" },
    { q: "Ide pokok di awal paragraf disebut ?", o: ["Deduktif","Induktif","Campuran","Naratif"], a: "Deduktif", d: "MEDIUM" },
    { q: "Ide pokok di akhir paragraf ?", o: ["Deduktif","Induktif","Campuran","Deskriptif"], a: "Induktif", d: "MEDIUM" },
    { q: "Kata tanya untuk alasan ?", o: ["Apa","Siapa","Mengapa","Bagaimana"], a: "Mengapa", d: "MEDIUM" },
    { q: "Kata tanya untuk cara ?", o: ["Apa","Siapa","Mengapa","Bagaimana"], a: "Bagaimana", d: "MEDIUM" },
    { q: "Kesimpulan bacaan berisi ?", o: ["Amanat","Inti","Latar","Tokoh"], a: "Inti", d: "MEDIUM" },
    { q: "Membaca ekstensif untuk ?", o: ["Detail","Garis besar","Teliti","Pahami kata"], a: "Garis besar", d: "MEDIUM" },
    { q: "Skimming mencari ?", o: ["Detail","Info cepat","Makna","Struktur"], a: "Info cepat", d: "MEDIUM" },
  ])},
  { cs: "BINDO", title: "Kata Baku", diff: "MEDIUM", qs: fill10([
    { q: "Baku dari aktif ?", o: ["Aktif","Aktip","Akstif","Aktif"], a: "Aktif", d: "MEDIUM" },
    { q: "Baku dari ijin ?", o: ["Ijin","Izin","Idzin","Isin"], a: "Izin", d: "MEDIUM" },
    { q: "Baku dari apotik ?", o: ["Apotik","Apotek","Apoteik","Apotik"], a: "Apotek", d: "MEDIUM" },
    { q: "Baku dari sistim ?", o: ["Sistim","Sistem","Sistim","Sistem"], a: "Sistem", d: "MEDIUM" },
    { q: "Baku dari kwintal ?", o: ["Kwintal","Kuintal","Kwintal","Kuintal"], a: "Kuintal", d: "MEDIUM" },
    { q: "Baku dari jadwal ?", o: ["Jadwal","Jadual","Jaduwal","Jadwall"], a: "Jadwal", d: "MEDIUM" },
    { q: "Baku dari karir ?", o: ["Karir","Karier","Karier","Karir"], a: "Karier", d: "MEDIUM" },
    { q: "Baku dari syah ?", o: ["Syah","Sah","Syah","Shah"], a: "Sah", d: "MEDIUM" },
    { q: "Baku dari analisa ?", o: ["Analisa","Analisis","Analisa","Analis"], a: "Analisis", d: "MEDIUM" },
    { q: "Baku dari nasehat ?", o: ["Nasehat","Nasihat","Nasehat","Nasihat"], a: "Nasihat", d: "MEDIUM" },
  ])},

  // IPS
  { cs: "IPS", title: "Peta dan Globe", diff: "EASY", qs: fill10([
    { q: "Peta gambaran bumi bidang ?", o: ["Lengkung","Datar","Miring","Vertikal"], a: "Datar", d: "EASY" },
    { q: "Penunjuk arah peta disebut ?", o: ["Legenda","Skala","Orientasi","Garis tepi"], a: "Orientasi", d: "EASY" },
    { q: "Skala 1:250.000 1 cm = ?", o: ["2,5 km","25 km","250 km","2.500 km"], a: "2,5 km", d: "EASY" },
    { q: "Warna hijau peta menunjukkan ?", o: ["Laut","Dataran rendah","Pegunungan","Gurun"], a: "Dataran rendah", d: "EASY" },
    { q: "Keterangan simbol peta disebut ?", o: ["Judul","Legenda","Arah","Skala"], a: "Legenda", d: "EASY" },
    { q: "Garis lintang membagi ?", o: ["Utara-selatan","Timur-barat","Diagonal","Vertikal"], a: "Utara-selatan", d: "EASY" },
    { q: "Globe model bumi ?", o: ["Datar","Bulat","Segitiga","Persegi"], a: "Bulat", d: "EASY" },
    { q: "Atlas kumpulan ?", o: ["Gambar","Peta","Foto","Tabel"], a: "Peta", d: "EASY" },
    { q: "Simbol sungai digambar ?", o: ["Lurus","Berkelok","Titik","Kotak"], a: "Berkelok", d: "EASY" },
    { q: "Warna biru peta artinya ?", o: ["Daratan","Lautan","Pegunungan","Kota"], a: "Lautan", d: "EASY" },
  ])},
  { cs: "IPS", title: "Keragaman Budaya", diff: "EASY", qs: fill10([
    { q: "Rumah Joglo dari ?", o: ["Jateng","Sumut","Papua","Sulsel"], a: "Jateng", d: "EASY" },
    { q: "Tari Kecak dari ?", o: ["Jawa","Bali","Sunda","Sumatra"], a: "Bali", d: "EASY" },
    { q: "Angklung dari ?", o: ["Jabar","Jatim","Bali","Sumut"], a: "Jabar", d: "EASY" },
    { q: "Candi Borobudur di ?", o: ["Jakarta","Yogya","Magelang","Solo"], a: "Magelang", d: "EASY" },
    { q: "Rendang makanan khas ?", o: ["Jawa","Sumbar","Sulsel","Kaltim"], a: "Sumbar", d: "EASY" },
    { q: "Tari Samber dari ?", o: ["Jawa","Bali","Papua","Sunda"], a: "Papua", d: "EASY" },
    { q: "Bundo Kanduang dari ?", o: ["Sumbar","Sumut","Jambi","Riau"], a: "Sumbar", d: "EASY" },
    { q: "Lagu Ampar Pisang dari ?", o: ["Sumbar","Kalsel","Sulsel","Papua"], a: "Kalsel", d: "EASY" },
    { q: "Rencong senjata dari ?", o: ["Jawa","Aceh","Sumbar","Sulsel"], a: "Aceh", d: "EASY" },
    { q: "Ngaben tradisi dari ?", o: ["Jawa","Bali","Sumut","Kaltim"], a: "Bali", d: "EASY" },
  ])},
  { cs: "IPS", title: "Sejarah Kemerdekaan", diff: "MEDIUM", qs: fill10([
    { q: "Proklamasi kemerdekaan RI ?", o: ["16/8/1945","17/8/1945","18/8/1945","19/8/1945"], a: "17/8/1945", d: "MEDIUM" },
    { q: "Teks proklamasi diketik ?", o: ["Soekarno","Hatta","Sayuti Melik","Subarjo"], a: "Sayuti Melik", d: "MEDIUM" },
    { q: "Penjahit bendera ?", o: ["Fatmawati","Kartini","Cut Nyak","RA Kartini"], a: "Fatmawati", d: "MEDIUM" },
    { q: "Lagu kebangsaan ?", o: ["Indonesia Pusaka","Indonesia Raya","Tanah Air","Bagimu Negeri"], a: "Indonesia Raya", d: "MEDIUM" },
    { q: "Pembacaan proklamasi di ?", o: ["Istana","Lapangan Ikada","Pegangsaan 56","Gedung DPR"], a: "Pegangsaan 56", d: "MEDIUM" },
    { q: "Tokoh proklamator ?", o: ["Soekarno-Hatta","Soekarno-Hatta","Sudirman","Kartini"], a: "Soekarno-Hatta", d: "MEDIUM" },
    { q: "Bendera merah putih warna ?", o: ["Merah-biru","Merah-putih","Putih-merah","Merah-hitam"], a: "Merah-putih", d: "MEDIUM" },
    { q: "Jepang menyerah sekutu ?", o: ["6/8","9/8","14/8","15/8"], a: "14/8", d: "MEDIUM" },
    { q: "Rengasdengklok tgl ?", o: ["14/8","15/8","16/8","17/8"], a: "16/8", d: "MEDIUM" },
    { q: "Pertempuran Surabaya tgl ?", o: ["10/11","17/8","1/6","18/8"], a: "10/11", d: "MEDIUM" },
  ])},
  { cs: "IPS", title: "Kegiatan Ekonomi", diff: "MEDIUM", qs: fill10([
    { q: "Kegiatan hasilkan barang ?", o: ["Produksi","Distribusi","Konsumsi","Promosi"], a: "Produksi", d: "MEDIUM" },
    { q: "Kegiatan salurkan barang ?", o: ["Produksi","Distribusi","Konsumsi","Promosi"], a: "Distribusi", d: "MEDIUM" },
    { q: "Kegiatan gunakan barang ?", o: ["Produksi","Distribusi","Konsumsi","Promosi"], a: "Konsumsi", d: "MEDIUM" },
    { q: "Tempat penjual pembeli ?", o: ["Sekolah","Pasar","Rumah","Kantor"], a: "Pasar", d: "MEDIUM" },
    { q: "BUMN singkatan ?", o: ["Badan Usaha Milik Negara","Usaha Dagang","Bumi","Bank"], a: "Badan Usaha Milik Negara", d: "MEDIUM" },
    { q: "Contoh BUMN ?", o: ["Pertamina","Indomaret","Alfamart","Gojek"], a: "Pertamina", d: "MEDIUM" },
    { q: "Permintaan barang ?", o: ["Dibeli","Dijual","Ditukar","Dipinjam"], a: "Dibeli", d: "MEDIUM" },
    { q: "Penawaran barang ?", o: ["Dibeli","Dijual","Ditukar","Dipinjam"], a: "Dijual", d: "MEDIUM" },
    { q: "Koperasi asas ?", o: ["Modal","Kekeluargaan","Untung","Pasar"], a: "Kekeluargaan", d: "MEDIUM" },
    { q: "Pajak fungsi ?", o: ["Pembangunan","Pribadi","Sekolah","Keluarga"], a: "Pembangunan", d: "MEDIUM" },
  ])},
  { cs: "IPS", title: "Letak Geografis", diff: "EASY", qs: fill10([
    { q: "Indonesia antar dua benua ?", o: ["Asia-Afrika","Asia-Australia","Asia-Eropa","Afrika-Australia"], a: "Asia-Australia", d: "EASY" },
    { q: "Indonesia antar dua samudra ?", o: ["Pasifik-Atlantik","Pasifik-Hindia","Atlantik-Hindia","Pasifik-Arktik"], a: "Pasifik-Hindia", d: "EASY" },
    { q: "Jumlah pulau Indonesia ?", o: ["5.000","10.000","17.000","20.000"], a: "17.000", d: "EASY" },
    { q: "Laut Indonesia disebut ?", o: ["Laut teritorial","Nusantara","ZEE","Lepas"], a: "Nusantara", d: "EASY" },
    { q: "Garis khatulistiwa melalui ?", o: ["Jakarta","Pontianak","Surabaya","Medan"], a: "Pontianak", d: "EASY" },
    { q: "Iklim Indonesia ?", o: ["Subtropis","Tropis","Kutub","Gurun"], a: "Tropis", d: "EASY" },
    { q: "Musim di Indonesia ?", o: ["Panas-dingin","Hujan-kemarau","Salju","Gugur"], a: "Hujan-kemarau", d: "EASY" },
    { q: "Negara tetangga utara ?", o: ["Timor Leste","Malaysia","Australia","PNG"], a: "Malaysia", d: "EASY" },
    { q: "Negara tetangga selatan ?", o: ["Malaysia","Australia","Filipina","Thailand"], a: "Australia", d: "EASY" },
    { q: "Negara tetangga timur ?", o: ["Malaysia","Australia","PNG","Filipina"], a: "PNG", d: "EASY" },
  ])},

  // PPKN
  { cs: "PPKN", title: "Pancasila", diff: "EASY", qs: fill10([
    { q: "Pancasila terdapat dalam ?", o: ["UUD 1945","Pembukaan UUD","Batang Tubuh","Penjelasan"], a: "Pembukaan UUD", d: "EASY" },
    { q: "Sila pertama Pancasila ?", o: ["Kemanusiaan","Ketuhanan YME","Persatuan","Keadilan"], a: "Ketuhanan YME", d: "EASY" },
    { q: "Lambang sila ke-2 ?", o: ["Bintang","Rantai","Pohon beringin","Padi kapas"], a: "Rantai", d: "EASY" },
    { q: "Pohon beringin sila ke ?", o: ["1","2","3","4"], a: "3", d: "EASY" },
    { q: "Bunyi sila ke-4 ?", o: ["Ketuhanan","Kemanusiaan","Persatuan","Kerakyatan"], a: "Kerakyatan", d: "EASY" },
    { q: "Lambang sila ke-5 ?", o: ["Bintang","Rantai","Padi kapas","Pohon beringin"], a: "Padi kapas", d: "EASY" },
    { q: "Pancasila artinya ?", o: ["Lima dasar","Lima aturan","Lima tujuan","Lima cara"], a: "Lima dasar", d: "EASY" },
    { q: "Jumlah sila Pancasila ?", o: ["4","5","6","7"], a: "5", d: "EASY" },
    { q: "Pengusul nama Pancasila ?", o: ["Soekarno","Hatta","Yamin","Soepomo"], a: "Soekarno", d: "EASY" },
    { q: "Pancasila disahkan tgl ?", o: ["1 Juni","17 Agustus","18 Agustus","29 April"], a: "18 Agustus", d: "EASY" },
  ])},
  { cs: "PPKN", title: "Hak dan Kewajiban", diff: "MEDIUM", qs: fill10([
    { q: "Setiap anak berhak ?", o: ["Hukuman","Pendidikan","Pekerjaan","Kekuasaan"], a: "Pendidikan", d: "MEDIUM" },
    { q: "Kewajiban siswa ?", o: ["Bermain","Belajar","Tidur","Liburan"], a: "Belajar", d: "MEDIUM" },
    { q: "Hak di rumah ?", o: ["Kasih sayang","Bermain","Makan","Semua"], a: "Semua", d: "MEDIUM" },
    { q: "Kewajiban di rumah ?", o: ["Bantu orang tua","Bermain","Makan","Tidur"], a: "Bantu orang tua", d: "MEDIUM" },
    { q: "Hak warga negara pasal ?", o: ["27","28","29","30"], a: "27", d: "MEDIUM" },
    { q: "Pendidikan gratis pasal ?", o: ["29","31","33","34"], a: "31", d: "MEDIUM" },
    { q: "Contoh hak di sekolah ?", o: ["Dapat ilmu","Bayar SPP","Jaga bersih","Patuhi guru"], a: "Dapat ilmu", d: "MEDIUM" },
    { q: "Kewajiban di sekolah ?", o: ["Dapat uang","Belajar","Bermain","Istirahat"], a: "Belajar", d: "MEDIUM" },
    { q: "HAM singkatan ?", o: ["Hak Ahli","Hak Asasi Manusia","Hak Akhir","Hak Alam"], a: "Hak Asasi Manusia", d: "MEDIUM" },
    { q: "Pembatasan HAM pasal ?", o: ["28J","27","29","30"], a: "28J", d: "MEDIUM" },
  ])},
  { cs: "PPKN", title: "Musyawarah", diff: "EASY", qs: fill10([
    { q: "Musyawarah ambil keputusan ?", o: ["Sendiri","Bersama","Paksa","Tertutup"], a: "Bersama", d: "EASY" },
    { q: "Hasil musyawarah dilaksanakan ?", o: ["Terpaksa","Bersama","Diam","Tolak"], a: "Bersama", d: "EASY" },
    { q: "Musyawarah sesuai sila ke ?", o: ["2","3","4","5"], a: "4", d: "EASY" },
    { q: "Dalam musyawarah kita harus ?", o: ["Paksakan","Hargai pendapat","Diam","Marah"], a: "Hargai pendapat", d: "EASY" },
    { q: "Keputusan musyawarah disebut ?", o: ["Mufakat","Paksaan","Perintah","Usul"], a: "Mufakat", d: "EASY" },
    { q: "Voting dilakukan jika ?", o: ["Mufakat","Tidak mufakat","Awal","Aman"], a: "Tidak mufakat", d: "EASY" },
    { q: "Tempat musyawarah di ?", o: ["Kelas","Kantor","Masjid","Semua"], a: "Semua", d: "EASY" },
    { q: "Ketua musyawarah tugas ?", o: ["Memimpin","Bicara","Diam","Menulis"], a: "Memimpin", d: "EASY" },
    { q: "Peserta musyawarah berhak ?", o: ["Pendapat","Marah","Pulang","Diam"], a: "Pendapat", d: "EASY" },
    { q: "Gotong royong nilai ?", o: ["Individual","Kebersamaan","Egois","Kompetisi"], a: "Kebersamaan", d: "EASY" },
  ])},
  { cs: "PPKN", title: "Bhinneka Tunggal Ika", diff: "EASY", qs: fill10([
    { q: "Bhinneka artinya ?", o: ["Berbeda satu","Satu semua","Teguh","Indah"], a: "Berbeda satu", d: "EASY" },
    { q: "Semboyan pada ?", o: ["Bendera","Lambang negara","UUD","Pancasila"], a: "Lambang negara", d: "EASY" },
    { q: "Sikap tepat pada keberagaman ?", o: ["Toleransi","Diskriminasi","Etnosentrisme","Primordial"], a: "Toleransi", d: "EASY" },
    { q: "Indonesia beragam suku ?", o: ["100","1.300","500","50"], a: "1.300", d: "EASY" },
    { q: "Bahasa daerah terbanyak ?", o: ["Sunda","Jawa","Batak","Bugis"], a: "Jawa", d: "EASY" },
    { q: "Agama diakui ?", o: ["4","5","6","7"], a: "6", d: "EASY" },
    { q: "Tarian daerah dari ?", o: ["Pusat","Daerah","LN","Pemerintah"], a: "Daerah", d: "EASY" },
    { q: "Faktor keberagaman ?", o: ["Letak strategis","Geografis","Sejarah","Semua"], a: "Semua", d: "EASY" },
    { q: "Contoh toleransi ?", o: ["Hormati tradisi","Rendahkan","Anggap terbaik","Tolak"], a: "Hormati tradisi", d: "EASY" },
    { q: "Bhinneka merajut ?", o: ["Perbedaan","Persatuan","Persaingan","Pertikaian"], a: "Persatuan", d: "EASY" },
  ])},
  { cs: "PPKN", title: "NKRI", diff: "MEDIUM", qs: fill10([
    { q: "Bentuk negara Indonesia ?", o: ["Federal","Kesatuan","Serikat","Konfederasi"], a: "Kesatuan", d: "MEDIUM" },
    { q: "Kepala negara Indonesia ?", o: ["PM","Presiden","Raja","Gubernur"], a: "Presiden", d: "MEDIUM" },
    { q: "Dasar hukum negara ?", o: ["Pancasila","UUD 1945","Keduanya","Tap MPR"], a: "Keduanya", d: "MEDIUM" },
    { q: "Ibu kota Indonesia ?", o: ["Jakarta","Bandung","Surabaya","Nusantara"], a: "Nusantara", d: "MEDIUM" },
    { q: "Lambang negara ?", o: ["Bendera","Garuda Pancasila","Pancasila","UUD"], a: "Garuda Pancasila", d: "MEDIUM" },
    { q: "Batas wilayah timur ?", o: ["Samudra Hindia","Papua","Malaysia","Australia"], a: "Papua", d: "MEDIUM" },
    { q: "Batas wilayah barat ?", o: ["Samudra Hindia","Papua","Malaysia","Filipina"], a: "Samudra Hindia", d: "MEDIUM" },
    { q: "Pulau terpadat ?", o: ["Sumatra","Jawa","Kalimantan","Sulawesi"], a: "Jawa", d: "MEDIUM" },
    { q: "Pulau terluas ?", o: ["Sumatra","Jawa","Kalimantan","Papua"], a: "Papua", d: "MEDIUM" },
    { q: "Batas darat dengan Malaysia di ?", o: ["Jawa","Kalimantan","Sumatra","Papua"], a: "Kalimantan", d: "MEDIUM" },
  ])},

  // BING
  { cs: "BING", title: "Greetings", diff: "EASY", qs: fill10([
    { q: "Selamat pagi English ?", o: ["Good night","Good morning","Good evening","Good afternoon"], a: "Good morning", d: "EASY" },
    { q: "How are you dijawab ?", o: ["I am fine","I am student","I am from RI","I am 10"], a: "I am fine", d: "EASY" },
    { q: "Selamat siang English ?", o: ["Good morning","Good afternoon","Good evening","Good night"], a: "Good afternoon", d: "EASY" },
    { q: "Saat berpisah bilang ?", o: ["Hello","Goodbye","How are you","Thanks"], a: "Goodbye", d: "EASY" },
    { q: "Thank you dijawab ?", o: ["You're welcome","Yes","No","Goodbye"], a: "You're welcome", d: "EASY" },
    { q: "Nice to meet you dijawab ?", o: ["Nice too","Goodbye","Thanks","Sorry"], a: "Nice too", d: "EASY" },
    { q: "Selamat malam English ?", o: ["Good night","Good evening","Good afternoon","Good morning"], a: "Good night", d: "EASY" },
    { q: "Perkenalkan diri ?", o: ["My name is","How are you","Goodbye","Thanks"], a: "My name is", d: "EASY" },
    { q: "How do you do untuk ?", o: ["Pertama","Berpisah","Tanya umur","Tanya alamat"], a: "Pertama", d: "EASY" },
    { q: "Good evening artinya ?", o: ["Pagi","Siang","Sore","Malam"], a: "Malam", d: "EASY" },
  ])},
  { cs: "BING", title: "Daily Activities", diff: "EASY", qs: fill10([
    { q: "I ... breakfast.", o: ["Eat","Have","Take","Make"], a: "Have", d: "EASY" },
    { q: "She ... to school.", o: ["Go","Goes","Going","Went"], a: "Goes", d: "EASY" },
    { q: "We ... homework.", o: ["Does","Do","Did","Done"], a: "Do", d: "EASY" },
    { q: "He ... up at 5 AM.", o: ["Wake","Wakes","Woke","Waking"], a: "Wakes", d: "EASY" },
    { q: "They ... TV.", o: ["Watch","Watches","Watched","Watching"], a: "Watch", d: "EASY" },
    { q: "My mother ... lunch.", o: ["Cook","Cooks","Cooked","Cooking"], a: "Cooks", d: "EASY" },
    { q: "I ... my teeth.", o: ["Brush","Brushes","Brushed","Brushing"], a: "Brush", d: "EASY" },
    { q: "She ... English.", o: ["Study","Studies","Studied","Studying"], a: "Studies", d: "EASY" },
    { q: "Father ... to office.", o: ["Go","Goes","Going","Went"], a: "Goes", d: "EASY" },
    { q: "We ... dinner at 7 PM.", o: ["Eat","Have","Take","Make"], a: "Have", d: "EASY" },
  ])},
  { cs: "BING", title: "My School", diff: "EASY", qs: fill10([
    { q: "I study at SD ...", o: ["Nusantara","Negeri","Internasional","Nasional"], a: "Nusantara", d: "EASY" },
    { q: "My teacher ... me.", o: ["Teach","Teaches","Teaching","Taught"], a: "Teaches", d: "EASY" },
    { q: "We ... in class.", o: ["Learn","Learns","Learning","Learned"], a: "Learn", d: "EASY" },
    { q: "I ... Math on Monday.", o: ["Study","Studies","Studying","Studied"], a: "Study", d: "EASY" },
    { q: "Students ... in library.", o: ["Read","Reads","Reading","Readed"], a: "Read", d: "EASY" },
    { q: "The bell ... at 7 AM.", o: ["Ring","Rings","Ringing","Rang"], a: "Rings", d: "EASY" },
    { q: "We ... in the yard.", o: ["Play","Plays","Playing","Played"], a: "Play", d: "EASY" },
    { q: "I ... my teacher.", o: ["Like","Likes","Liking","Liked"], a: "Like", d: "EASY" },
    { q: "The classroom ... clean.", o: ["Am","Is","Are","Be"], a: "Is", d: "EASY" },
    { q: "We ... at 2 PM.", o: ["Go home","Goes home","Going","Went"], a: "Go home", d: "EASY" },
  ])},
  { cs: "BING", title: "My Family", diff: "EASY", qs: fill10([
    { q: "My mother is a ...", o: ["Teacher","Doctor","Nurse","Housewife"], a: "Housewife", d: "EASY" },
    { q: "My father is a ...", o: ["Policeman","Driver","Doctor","Many jobs"], a: "Many jobs", d: "EASY" },
    { q: "I have one ...", o: ["Brother","Father","Mother","Uncle"], a: "Brother", d: "EASY" },
    { q: "My grandparents are ...", o: ["Young","Old","Small","Big"], a: "Old", d: "EASY" },
    { q: "My sister is ... than me.", o: ["Younger","Young","Oldest","Small"], a: "Younger", d: "EASY" },
    { q: "My uncle is my mother's ...", o: ["Brother","Father","Son","Friend"], a: "Brother", d: "EASY" },
    { q: "My aunt is my mother's ...", o: ["Sister","Mother","Daughter","Friend"], a: "Sister", d: "EASY" },
    { q: "My cousin is my uncle's ...", o: ["Child","Father","Mother","Friend"], a: "Child", d: "EASY" },
    { q: "My parents are my ...", o: ["Father and mother","Sister brother","Uncle aunt","Friend"], a: "Father and mother", d: "EASY" },
    { q: "We are a happy ...", o: ["Family","School","Class","Group"], a: "Family", d: "EASY" },
  ])},
  { cs: "BING", title: "Numbers", diff: "EASY", qs: fill10([
    { q: "20 + 10 = ?", o: ["Twenty","Thirty","Forty","Fifty"], a: "Thirty", d: "EASY" },
    { q: "12th month ?", o: ["Nov","Dec","Oct","Jan"], a: "Dec", d: "EASY" },
    { q: "100 in words ?", o: ["Ten","One hundred","Thousand","Hundred"], a: "One hundred", d: "EASY" },
    { q: "First month ?", o: ["Jan","Feb","Mar","Apr"], a: "Jan", d: "EASY" },
    { q: "50 in words ?", o: ["Fifteen","Fifty","Five","Sixty"], a: "Fifty", d: "EASY" },
    { q: "15 in words ?", o: ["Fifty","Fifteen","Five","Fifty"], a: "Fifteen", d: "EASY" },
    { q: "7 day = 1 ?", o: ["Month","Week","Year","Day"], a: "Week", d: "EASY" },
    { q: "365 day = 1 ?", o: ["Month","Week","Year","Day"], a: "Year", d: "EASY" },
    { q: "Third number ?", o: ["One","Two","Three","Four"], a: "Three", d: "EASY" },
    { q: "21 in words ?", o: ["Twelve","Twenty one","Two one","Twenty first"], a: "Twenty one", d: "EASY" },
  ])},
];

// ── Bab grouping per subject ──
const BAB_MAP: Record<string, Record<string, string>> = {
  MTK:   { "Bilangan Bulat": "Bab 1: Bilangan", "Pecahan": "Bab 2: Pecahan", "Bangun Datar": "Bab 3: Geometri", "KPK dan FPB": "Bab 1: Bilangan", "Skala dan Denah": "Bab 2: Pecahan" },
  IPA:   { "Tata Surya": "Bab 1: Alam Semesta", "Makhluk Hidup": "Bab 2: Makhluk Hidup", "Rangka dan Otot": "Bab 2: Makhluk Hidup", "Sumber Daya Alam": "Bab 3: Sumber Daya", "Gaya dan Gerak": "Bab 3: Sumber Daya" },
  BINDO: { "Teks Deskripsi": "Bab 1: Teks", "Pantun": "Bab 2: Sastra", "Cerita Fiksi": "Bab 2: Sastra", "Membaca Intensif": "Bab 1: Teks", "Kata Baku": "Bab 3: Kebahasaan" },
  IPS:   { "Peta dan Globe": "Bab 1: Geografi", "Keragaman Budaya": "Bab 2: Sosial Budaya", "Sejarah Kemerdekaan": "Bab 3: Sejarah", "Kegiatan Ekonomi": "Bab 2: Sosial Budaya", "Letak Geografis": "Bab 1: Geografi" },
  PPKN:  { "Pancasila": "Bab 1: Ideologi", "Hak dan Kewajiban": "Bab 2: Hukum", "Musyawarah": "Bab 3: Demokrasi", "Bhinneka Tunggal Ika": "Bab 1: Ideologi", "NKRI": "Bab 3: Demokrasi" },
  BING:  { "Greetings": "Bab 1: Expressions", "Daily Activities": "Bab 2: Daily Life", "My School": "Bab 2: Daily Life", "My Family": "Bab 2: Daily Life", "Numbers": "Bab 1: Expressions" },
};

const CONTENT_MAP: Record<string, string> = {
  "Bilangan Bulat": "Bilangan bulat adalah bilangan yang tidak memiliki pecahan desimal. Contoh bilangan bulat: -3, -2, -1, 0, 1, 2, 3. Bilangan bulat dapat dijumlahkan, dikurangkan, dikalikan, dan dibagikan. Operasi hitung bilangan bulat mengikuti aturan tertentu. Misalnya, jika kedua bilangan bertanda sama, hasil penjumlahannya adalah jumlah kedua bilangan dengan tanda yang sama.",
  "Pecahan": "Pecahan adalah bilangan yang menyatakan bagian dari keseluruhan. Pecahan ditulis sebagai a/b, di mana a disebut pembilang dan b disebut penyebut. Contoh: 1/2, 3/4, 2/5. Pecahan dapat dijumlahkan, dikurangkan, dikalikan, dan dibagikan. Untuk menjumlahkan pecahan dengan penyebut berbeda, samakan penyebutnya terlebih dahulu dengan mencari KPK.",
  "Bangun Datar": "Bangun datar adalah bangun yang seluruh bagiannya terletak pada satu bidang datar. Contoh bangun datar: persegi, persegi panjang, segitiga, lingkaran, jajar genjang, trapesium, layang-layang, dan belah ketupat. Setiap bangun datar memiliki rumus luas dan keliling yang berbeda. Luas persegi = s x s, luas persegi panjang = p x l, luas segitiga = 1/2 x a x t.",
  "KPK dan FPB": "KPK (Kelipatan Persekutuan Terkecil) adalah bilangan terkecil yang habis dibagi oleh dua bilangan atau lebih. FPB (Faktor Persekutuan Terbesar) adalah bilangan terbesar yang dapat membagi dua bilangan atau lebih. Cara mencari KPK dan FPB dapat menggunakan faktorisasi prima atau pohon faktor.",
  "Skala dan Denah": "Skala adalah perbandingan antara jarak pada peta atau denah dengan jarak sebenarnya. Skala ditulis sebagai 1 : n, artinya 1 cm pada peta mewakili n cm jarak sebenarnya. Rumus skala = jarak peta : jarak sebenarnya. Denah adalah gambar yang menunjukkan letak suatu tempat.",
  "Tata Surya": "Tata Surya adalah kumpulan benda langit yang terdiri dari Matahari sebagai pusatnya dan planet-planet yang mengelilinginya. Ada 8 planet dalam Tata Surya: Merkurius, Venus, Bumi, Mars, Jupiter, Saturnus, Uranus, dan Neptunus. Bumi adalah satu-satunya planet yang memiliki kehidupan.",
  "Makhluk Hidup": "Makhluk hidup memiliki ciri-ciri: bergerak, bernapas, tumbuh, berkembang biak, memerlukan makanan, peka terhadap rangsangan, dan mengeluarkan zat sisa. Makhluk hidup dibagi menjadi manusia, hewan, dan tumbuhan. Hewan dibedakan menjadi herbivor (pemakan tumbuhan), karnivor (pemakan daging), dan omnivor (pemakan segalanya).",
  "Rangka dan Otot": "Rangka manusia berfungsi melindungi organ tubuh, menegakkan tubuh, dan menjadi tempat melekatnya otot. Tulang penyusun rangka: tengkorak, tulang badan, dan tulang anggota gerak. Otot adalah jaringan yang dapat berkontraksi dan berelaksasi untuk menghasilkan gerakan. Otot dibedakan menjadi otot lurik, otot polos, dan otot jantung.",
  "Sumber Daya Alam": "Sumber Daya Alam (SDA) adalah segala sesuatu yang berasal dari alam yang dapat digunakan untuk memenuhi kebutuhan manusia. SDA dibedakan menjadi SDA terbarukan (air, udara, tumbuhan) dan SDA tidak terbarukan (minyak bumi, batu bara). Kita harus bijak dalam menggunakan SDA agar tidak habis.",
  "Gaya dan Gerak": "Gaya adalah tarikan atau dorongan yang dapat menyebabkan benda bergerak, berubah bentuk, atau berubah arah. Satuan gaya adalah Newton. Gaya dapat dibedakan menjadi gaya sentuh (gesek, pegas, otot) dan gaya tak sentuh (gravitasi, magnet, listrik). Gerak adalah perubahan posisi benda terhadap titik acuan.",
  "Teks Deskripsi": "Teks deskripsi adalah teks yang menggambarkan suatu objek, tempat, atau peristiwa secara detail sehingga pembaca seolah-olah melihat, mendengar, atau merasakan objek yang dideskripsikan. Ciri teks deskripsi: menggunakan kata sifat, kalimat terperinci, dan bertujuan menggambarkan. Struktur: identifikasi dan deskripsi bagian.",
  "Pantun": "Pantun adalah puisi lama yang terdiri dari 4 baris. Baris 1-2 disebut sampiran, baris 3-4 disebut isi. Pantun memiliki rima a-b-a-b. Setiap baris terdiri dari 8-12 suku kata. Pantun dibedakan menjadi pantun jenaka, pantun nasihat, pantun teka-teki, dan pantun agama.",
  "Cerita Fiksi": "Cerita fiksi adalah cerita rekaan atau khayalan yang tidak berdasarkan kejadian nyata. Contoh cerita fiksi: dongeng, cerpen, novel, fabel. Unsur intrinsik cerita fiksi: tema, tokoh, alur, latar, amanat, sudut pandang. Tokoh dibedakan menjadi protagonis (baik) dan antagonis (jahat).",
  "Membaca Intensif": "Membaca intensif adalah kegiatan membaca yang dilakukan secara saksama untuk memahami isi bacaan secara mendetail. Tujuannya adalah menemukan ide pokok, informasi spesifik, dan kesimpulan dari bacaan. Ide pokok bisa terletak di awal paragraf (deduktif) atau di akhir paragraf (induktif).",
  "Kata Baku": "Kata baku adalah kata yang penulisannya sesuai dengan kaidah standar bahasa Indonesia (KBBI). Kata tidak baku adalah kata yang penulisannya tidak sesuai kaidah. Contoh: aktif (baku), aktip (tidak baku); izin (baku), ijin (tidak baku); sistem (baku), sistim (tidak baku).",
  "Peta dan Globe": "Peta adalah gambaran permukaan bumi pada bidang datar dengan skala tertentu. Globe adalah model bola bumi. Komponen peta: judul, skala, orientasi (penunjuk arah), legenda (keterangan simbol), garis tepi, dan tahun pembuatan. Warna peta: biru (air), hijau (dataran rendah), coklat (pegunungan).",
  "Keragaman Budaya": "Indonesia memiliki keragaman suku, budaya, bahasa, dan agama. Bhinneka Tunggal Ika adalah semboyan yang berarti berbeda-beda tetapi tetap satu. Keragaman budaya meliputi rumah adat, tarian, lagu daerah, pakaian adat, dan makanan khas. Kita harus saling menghormati keragaman tersebut.",
  "Sejarah Kemerdekaan": "Kemerdekaan Indonesia diproklamasikan pada 17 Agustus 1945 oleh Soekarno-Hatta. Teks proklamasi diketik oleh Sayuti Melik. Bendera merah putih dijahit oleh Fatmawati. Peristiwa Rengasdengklok terjadi pada 16 Agustus 1945. Pertempuran Surabaya pada 10 November diperingati sebagai Hari Pahlawan.",
  "Kegiatan Ekonomi": "Kegiatan ekonomi terdiri dari produksi (menghasilkan barang), distribusi (menyalurkan barang), dan konsumsi (menggunakan barang). Pelaku ekonomi: rumah tangga, perusahaan, pemerintah. Badan usaha: BUMN (milik negara), BUMS (milik swasta), koperasi (asas kekeluargaan). Pasar adalah tempat bertemunya penjual dan pembeli.",
  "Letak Geografis": "Indonesia terletak di antara dua benua (Asia dan Australia) dan dua samudra (Pasifik dan Hindia). Letak ini disebut posisi silang. Indonesia memiliki sekitar 17.000 pulau. Iklim Indonesia adalah tropis. Indonesia memiliki 2 musim: hujan dan kemarau. Garis khatulistiwa melewati Indonesia.",
  "Pancasila": "Pancasila adalah dasar negara Indonesia yang terdiri dari 5 sila. Sila 1: Ketuhanan YME, Sila 2: Kemanusiaan, Sila 3: Persatuan, Sila 4: Kerakyatan, Sila 5: Keadilan. Lambang Pancasila: bintang, rantai, pohon beringin, kepala banteng, padi kapas. Pancasila disahkan pada 18 Agustus 1945.",
  "Hak dan Kewajiban": "Hak adalah sesuatu yang kita terima, kewajiban adalah sesuatu yang harus kita lakukan. Contoh hak anak: mendapat pendidikan, kasih sayang, bermain. Contoh kewajiban siswa: belajar, menghormati guru, mematuhi aturan. Hak asasi manusia (HAM) adalah hak dasar yang dimiliki setiap manusia.",
  "Musyawarah": "Musyawarah adalah cara pengambilan keputusan bersama yang sesuai dengan sila ke-4 Pancasila. Dalam musyawarah, setiap orang berhak menyampaikan pendapat. Keputusan diambil secara mufakat (kesepakatan bersama). Jika tidak mufakat, dilakukan voting. Gotong royong adalah nilai kebersamaan yang memperkuat musyawarah.",
  "Bhinneka Tunggal Ika": "Bhinneka Tunggal Ika berarti berbeda-beda tetapi tetap satu. Semboyan ini terdapat pada lambang negara Garuda Pancasila. Indonesia memiliki lebih dari 1.300 suku, 6 agama yang diakui, dan ratusan bahasa daerah. Sikap toleransi diperlukan untuk menjaga persatuan dalam keberagaman.",
  "NKRI": "NKRI adalah Negara Kesatuan Republik Indonesia. Bentuk negara Indonesia adalah kesatuan. Kepala negara adalah Presiden. Dasar hukum negara adalah Pancasila dan UUD 1945. Lambang negara adalah Garuda Pancasila. Ibu kota negara adalah Nusantara. Wilayah Indonesia membentang dari Sabang sampai Merauke.",
  "Greetings": "Greetings adalah ungkapan sapaan dalam bahasa Inggris. Contoh: Good morning (selamat pagi), Good afternoon (selamat siang), Good evening (selamat sore), Good night (selamat malam). Cara memperkenalkan diri: My name is ... Cara menjawab sapaan: I am fine, thank you. Ungkapan perpisahan: Goodbye.",
  "Daily Activities": "Daily activities adalah kegiatan sehari-hari dalam bahasa Inggris. Contoh: I wake up at 5 AM, I have breakfast, I go to school, I study Math, I play with friends, I do homework, I have dinner, I watch TV, I brush my teeth, I go to sleep. Gunakan verb sesuai subjek (I/You/We/They + verb1, He/She/It + verb1+s/es).",
  "My School": "My School adalah tema tentang lingkungan sekolah dalam bahasa Inggris. Contoh kalimat: I study at SD Nusantara, My teacher teaches me, We learn in class, The bell rings at 7 AM, We play in the yard, I like my teacher, The classroom is clean, We go home at 2 PM.",
  "My Family": "My Family adalah tema tentang keluarga dalam bahasa Inggris. Anggota keluarga: father (ayah), mother (ibu), brother (saudara laki-laki), sister (saudara perempuan), grandfather (kakek), grandmother (nenek), uncle (paman), aunt (bibi), cousin (sepupu). Contoh: My mother is a housewife, My father is a teacher.",
  "Numbers": "Numbers adalah tema tentang angka dalam bahasa Inggris. Angka 1-10: one, two, three, four, five, six, seven, eight, nine, ten. Angka 11-20: eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty. Hari dalam seminggu: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.",
};

const VIDEO_MAP: Record<string, { title: string; url: string; duration: number }[]> = {
  "Bilangan Bulat": [{ title: "Video Bilangan Bulat", url: "https://www.youtube.com/embed/7_MUYu2f2iA", duration: 480 }],
  "Pecahan": [{ title: "Video Pecahan", url: "https://www.youtube.com/embed/6dTnFmvd0FE", duration: 540 }],
  "Bangun Datar": [{ title: "Video Bangun Datar", url: "https://www.youtube.com/embed/1LMr0FbUeR4", duration: 600 }],
  "KPK dan FPB": [{ title: "Video KPK dan FPB", url: "https://www.youtube.com/embed/0r4VqFqO9js", duration: 420 }],
  "Skala dan Denah": [{ title: "Video Skala dan Denah", url: "https://www.youtube.com/embed/WVREmBz-LYA", duration: 360 }],
  "Tata Surya": [{ title: "Video Tata Surya", url: "https://www.youtube.com/embed/F2prtmMFXGg", duration: 600 }],
  "Makhluk Hidup": [{ title: "Video Makhluk Hidup", url: "https://www.youtube.com/embed/kL2sX8KQk_I", duration: 480 }],
  "Rangka dan Otot": [{ title: "Video Rangka dan Otot", url: "https://www.youtube.com/embed/3CbRQVjC5_s", duration: 540 }],
  "Sumber Daya Alam": [{ title: "Video Sumber Daya Alam", url: "https://www.youtube.com/embed/0vSSUvdfJ4M", duration: 420 }],
  "Gaya dan Gerak": [{ title: "Video Gaya dan Gerak", url: "https://www.youtube.com/embed/l-cE6VU6kIY", duration: 480 }],
  "Teks Deskripsi": [{ title: "Video Teks Deskripsi", url: "https://www.youtube.com/embed/Z_1rQf5vP5M", duration: 360 }],
  "Pantun": [{ title: "Video Pantun", url: "https://www.youtube.com/embed/PNHqbV1YJHU", duration: 420 }],
  "Cerita Fiksi": [{ title: "Video Cerita Fiksi", url: "https://www.youtube.com/embed/FTcdRlJCpno", duration: 480 }],
  "Membaca Intensif": [{ title: "Video Membaca Intensif", url: "https://www.youtube.com/embed/9-niL0zT4Aw", duration: 360 }],
  "Kata Baku": [{ title: "Video Kata Baku", url: "https://www.youtube.com/embed/MRm6qNEJscs", duration: 300 }],
  "Peta dan Globe": [{ title: "Video Peta dan Globe", url: "https://www.youtube.com/embed/MCjTGF4xBEI", duration: 420 }],
  "Keragaman Budaya": [{ title: "Video Keragaman Budaya", url: "https://www.youtube.com/embed/6qjCcBBYxls", duration: 480 }],
  "Sejarah Kemerdekaan": [{ title: "Video Sejarah Kemerdekaan", url: "https://www.youtube.com/embed/eD_sYWdKm2E", duration: 600 }],
  "Kegiatan Ekonomi": [{ title: "Video Kegiatan Ekonomi", url: "https://www.youtube.com/embed/b0NfF6Mdp0A", duration: 360 }],
  "Letak Geografis": [{ title: "Video Letak Geografis", url: "https://www.youtube.com/embed/mR4Z2LbZfnY", duration: 420 }],
  "Pancasila": [{ title: "Video Pancasila", url: "https://www.youtube.com/embed/KRj8r6Y5TJE", duration: 480 }],
  "Hak dan Kewajiban": [{ title: "Video Hak dan Kewajiban", url: "https://www.youtube.com/embed/tN0r_17qMKM", duration: 360 }],
  "Musyawarah": [{ title: "Video Musyawarah", url: "https://www.youtube.com/embed/aTLM4CTyUyk", duration: 300 }],
  "Bhinneka Tunggal Ika": [{ title: "Video Bhinneka Tunggal Ika", url: "https://www.youtube.com/embed/Bf2XjRs2twQ", duration: 420 }],
  "NKRI": [{ title: "Video NKRI", url: "https://www.youtube.com/embed/sAFJVClzYqo", duration: 480 }],
  "Greetings": [{ title: "Video Greetings", url: "https://www.youtube.com/embed/gVIFEVLzP6o", duration: 360 }],
  "Daily Activities": [{ title: "Video Daily Activities", url: "https://www.youtube.com/embed/FEaLYP6dLqE", duration: 420 }],
  "My School": [{ title: "Video My School", url: "https://www.youtube.com/embed/yswIEq15HJM", duration: 360 }],
  "My Family": [{ title: "Video My Family", url: "https://www.youtube.com/embed/FGlXq6T0r_I", duration: 360 }],
  "Numbers": [{ title: "Video Numbers", url: "https://www.youtube.com/embed/e0dJWfQHF8Y", duration: 300 }],
};

async function main() {
  // delete all
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

  // users
  const uKepsek = await prisma.user.create({ data: { email: "kepsek@test.com", passwordHash: ph, role: "PRINCIPAL", name: "Kepsek SD Nusantara" } });
  await prisma.principal.create({ data: { userId: uKepsek.id, nip: "197501012010011001" } });
  const uGuru = await prisma.user.create({ data: { email: "guru@test.com", passwordHash: ph, role: "TEACHER", name: "Bu Dewi Guru Kelas" } });
  const teacher = await prisma.teacher.create({ data: { userId: uGuru.id, nip: "198505152010012002" } });
  const uOrtu = await prisma.user.create({ data: { email: "ortu@test.com", passwordHash: ph, role: "PARENT", name: "Orang Tua Tomoyo" } });
  const parent = await prisma.parent.create({ data: { userId: uOrtu.id, phone: "08123456789" } });

  // students
  const studentDefs = [
    { email: "kagumi@test.com", name: "Kagumi",   kelas: "1-A", grade: 1, nis: "0011234567", parent: null },
    { email: "shiro@test.com",  name: "Shiro",    kelas: "2-A", grade: 2, nis: "0021234567", parent: null },
    { email: "megumi@test.com", name: "Megumi",   kelas: "3-A", grade: 3, nis: "0031234567", parent: null },
    { email: "serika@test.com", name: "Serika",   kelas: "4-A", grade: 4, nis: "0041234567", parent: null },
    { email: "kumamoto@test.com", name: "Kumamoto", kelas: "5-A", grade: 5, nis: "0051234567", parent: null },
    { email: "simon@test.com", name: "Tomoyo",    kelas: "6-A", grade: 6, nis: "0061234567", parent: parent.id },
  ];

  const classCache: Record<string, any> = {};

  for (const sd of studentDefs) {
    if (!classCache[sd.kelas]) {
      classCache[sd.kelas] = await prisma.class.create({ data: { name: sd.kelas, gradeLevel: sd.grade, academicYear: 2026, homeroomTeacherId: teacher.id } });
    }
    const u = await prisma.user.create({ data: { email: sd.email, passwordHash: ph, role: "STUDENT", name: sd.name } });
    await prisma.student.create({
      data: { userId: u.id, nis: sd.nis, classId: classCache[sd.kelas].id, parentId: sd.parent, birthdate: new Date(`${2014 - (sd.grade - 1)}-01-15`) },
    });
  }

  console.log("users + classes + students created");

  // subjects (global)
  const subjects: Record<string, any> = {};
  for (const sd of SUBJECT_DEFS) {
    subjects[sd.code] = await prisma.subject.create({ data: sd });
  }

  // class-subject links for ALL classes (needed for structure)
  const allClasses = Object.values(classCache);
  for (const cls of allClasses) {
    for (const sd of SUBJECT_DEFS) {
      await prisma.classSubject.create({
        data: { classId: cls.id, subjectId: subjects[sd.code].id, teacherId: teacher.id, semester: 1, academicYear: 2026 },
      });
    }
  }

  // ONLY populate grade 6 materials + questions
  const g6Cls = classCache["6-A"];
  const g6CSs: Record<string, any> = {};
  for (const sd of SUBJECT_DEFS) {
    g6CSs[sd.code] = await prisma.classSubject.findFirst({ where: { classId: g6Cls.id, subjectId: subjects[sd.code].id } });
  }

  for (let i = 0; i < GRADE6_MATERIALS.length; i++) {
    const def = GRADE6_MATERIALS[i];
    const cs = g6CSs[def.cs];
    const bab = BAB_MAP[def.cs]?.[def.title] ?? null;
    const contentText = CONTENT_MAP[def.title] ?? null;
    const mat = await prisma.material.create({
      data: { title: def.title, bab, contentText, classSubjectId: cs.id, difficulty: def.diff, isPublished: true, orderIndex: i + 1 },
    });
    for (const q of def.qs) {
      await prisma.question.create({
        data: { materialId: mat.id, questionText: q.q, options: q.o, correctAnswer: q.a, difficulty: q.d, orderIndex: def.qs.indexOf(q) + 1 },
      });
    }
    const videos = VIDEO_MAP[def.title] ?? [];
    for (const v of videos) {
      await prisma.video.create({
        data: { materialId: mat.id, title: v.title, embedUrl: v.url, durationSeconds: v.duration, pointReward: 5 },
      });
    }
    console.log(`  6-A ${def.cs} - ${def.title}: ${def.qs.length} soal, ${videos.length} video`);
  }

  // student progress for grade 6
  const g6student = await prisma.student.findFirst({ where: { classId: g6Cls.id } });
  if (g6student) {
    for (const sd of SUBJECT_DEFS) {
      await prisma.studentProgress.create({
        data: { studentId: g6student.id, classSubjectId: g6CSs[sd.code].id, completionPercent: 10 + Math.floor(Math.random() * 50), totalScore: 10 + Math.floor(Math.random() * 80) },
      });
    }
  }

  console.log("\nSEED SD SELESAI!");
  console.log("kepsek@test.com / password123");
  console.log("guru@test.com / password123");
  console.log("kagumi@test.com / password123 (Kelas 1)");
  console.log("shiro@test.com / password123 (Kelas 2)");
  console.log("megumi@test.com / password123 (Kelas 3)");
  console.log("serika@test.com / password123 (Kelas 4)");
  console.log("kumamoto@test.com / password123 (Kelas 5)");
  console.log("simon@test.com / password123 (Tomoyo - Kelas 6)");
  console.log("ortu@test.com / password123 (Orang Tua Tomoyo)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
