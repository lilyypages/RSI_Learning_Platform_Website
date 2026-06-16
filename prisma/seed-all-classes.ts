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

const SUBJECTS = [
  { name: "Matematika", code: "MTK" },
  { name: "Ilmu Pengetahuan Alam", code: "IPA" },
  { name: "Bahasa Indonesia", code: "BINDO" },
  { name: "Ilmu Pengetahuan Sosial", code: "IPS" },
  { name: "PPKn", code: "PPKN" },
  { name: "Bahasa Inggris", code: "BING" },
];

type GradeData = { clsName: string; grade: number; studentName: string; studentEmail: string; studentNis: string; parentId?: string; materials: { cs: string; title: string; diff: string; qs: Q[] }[] };

const LABEL = ["A", "B", "C", "D"];

function fill10(qs: Q[]): Q[] {
  const r = [...qs];
  const ds = ["EASY", "MEDIUM", "HARD"];
  let fi = 0;
  while (r.length < 10) {
    const d = ds[fi % 3]; fi++;
    const idx = r.length + 1;
    r.push({ q: `Soal pelengkap ${idx} ?`, o: ["Pil A", "Pil B", "Pil C", "Pil D"], a: "Pil B", d });
  }
  return r;
}

function M(cs: string, title: string, diff: string, qs: Q[]) {
  return { cs, title, diff, qs: fill10(qs) };
}

function mc(q: string, aIdx: number, opts: string[], d: string): Q {
  return { q, o: opts, a: opts[aIdx] ?? opts[0], d };
}

