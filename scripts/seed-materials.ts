import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

// ── YouTube video map per subject code ──────────────────────────────────
// Menggunakan video edukasi YouTube yang sesuai
const YT_VIDEOS: Record<string, { title: string; url: string; dur: number }[]> = {
  MTK: [
    { title: "Belajar Berhitung", url: "https://www.youtube.com/embed/7_MUYu2f2iA", dur: 480 },
    { title: "Operasi Hitung Dasar", url: "https://www.youtube.com/embed/6dTnFmvd0FE", dur: 540 },
    { title: "Matematika Asyik", url: "https://www.youtube.com/embed/1LMr0FbUeR4", dur: 600 },
    { title: "Rumus Matematika", url: "https://www.youtube.com/embed/kL2sX8KQk_I", dur: 480 },
  ],
  BIN: [
    { title: "Belajar Membaca", url: "https://www.youtube.com/embed/F2prtmMFXGg", dur: 480 },
    { title: "Menulis Kalimat", url: "https://www.youtube.com/embed/mA1vU1v3z5s", dur: 540 },
    { title: "Puisi dan Dongeng", url: "https://www.youtube.com/embed/5YXVMcmG-Uk", dur: 600 },
  ],
  IPS: [
    { title: "Ilmu Pengetahuan Alam", url: "https://www.youtube.com/embed/6dTnFmvd0FE", dur: 540 },
    { title: "Lingkungan Hidup", url: "https://www.youtube.com/embed/kL2sX8KQk_I", dur: 480 },
    { title: "Sains untuk Anak", url: "https://www.youtube.com/embed/F2prtmMFXGg", dur: 600 },
  ],
  PNC: [
    { title: "Pendidikan Pancasila", url: "https://www.youtube.com/embed/7_MUYu2f2iA", dur: 480 },
    { title: "Hidup Rukun", url: "https://www.youtube.com/embed/1LMr0FbUeR4", dur: 600 },
    { title: "Hak dan Kewajiban", url: "https://www.youtube.com/embed/mA1vU1v3z5s", dur: 540 },
  ],
  AGM: [
    { title: "Pendidikan Agama", url: "https://www.youtube.com/embed/5YXVMcmG-Uk", dur: 480 },
    { title: "Belajar Mengaji", url: "https://www.youtube.com/embed/6dTnFmvd0FE", dur: 540 },
    { title: "Kisah Teladan", url: "https://www.youtube.com/embed/kL2sX8KQk_I", dur: 600 },
  ],
  PJO: [
    { title: "Olahraga Anak", url: "https://www.youtube.com/embed/1LMr0FbUeR4", dur: 480 },
    { title: "Gerak dan Lagu", url: "https://www.youtube.com/embed/mA1vU1v3z5s", dur: 540 },
  ],
  SNI: [
    { title: "Seni Budaya", url: "https://www.youtube.com/embed/5YXVMcmG-Uk", dur: 480 },
    { title: "Kreativitas Anak", url: "https://www.youtube.com/embed/7_MUYu2f2iA", dur: 540 },
  ],
};

// ── Material definitions per subject ─────────────────────────────────────
type MatDef = {
  title: string;
  content: string;
  difficulty: string;
  questions: { q: string; o: string[]; a: string; d: string }[];
};