const GRADE_MATERIALS: Record<number, ReturnType<typeof M>[]> = {
  1: [
    // MTK
    M("MTK", "Angka 1-10", "EASY", [
      mc("Lambang bilangan lima adalah ?", 2, ["3","4","5","6"], "EASY"),
      mc("7 + 2 = ?", 3, ["8","10","12","9"], "EASY"),
      mc("6 - 4 = ?", 0, ["2","3","4","5"], "EASY"),
      mc("Jumlah jari tangan ada ?", 2, ["5","8","10","12"], "EASY"),
      mc("Benda yang bentuknya segitiga ?", 1, ["Bola","Penggaris segitiga","Koin","Buku"], "EASY"),
      mc("Angka yang lebih besar dari 7 ?", 2, ["5","6","8","4"], "EASY"),
      mc("4 + 3 = ?", 0, ["7","8","9","10"], "EASY"),
      mc("9 - 5 = ?", 1, ["3","4","5","6"], "EASY"),
      mc("Bilangan 8 dilambangkan ?", 3, ["Enam","Tujuh","Sembilan","Delapan"], "EASY"),
      mc("3 + 6 = ?", 2, ["8","10","9","6"], "EASY"),
    ]),
    M("MTK", "Penjumlahan Sederhana", "EASY", [
      mc("2 + 2 = ?", 1, ["3","4","5","6"], "EASY"),
      mc("5 + 1 = ?", 2, ["5","7","6","8"], "EASY"),
      mc("3 + 4 = ?", 0, ["7","8","9","6"], "EASY"),
      mc("1 + 9 = ?", 2, ["9","11","10","8"], "EASY"),
      mc("6 + 3 = ?", 3, ["8","7","10","9"], "EASY"),
      mc("4 + 4 = ?", 2, ["6","7","8","9"], "EASY"),
      mc("7 + 1 = ?", 0, ["8","6","9","10"], "EASY"),
      mc("2 + 6 = ?", 1, ["7","8","9","10"], "EASY"),
      mc("5 + 5 = ?", 0, ["10","9","8","11"], "EASY"),
      mc("3 + 3 = ?", 0, ["6","7","8","9"], "EASY"),
    ]),
    M("MTK", "Pengurangan Sederhana", "EASY", [
      mc("8 - 3 = ?", 1, ["4","5","6","7"], "EASY"),
      mc("7 - 2 = ?", 2, ["4","6","5","3"], "EASY"),
      mc("10 - 4 = ?", 0, ["6","7","8","5"], "EASY"),
      mc("9 - 6 = ?", 3, ["2","4","5","3"], "EASY"),
      mc("5 - 1 = ?", 1, ["3","4","5","6"], "EASY"),
      mc("6 - 3 = ?", 2, ["2","4","3","5"], "EASY"),
      mc("10 - 7 = ?", 0, ["3","4","5","2"], "EASY"),
      mc("8 - 5 = ?", 3, ["2","4","5","3"], "EASY"),
      mc("4 - 2 = ?", 0, ["2","3","4","1"], "EASY"),
      mc("9 - 3 = ?", 1, ["5","6","7","8"], "EASY"),
    ]),
    M("MTK", "Membandingkan Bilangan", "EASY", [
      mc("7 ... 4, tanda yang benar ?", 0, [">","<","=","+"], "EASY"),
      mc("Bilangan terkecil dari 3,7,1 ?", 3, ["3","7","5","1"], "EASY"),
      mc("Bilangan terbesar dari 4,9,2 ?", 2, ["4","2","9","6"], "EASY"),
      mc("6 ... 6, tanda yang benar ?", 2, [">","<","=","-"], "EASY"),
      mc("Angka antara 4 dan 6 ?", 1, ["3","5","7","8"], "EASY"),
      mc("3 ... 8, tanda yang benar ?", 1, [">","<","=","+"], "EASY"),
      mc("Bilangan 5 lebih ... dari 2 ?", 0, ["Besar","Kecil","Sama","Kurang"], "EASY"),
      mc("Bilangan 3 lebih ... dari 7 ?", 0, ["Kecil","Besar","Sama","Panjang"], "EASY"),
      mc("Angka yang lebih kecil dari 6 ?", 0, ["4","7","8","9"], "EASY"),
      mc("Urutan 2,5,1,4 dari terkecil ?", 2, ["1,2,4,5","2,1,4,5","1,2,5,4","5,4,2,1"], "EASY"),
    ]),
    M("MTK", "Bangun Dasar", "EASY", [
      mc("Bentuk bola adalah ?", 2, ["Kotak","Segitiga","Bulat","Persegi"], "EASY"),
      mc("Benda berbentuk lingkaran ?", 0, ["Koin","Buku","Meja","Pintu"], "EASY"),
      mc("Benda berbentuk persegi ?", 3, ["Bola","Piring","Gelas","Ubin"], "EASY"),
      mc("Segitiga memiliki ... sisi ?", 0, ["3","4","5","2"], "EASY"),
      mc("Persegi memiliki ... sisi ?", 1, ["3","4","5","2"], "EASY"),
      mc("Lingkaran tidak memiliki ?", 0, ["Sudut","Sisi","Bentuk","Garis"], "EASY"),
      mc("Bentuk pensil seperti ?", 2, ["Bola","Kotak","Tabung","Segitiga"], "EASY"),
      mc("Buku berbentuk ?", 0, ["Persegi panjang","Lingkaran","Segitiga","Bola"], "EASY"),
      mc("Piring berbentuk ?", 1, ["Kotak","Lingkaran","Segitiga","Tabung"], "EASY"),
      mc("Penggaris segitiga berbentuk ?", 2, ["Lingkaran","Kotak","Segitiga","Persegi"], "EASY"),
    ]),

    // IPA
    M("IPA", "Tubuhku", "EASY", [
      mc("Bagian tubuh untuk melihat ?", 3, ["Telinga","Hidung","Mulut","Mata"], "EASY"),
      mc("Bagian tubuh untuk mendengar ?", 0, ["Telinga","Mata","Hidung","Lidah"], "EASY"),
      mc("Bagian tubuh untuk mencium ?", 2, ["Mata","Telinga","Hidung","Kulit"], "EASY"),
      mc("Kaki digunakan untuk ?", 2, ["Memegang","Melihat","Berjalan","Bernapas"], "EASY"),
      mc("Tangan digunakan untuk ?", 0, ["Memegang","Berjalan","Melompat","Duduk"], "EASY"),
      mc("Lidah digunakan untuk ?", 1, ["Melihat","Mengecap","Mendengar","Mencium"], "EASY"),
      mc("Kulit digunakan untuk ?", 2, ["Melihat","Bernapas","Merasakan","Berlari"], "EASY"),
      mc("Jumlah jari tangan ?", 2, ["5","8","10","12"], "EASY"),
      mc("Rambut tumbuh di ?", 0, ["Kepala","Kaki","Tangan","Perut"], "EASY"),
      mc("Gigi digunakan untuk ?", 3, ["Melihat","Bernapas","Berbicara","Mengunyah"], "EASY"),
    ]),
    M("IPA", "Hewan di Sekitarku", "EASY", [
      mc("Hewan yang bisa terbang ?", 1, ["Kucing","Burung","Ikan","Kambing"], "EASY"),
      mc("Hewan yang berenang di air ?", 3, ["Ayam","Kambing","Kucing","Ikan"], "EASY"),
      mc("Kucing berkembang biak dengan ?", 1, ["Bertelur","Melahirkan","Membelah","Tunas"], "EASY"),
      mc("Hewan berkaki empat ?", 2, ["Ayam","Burung","Kambing","Bebek"], "EASY"),
      mc("Ayam berkembang biak dengan ?", 0, ["Bertelur","Melahirkan","Membelah","Tunas"], "EASY"),
      mc("Hewan bersayap ?", 3, ["Kucing","Kambing","Ular","Burung"], "EASY"),
      mc("Ikan bernapas dengan ?", 2, ["Paru","Trakea","Insang","Kulit"], "EASY"),
      mc("Hewan berkaki dua ?", 0, ["Ayam","Kucing","Kambing","Sapi"], "EASY"),
      mc("Kucing suka makan ?", 2, ["Rumput","Biji","Ikan","Daun"], "EASY"),
      mc("Hewan paling besar ?", 1, ["Kucing","Gajah","Ayam","Kambing"], "EASY"),
    ]),
    M("IPA", "Tumbuhan", "EASY", [
      mc("Tumbuhan butuh ?", 1, ["Batu","Air","Plastik","Kertas"], "EASY"),
      mc("Bunga yang indah biasanya berwarna ?", 2, ["Hitam","Abu","Merah","Coklat"], "EASY"),
      mc("Daun biasanya berwarna ?", 1, ["Merah","Hijau","Biru","Kuning"], "EASY"),
      mc("Batang pohon tempat ?", 3, ["Daun","Air","Akar","Batang"], "EASY"),
      mc("Akar berada di ?", 1, ["Atas","Tanah","Udara","Daun"], "EASY"),
      mc("Tumbuhan butuh sinar ?", 0, ["Matahari","Bulan","Bintang","Lampu"], "EASY"),
      mc("Buah yang warnanya merah ?", 3, ["Jeruk","Pisang","Anggur","Apel"], "EASY"),
      mc("Buah yang warnanya kuning ?", 1, ["Apel","Pisang","Anggur","Semangka"], "EASY"),
      mc("Tumbuhan tumbuh dari ?", 0, ["Biji","Batu","Plastik","Kertas"], "EASY"),
      mc("Bunga mawar memiliki ?", 0, ["Duri","Bulu","Sisik","Cangkang"], "EASY"),
    ]),
    M("IPA", "Lingkunganku", "EASY", [
      mc("Udara yang segar terasa di ?", 1, ["Kota","Pedesaan","Pabrik","Jalan raya"], "EASY"),
      mc("Membuang sampah harus di ?", 3, ["Sungai","Jalan","Halaman","Tempat sampah"], "EASY"),
      mc("Air bersih terlihat ?", 0, ["Bening","Keruh","Kotor","Bau"], "EASY"),
      mc("Tanaman membuat udara ?", 1, ["Kotor","Sejuk","Panas","Bau"], "EASY"),
      mc("Menyiram tanaman setiap ?", 0, ["Pagi","Malam","Minggu","Bulan"], "EASY"),
      mc("Lingkungan bersih membuat ?", 3, ["Sakit","Kotor","Bau","Sehat"], "EASY"),
      mc("Kegiatan merawat taman ?", 0, ["Menyiram","Membuang","Merusak","Mematahkan"], "EASY"),
      mc("Sampah organik contohnya ?", 1, ["Plastik","Daun kering","Botol","Kaleng"], "EASY"),
      mc("Halaman rumah sebaiknya ?", 0, ["Bersih","Kotor","Berantakan","Bau"], "EASY"),
      mc("Buang air kecil di ?", 1, ["Sungai","Toilet","Jalan","Halaman"], "EASY"),
    ]),
    M("IPA", "Cuaca", "EASY", [
      mc("Saat hujan kita pakai ?", 3, ["Topi","Jaket","Sweater","Payung"], "EASY"),
      mc("Matahari terasa ?", 2, ["Dingin","Sejuk","Panas","Basah"], "EASY"),
      mc("Langit mendung menandakan ?", 0, ["Hujan","Panas","Cerah","Salju"], "EASY"),
      mc("Saat cuaca panas kita merasa ?", 3, ["Dingin","Sejuk","Basah","Haus"], "EASY"),
      mc("Pelangi muncul setelah ?", 1, ["Pagi","Hujan","Malam","Siang"], "EASY"),
      mc("Angin kencang disebut ?", 2, ["Hujan","Panas","Badai","Salju"], "EASY"),
      mc("Saat hujan jalanan menjadi ?", 0, ["Basah","Kering","Panas","Bersih"], "EASY"),
      mc("Cuaca cerah langit berwarna ?", 1, ["Abu","Biru","Merah","Hitam"], "EASY"),
      mc("Awan berwarna ?", 2, ["Biru","Hitam","Putih","Merah"], "EASY"),
      mc("Hujan turun dari ?", 0, ["Awan","Tanah","Pohon","Gunung"], "EASY"),
    ]),

    // BINDO
    M("BINDO", "Huruf dan Kata", "EASY", [
      mc("Huruf pertama abjad ?", 0, ["A","B","C","D"], "EASY"),
      mc("Huruf terakhir abjad ?", 3, ["X","Y","V","Z"], "EASY"),
      mc("Kata 'ibu' terdiri ... huruf ?", 1, ["2","3","4","5"], "EASY"),
      mc("B-u-d-i dibaca ?", 2, ["Budi","Bada","Budi","Bidu"], "EASY"),
      mc("Huruf vokal contohnya ?", 0, ["A","B","C","D"], "EASY"),
      mc("Kata yang tepat untuk gambar kucing ?", 2, ["Anjing","Ikan","Kucing","Burung"], "EASY"),
      mc("A-y-a-h dibaca ?", 1, ["Ibu","Ayah","Kakak","Adik"], "EASY"),
      mc("Kata 'mata' diawali huruf ?", 0, ["M","N","L","K"], "EASY"),
      mc("Banyak huruf dalam 'sekolah' ?", 1, ["6","7","8","9"], "EASY"),
      mc("Kata 'buku' berakhiran huruf ?", 3, ["B","K","U","A"], "EASY"),
    ]),
    M("BINDO", "Kata Sehari-hari", "EASY", [
      mc("Ucapan saat bertemu ?", 0, ["Halo","Selamat tinggal","Terima kasih","Maaf"], "EASY"),
      mc("Ucapan saat diberi ?", 2, ["Halo","Maaf","Terima kasih","Selamat pagi"], "EASY"),
      mc("Kata untuk meminta maaf ?", 2, ["Halo","Terima kasih","Maaf","Selamat"], "EASY"),
      mc("Ibu memasak di ?", 2, ["Kamar","Taman","Dapur","Kantor"], "EASY"),
      mc("Adik tidur di ?", 1, ["Dapur","Kamar tidur","Taman","Kantor"], "EASY"),
      mc("Ayah bekerja di ?", 0, ["Kantor","Dapur","Taman","Kamar"], "EASY"),
      mc("Kakak belajar di ?", 2, ["Kantor","Dapur","Sekolah","Taman"], "EASY"),
      mc("Kata untuk menanyakan nama ?", 3, ["Apa","Dimana","Kapan","Siapa"], "EASY"),
      mc("Kata untuk menanyakan tempat ?", 1, ["Apa","Dimana","Siapa","Mengapa"], "EASY"),
      mc("Kata untuk menanyakan waktu ?", 2, ["Apa","Siapa","Kapan","Dimana"], "EASY"),
    ]),
    M("BINDO", "Membaca Sederhana", "EASY", [
      mc("Ini ... buku. Kata yang tepat ?", 1, ["Adalah","Buku","Pena","Meja"], "EASY"),
      mc("Kalimat yang benar ?", 0, ["Saya pergi sekolah","Sekolah pergi saya","Pergi saya sekolah","Saya sekolah pergi"], "EASY"),
      mc("Budi ... sepeda. Kata tepat ?", 2, ["Tidur","Makan","Naik","Minum"], "EASY"),
      mc("Ayah membaca ?", 0, ["Koran","Nasi","Air","Sepeda"], "EASY"),
      mc("Ibu ... sayur. Kata tepat ?", 3, ["Tidur","Baca","Tulis","Masak"], "EASY"),
      mc("Adik bermain ?", 2, ["Tidur","Makan","Bola","Baca"], "EASY"),
      mc("Kakak menulis dengan ?", 1, ["Buku","Pensil","Sepatu","Topi"], "EASY"),
      mc("Saya minum dengan ?", 2, ["Piring","Sendok","Gelas","Mangkok"], "EASY"),
      mc("Kucing makan ?", 3, ["Nasi","Sayur","Buah","Ikan"], "EASY"),
      mc("Burung terbang dengan ?", 0, ["Sayap","Kaki","Paruh","Ekor"], "EASY"),
    ]),
    M("BINDO", "Cerita Sederhana", "EASY", [
      mc("Cerita tentang kucing disebut ?", 1, ["Dongeng","Fabel","Mite","Legenda"], "EASY"),
      mc("Tokoh dalam cerita bisa ?", 2, ["Hanya manusia","Hanya hewan","Manusia atau hewan","Batu"], "EASY"),
      mc("Pesan dalam cerita disebut ?", 1, ["Judul","Amanat","Tokoh","Latar"], "EASY"),
      mc("Cerita Kancil dan Buaya termasuk ?", 0, ["Fabel","Legenda","Mite","Sage"], "EASY"),
      mc("Dalam cerita, Kancil bersifat ?", 0, ["Cerdik","Malas","Pemarah","Sombong"], "EASY"),
      mc("Cerita dimulai dengan kata ?", 2, ["Akhirnya","Lalu","Pada suatu hari","Maka"], "EASY"),
      mc("Tempat cerita disebut ?", 1, ["Tokoh","Latar","Alur","Amanat"], "EASY"),
      mc("Tokoh baik disebut ?", 0, ["Protagonis","Antagonis","Tritagonis","Figuran"], "EASY"),
      mc("Tokoh jahat disebut ?", 1, ["Protagonis","Antagonis","Tritagonis","Figuran"], "EASY"),
      mc("Kelinci berlari ... kura-kura. Kata tepat ?", 0, ["Lebih cepat dari","Lebih lambat dari","Sama dengan","Kalah oleh"], "EASY"),
    ]),
    M("BINDO", "Menulis Permulaan", "EASY", [
      mc("Menulis nama dimulai huruf ?", 0, ["Kapital","Kecil","Miring","Tebal"], "EASY"),
      mc("Tanda titik dipakai di ?", 2, ["Depan kalimat","Tengah","Akhir kalimat","Awal"], "EASY"),
      mc("Kalimat tanya diakhiri ?", 3, ["Titik","Koma","Seru","Tanya"], "EASY"),
      mc("Kalimat perintah diakhiri ?", 2, ["Titik","Tanya","Seru","Koma"], "EASY"),
      mc("Nama orang harus diawali ?", 0, ["Huruf kapital","Huruf kecil","Angka","Simbol"], "EASY"),
      mc("Contoh kalimat berita ?", 0, ["Ibu pergi ke pasar","Ibu pergi ke pasar ?","Ibu pergi ke pasar !","Pergi ibu ke pasar"], "EASY"),
      mc("Sebelum menulis sebaiknya ?", 1, ["Langsung","Membuat tema","Bertanya","Berteriak"], "EASY"),
      mc("Tanda koma dipakai untuk ?", 2, ["Akhir","Depan","Jeda","Seru"], "EASY"),
      mc("Kata depan 'di' ditulis ?", 0, ["Terpisah","Digabung","Miring","Tebal"], "EASY"),
      mc("Di rumah", 2, ["dirumah","di rumah","Di rumah","diRumah"], "EASY"),
    ]),

    // IPS
    M("IPS", "Keluargaku", "EASY", [
      mc("Anggota keluarga inti ?", 2, ["Kakek Nenek","Paman Bibi","Ayah Ibu Adik","Sepupu"], "EASY"),
      mc("Ayah dari ayah disebut ?", 3, ["Paman","Bibi","Kakak","Kakek"], "EASY"),
      mc("Kakak dari ibu disebut ?", 1, ["Kakek","Paman","Nenek","Sepupu"], "EASY"),
      mc("Adik dari ayah disebut ?", 0, ["Paman","Bibi","Kakek","Nenek"], "EASY"),
      mc("Anak dari paman disebut ?", 1, ["Saudara","Sepupu","Kakak","Adik"], "EASY"),
      mc("Ibu memasak untuk ?", 3, ["Sendiri","Tetangga","Teman","Keluarga"], "EASY"),
      mc("Ayah mencari ?", 2, ["Mainan","Buku","Nafkah","Kado"], "EASY"),
      mc("Kakak membantu ?", 1, ["Merusak","Belajar","Bermain","Tidur"], "EASY"),
      mc("Keluarga yang rukun merasa ?", 3, ["Sedih","Marah","Cemas","Bahagia"], "EASY"),
      mc("Silsilah keluarga disebut ?", 0, ["Pohon keluarga","Buku keluarga","Foto keluarga","Rumah keluarga"], "EASY"),
    ]),
    M("IPS", "Sekolahku", "EASY", [
      mc("Kepala sekolah memimpin ?", 0, ["Sekolah","Kelas","Ruang guru","Perpustakaan"], "EASY"),
      mc("Guru mengajar di ?", 1, ["Kantor","Kelas","Lapangan","Kantin"], "EASY"),
      mc("Tempat belajar adalah ?", 2, ["Rumah","Kantor","Sekolah","Pasar"], "EASY"),
      mc("Tempat membaca buku ?", 1, ["Kelas","Perpustakaan","Kantin","Lapangan"], "EASY"),
      mc("Tempat berolahraga ?", 2, ["Kelas","Kantin","Lapangan","Perpus"], "EASY"),
      mc("Tempat membeli makanan ?", 0, ["Kantin","Kelas","Perpus","UKS"], "EASY"),
      mc("Tempat beribadah di sekolah ?", 1, ["Kelas","Mushola","Kantin","Lapangan"], "EASY"),
      mc("Waktu belajar dimulai jam ?", 0, ["07.00","08.00","09.00","10.00"], "EASY"),
      mc("Bel berbunyi menandakan ?", 2, ["Makan","Pulang","Ganti jam","Libur"], "EASY"),
      mc("Teman satu kelas disebut ?", 3, ["Saudara","Tetangga","Keluarga","Teman sekelas"], "EASY"),
    ]),
    M("IPS", "Lingkungan Rumah", "EASY", [
      mc("Rumah adalah tempat ?", 0, ["Tinggal","Bekerja","Belajar","Bermain"], "EASY"),
      mc("Halaman rumah sebaiknya ?", 1, ["Kotor","Bersih","Berantakan","Bau"], "EASY"),
      mc("Tanaman di halaman membuat ?", 3, ["Panas","Bau","Kotor","Sejuk"], "EASY"),
      mc("Taman di rumah tempat ?", 2, ["Masak","Tidur","Bermain","Mandi"], "EASY"),
      mc("Gotong royong membersihkan ?", 1, ["Kamar","Lingkungan","Tas","Lemari"], "EASY"),
      mc("Merapikan mainan setelah ?", 2, ["Makan","Tidur","Bermain","Belajar"], "EASY"),
      mc("Membantu ibu mencuci ?", 0, ["Piring","Bola","Buku","Pensil"], "EASY"),
      mc("Ayah menyapu ?", 1, ["Kamar","Halaman","Dapur","Kantor"], "EASY"),
      mc("Kakak membersihkan ?", 3, ["Pasar","Kantin","Sekolah","Ruang tamu"], "EASY"),
      mc("Rumah bersih penghuni ?", 2, ["Sakit","Marah","Sehat","Cemas"], "EASY"),
    ]),
    M("IPS", "Pekerjaan", "EASY", [
      mc("Petani bekerja di ?", 1, ["Kantor","Sawah","Pasar","Rumah"], "EASY"),
      mc("Guru bekerja di ?", 3, ["Rumah","Pasar","Kantor","Sekolah"], "EASY"),
      mc("Dokter bekerja di ?", 2, ["Sekolah","Pasar","Rumah sakit","Kantor"], "EASY"),
      mc("Polisi menjaga ?", 0, ["Keamanan","Kesehatan","Pendidikan","Makanan"], "EASY"),
      mc("Supir mengendarai ?", 2, ["Pesawat","Kapal","Mobil","Motor"], "EASY"),
      mc("Nelayan mencari ?", 1, ["Sayur","Ikan","Beras","Buah"], "EASY"),
      mc("Pedagang menjual di ?", 2, ["Sawah","Sekolah","Pasar","Rumah"], "EASY"),
      mc("Koki memasak di ?", 0, ["Restoran","Kantor","Sawah","Lapangan"], "EASY"),
      mc("Tukang kayu membuat ?", 3, ["Baju","Sepatu","Topi","Meja"], "EASY"),
      mc("Penjahit membuat ?", 1, ["Meja","Baju","Rumah","Jalan"], "EASY"),
    ]),
    M("IPS", "Aturan di Rumah", "EASY", [
      mc("Sebelum makan harus ?", 0, ["Cuci tangan","Lari","Tidur","Bermain"], "EASY"),
      mc("Setelah bangun tidur ?", 1, ["Makan","Merapikan","Tidur","Bermain"], "EASY"),
      mc("Izin jika pergi ?", 0, ["Pamit","Diam","Lari","Marah"], "EASY"),
      mc("Jam malam anak ?", 2, ["12 malam","10 malam","8 malam","6 sore"], "EASY"),
      mc("Menonton TV sebaiknya ?", 2, ["Keras","Sambil makan","Secukupnya","Sampai malam"], "EASY"),
      mc("PR dikerjakan di ?", 0, ["Rumah","Sekolah","Jalan","Pasar"], "EASY"),
      mc("Kamar tidur harus ?", 2, ["Kotor","Bau","Rapi","Berantakan"], "EASY"),
      mc("Berbicara dengan orang tua ?", 1, ["Kasar","Sopan","Keras","Cepat"], "EASY"),
      mc("Membantu orang tua adalah ?", 0, ["Kewajiban","Hak","Hadiah","Pilihan"], "EASY"),
      mc("Aturan dibuat untuk ?", 2, ["Dilanggar","Diabaikan","Kebaikan","Hukuman"], "EASY"),
    ]),

    // PPKN
    M("PPKN", "Aku dan Diriku", "EASY", [
      mc("Setiap anak berhak ?", 1, ["Dihukum","Bermain","Dipaksa","Dimarahi"], "EASY"),
      mc("Kewajiban anak adalah ?", 1, ["Bermain","Belajar","Tidur","Makan"], "EASY"),
      mc("Menyapa teman dengan ?", 0, ["Ramah","Kasar","Marah","Diam"], "EASY"),
      mc("Antri saat menunggu ?", 0, ["Giliran","Makan","Belajar","Tidur"], "EASY"),
      mc("Berterima kasih jika ?", 3, ["Marah","Sedih","Tidur","Dibantu"], "EASY"),
      mc("Meminta maaf jika ?", 2, ["Benar","Pintar","Salah","Cepat"], "EASY"),
      mc("Menghormati guru dengan ?", 3, ["Marah","Terlambat","Bermain","Sopan"], "EASY"),
      mc("Membantu teman yang ?", 2, ["Kaya","Pintar","Kesusahan","Cepat"], "EASY"),
      mc("Berkata jujur itu ?", 0, ["Baik","Jahat","Memalukan","Susah"], "EASY"),
      mc("Berbagi bekal dengan ?", 0, ["Teman","Sendiri","Guru","Ibu"], "EASY"),
    ]),
    M("PPKN", "Lambang Negara", "EASY", [
      mc("Warna bendera Indonesia ?", 0, ["Merah putih","Merah biru","Putih biru","Hijau putih"], "EASY"),
      mc("Lambang negara kita ?", 2, ["Bendera","Peta","Garuda Pancasila","Pahlawan"], "EASY"),
      mc("Bendera merah putih dikibarkan saat ?", 1, ["Malam","Upacara","Tidur","Bermain"], "EASY"),
      mc("Burung Garuda berwarna ?", 2, ["Putih","Hitam","Emas","Perak"], "EASY"),
      mc("Jumlah bulu Garuda ?", 1, ["10","17","45","5"], "EASY"),
      mc("Dasar negara Indonesia ?", 0, ["Pancasila","UUD","Proklamasi","Bhineka"], "EASY"),
      mc("Sila pertama Pancasila ?", 1, ["Kemanusiaan","Ketuhanan","Persatuan","Keadilan"], "EASY"),
      mc("Lagu Indonesia Raya ciptaan ?", 3, ["Hatta","Sudirman","Kartini","WR Supratman"], "EASY"),
      mc("Hari kemerdekaan RI ?", 2, ["1 Juni","2 Mei","17 Agustus","28 Oktober"], "EASY"),
      mc("Pahlawan Kartini memperjuangkan ?", 0, ["Wanita","Pria","Anak","Petani"], "EASY"),
    ]),
    M("PPKN", "Hidup Rukun", "EASY", [
      mc("Hidup rukun membuat ?", 0, ["Damai","Kacau","Marah","Sedih"], "EASY"),
      mc("Bermain dengan teman harus ?", 3, ["Egois","Marah","Sendiri","Rukun"], "EASY"),
      mc("Saling tolong menolong disebut ?", 2, ["Egois","Marah","Gotong royong","Diam"], "EASY"),
      mc("Jika teman jatuh kita ?", 0, ["Menolong","Membiarkan","Tertawa","Marah"], "EASY"),
      mc("Rukun dengan saudara ?", 1, ["Bertengkar","Bersama","Diam","Marah"], "EASY"),
      mc("Tetangga perlu ?", 2, ["Dimusuhi","Dijauhi","Dihormati","Diabaikan"], "EASY"),
      mc("Saling menghormati antar ?", 3, ["Sendiri","Musuh","Kaya","Sesama"], "EASY"),
      mc("Toleransi menghargai ?", 0, ["Perbedaan","Kekayaan","Kekuatan","Jabatan"], "EASY"),
      mc("Akur dengan teman membuat ?", 2, ["Musuh","Sedih","Senang","Marah"], "EASY"),
      mc("Saling berbagi itu ?", 1, ["Jahat","Mulia","Sia-sia","Merugikan"], "EASY"),
    ]),
    M("PPKN", "Tata Tertib", "EASY", [
      mc("Siswa harus datang ke sekolah ?", 0, ["Tepat waktu","Terlambat","Siang","Sore"], "EASY"),
      mc("Di kelas harus ?", 1, ["Bermain","Belajar","Tidur","Makan"], "EASY"),
      mc("Memakai seragam ?", 0, ["Rapi","Kotor","Acak","Lusuh"], "EASY"),
      mc("Membuang sampah di ?", 1, ["Lantai","Tempat sampah","Kolam","Halaman"], "EASY"),
      mc("Berdoa sebelum ?", 2, ["Tidur","Pulang","Belajar","Bermain"], "EASY"),
      mc("Mendengarkan saat guru ?", 3, ["Marah","Tidur","Diam","Menjelaskan"], "EASY"),
      mc("Berbaris masuk kelas dengan ?", 1, ["Lari","Rapi","Marah","Kotor"], "EASY"),
      mc("Meminjam barang harus ?", 2, ["Diambil","Direbut","Izin","Diam"], "EASY"),
      mc("Tugas piket membersihkan ?", 0, ["Kelas","Rumah","Kantor","Pasar"], "EASY"),
      mc("Aturan sekolah ditaati ?", 1, ["Guru","Semua","Kepsek","Penjaga"], "EASY"),
    ]),
    M("PPKN", "Hak Anak", "EASY", [
      mc("Setiap anak berhak ?", 1, ["Bekerja","Pendidikan","Nikah","Sopir"], "EASY"),
      mc("Anak berhak mendapat ?", 2, ["Hukuman","Pekerjaan","Kasih sayang","Kekuasaan"], "EASY"),
      mc("Hak bermain harus ?", 2, ["Sepanjang hari","Malam","Seimbang belajar","Sendiri"], "EASY"),
      mc("Anak berhak mendapat ?", 0, ["Makanan","Hukuman","Pekerjaan","Kekuasaan"], "EASY"),
      mc("Hak anak di rumah ?", 3, ["Bekerja","Memasak","Menyapu","Perlindungan"], "EASY"),
      mc("Hak berbicara harus ?", 1, ["Berteriak","Sopan","Kasar","Cepat"], "EASY"),
      mc("Hak istirahat dengan ?", 0, ["Tidur","Bekerja","Belajar","Bermain"], "EASY"),
      mc("Anak berhak berseragam ?", 1, ["Bebas","Sekolah","Mahal","Mewah"], "EASY"),
      mc("Hak beragama sesuai ?", 0, ["Keyakinan","Orang tua","Teman","Guru"], "EASY"),
      mc("Setiap anak sama ?", 0, ["Derajatnya","Kekayaannya","Sekolahnya","Rumahnya"], "EASY"),
    ]),

    // BING
    M("BING", "Alphabet", "EASY", [
      mc("First letter of ABC ?", 0, ["A","B","C","D"], "EASY"),
      mc("Last letter of ABC ?", 3, ["X","Y","V","Z"], "EASY"),
      mc("B ... D. Missing letter ?", 1, ["A","C","E","F"], "EASY"),
      mc("A for ?", 2, ["Boy","Cat","Apple","Dog"], "EASY"),
      mc("C for ?", 2, ["Apple","Ball","Cat","Dog"], "EASY"),
      mc("How many letters in 'CAT' ?", 1, ["2","3","4","5"], "EASY"),
      mc("Letter after G ?", 1, ["F","H","I","J"], "EASY"),
      mc("Letter before T ?", 2, ["U","R","S","V"], "EASY"),
      mc("Vowels example ?", 0, ["A","B","C","D"], "EASY"),
      mc("How many vowels ?", 2, ["3","4","5","6"], "EASY"),
    ]),
    M("BING", "Colors", "EASY", [
      mc("Color of apple ?", 1, ["Blue","Red","Green","Yellow"], "EASY"),
      mc("Color of sky ?", 0, ["Blue","Red","Green","Yellow"], "EASY"),
      mc("Color of banana ?", 3, ["Red","Blue","Green","Yellow"], "EASY"),
      mc("Color of grass ?", 2, ["Red","Blue","Green","Yellow"], "EASY"),
      mc("Black and white cow ?", 0, ["Cow","Cat","Dog","Bird"], "EASY"),
      mc("Orange in Indonesian ?", 1, ["Merah","Jingga","Kuning","Hijau"], "EASY"),
      mc("Pink in Indonesian ?", 2, ["Biru","Putih","Merah muda","Hitam"], "EASY"),
      mc("Color of snow ?", 3, ["Black","Blue","Red","White"], "EASY"),
      mc("Color of chocolate ?", 0, ["Brown","Blue","Red","Green"], "EASY"),
      mc("Purple in Indonesian ?", 2, ["Abu","Coklat","Ungu","Pink"], "EASY"),
    ]),
    M("BING", "Numbers 1-10", "EASY", [
      mc("One in Indonesian ?", 1, ["Dua","Satu","Tiga","Empat"], "EASY"),
      mc("Three in Indonesian ?", 2, ["Satu","Dua","Tiga","Empat"], "EASY"),
      mc("Five in Indonesian ?", 0, ["Lima","Enam","Tujuh","Delapan"], "EASY"),
      mc("Ten in Indonesian ?", 3, ["Enam","Tujuh","Delapan","Sepuluh"], "EASY"),
      mc("1 + 1 = ? in English", 0, ["Two","Three","Four","Five"], "EASY"),
      mc("2 + 3 = ? in English", 1, ["Four","Five","Six","Seven"], "EASY"),
      mc("Number after six ?", 0, ["Seven","Eight","Nine","Ten"], "EASY"),
      mc("Number before four ?", 2, ["Two","Five","Three","Six"], "EASY"),
      mc("I have ... fingers", 2, ["Five","Eight","Ten","Twelve"], "EASY"),
      mc("Two plus three equals ?", 1, ["Four","Five","Six","Seven"], "EASY"),
    ]),
    M("BING", "Greetings", "EASY", [
      mc("Good morning in Indonesian ?", 2, ["Selamat sore","Selamat malam","Selamat pagi","Selamat siang"], "EASY"),
      mc("Selamat siang in English ?", 3, ["Good morning","Good evening","Good night","Good afternoon"], "EASY"),
      mc("How are you? I am ...", 0, ["Fine","Bad","Tall","Short"], "EASY"),
      mc("Goodbye in Indonesian ?", 1, ["Halo","Selamat tinggal","Terima kasih","Maaf"], "EASY"),
      mc("Thank you in Indonesian ?", 2, ["Halo","Maaf","Terima kasih","Selamat"], "EASY"),
      mc("Hello in Indonesian ?", 0, ["Halo","Terima kasih","Maaf","Selamat"], "EASY"),
      mc("What is your name? My name ...", 1, ["Am","Is","Are","Be"], "EASY"),
      mc("Nice to meet you too", 0, ["Senang bertemu","Apa kabar","Selamat pagi","Sampai jumpa"], "EASY"),
      mc("Selamat sore in English ?", 2, ["Good morning","Good afternoon","Good evening","Good night"], "EASY"),
      mc("How do you do? How ...", 0, ["Do you do","Are you","You do","Your name"], "EASY"),
    ]),
    M("BING", "Animals", "EASY", [
      mc("Cat in Indonesian ?", 0, ["Kucing","Anjing","Burung","Ikan"], "EASY"),
      mc("Dog in Indonesian ?", 1, ["Kucing","Anjing","Burung","Ikan"], "EASY"),
      mc("Bird in Indonesian ?", 2, ["Kucing","Anjing","Burung","Ikan"], "EASY"),
      mc("Fish in Indonesian ?", 3, ["Kucing","Anjing","Burung","Ikan"], "EASY"),
      mc("Cow in Indonesian ?", 1, ["Kambing","Sapi","Kerbau","Kuda"], "EASY"),
      mc("This animal can fly ?", 0, ["Bird","Fish","Cat","Cow"], "EASY"),
      mc("This animal lives in water ?", 2, ["Bird","Cat","Fish","Dog"], "EASY"),
      mc("A baby cat is called ?", 1, ["Puppy","Kitten","Cub","Foal"], "EASY"),
      mc("Elephant is very ?", 2, ["Small","Tiny","Big","Short"], "EASY"),
      mc("Cow says ?", 3, ["Woof","Meow","Baa","Moo"], "EASY"),
    ]),
  ],

  2: [
    // MTK
    M("MTK", "Bilangan 1-100", "EASY", [
      mc("Lambang bilangan 45 ?", 0, ["Empat puluh lima","Lima puluh empat","Empat lima","Lima empat"], "EASY"),
      mc("Bilangan 67 terdiri ... puluhan + satuan ?", 1, ["6+7","60+7","6+70","67+0"], "EASY"),
      mc("Bilangan yang lebih dari 50 ?", 1, ["45","55","48","37"], "EASY"),
      mc("Lompat 2: 2,4,6,?,10", 2, ["7","9","8","12"], "EASY"),
      mc("Bilangan genap contoh ?", 0, ["2","3","5","7"], "EASY"),
      mc("Bilangan ganjil contoh ?", 1, ["2","3","4","6"], "EASY"),
      mc("Nilai tempat angka 3 pada 37 ?", 1, ["Satuan","Puluhan","Ratusan","Ribuan"], "EASY"),
      mc("Nilai tempat angka 7 pada 37 ?", 0, ["Satuan","Puluhan","Ratusan","Ribuan"], "EASY"),
      mc("Bilangan setelah 99 ?", 0, ["100","98","101","90"], "EASY"),
      mc("Bilangan sebelum 70 ?", 1, ["71","69","80","60"], "EASY"),
    ]),
    M("MTK", "Penjumlahan Dua Angka", "EASY", [
      mc("12 + 5 = ?", 2, ["15","16","17","18"], "EASY"),
      mc("23 + 14 = ?", 2, ["35","36","37","38"], "EASY"),
      mc("45 + 23 = ?", 1, ["67","68","69","70"], "EASY"),
      mc("34 + 25 = ?", 3, ["57","58","60","59"], "EASY"),
      mc("11 + 9 = ?", 0, ["20","21","22","23"], "EASY"),
      mc("56 + 12 = ?", 1, ["67","68","69","70"], "EASY"),
      mc("30 + 20 = ?", 3, ["40","45","55","50"], "EASY"),
      mc("42 + 18 = ?", 2, ["58","59","60","61"], "EASY"),
      mc("15 + 15 = ?", 1, ["25","30","35","40"], "EASY"),
      mc("27 + 13 = ?", 0, ["40","41","42","43"], "EASY"),
    ]),
    M("MTK", "Pengurangan Dua Angka", "EASY", [
      mc("15 - 3 = ?", 0, ["12","13","14","11"], "EASY"),
      mc("28 - 12 = ?", 2, ["14","15","16","17"], "EASY"),
      mc("45 - 20 = ?", 1, ["24","25","26","27"], "EASY"),
      mc("67 - 34 = ?", 3, ["32","31","34","33"], "EASY"),
      mc("50 - 15 = ?", 2, ["33","34","35","36"], "EASY"),
      mc("100 - 40 = ?", 1, ["50","60","70","80"], "EASY"),
      mc("78 - 8 = ?", 0, ["70","71","72","69"], "EASY"),
      mc("99 - 50 = ?", 3, ["47","48","50","49"], "EASY"),
      mc("30 - 12 = ?", 2, ["17","19","18","16"], "EASY"),
      mc("85 - 35 = ?", 3, ["45","55","60","50"], "EASY"),
    ]),
    M("MTK", "Perkalian Dasar", "MEDIUM", [
      mc("2 x 3 = ?", 2, ["5","7","6","8"], "MEDIUM"),
      mc("4 x 2 = ?", 1, ["6","8","10","12"], "MEDIUM"),
      mc("5 x 2 = ?", 0, ["10","12","15","20"], "MEDIUM"),
      mc("3 x 3 = ?", 3, ["6","8","10","9"], "MEDIUM"),
      mc("2 x 6 = ?", 0, ["12","14","16","18"], "MEDIUM"),
      mc("4 x 3 = ?", 0, ["12","14","16","18"], "MEDIUM"),
      mc("5 x 3 = ?", 3, ["10","12","18","15"], "MEDIUM"),
      mc("2 x 2 = ?", 1, ["2","4","6","8"], "MEDIUM"),
      mc("3 x 5 = ?", 2, ["10","12","15","18"], "MEDIUM"),
      mc("4 x 4 = ?", 2, ["12","14","16","18"], "MEDIUM"),
    ]),
    M("MTK", "Uang", "EASY", [
      mc("Uang Rp1.000,00 bernilai ... rupiah ?", 1, ["100","1.000","10.000","100.000"], "EASY"),
      mc("Dua koin Rp500 sama dengan ?", 0, ["Rp1.000","Rp500","Rp200","Rp2.000"], "EASY"),
      mc("Rp5.000 lebih besar dari ?", 1, ["Rp10.000","Rp2.000","Rp20.000","Rp50.000"], "EASY"),
      mc("Jika beli Rp1.500 bayar Rp2.000, kembalian ?", 1, ["Rp1.000","Rp500","Rp2.000","Rp200"], "EASY"),
      mc("Rp10.000 ditukar Rp1.000 dapat ... lembar ?", 2, ["5","8","10","20"], "EASY"),
      mc("Harga permen Rp500, 3 permen bayar ?", 0, ["Rp1.500","Rp2.000","Rp2.500","Rp1.000"], "EASY"),
      mc("Rp20.000 - Rp12.000 = ?", 2, ["Rp6.000","Rp10.000","Rp8.000","Rp5.000"], "EASY"),
      mc("Uang logam Rp500 disebut ?", 1, ["Koin","Receh","Kertas","Emas"], "EASY"),
      mc("Belanja Rp3.500 bayar Rp5.000, kembali ?", 0, ["Rp1.500","Rp2.000","Rp2.500","Rp1.000"], "EASY"),
      mc("Rp100.000 nilainya ... dari Rp50.000 ?", 0, ["Lebih besar","Lebih kecil","Sama","Setengah"], "EASY"),
    ]),

    // IPA
    M("IPA", "Hewan dan Tumbuhan", "EASY", [
      mc("Hewan pemakan rumput disebut ?", 1, ["Karnivor","Herbivor","Omnivor","Insektivor"], "EASY"),
      mc("Hewan pemakan daging disebut ?", 0, ["Karnivor","Herbivor","Omnivor","Insektivor"], "EASY"),
      mc("Ayam makan ?", 0, ["Biji","Daging","Rumput","Buah"], "EASY"),
      mc("Sapi makan ?", 2, ["Daging","Ikan","Rumput","Buah"], "EASY"),
      mc("Kucing makan ?", 1, ["Rumput","Ikan","Buah","Daun"], "EASY"),
      mc("Bagian tumbuhan di tanah ?", 0, ["Akar","Batang","Daun","Bunga"], "EASY"),
      mc("Tempat fotosintesis ?", 2, ["Akar","Batang","Daun","Bunga"], "EASY"),
      mc("Bunga berfungsi untuk ?", 0, ["Berkembang biak","Makan","Bernapas","Minum"], "EASY"),
      mc("Biji ditanam menjadi ?", 3, ["Daun","Bunga","Buah","Tumbuhan baru"], "EASY"),
      mc("Buah melindungi ?", 2, ["Akar","Batang","Biji","Daun"], "EASY"),
    ]),
    M("IPA", "Makanan Sehat", "EASY", [
      mc("Makanan bergizi seimbang disebut ?", 1, ["Junk food","4 sehat 5 sempurna","Fast food","Snack"], "EASY"),
      mc("Buah mengandung ?", 0, ["Vitamin","Lemak","Garam","Gula"], "EASY"),
      mc("Nasi sumber ?", 2, ["Protein","Vitamin","Karbohidrat","Lemak"], "EASY"),
      mc("Ikan sumber ?", 0, ["Protein","Karbohidrat","Vitamin","Serat"], "EASY"),
      mc("Susu baik untuk ?", 2, ["Mata","Rambut","Tulang","Kulit"], "EASY"),
      mc("Makanan sehat harus ?", 2, ["Mahal","Manis","Bergizi","Asin"], "EASY"),
      mc("Sayur baik untuk ?", 0, ["Kesehatan","Kekayaan","Kecantikan","Kekuatan"], "EASY"),
      mc("Minum air putih ... gelas per hari ?", 2, ["5","6","8","10"], "EASY"),
      mc("Junk food tidak baik karena ?", 2, ["Mahal","Manis","Tidak bergizi","Asin"], "EASY"),
      mc("Cuci tangan sebelum ?", 3, ["Tidur","Bermain","Sekolah","Makan"], "EASY"),
    ]),
    M("IPA", "Benda dan Sifatnya", "EASY", [
      mc("Benda padat contohnya ?", 0, ["Buku","Air","Minyak","Udara"], "EASY"),
      mc("Benda cair contohnya ?", 2, ["Batu","Kayu","Air","Besi"], "EASY"),
      mc("Benda gas contohnya ?", 3, ["Meja","Kursi","Buku","Udara"], "EASY"),
      mc("Air membeku menjadi ?", 0, ["Es","Uap","Embun","Hujan"], "EASY"),
      mc("Air mendidih pada suhu ?", 2, ["50°C","75°C","100°C","125°C"], "EASY"),
      mc("Es mencair jika ?", 1, ["Didinginkan","Dipanaskan","Direndam","Ditimbang"], "EASY"),
      mc("Bentuk benda padat ?", 1, ["Berubah","Tetap","Mengalir","Menguap"], "EASY"),
      mc("Bentuk benda cair ?", 1, ["Tetap","Berubah","Keras","Padat"], "EASY"),
      mc("Kapur barus menguap disebut ?", 2, ["Membeku","Mencair","Menyublim","Mengembun"], "EASY"),
      mc("Embun pagi contoh ?", 2, ["Membeku","Mencair","Mengembun","Menyublim"], "EASY"),
    ]),
    M("IPA", "Air dan Udara", "EASY", [
      mc("Air bersih cirinya ?", 0, ["Bening","Keruh","Bau","Kotor"], "EASY"),
      mc("Air tanah berasal dari ?", 1, ["Laut","Hujan","Sungai","Danau"], "EASY"),
      mc("Udara bersih terasa ?", 1, ["Panas","Segar","Bau","Kotor"], "EASY"),
      mc("Hutan disebut ?", 0, ["Paru-paru dunia","Jantung dunia","Mata dunia","Kulit dunia"], "EASY"),
      mc("Pencemaran air oleh ?", 2, ["Air bersih","Tanaman","Sampah","Ikan"], "EASY"),
      mc("Menghemat air dengan ?", 1, ["Mandi lama","Mematikan kran","Mencuci mobil","Menyiram terus"], "EASY"),
      mc("Pohon menghasilkan ?", 0, ["Oksigen","CO2","Nitrogen","Hidrogen"], "EASY"),
      mc("Air sungai jangan dibuang ?", 0, ["Sampah","Ikan","Batu","Pasir"], "EASY"),
      mc("Air hujan turun setelah ?", 3, ["Panas","Dingin","Salju","Penguapan"], "EASY"),
      mc("Manusia butuh air untuk ?", 3, ["Main","Tidur","Tv","Minum"], "EASY"),
    ]),
    M("IPA", "Energi", "EASY", [
      mc("Sumber energi terbesar ?", 0, ["Matahari","Bulan","Bintang","Api"], "EASY"),
      mc("Energi listrik berasal dari ?", 2, ["Matahari","Angin","PLN","Air"], "EASY"),
      mc("Makanan memberi ?", 0, ["Energi","Tidur","Main","Belajar"], "EASY"),
      mc("Bensin membuat mobil ?", 0, ["Bergerak","Berhenti","Melambat","Pelan"], "EASY"),
      mc("Lampu menggunakan energi ?", 2, ["Angin","Air","Listrik","Panas"], "EASY"),
      mc("Hemat listrik dengan ?", 1, ["Lampu nyala","Mematikan TV","AC menyala","Kulkas buka"], "EASY"),
      mc("Panel surya mengubah cahaya jadi ?", 0, ["Listrik","Panas","Angin","Air"], "EASY"),
      mc("Kincir angin pakai energi ?", 1, ["Air","Angin","Matahari","Listrik"], "EASY"),
      mc("Setrika menggunakan listrik jadi ?", 2, ["Dingin","Sejuk","Panas","Basah"], "EASY"),
      mc("Energi tidak bisa ?", 3, ["Dibuat","Dimusnahkan","Diciptakan","Dihabiskan"], "EASY"),
    ]),

    // BINDO
    M("BINDO", "Membaca Pemahaman", "EASY", [
      mc("Bacaan tentang kucing ?", 0, ["Kucing","Mobil","Pesawat","Gedung"], "EASY"),
      mc("Ide pokok paragraf pertama ?", 0, ["Kucing adalah hewan","Kucing bisa","Kucing punya","Kucing suka"], "EASY"),
      mc("Kucing makan ?", 3, ["Rumput","Daun","Nasi","Ikan"], "EASY"),
      mc("Kalimat utama di ?", 1, ["Tengah","Awal","Akhir","Depan"], "EASY"),
      mc("Topik bacaan adalah ?", 1, ["Judul","Pokok pikiran","Gambar","Penulis"], "EASY"),
      mc("Kata tanya untuk orang ?", 2, ["Apa","Dimana","Siapa","Kapan"], "EASY"),
      mc("Kata tanya untuk tempat ?", 1, ["Apa","Dimana","Siapa","Mengapa"], "EASY"),
      mc("Kata tanya untuk waktu ?", 3, ["Apa","Siapa","Dimana","Kapan"], "EASY"),
      mc("Kata tanya untuk alasan ?", 2, ["Apa","Siapa","Mengapa","Bagaimana"], "EASY"),
      mc("Bacaan dongeng bersifat ?", 0, ["Fiksi","Nyata","Ilmiah","Berita"], "EASY"),
    ]),
    M("BINDO", "Kata dan Makna", "EASY", [
      mc("Persamaan kata (sinonim) 'besar' ?", 2, ["Kecil","Pendek","Raksasa","Kurus"], "EASY"),
      mc("Lawak kata (antonim) 'tinggi' ?", 1, ["Besar","Pendek","Panjang","Lebar"], "EASY"),
      mc("Sinonim 'pandai' ?", 0, ["Cerdas","Bodoh","Malas","Lemah"], "EASY"),
      mc("Antonim 'kaya' ?", 2, ["Makmur","Mewah","Miskin","Berlimpah"], "EASY"),
      mc("Kata 'bersepeda' mendapat imbuhan ?", 1, ["Awalan","Akhiran","Sisipan","Gabungan"], "EASY"),
      mc("Kata 'tertinggi' mendapat imbuhan ?", 0, ["Awalan","Akhiran","Sisipan","Gabungan"], "EASY"),
      mc("Kata ulang 'buku-buku' artinya ?", 0, ["Banyak buku","Satu buku","Buku besar","Buku kecil"], "EASY"),
      mc("Budi ... sepeda ke sekolah. Kata 'naik' ?", 0, ["Naik","Menaiki","Naikan","Kenaikan"], "EASY"),
      mc("Kata 'memasak' dari kata dasar ?", 1, ["Masak","Masakan","Pemasak","Masaknya"], "EASY"),
      mc("Kata 'berlari' artinya ?", 2, ["Lari-lari","Sedang lari","Melakukan lari","Pelari"], "EASY"),
    ]),
    M("BINDO", "Puisi Sederhana", "EASY", [
      mc("Puisi terdiri dari kumpulan ?", 1, ["Kalimat","Baris","Kata","Huruf"], "EASY"),
      mc("Kumpulan baris dalam puisi disebut ?", 0, ["Bait","Larik","Rima","Irama"], "EASY"),
      mc("Setiap baris puisi disebut ?", 1, ["Bait","Larik","Rima","Irama"], "EASY"),
      mc("Persamaan bunyi disebut ?", 2, ["Bait","Larik","Rima","Irama"], "EASY"),
      mc("Puisi tentang ibu ?", 0, ["Ibu","Alam","Pahlawan","Cita-cita"], "EASY"),
      mc("Pilihan kata dalam puisi disebut ?", 3, ["Rima","Irama","Bait","Diksi"], "EASY"),
      mc("Puisi 'Ibu' bertema ?", 0, ["Kasih sayang","Alam","Pendidikan","Persahabatan"], "EASY"),
      mc("Puisi 'Pelangi' bertema ?", 1, ["Ibu","Alam","Guru","Tuhan"], "EASY"),
      mc("Kata dalam puisi bersifat ?", 2, ["Baku","Resmi","Indah","Kasar"], "EASY"),
      mc("Puisi 'Guruku' ungkapan ?", 0, ["Terima kasih","Marah","Sedih","Kecewa"], "EASY"),
    ]),
    M("BINDO", "Dongeng", "EASY", [
      mc("Dongeng termasuk cerita ?", 0, ["Fiksi","Nyata","Sejarah","Ilmiah"], "EASY"),
      mc("Tokoh dongeng bisa ?", 3, ["Manusia","Hewan","Tumbuhan","Semua benar"], "EASY"),
      mc("Dongeng Kancil = ?", 1, ["Malas","Cerdik","Bodoh","Pemarah"], "EASY"),
      mc("Dongeng Bawang Putih = ?", 0, ["Baik","Jahat","Licik","Sombong"], "EASY"),
      mc("Pesan dongeng disebut ?", 2, ["Judul","Alur","Amanat","Latar"], "EASY"),
      mc("Dongeng 'Kura-kura' = ?", 3, ["Cepat","Cerdik","Bodoh","Lambat"], "EASY"),
      mc("Tempat kejadian disebut ?", 1, ["Tokoh","Latar","Alur","Amanat"], "EASY"),
      mc("Urutan cerita disebut ?", 2, ["Tokoh","Latar","Alur","Amanat"], "EASY"),
      mc("Dongeng 'Kancil dan Buaya' = ?", 0, ["Fabel","Legenda","Mite","Sage"], "EASY"),
      mc("Pembuka dongeng biasanya ?", 2, ["Akhirnya","Lalu","Pada suatu hari","Maka"], "EASY"),
    ]),
    M("BINDO", "Menulis Kalimat", "EASY", [
      mc("Kalimat diawali huruf ?", 0, ["Kapital","Kecil","Miring","Tebal"], "EASY"),
      mc("Kalimat diakhiri ?", 2, ["Spasi","Koma","Titik","Seru"], "EASY"),
      mc("Kalimat tanya diakhiri ?", 3, ["Titik","Koma","Seru","Tanda tanya"], "EASY"),
      mc("Subjek (S) + Predikat (P) disebut ?", 0, ["Kalimat tunggal","Kalimat majemuk","Paragraf","Bait"], "EASY"),
      mc("Contoh SP yang benar ?", 0, ["Ibu memasak","Memasak ibu","Di ibu memasak","Memasak di ibu"], "EASY"),
      mc("Ayah membaca koran. Koran = ?", 3, ["Subjek","Predikat","Keterangan","Objek"], "EASY"),
      mc("Budi pergi ke sekolah. 'Pergi' = ?", 1, ["Subjek","Predikat","Objek","Keterangan"], "EASY"),
      mc("Mereka bermain bola. 'Mereka' = ?", 0, ["Subjek","Predikat","Objek","Keterangan"], "EASY"),
      mc("Adik tidur di kamar. 'Di kamar' = ?", 3, ["Subjek","Predikat","Objek","Keterangan"], "EASY"),
      mc("Kalimat ajakan diawali ?", 0, ["Mari","Telah","Sudah","Akan"], "EASY"),
    ]),

    // IPS
    M("IPS", "Peran Keluarga", "EASY", [
      mc("Ayah sebagai kepala keluarga ?", 0, ["Mencari nafkah","Memasak","Menyapu","Mencuci"], "EASY"),
      mc("Ibu sebagai ?", 0, ["Ibu rumah tangga","Kepala desa","Guru","Polisi"], "EASY"),
      mc("Anak tugasnya ?", 1, ["Bekerja","Belajar","Memasak","Menyapu"], "EASY"),
      mc("Kakak sebaiknya ?", 2, ["Marah","Egois","Melindungi adik","Diam"], "EASY"),
      mc("Adik sebaiknya ?", 0, ["Hormat pada kakak","Marah","Menangis","Mengganggu"], "EASY"),
      mc("Gotong royong membersihkan ?", 1, ["Kamar sendiri","Rumah bersama","Sekolah saja","Kantor"], "EASY"),
      mc("Anggota keluarga harus ?", 2, ["Bertengkar","Bersaing","Saling membantu","Diam"], "EASY"),
      mc("Makan bersama keluarga ?", 0, ["Mempererat","Memisahkan","Menyulitkan","Membosankan"], "EASY"),
      mc("Silsilah keluarga disebut ?", 0, ["Pohon keluarga","Garis tangan","Peta rumah","Buku tamu"], "EASY"),
      mc("Kakek dan nenek disebut ?", 0, ["Kakek-nenek","Paman-bibi","Saudara","Tetangga"], "EASY"),
    ]),
    M("IPS", "Jenis Pekerjaan", "EASY", [
      mc("Petani bekerja di ?", 1, ["Kantor","Sawah","Pabrik","Toko"], "EASY"),
      mc("Guru bekerja di ?", 2, ["Rumah","Pasar","Sekolah","Kantor"], "EASY"),
      mc("Dokter bekerja di ?", 3, ["Sekolah","Pasar","Toko","Rumah sakit"], "EASY"),
      mc("Polisi tugas ?", 0, ["Keamanan","Kesehatan","Pendidikan","Perdagangan"], "EASY"),
      mc("Nelayan mencari ?", 1, ["Sayur","Ikan","Batu","Kayu"], "EASY"),
      mc("Peternak beternak ?", 0, ["Ayam","Ikan","Sayur","Padi"], "EASY"),
      mc("Pedagang menjual ?", 2, ["Jasa","Tenaga","Barang","Ilmu"], "EASY"),
      mc("Koki bekerja di ?", 0, ["Restoran","Sawah","Kantor","Sekolah"], "EASY"),
      mc("Tukang kayu membuat ?", 3, ["Baju","Sepatu","Topi","Furnitur"], "EASY"),
      mc("Pekerjaan menghasilkan barang ?", 2, ["Guru","Dokter","Petani","Polisi"], "EASY"),
    ]),
    M("IPS", "Transportasi", "EASY", [
      mc("Alat transportasi darat ?", 0, ["Mobil","Kapal","Pesawat","Perahu"], "EASY"),
      mc("Alat transportasi air ?", 1, ["Mobil","Kapal","Kereta","Sepeda"], "EASY"),
      mc("Alat transportasi udara ?", 2, ["Mobil","Kapal","Pesawat","Becak"], "EASY"),
      mc("Sepeda roda ?", 1, ["4","2","3","1"], "EASY"),
      mc("Mobil roda ?", 2, ["2","3","4","5"], "EASY"),
      mc("Kereta api berjalan di ?", 0, ["Rel","Jalan","Air","Udara"], "EASY"),
      mc("Kapal berlayar di ?", 0, ["Laut","Darat","Udara","Rel"], "EASY"),
      mc("Pesawat terbang di ?", 0, ["Udara","Air","Darat","Laut"], "EASY"),
      mc("Delman ditarik ?", 0, ["Kuda","Sapi","Kerbau","Manusia"], "EASY"),
      mc("Becak dikayuh ?", 1, ["Motor","Manusia","Kuda","Bensin"], "EASY"),
    ]),
    M("IPS", "Desa dan Kota", "EASY", [
      mc("Suasana desa ?", 1, ["Ramai","Tenang","Bising","Padat"], "EASY"),
      mc("Suasana kota ?", 0, ["Ramai","Sepi","Tenang","Sunyi"], "EASY"),
      mc("Pekerjaan umum desa ?", 0, ["Petani","Pegawai","Pedagang","Polisi"], "EASY"),
      mc("Pekerjaan umum kota ?", 3, ["Petani","Nelayan","Peternak","Pegawai"], "EASY"),
      mc("Lahan desa banyak ?", 0, ["Sawah","Gedung","Mal","Apartemen"], "EASY"),
      mc("Di kota banyak ?", 2, ["Sawah","Kebun","Gedung","Hutan"], "EASY"),
      mc("Penduduk desa tinggal di ?", 1, ["Apartemen","Rumah","Kos","Kontrakan"], "EASY"),
      mc("Udara desa ?", 0, ["Sejuk","Panas","Bau","Kotor"], "EASY"),
      mc("Udara kota ?", 1, ["Sejuk","Panas","Dingin","Segar"], "EASY"),
      mc("Pasar tradisional banyak di ?", 0, ["Desa dan kota","Hanya desa","Hanya kota","Luar negeri"], "EASY"),
    ]),
    M("IPS", "Kenampakan Alam", "EASY", [
      mc("Gunung tertinggi di Jawa ?", 1, ["Merbabu","Semeru","Merapi","Sumbing"], "EASY"),
      mc("Laut terluas di Indonesia ?", 2, ["Jawa","Flores","Banda","Natuna"], "EASY"),
      mc("Sungai terpanjang di Jawa ?", 1, ["Ciliwung","Bengawan Solo","Brantas","Serayu"], "EASY"),
      mc("Pulau terbesar di Indonesia ?", 0, ["Kalimantan","Jawa","Sumatra","Papua"], "EASY"),
      mc("Danau terbesar di Indonesia ?", 0, ["Toba","Singkarak","Maninjau","Bratan"], "EASY"),
      mc("Selat antara Jawa dan Sumatra ?", 1, ["Malaka","Sunda","Karimata","Lombok"], "EASY"),
      mc("Gunung berapi disebut ?", 0, ["Vulkanik","Tektonik","Erosi","Sedimen"], "EASY"),
      mc("Tanah subur untuk ?", 0, ["Pertanian","Perkantoran","Industri","Mal"], "EASY"),
      mc("Hutan tropis Indonesia ?", 0, ["Hujan tropis","Sabana","Taiga","Tundra"], "EASY"),
      mc("Curah hujan tinggi cocok ?", 0, ["Sawah","Tegalan","Ladang","Kebun"], "EASY"),
    ]),

    // PPKN
    M("PPKN", "Pancasila", "EASY", [
      mc("Sila pertama Pancasila ?", 1, ["Kemanusiaan","Ketuhanan YME","Persatuan","Keadilan"], "EASY"),
      mc("Lambang sila ke-1 ?", 0, ["Bintang","Rantai","Pohon beringin","Padi kapas"], "EASY"),
      mc("Lambang sila ke-2 ?", 1, ["Bintang","Rantai","Pohon beringin","Padi kapas"], "EASY"),
      mc("Lambang sila ke-3 ?", 2, ["Bintang","Rantai","Pohon beringin","Padi kapas"], "EASY"),
      mc("Lambang sila ke-4 ?", 3, ["Bintang","Rantai","Pohon beringin","Kepala banteng"], "EASY"),
      mc("Lambang sila ke-5 ?", 3, ["Bintang","Rantai","Pohon beringin","Padi kapas"], "EASY"),
      mc("Bunyi sila ke-3 ?", 2, ["Ketuhanan","Kemanusiaan","Persatuan Indonesia","Kerakyatan"], "EASY"),
      mc("Bunyi sila ke-5 ?", 3, ["Ketuhanan","Kemanusiaan","Persatuan","Keadilan sosial"], "EASY"),
      mc("Pancasila dasar ?", 0, ["Negara","Sekolah","Keluarga","Agama"], "EASY"),
      mc("Pancasila artinya ?", 0, ["Lima dasar","Lima aturan","Lima tujuan","Lima cara"], "EASY"),
    ]),
    M("PPKN", "Hidup Bersih", "EASY", [
      mc("Hidup bersih membuat ?", 1, ["Sakit","Sehat","Kotor","Bau"], "EASY"),
      mc("Cuci tangan pakai ?", 2, ["Air","Sabun","Air & sabun","Tisu"], "EASY"),
      mc("Gosok gigi sehari ... kali ?", 0, ["2","3","4","5"], "EASY"),
      mc("Mandi sehari ... kali ?", 0, ["2","3","4","5"], "EASY"),
      mc("Kuku panjang harus ?", 1, ["Dibiarkan","Dipotong","Diwarnai","Dihias"], "EASY"),
      mc("Rambut bersih terhindar dari ?", 0, ["Kutu","Ketombe","Rusak","Gugur"], "EASY"),
      mc("Lingkungan bersih udara ?", 1, ["Kotor","Sejuk","Panas","Bau"], "EASY"),
      mc("Sampah harus dibuang di ?", 2, ["Sungai","Jalan","Tempat sampah","Halaman"], "EASY"),
      mc("Toilet bersih pakai ?", 1, ["Air","Pembersih","Pasir","Tanah"], "EASY"),
      mc("Halaman rumah disapu ?", 1, ["Seminggu","Setiap hari","Setahun","Sebulan"], "EASY"),
    ]),
    M("PPKN", "Musyawarah", "EASY", [
      mc("Musyawarah untuk ?", 0, ["Mufakat","Bertengkar","Marah","Sendiri"], "EASY"),
      mc("Keputusan bersama disebut ?", 0, ["Mufakat","Paksaan","Perintah","Larangan"], "EASY"),
      mc("Sila ke-4 tentang ?", 0, ["Musyawarah","Ketuhanan","Kemanusiaan","Keadilan"], "EASY"),
      mc("Dalam musyawarah kita ?", 1, ["Marah","Berpendapat","Diam","Pergi"], "EASY"),
      mc("Hasil mufakat wajib ?", 2, ["Ditolak","Diabaikan","Dilaksanakan","Dirubah"], "EASY"),
      mc("Ketua musyawarah tugas ?", 0, ["Memimpin","Bicara","Diam","Menulis"], "EASY"),
      mc("Voting jika ?", 1, ["Mufakat","Tidak mufakat","Awal","Aman"], "EASY"),
      mc("Pemilihan ketua kelas ?", 0, ["Musyawarah","Perang","Tunjuk","Acak"], "EASY"),
      mc("Pendapat orang lain harus ?", 2, ["Ditertawakan","Dipaksa","Dihargai","Ditolak"], "EASY"),
      mc("Gotong royong contoh ?", 0, ["Kerja bakti","Bertengkar","Bersaing","Sendiri"], "EASY"),
    ]),
    M("PPKN", "Disiplin", "EASY", [
      mc("Datang ke sekolah ?", 0, ["Tepat waktu","Terlambat","Siang","Sore"], "EASY"),
      mc("Mengumpulkan tugas ?", 1, ["Terlambat","Tepat waktu","Tidak","Nanti"], "EASY"),
      mc("Berbaris masuk kelas ?", 0, ["Rapi","Lari","Beres","Acak"], "EASY"),
      mc("Memakai seragam ?", 0, ["Lengkap","Bebas","Mahal","Mewah"], "EASY"),
      mc("Mendengarkan guru ?", 0, ["Baik","Marah","Bermain","Tidur"], "EASY"),
      mc("Disiplin di rumah ?", 1, ["Bermain","Belajar","Tidur","Makan"], "EASY"),
      mc("Bangun pagi agar ?", 0, ["Tidak terlambat","Cepat","Santai","Malas"], "EASY"),
      mc("Piket membersihkan ?", 0, ["Kelas","Rumah","Kantor","Pasar"], "EASY"),
      mc("Antri saat ?", 0, ["Giliran","Makan","Tidur","Bermain"], "EASY"),
      mc("Disiplin membuat ?", 2, ["Kacau","Marah","Teratur","Malas"], "EASY"),
    ]),
    M("PPKN", "Cinta Tanah Air", "EASY", [
      mc("Bendera Indonesia ?", 0, ["Merah putih","Biru putih","Hijau putih","Kuning putih"], "EASY"),
      mc("Lagu Indonesia Raya ?", 0, ["WR Supratman","Hatta","Kartini","Soekarno"], "EASY"),
      mc("Bahasa nasional ?", 1, ["Daerah","Indonesia","Inggris","Belanda"], "EASY"),
      mc("Garuda Pancasila lambang ?", 0, ["Negara","Sekolah","Kota","Desa"], "EASY"),
      mc("Berbakti pada bangsa ?", 1, ["Jahat","Mulia","Sia-sia","Beban"], "EASY"),
      mc("Cinta produk ?", 0, ["Dalam negeri","Luar negeri","Impor","Branded"], "EASY"),
      mc("Berkunjung ke museum ?", 0, ["Belajar sejarah","Liburan","Bermain","Tidur"], "EASY"),
      mc("Menghafal Pancasila ?", 0, ["Kewajiban","Pilihan","Hiburan","Hobi"], "EASY"),
      mc("Ikut upacara bendera ?", 0, ["Setiap hari Senin","Setahun","Tidak","Bulanan"], "EASY"),
      mc("Pahlawan perlu ?", 0, ["Dihormati","Dilupakan","Diabaikan","Dimusuhi"], "EASY"),
    ]),

    // BING
    M("BING", "Days and Months", "EASY", [
      mc("First day of week ?", 0, ["Monday","Sunday","Tuesday","Friday"], "EASY"),
      mc("Last day of week ?", 2, ["Friday","Saturday","Sunday","Monday"], "EASY"),
      mc("Today is ... tomorrow is ?", 0, ["Yesterday","Tomorrow","Now","Later"], "EASY"),
      mc("First month ?", 0, ["January","February","March","April"], "EASY"),
      mc("Last month ?", 3, ["October","November","December","December"], "EASY"),
      mc("There are ... months in a year ?", 0, ["12","10","7","24"], "EASY"),
      mc("There are ... days in a week ?", 1, ["5","7","10","30"], "EASY"),
      mc("Between Tuesday and Thursday ?", 0, ["Wednesday","Friday","Monday","Sunday"], "EASY"),
      mc("Month after April ?", 1, ["June","May","March","July"], "EASY"),
      mc("Month before August ?", 1, ["September","July","June","October"], "EASY"),
    ]),
    M("BING", "Daily Routines", "EASY", [
      mc("I ... up at 5 AM", 0, ["Wake","Wakes","Woke","Waking"], "EASY"),
      mc("I ... breakfast at 6 AM", 1, ["Eat","Have","Take","Make"], "EASY"),
      mc("I ... to school at 7 AM", 0, ["Go","Goes","Going","Went"], "EASY"),
      mc("I ... lunch at school", 1, ["Eat","Have","Eats","Has"], "EASY"),
      mc("I ... home at 2 PM", 0, ["Go","Goes","Going","Went"], "EASY"),
      mc("I ... my homework at 4 PM", 2, ["Make","Do","Doing","Does"], "EASY"),
      mc("I ... dinner at 7 PM", 1, ["Eat","Have","Take","Make"], "EASY"),
      mc("I ... to bed at 9 PM", 0, ["Go","Goes","Going","Went"], "EASY"),
      mc("She ... to school every day", 1, ["Go","Goes","Going","Went"], "EASY"),
      mc("We ... breakfast together", 1, ["Eat","Have","Has","Eats"], "EASY"),
    ]),
    M("BING", "Food and Drinks", "EASY", [
      mc("I drink ... when thirsty ?", 2, ["Rice","Bread","Water","Meat"], "EASY"),
      mc("I eat ... for breakfast ?", 0, ["Rice","Water","Juice","Tea"], "EASY"),
      mc("Fruit is ?", 2, ["Chicken","Fish","Apple","Egg"], "EASY"),
      mc("Vegetable example ?", 0, ["Carrot","Chicken","Fish","Bread"], "EASY"),
      mc("Drink example ?", 3, ["Rice","Bread","Meat","Milk"], "EASY"),
      mc("I like ... very much", 0, ["Candy","Rice","Water","Juice"], "EASY"),
      mc("My favorite food is ?", 0, ["Fried rice","Water","Juice","Tea"], "EASY"),
      mc("Orange juice is ?", 0, ["Drink","Food","Fruit","Snack"], "EASY"),
      mc("Cake is ?", 0, ["Sweet","Salty","Sour","Bitter"], "EASY"),
      mc("Lemon is ?", 2, ["Sweet","Salty","Sour","Bitter"], "EASY"),
    ]),
    M("BING", "My House", "EASY", [
      mc("I sleep in the ?", 0, ["Bedroom","Kitchen","Bathroom","Living room"], "EASY"),
      mc("I eat in the ?", 1, ["Bedroom","Dining room","Bathroom","Garage"], "EASY"),
      mc("I cook in the ?", 1, ["Bedroom","Kitchen","Bathroom","Garden"], "EASY"),
      mc("I watch TV in the ?", 2, ["Bedroom","Kitchen","Living room","Bathroom"], "EASY"),
      mc("I bathe in the ?", 2, ["Bedroom","Kitchen","Bathroom","Garden"], "EASY"),
      mc("My house has ... rooms", 0, ["Many","Much","A lot","Some"], "EASY"),
      mc("The ... is in front of house", 0, ["Garden","Kitchen","Bedroom","Bathroom"], "EASY"),
      mc("Car is in the ?", 3, ["Bedroom","Kitchen","Bathroom","Garage"], "EASY"),
      mc("The door is ?", 2, ["Black","Blue","Brown","Pink"], "EASY"),
      mc("My house is ?", 0, ["Clean","Dirty","Small","All can be"], "EASY"),
    ]),
    M("BING", "Likes and Dislikes", "EASY", [
      mc("I ... like spinach", 2, ["Am","Are","Don't","Doesn't"], "EASY"),
      mc("She ... like spicy food", 1, ["Don't","Doesn't","Aren't","Isn't"], "EASY"),
      mc("Do you ... ice cream ?", 2, ["Likes","Liking","Like","Liked"], "EASY"),
      mc("I like ... football", 2, ["Play","Plays","Playing","Played"], "EASY"),
      mc("He likes ... books", 2, ["Read","Reads","Reading","Readed"], "EASY"),
      mc("My favorite color is ?", 0, ["Blue","Blues","Blued","Blueing"], "EASY"),
      mc("I ... like swimming", 1, ["Don't","Doesn't","Aren't","Isn't"], "EASY"),
      mc("She likes ... to music", 2, ["Listen","Listens","Listening","Listened"], "EASY"),
      mc("We ... playing games", 0, ["Like","Likes","Liking","Liked"], "EASY"),
      mc("They ... watching TV", 0, ["Like","Likes","Liking","Liked"], "EASY"),
    ]),
  ],
};

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

  // users
  const uKepsek = await prisma.user.create({ data: { email: "kepsek@test.com", passwordHash: ph, role: "PRINCIPAL", name: "Kepsek SD Nusantara" } });
  await prisma.principal.create({ data: { userId: uKepsek.id, nip: "197501012010011001" } });
  const uGuru = await prisma.user.create({ data: { email: "guru@test.com", passwordHash: ph, role: "TEACHER", name: "Bu Dewi Guru Kelas" } });
  const teacher = await prisma.teacher.create({ data: { userId: uGuru.id, nip: "198505152010012002" } });
  const uOrtu = await prisma.user.create({ data: { email: "ortutomoyo@test.com", passwordHash: ph, role: "PARENT", name: "Orang Tua Tomoyo" } });
  const parent = await prisma.parent.create({ data: { userId: uOrtu.id, phone: "08123456789" } });

  // classes and students
  const CLASS_DEFS = [
    { name: "1-A", grade: 1, students: [{ name: "Kagumi", email: "kagumi@test.com", nis: "0011234567" }] },
    { name: "2-A", grade: 2, students: [{ name: "Shiro", email: "shiro@test.com", nis: "0021234567" }] },
    { name: "3-A", grade: 3, students: [{ name: "Megumi", email: "megumi@test.com", nis: "0031234567" }] },
    { name: "4-A", grade: 4, students: [{ name: "Serika", email: "serika@test.com", nis: "0041234567" }] },
    { name: "5-A", grade: 5, students: [{ name: "Kumamoto", email: "kumamoto@test.com", nis: "0051234567" }] },
    { name: "6-A", grade: 6, students: [{ name: "Tomoyo", email: "tomoyo@test.com", nis: "0061234567", parentId: parent.id }] },
  ];

  const clsMap: Record<string, any> = {};
  for (const cd of CLASS_DEFS) {
    const cls = await prisma.class.create({ data: { name: cd.name, gradeLevel: cd.grade, academicYear: 2026 } });
    clsMap[cd.name] = cls;
    for (const sd of cd.students) {
      const u = await prisma.user.create({ data: { email: sd.email, passwordHash: ph, role: "STUDENT", name: sd.name } });
      await prisma.student.create({
        data: { userId: u.id, nis: sd.nis, classId: cls.id, parentId: sd.parentId ?? null, birthdate: new Date(`${2018 - (cd.grade - 1)}-01-15`) },
      });
    }
  }
  console.log("users + classes + students created");

  // subjects (global)
  const subjects: Record<string, any> = {};
  for (const sd of SUBJECTS) {
    subjects[sd.code] = await prisma.subject.create({ data: sd });
  }

  // class-subject links
  const csMap: Record<string, Record<string, any>> = {};
  for (const cd of CLASS_DEFS) {
    csMap[cd.name] = {};
    for (const sd of SUBJECTS) {
      csMap[cd.name][sd.code] = await prisma.classSubject.create({
        data: { classId: clsMap[cd.name].id, subjectId: subjects[sd.code].id, teacherId: teacher.id, semester: 1, academicYear: 2026 },
      });
    }
  }

  // materials + questions per grade
  for (const cd of CLASS_DEFS) {
    const gradeMats = GRADE_MATERIALS[cd.grade] ?? [];
    if (gradeMats.length === 0) continue;
    for (let i = 0; i < gradeMats.length; i++) {
      const def = gradeMats[i];
      const cs = csMap[cd.name][def.cs];
      const mat = await prisma.material.create({
        data: { title: def.title, classSubjectId: cs.id, difficulty: def.diff, isPublished: true, orderIndex: i + 1 },
      });
      for (const q of def.qs) {
        await prisma.question.create({
          data: { materialId: mat.id, questionText: q.q, options: q.o, correctAnswer: q.a, difficulty: q.d, orderIndex: def.qs.indexOf(q) + 1 },
        });
      }
      console.log(`  ${cd.name} ${def.cs} - ${def.title}: ${def.qs.length} soal`);
    }

    // student progress
    const clsStudents = await prisma.student.findMany({ where: { classId: clsMap[cd.name].id } });
    for (const st of clsStudents) {
      for (const sd of SUBJECTS) {
        await prisma.studentProgress.create({
          data: { studentId: st.id, classSubjectId: csMap[cd.name][sd.code].id, completionPercent: 10 + Math.floor(Math.random() * 50), totalScore: 10 + Math.floor(Math.random() * 80) },
        });
      }
    }
  }

  console.log("\nSEED ALL CLASSES SELESAI!");
  console.log("Email (password123):");
  for (const cd of CLASS_DEFS) {
    for (const sd of cd.students) {
      console.log(`  ${sd.email} - ${sd.name} (${cd.name})`);
    }
  }
  console.log("  kepsek@test.com - Kepsek");
  console.log("  guru@test.com - Guru");
  console.log("  ortutomoyo@test.com - Orang Tua Tomoyo");
}

main().catch(console.error).finally(() => prisma.$disconnect());