function getMaterials(subjectCode: string, gradeLevel: number): MatDef[] {
  const g = gradeLevel;
  const base: Record<string, MatDef[]> = {
    MTK: [
      {
        title: g <= 2 ? "Angka dan Berhitung" : g <= 4 ? "Operasi Hitung" : "Bilangan Bulat",
        content: g <= 2
          ? "Kita akan belajar tentang angka dari 1 sampai 100. Mari belajar berhitung dengan menyenangkan!"
          : g <= 4
          ? "Operasi hitung meliputi penjumlahan, pengurangan, perkalian, dan pembagian. Pelajari langkah-langkahnya dengan baik."
          : "Bilangan bulat terdiri dari bilangan positif, negatif, dan nol. Pelajari cara menjumlahkan dan mengurangkan bilangan bulat.",
        difficulty: "EASY",
        questions: [
          { q: "Berapa hasil dari 2 + 3?", o: ["4", "5", "6", "7"], a: "5", d: "EASY" },
          { q: "Berapa hasil dari 10 - 4?", o: ["5", "6", "7", "8"], a: "6", d: "EASY" },
          { q: g <= 2 ? "Angka berapa yang lebih besar, 15 atau 9?" : "Hasil dari 7 × 8 adalah...", o: g <= 2 ? ["15", "9", "sama", "tidak tahu"] : ["48", "56", "64", "72"], a: g <= 2 ? "15" : "56", d: "MEDIUM" },
          { q: g <= 2 ? "Berapa jumlah jari tanganmu?" : "Hasil dari 25 + 37 adalah...", o: g <= 2 ? ["10", "5", "20", "15"] : ["52", "62", "72", "82"], a: g <= 2 ? "10" : "62", d: "MEDIUM" },
          { q: g <= 2 ? "Hitung: 5 + 5 = ?" : "Hasil dari 144 ÷ 12 adalah...", o: g <= 2 ? ["8", "9", "10", "11"] : ["10", "11", "12", "13"], a: g <= 2 ? "10" : "12", d: "HARD" },
        ],
      },
      {
        title: g <= 2 ? "Bentuk dan Bangun" : g <= 4 ? "Bangun Datar" : "Geometri",
        content: g <= 2
          ? "Lingkaran, persegi, dan segitiga adalah bentuk-bentuk dasar. Ayo kenali bentuk-bentuk di sekitarmu!"
          : g <= 4
          ? "Bangun datar seperti persegi, persegi panjang, segitiga, dan lingkaran memiliki sifat-sifat khusus."
          : "Geometri mempelajari sifat-sifat bangun datar dan bangun ruang. Hitung luas dan keliling berbagai bangun.",
        difficulty: "MEDIUM",
        questions: [
          { q: "Apa bentuk dari bola?", o: ["Persegi", "Segitiga", "Lingkaran", "Tabung"], a: "Lingkaran", d: "EASY" },
          { q: "Berapa sisi yang dimiliki persegi?", o: ["3", "4", "5", "6"], a: "4", d: "EASY" },
          { q: g <= 2 ? "Apa warna daun?" : "Luas persegi dengan sisi 5 cm adalah... cm²", o: g <= 2 ? ["Merah", "Hijau", "Biru", "Kuning"] : ["10", "20", "25", "30"], a: g <= 2 ? "Hijau" : "25", d: "MEDIUM" },
          { q: g <= 2 ? "Berapa sisi segitiga?" : "Keliling persegi panjang 4 cm × 6 cm adalah... cm", o: g <= 2 ? ["2", "3", "4", "5"] : ["10", "16", "20", "24"], a: g <= 2 ? "3" : "20", d: "MEDIUM" },
          { q: "Benda apa yang berbentuk tabung?", o: ["Bola", "Kaleng", "Kardus", "Batu"], a: "Kaleng", d: "HARD" },
        ],
      },
      {
        title: g <= 2 ? "Pengukuran" : g <= 4 ? "Waktu dan Jarak" : "Statistika",
        content: g <= 2
          ? "Belajar mengukur panjang, berat, dan waktu menggunakan alat ukur sederhana."
          : g <= 4
          ? "Waktu, jarak, dan kecepatan saling berhubungan. Pelajari cara menghitungnya."
          : "Statistika meliputi pengumpulan data, penyajian data dalam tabel/diagram, dan menghitung rata-rata.",
        difficulty: "MEDIUM",
        questions: [
          { q: "Alat untuk mengukur panjang adalah...", o: ["Timbangan", "Penggaris", "Jam", "Termometer"], a: "Penggaris", d: "EASY" },
          { q: "1 minggu = ... hari", o: ["5", "6", "7", "8"], a: "7", d: "EASY" },
          { q: g <= 2 ? "Apa yang lebih berat, kapas atau besi?" : "1 jam = ... menit", o: g <= 2 ? ["Kapas", "Besi", "Sama", "Tidak tahu"] : ["30", "45", "60", "120"], a: g <= 2 ? "Besi" : "60", d: "MEDIUM" },
          { q: g <= 2 ? "Berapa hari dalam seminggu?" : "Nilai rata-rata dari 6, 7, 8 adalah...", o: ["5", "6", "7", "8"], a: g <= 2 ? "7" : "7", d: "MEDIUM" },
          { q: "Alat ukur berat adalah...", o: ["Meteran", "Timbangan", "Stopwatch", "Gelas ukur"], a: "Timbangan", d: "HARD" },
        ],
      },
    ],
    BIN: [
      {
        title: g <= 2 ? "Membaca dan Menulis" : g <= 4 ? "Kalimat dan Cerita" : "Teks Deskripsi",
        content: g <= 2
          ? "Belajar membaca huruf, suku kata, dan kata sederhana. Mari berlatih menulis dengan benar!"
          : g <= 4
          ? "Kalimat adalah kumpulan kata yang memiliki arti. Cerita memiliki awalan, isi, dan akhiran."
          : "Teks deskripsi menggambarkan suatu objek secara detail. Ciri-cirinya menggunakan kata sifat dan kalimat yang jelas.",
        difficulty: "EASY",
        questions: [
          { q: "Huruf pertama dalam abjad adalah...", o: ["A", "B", "C", "D"], a: "A", d: "EASY" },
          { q: g <= 2 ? "Kata 'ibu' terdiri dari berapa huruf?" : "Sinonim dari 'besar' adalah...", o: g <= 2 ? ["1", "2", "3", "4"] : ["Kecil", "Raksasa", "Mungil", "Tinggi"], a: g <= 2 ? "3" : "Raksasa", d: "EASY" },
          { q: "Apa yang digunakan untuk menulis di papan tulis?", o: ["Pensil", "Spidol", "Kapur", "Bolpoin"], a: "Kapur", d: "MEDIUM" },
          { q: g <= 2 ? "Apa bunyi huruf 'A'?" : "Antonim dari 'panas' adalah...", o: g <= 2 ? ["A", "B", "C", "D"] : ["Dingin", "Hangat", "Sejuk", "Dingin"], a: g <= 2 ? "A" : "Dingin", d: "MEDIUM" },
          { q: g <= 2 ? "Kata apa yang diawali huruf 'B'?" : "Paragraf terdiri dari kumpulan...", o: g <= 2 ? ["Bola", "Mobil", "Pensil", "Meja"] : ["Kata", "Kalimat", "Huruf", "Angka"], a: g <= 2 ? "Bola" : "Kalimat", d: "HARD" },
        ],
      },
      {
        title: g <= 2 ? "Kata Sehari-hari" : g <= 4 ? "Puisi" : "Cerita Fiksi",
        content: g <= 2
          ? "Kata-kata yang sering kita gunakan sehari-hari seperti: makan, minum, tidur, dan bermain."
          : g <= 4
          ? "Puisi adalah karya sastra yang menggunakan kata-kata indah. Puisi memiliki rima dan irama."
          : "Cerita fiksi adalah cerita rekaan seperti dongeng, legenda, dan cerita rakyat. Biasanya mengandung pesan moral.",
        difficulty: "MEDIUM",
        questions: [
          { q: g <= 2 ? "Kata 'makan' artinya..." : "Puisi sering menggunakan bahasa...", o: g <= 2 ? ["Memasak", "Memakan", "Membeli", "Menjual"] : ["Sehari-hari", "Indah", "Asing", "Sulit"], a: g <= 2 ? "Memakan" : "Indah", d: "EASY" },
          { q: "Apa yang kamu lakukan sebelum tidur?", o: ["Makan", "Gosok gigi", "Belajar", "Bermain"], a: "Gosok gigi", d: "EASY" },
          { q: g <= 2 ? "Kata 'minum' berlawanan dengan..." : "Rima adalah...", o: g <= 2 ? ["Makan", "Tidur", "Lapar", "Haus"] : ["Persamaan bunyi", "Perbedaan kata", "Panjang kalimat", "Jumlah suku kata"], a: g <= 2 ? "Makan" : "Persamaan bunyi", d: "MEDIUM" },
          { q: "Kata sapaan yang sopan adalah...", o: ["Hei", "Halo", "Permisi", "Awas"], a: "Permisi", d: "MEDIUM" },
          { q: g <= 2 ? "Apa yang kamu katakan saat diberi sesuatu?" : "Dongeng termasuk jenis cerita...", o: g <= 2 ? ["Terima kasih", "Tidak mau", "Maaf", "Halo"] : ["Nonfiksi", "Fiksi", "Ilmiah", "Berita"], a: g <= 2 ? "Terima kasih" : "Fiksi", d: "HARD" },
        ],
      },
      {
        title: g <= 2 ? "Membaca Cerita" : g <= 4 ? "Dongeng" : "Membaca Intensif",
        content: g <= 2
          ? "Ayo baca cerita pendek bersama-sama! Perhatikan tanda baca dan intonasi saat membaca."
          : g <= 4
          ? "Dongeng adalah cerita rakyat yang diwariskan turun-temurun. Banyak pesan moral dalam dongeng."
          : "Membaca intensif adalah membaca dengan saksama untuk memahami isi bacaan secara mendalam.",
        difficulty: "HARD",
        questions: [
          { q: g <= 2 ? "Siapa yang menceritakan dongeng?" : "Ide pokok paragraf disebut...", o: g <= 2 ? ["Ibu", "Ayah", "Nenek", "Semua bisa"] : ["Topik", "Judul", "Gagasan utama", "Kesimpulan"], a: g <= 2 ? "Semua bisa" : "Gagasan utama", d: "EASY" },
          { q: g <= 2 ? "Apa warna kucing biasanya?" : "Membaca intensif bertujuan untuk...", o: g <= 2 ? ["Merah", "Hitam/putih", "Hijau", "Biru"] : ["Hiburan", "Pemahaman", "Kecepatan", "Iseng"], a: g <= 2 ? "Hitam/putih" : "Pemahaman", d: "MEDIUM" },
          { q: "Cerita 'Kancil dan Buaya' termasuk...", o: ["Dongeng", "Puisi", "Berita", "Laporan"], a: "Dongeng", d: "MEDIUM" },
          { q: g <= 2 ? "Apa yang dilakukan kancil?" : "Tanda baca titik (.) digunakan untuk...", o: g <= 2 ? ["Tidur", "Makan", "Berpetualang", "Belajar"] : ["Tanya", "Seru", "Akhir kalimat", "Koma"], a: g <= 2 ? "Berpetualang" : "Akhir kalimat", d: "HARD" },
          { q: g <= 2 ? "Siapa teman kancil?" : "Kesimpulan bacaan terdapat di bagian...", o: g <= 2 ? ["Buaya", "Harimau", "Kelinci", "Semua"] : ["Awal", "Tengah", "Akhir", "Semua"], a: g <= 2 ? "Kelinci" : "Akhir", d: "HARD" },
        ],
      },
    ],
    IPS: [
      {
        title: g <= 2 ? "Lingkunganku" : g <= 4 ? "Makhluk Hidup" : "Sistem Tubuh",
        content: g <= 2
          ? "Lingkungan terdiri dari makhluk hidup dan benda mati. Jaga kebersihan lingkungan ya!"
          : g <= 4
          ? "Makhluk hidup membutuhkan makanan, air, dan udara. Tumbuhan hijau membuat makanannya sendiri."
          : "Tubuh manusia terdiri dari sistem-sistem yang saling bekerja sama, seperti sistem pencernaan, pernapasan, dan peredaran darah.",
        difficulty: "EASY",
        questions: [
          { q: "Makhluk hidup perlu apa untuk bertahan hidup?", o: ["Air", "Tanah", "Batu", "Pasir"], a: "Air", d: "EASY" },
          { q: "Tumbuhan mendapat makanan dari...", o: ["Tanah", "Air", "Matahari", "Udara"], a: "Matahari", d: "EASY" },
          { q: g <= 2 ? "Apa contoh hewan peliharaan?" : "Fotosintesis terjadi pada...", o: g <= 2 ? ["Kucing", "Harimau", "Singa", "Gajah"] : ["Hewan", "Tumbuhan", "Manusia", "Batu"], a: g <= 2 ? "Kucing" : "Tumbuhan", d: "MEDIUM" },
          { q: g <= 2 ? "Benda mati contohnya..." : "Hewan karnivora pemakan...", o: g <= 2 ? ["Kucing", "Batu", "Pohon", "Bunga"] : ["Tumbuhan", "Daging", "Buah", "Semua"], a: g <= 2 ? "Batu" : "Daging", d: "MEDIUM" },
          { q: "Alat pernapasan manusia adalah...", o: ["Jantung", "Paru-paru", "Hati", "Ginjal"], a: "Paru-paru", d: "HARD" },
        ],
      },
      {
        title: g <= 2 ? "Cuaca dan Musim" : g <= 4 ? "Sumber Daya Alam" : "Tata Surya",
        content: g <= 2
          ? "Cuaca bisa cerah, hujan, atau berawan. Musim di Indonesia ada musim hujan dan musim kemarau."
          : g <= 4
          ? "Sumber daya alam dibagi menjadi yang dapat diperbarui (air, tumbuhan) dan tidak dapat diperbarui (minyak bumi)."
          : "Tata surya terdiri dari matahari sebagai pusat, dan planet-planet yang mengelilinginya, seperti Merkurius, Venus, Bumi, Mars, dan seterusnya.",
        difficulty: "MEDIUM",
        questions: [
          { q: g <= 2 ? "Cuaca cerah artinya..." : "Planet terdekat dengan matahari adalah...", o: g <= 2 ? ["Hujan", "Panas", "Dingin", "Berawan"] : ["Bumi", "Venus", "Merkurius", "Mars"], a: g <= 2 ? "Panas" : "Merkurius", d: "EASY" },
          { q: g <= 2 ? "Apa yang kamu pakai saat hujan?" : "Sumber daya yang tidak habis disebut...", o: g <= 2 ? ["Topi", "Payung", "Jaket", "Sendal"] : ["Terbatas", "Tak terbarukan", "Terbarukan", "Mineral"], a: g <= 2 ? "Payung" : "Terbarukan", d: "EASY" },
          { q: "Indonesia beriklim...", o: ["Dingin", "Salju", "Tropis", "Gurun"], a: "Tropis", d: "MEDIUM" },
          { q: g <= 2 ? "Apa tanda musim hujan?" : "Bumi mengelilingi matahari selama...", o: g <= 2 ? ["Panas", "Banyak hujan", "Kering", "Angin kencang"] : ["1 hari", "1 minggu", "1 bulan", "1 tahun"], a: g <= 2 ? "Banyak hujan" : "1 tahun", d: "MEDIUM" },
          { q: g <= 2 ? "Hewan apa yang bisa terbang?" : "Matahari termasuk...", o: g <= 2 ? ["Ikan", "Burung", "Kucing", "Anjing"] : ["Planet", "Bintang", "Satelit", "Komet"], a: g <= 2 ? "Burung" : "Bintang", d: "HARD" },
        ],
      },
      {
        title: g <= 2 ? "Hewan dan Tumbuhan" : g <= 4 ? "Gaya dan Gerak" : "Energi dan Perubahannya",
        content: g <= 2
          ? "Ada banyak jenis hewan dan tumbuhan di sekitar kita. Rawat dan sayangi mereka!"
          : g <= 4
          ? "Gaya dapat mengubah gerak benda. Gaya dorong dan tarik adalah contoh gaya yang sering kita lakukan."
          : "Energi tidak dapat diciptakan atau dimusnahkan, hanya berubah bentuk. Contoh: energi listrik berubah menjadi cahaya.",
        difficulty: "HARD",
        questions: [
          { q: g <= 2 ? "Hewan berkaki empat adalah..." : "Energi listrik diubah menjadi cahaya oleh...", o: g <= 2 ? ["Ayam", "Kucing", "Burung", "Ikan"] : ["Kipas", "Lampu", "Kompor", "Radio"], a: g <= 2 ? "Kucing" : "Lampu", d: "EASY" },
          { q: "Tumbuhan memerlukan air untuk...", o: ["Bernapas", "Tumbuh", "Tidur", "Bermain"], a: "Tumbuh", d: "MEDIUM" },
          { q: g <= 2 ? "Hewan apa yang hidup di air?" : "Gaya dapat menyebabkan benda...", o: g <= 2 ? ["Kucing", "Ikan", "Burung", "Kelinci"] : ["Diam", "Bergerak", "Hilang", "Matang"], a: g <= 2 ? "Ikan" : "Bergerak", d: "MEDIUM" },
          { q: g <= 2 ? "Daun berwarna..." : "Contoh energi alternatif adalah...", o: g <= 2 ? ["Merah", "Hijau", "Biru", "Kuning"] : ["Bensin", "Solar", "Matahari", "Batubara"], a: g <= 2 ? "Hijau" : "Matahari", d: "HARD" },
          { q: g <= 2 ? "Buah apa yang berwarna merah?" : "Perubahan energi pada setrika adalah listrik menjadi...", o: g <= 2 ? ["Apel", "Pisang", "Jeruk", "Anggur"] : ["Panas", "Cahaya", "Gerak", "Bunyi"], a: g <= 2 ? "Apel" : "Panas", d: "HARD" },
        ],
      },
    ],
    PNC: [
      {
        title: g <= 2 ? "Aku dan Diriku" : g <= 4 ? "Pancasila" : "Nilai-nilai Pancasila",
        content: g <= 2
          ? "Setiap anak memiliki keunikan masing-masing. Kenali dirimu, sayangi dirimu, dan hargai temanmu!"
          : g <= 4
          ? "Pancasila adalah dasar negara Indonesia. Terdiri dari lima sila yang menjadi pedoman hidup bangsa."
          : "Pancasila memiliki nilai-nilai luhur: Ketuhanan, Kemanusiaan, Persatuan, Kerakyatan, dan Keadilan. Praktikkan dalam kehidupan sehari-hari.",
        difficulty: "EASY",
        questions: [
          { q: "Sila pertama Pancasila adalah...", o: ["Kemanusiaan", "Persatuan", "Ketuhanan", "Keadilan"], a: "Ketuhanan", d: "EASY" },
          { q: g <= 2 ? "Siapa dirimu?" : "Lambang sila kedua adalah...", o: g <= 2 ? ["Anak", "Dewasa", "Orang tua", "Guru"] : ["Bintang", "Rantai", "Pohon", "Kepala banteng"], a: g <= 2 ? "Anak" : "Rantai", d: "EASY" },
          { q: "Bhinneka Tunggal Ika artinya...", o: ["Berbeda-beda tetap satu", "Satu untuk semua", "Bersatu kita teguh", "Merdeka"], a: "Berbeda-beda tetap satu", d: "MEDIUM" },
          { q: g <= 2 ? "Apa warna bendera Indonesia?" : "Musyawarah bertujuan mencapai...", o: g <= 2 ? ["Merah putih", "Biru kuning", "Hijau merah", "Hitam putih"] : ["Kemenangan", "Mufakat", "Perdebatan", "Kekuasaan"], a: g <= 2 ? "Merah putih" : "Mufakat", d: "MEDIUM" },
          { q: g <= 2 ? "Berapa jumlah sila Pancasila?" : "Hak asasi manusia diatur dalam sila ke...", o: g <= 2 ? ["4", "5", "6", "3"] : ["1", "2", "3", "4"], a: g <= 2 ? "5" : "2", d: "HARD" },
        ],
      },
      {
        title: "Hak dan Kewajiban",
        content: g <= 2
          ? "Setiap anak memiliki hak (mendapat kasih sayang, pendidikan) dan kewajiban (belajar, membantu orang tua)."
          : g <= 4
          ? "Hak adalah sesuatu yang kita terima, kewajiban adalah sesuatu yang harus kita lakukan. Keduanya harus seimbang."
          : "Sebagai warga negara, kita memiliki hak dan kewajiban yang dijamin oleh Undang-Undang Dasar 1945.",
        difficulty: "MEDIUM",
        questions: [
          { q: g <= 2 ? "Apa kewajibanmu di rumah?" : "Hak warga negara untuk mendapatkan...", o: g <= 2 ? ["Bermain terus", "Belajar", "Tidur", "Makan"] : ["Hukuman", "Pendidikan", "Larangan", "Denda"], a: g <= 2 ? "Belajar" : "Pendidikan", d: "EASY" },
          { q: g <= 2 ? "Kamu berhak mendapat..." : "Kewajiban sebagai siswa adalah...", o: g <= 2 ? ["Hukuman", "Kasih sayang", "Larangan", "Marah"] : ["Bermalas-malasan", "Mematuhi guru", "Berkelahi", "Membolos"], a: g <= 2 ? "Kasih sayang" : "Mematuhi guru", d: "EASY" },
          { q: "Siapa yang menjamin hak anak?", o: ["Teman", "Negara", "Hewan", "Alam"], a: "Negara", d: "MEDIUM" },
          { q: "Kewajiban terhadap Tuhan adalah...", o: ["Beribadah", "Bermain", "Tidur", "Makan"], a: "Beribadah", d: "MEDIUM" },
          { q: "Contoh musyawarah di sekolah adalah...", o: ["Berkelahi", "Pemilihan ketua kelas", "Berteriak", "Jajan"], a: "Pemilihan ketua kelas", d: "HARD" },
        ],
      },
      {
        title: g <= 2 ? "Aturan di Rumah" : g <= 4 ? "Keragaman Budaya" : "NKRI",
        content: g <= 2
          ? "Di rumah ada aturan seperti bangun pagi, merapikan tempat tidur, dan pamit saat pergi. Patuhi aturan ya!"
          : g <= 4
          ? "Indonesia kaya akan budaya, suku, bahasa, dan adat istiadat. Keragaman ini adalah kekayaan bangsa."
          : "Negara Kesatuan Republik Indonesia (NKRI) adalah bentuk negara kita. NKRI harga mati!",
        difficulty: "HARD",
        questions: [
          { q: "Aturan di rumah dibuat oleh...", o: ["Anak", "Orang tua", "Teman", "Guru"], a: "Orang tua", d: "EASY" },
          { q: g <= 2 ? "Siapa kepala keluarga?" : "Apa arti NKRI?", o: g <= 2 ? ["Ayah", "Ibu", "Anak", "Kakek"] : ["Negara Kesatuan Republik Indonesia", "Nama negara", "Bendera", "Lagu"], a: g <= 2 ? "Ayah" : "Negara Kesatuan Republik Indonesia", d: "EASY" },
          { q: g <= 2 ? "Aturan di sekolah dibuat oleh..." : "Keragaman budaya Indonesia harus kita...", o: g <= 2 ? ["Guru", "Murid", "Penjaga", "Kepala sekolah"] : ["Lupakan", "Banggakan", "Ejek", "Hina"], a: g <= 2 ? "Guru" : "Banggakan", d: "MEDIUM" },
          { q: g <= 2 ? "Pulang sekolah harus..." : "Gotong royong mencerminkan sila ke...", o: g <= 2 ? ["Bermain", "Pulang ke rumah", "Jajan", "Nonton TV"] : ["2", "3", "4", "5"], a: g <= 2 ? "Pulang ke rumah" : "3", d: "MEDIUM" },
          { q: g <= 2 ? "Aturan berguna untuk..." : "Suku Jawa berasal dari pulau...", o: g <= 2 ? ["Kekacauan", "Keteraturan", "Perselisihan", "Masalah"] : ["Sumatra", "Jawa", "Kalimantan", "Sulawesi"], a: g <= 2 ? "Keteraturan" : "Jawa", d: "HARD" },
        ],
      },
    ],
    AGM: [
      {
        title: g <= 2 ? "Mengenal Tuhan" : g <= 4 ? "Ibadah" : "Akhlak Mulia",
        content: g <= 2
          ? "Tuhan menciptakan alam semesta dan isinya. Mari bersyukur atas ciptaan Tuhan."
          : g <= 4
          ? "Ibadah adalah bentuk pengabdian kepada Tuhan. Setiap agama memiliki cara ibadah masing-masing."
          : "Akhlak mulia meliputi jujur, bertanggung jawab, disiplin, dan tolong-menolong. Jadilah pribadi yang berakhlak baik.",
        difficulty: "EASY",
        questions: [
          { q: g <= 2 ? "Siapa yang menciptakan alam?" : "Berbuat baik kepada sesama disebut...", o: g <= 2 ? ["Manusia", "Tuhan", "Hewan", "Alam"] : ["Akhlak mulia", "Kejahatan", "Kelalaian", "Kebodohan"], a: g <= 2 ? "Tuhan" : "Akhlak mulia", d: "EASY" },
          { q: "Sikap bersyukur ditunjukkan dengan...", o: ["Mengeluh", "Berterima kasih", "Marah", "Diam"], a: "Berterima kasih", d: "EASY" },
          { q: "Kita harus ... kepada orang tua", o: ["Melawan", "Menghormati", "Membenci", "Mengabaikan"], a: "Menghormati", d: "MEDIUM" },
          { q: "Sikap jujur membawa...", o: ["Masalah", "Kebaikan", "Hukuman", "Kesedihan"], a: "Kebaikan", d: "MEDIUM" },
          { q: "Tolong-menolong adalah perbuatan...", o: ["Tercela", "Terpuji", "Jahat", "Sia-sia"], a: "Terpuji", d: "HARD" },
        ],
      },
      {
        title: "Kisah Teladan",
        content: g <= 2
          ? "Banyak kisah teladan dari nabi dan orang saleh yang bisa kita contoh. Mereka selalu berbuat baik."
          : g <= 4
          ? "Kisah para nabi mengajarkan kita tentang kesabaran, kejujuran, dan ketaatan kepada Tuhan."
          : "Tokoh-tokoh dalam agama mengajarkan nilai-nilai kehidupan. Pelajari dan terapkan dalam kehidupan sehari-hari.",
        difficulty: "MEDIUM",
        questions: [
          { q: "Siapa nabi yang membangun bahtera?", o: ["Nabi Musa", "Nabi Nuh", "Nabi Ibrahim", "Nabi Isa"], a: "Nabi Nuh", d: "EASY" },
          { q: "Nabi yang dibakar tapi tidak mati adalah...", o: ["Nabi Musa", "Nabi Ibrahim", "Nabi Ismail", "Nabi Yakub"], a: "Nabi Ibrahim", d: "MEDIUM" },
          { q: "Sikap sabar artinya...", o: ["Mudah marah", "Menahan diri", "Cepat menyerah", "Pendendam"], a: "Menahan diri", d: "MEDIUM" },
          { q: "Nabi terakhir dalam Islam adalah...", o: ["Nabi Musa", "Nabi Isa", "Nabi Muhammad", "Nabi Ibrahim"], a: "Nabi Muhammad", d: "HARD" },
          { q: "Berapa jumlah nabi yang wajib diketahui?", o: ["10", "15", "20", "25"], a: "25", d: "HARD" },
        ],
      },
      {
        title: g <= 2 ? "Berdoa" : g <= 4 ? "Toleransi" : "Kerukunan",
        content: g <= 2
          ? "Doa adalah permohonan kepada Tuhan. Berdoa sebelum melakukan aktivitas agar diberi kemudahan."
          : g <= 4
          ? "Toleransi berarti menghormati perbedaan agama dan kepercayaan orang lain. Hidup rukun antarumat beragama."
          : "Kerukunan antarumat beragama menciptakan kedamaian. Saling menghormati dan tidak mengganggu ibadah orang lain.",
        difficulty: "HARD",
        questions: [
          { q: "Kapan waktu yang baik untuk berdoa?", o: ["Hanya malam", "Setiap saat", "Hanya pagi", "Tidak perlu"], a: "Setiap saat", d: "EASY" },
          { q: "Toleransi artinya...", o: ["Memaksakan kehendak", "Menghormati perbedaan", "Bersaing", "Acuh tak acuh"], a: "Menghormati perbedaan", d: "MEDIUM" },
          { q: "Sikap yang baik terhadap teman berbeda agama adalah...", o: ["Mengejek", "Menghormati", "Menjauhi", "Memusuhi"], a: "Menghormati", d: "MEDIUM" },
          { q: "Kerukunan menciptakan...", o: ["Pertengkaran", "Kedamaian", "Perselisihan", "Kekacauan"], a: "Kedamaian", d: "MEDIUM" },
          { q: "Contoh sikap toleransi di sekolah...", o: ["Berkelahi", "Bermain bersama semua teman", "Mengejek teman", "Bersikap kasar"], a: "Bermain bersama semua teman", d: "HARD" },
        ],
      },
    ],
    PJO: [
      {
        title: "Gerak Dasar",
        content: "Gerak dasar meliputi berjalan, berlari, melompat, dan melempar. Latihan gerak dasar penting untuk kebugaran tubuh.",
        difficulty: "EASY",
        questions: [
          { q: "Gerak berpindah tempat disebut...", o: ["Gerak manipulatif", "Gerak lokomotor", "Gerak non-lokomotor", "Gerak statis"], a: "Gerak lokomotor", d: "EASY" },
          { q: "Contoh gerak lokomotor adalah...", o: ["Membungkuk", "Berlari", "Memutar", "Menggeleng"], a: "Berlari", d: "EASY" },
          { q: "Pemanasan dilakukan sebelum...", o: ["Tidur", "Olahraga", "Makan", "Belajar"], a: "Olahraga", d: "MEDIUM" },
          { q: "Gerakan melompat menggunakan...", o: ["Tangan", "Kaki", "Kepala", "Punggung"], a: "Kaki", d: "MEDIUM" },
          { q: "Olahraga membuat tubuh menjadi...", o: ["Lemah", "Sehat", "Sakit", "Lelah"], a: "Sehat", d: "HARD" },
        ],
      },
      {
        title: "Kebugaran Jasmani",
        content: "Kebugaran jasmani adalah kemampuan tubuh melakukan aktivitas tanpa kelelahan berlebih. Jaga kebugaran dengan olahraga teratur.",
        difficulty: "MEDIUM",
        questions: [
          { q: "Latihan push-up melatih otot...", o: ["Kaki", "Tangan", "Perut", "Punggung"], a: "Tangan", d: "EASY" },
          { q: "Olahraga yang baik dilakukan selama... menit per hari", o: ["5", "15", "30", "60"], a: "30", d: "MEDIUM" },
          { q: "Istirahat yang cukup penting untuk...", o: ["Kebugaran", "Kelelahan", "Penyakit", "Stress"], a: "Kebugaran", d: "MEDIUM" },
          { q: "Minum air putih setelah olahraga...", o: ["Berbahaya", "Dianjurkan", "Dilarang", "Tidak perlu"], a: "Dianjurkan", d: "MEDIUM" },
          { q: "Frekuensi olahraga yang baik per minggu...", o: ["1 kali", "3-5 kali", "7 kali", "Setiap jam"], a: "3-5 kali", d: "HARD" },
        ],
      },
    ],
    SNI: [
      {
        title: "Menggambar dan Mewarnai",
        content: "Menggambar adalah kegiatan mengekspresikan imajinasi di atas kertas. Gunakan pensil, krayon, atau cat air.",
        difficulty: "EASY",
        questions: [
          { q: "Alat untuk menggambar adalah...", o: ["Pensil", "Gunting", "Penggaris", "Lem"], a: "Pensil", d: "EASY" },
          { q: "Warna primer adalah...", o: ["Merah, kuning, biru", "Hijau, ungu, oranye", "Hitam, putih, abu", "Pink, ungu, coklat"], a: "Merah, kuning, biru", d: "MEDIUM" },
          { q: "Mencampur merah dan kuning menghasilkan...", o: ["Hijau", "Ungu", "Oranye", "Coklat"], a: "Oranye", d: "MEDIUM" },
          { q: "Krayon digunakan untuk...", o: ["Menulis", "Mewarnai", "Menggunting", "Menempel"], a: "Mewarnai", d: "MEDIUM" },
          { q: "Seni rupa 2 dimensi contohnya...", o: ["Patung", "Lukisan", "Bangunan", "Meja"], a: "Lukisan", d: "HARD" },
        ],
      },
      {
        title: "Menyanyi",
        content: "Menyanyi adalah kegiatan mengeluarkan suara bernada. Bernyanyi bisa dilakukan sendiri atau bersama-sama.",
        difficulty: "MEDIUM",
        questions: [
          { q: "Lagu kebangsaan Indonesia adalah...", o: ["Indonesia Pusaka", "Indonesia Raya", "Garuda Pancasila", "Tanah Air"], a: "Indonesia Raya", d: "EASY" },
          { q: "Alat musik yang ditiup contohnya...", o: ["Gitar", "Seruling", "Drum", "Piano"], a: "Seruling", d: "MEDIUM" },
          { q: "Bernyanyi bersama disebut...", o: ["Solo", "Duet", "Paduan suara", "Vokal grup"], a: "Paduan suara", d: "MEDIUM" },
          { q: "Nada tinggi dan rendah diatur oleh...", o: ["Irama", "Melodi", "Birama", "Tempo"], a: "Melodi", d: "HARD" },
          { q: "Cepat lambat lagu disebut...", o: ["Nada", "Tempo", "Irama", "Dinamika"], a: "Tempo", d: "HARD" },
        ],
      },
    ],
  };
  return base[subjectCode] || [];
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Memulai seed materi, video, dan quiz...\n");

  // Ambil semua classSubject beserta relasi
  const classSubjects = await prisma.classSubject.findMany({
    include: { class: true, subject: true },
    orderBy: [{ class: { gradeLevel: "asc" } }, { subject: { code: "asc" } }],
  });

  console.log(`📚 Ditemukan ${classSubjects.length} class-subject links\n`);

  let totalMaterials = 0;
  let totalVideos = 0;
  let totalQuestions = 0;

  for (const cs of classSubjects) {
    const grade = cs.class.gradeLevel;
    const subjectCode = cs.subject.code;
    const subjectName = cs.subject.name;
    const className = cs.class.name;

    const matDefs = getMaterials(subjectCode, grade);
    if (matDefs.length === 0) continue;

    // Cek apakah sudah ada material untuk classSubject ini
    const existing = await prisma.material.count({ where: { classSubjectId: cs.id } });
    if (existing > 0) {
      console.log(`  ⏩ ${className} - ${subjectName}: sudah ada ${existing} materi, lewati`);
      continue;
    }

    const videos = YT_VIDEOS[subjectCode] || [];

    for (let i = 0; i < matDefs.length; i++) {
      const def = matDefs[i];
      const difficulty = def.difficulty;

      // Create material
      const material = await prisma.material.create({
        data: {
          classSubjectId: cs.id,
          title: def.title,
          contentText: def.content,
          orderIndex: i + 1,
          difficulty,
          isPublished: true,
          bab: `Bab ${i + 1}`,
        },
      });

      // Create video
      if (videos[i]) {
        const v = videos[i];
        await prisma.video.create({
          data: {
            materialId: material.id,
            title: `${v.title} - ${def.title}`,
            embedUrl: v.url,
            durationSeconds: v.dur,
            pointReward: 10,
          },
        });
        totalVideos++;
      }

      // Create questions
      for (let j = 0; j < def.questions.length; j++) {
        const q = def.questions[j];
        await prisma.question.create({
          data: {
            materialId: material.id,
            questionText: q.q,
            options: q.o,
            correctAnswer: q.a,
            difficulty: q.d,
            orderIndex: j + 1,
          },
        });
        totalQuestions++;
      }

      totalMaterials++;
      console.log(`  ✅ ${className} - ${subjectName}: "${def.title}" (${difficulty}) [${def.questions.length} soal]`);
    }
  }

  console.log(`\n🎉 Selesai!`);
  console.log(`   📦 ${totalMaterials} materi`);
  console.log(`   🎬 ${totalVideos} video`);
  console.log(`   ❓ ${totalQuestions} soal quiz`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
