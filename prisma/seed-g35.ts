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

type Q = { q: string; o: string[]; a: string; d: string };
const DS = ["EASY", "MEDIUM", "HARD"];

function fill10(qs: Q[]): Q[] {
  const r = [...qs]; let fi = 0;
  while (r.length < 10) { const d = DS[fi++ % 3]; r.push({ q: `Soal ${r.length + 1} ?`, o: ["A","B","C","D"], a: "B", d }); }
  return r;
}
const M = (cs: string, title: string, diff: string, qs: Q[]) => ({ cs, title, diff, qs: fill10(qs) });
const mc = (q: string, a: number, o: string[], d: string): Q => ({ q, o, a: o[a], d });

// ── Grade 3 questions ──
const G3: ReturnType<typeof M>[] = [
  M("MTK", "Perkalian & Pembagian", "MEDIUM", [
    mc("6 x 8 = ?", 0, ["48","56","64","72"], "MEDIUM"),
    mc("7 x 9 = ?", 1, ["56","63","72","81"], "MEDIUM"),
    mc("45 : 5 = ?", 2, ["7","8","9","10"], "MEDIUM"),
    mc("72 : 8 = ?", 2, ["7","8","9","10"], "MEDIUM"),
    mc("9 x 4 = ?", 0, ["36","32","40","45"], "MEDIUM"),
    mc("56 : 7 = ?", 2, ["6","7","8","9"], "MEDIUM"),
    mc("3 x 12 = ?", 0, ["36","32","40","48"], "MEDIUM"),
    mc("81 : 9 = ?", 2, ["7","8","9","10"], "MEDIUM"),
    mc("5 x 9 = ?", 1, ["40","45","50","55"], "MEDIUM"),
    mc("64 : 8 = ?", 2, ["6","7","8","9"], "MEDIUM"),
  ]),
  M("MTK", "Pecahan", "MEDIUM", [
    mc("1/3 + 1/3 = ?", 1, ["1/6","2/3","2/6","3/3"], "MEDIUM"),
    mc("2/5 + 1/5 = ?", 2, ["1/5","2/10","3/5","4/5"], "MEDIUM"),
    mc("3/4 - 1/4 = ?", 1, ["1/4","2/4","3/4","4/4"], "MEDIUM"),
    mc("1/2 sama dengan ?", 2, ["0,25","0,75","0,5","1,5"], "MEDIUM"),
    mc("4/8 disederhanakan jadi ?", 1, ["1/8","1/2","2/4","4/4"], "MEDIUM"),
    mc("1/4 + 2/4 = ?", 2, ["1/4","2/4","3/4","4/4"], "MEDIUM"),
    mc("3/6 = .../2", 0, ["1","2","3","4"], "MEDIUM"),
    mc("1 - 1/3 = ?", 1, ["1/3","2/3","3/3","0"], "MEDIUM"),
    mc("Pecahan senilai 2/4 ?", 1, ["1/4","1/2","3/4","4/4"], "MEDIUM"),
    mc("7/10 - 3/10 = ?", 2, ["3/10","4/10","5/10","6/10"], "MEDIUM"),
  ]),
  M("MTK", "Bangun Datar", "HARD", [
    mc("Luas persegi s=8 cm ?", 1, ["16","64","32","56"], "HARD"),
    mc("Keliling persegi s=12 cm ?", 1, ["24","48","36","60"], "HARD"),
    mc("Luas segitiga a=10 t=8 ?", 1, ["20","40","80","60"], "HARD"),
    mc("Keliling persegi panjang 12x5 ?", 1, ["24","34","30","40"], "HARD"),
    mc("Luas persegi panjang 9x7 ?", 2, ["56","72","63","81"], "HARD"),
    mc("Keliling segitiga 7,10,13 ?", 2, ["20","25","30","35"], "HARD"),
    mc("Luas jajar genjang a=12 t=5 ?", 1, ["30","60","40","50"], "HARD"),
    mc("Keliling belah ketupat s=9 ?", 2, ["18","27","36","45"], "HARD"),
    mc("Luas layang d1=10 d2=8 ?", 1, ["80","40","60","20"], "HARD"),
    mc("Keliling persegi panjang 15x6 ?", 2, ["30","36","42","48"], "HARD"),
  ]),
  M("MTK", "Waktu", "MEDIUM", [
    mc("1 jam = ... menit ?", 2, ["30","45","60","90"], "MEDIUM"),
    mc("1/2 jam = ... menit ?", 1, ["15","30","45","60"], "MEDIUM"),
    mc("2 jam = ... menit ?", 3, ["90","100","110","120"], "MEDIUM"),
    mc("Pukul 8 + 3 jam = ?", 3, ["9","10","12","11"], "MEDIUM"),
    mc("Pukul 10.30 + 90 menit = ?", 2, ["11.00","11.30","12.00","12.30"], "MEDIUM"),
    mc("1 menit = ... detik ?", 2, ["30","45","60","90"], "MEDIUM"),
    mc("Belajar 2 jam/hari, seminggu = ? jam", 2, ["7","10","14","21"], "MEDIUM"),
    mc("Pukul 7.15 - 45 menit = ?", 1, ["6.15","6.30","6.45","7.00"], "MEDIUM"),
    mc("1 bulan = ... hari ?", 2, ["28-29","30","30-31","31"], "MEDIUM"),
    mc("Pukul 13.00 = jam ? siang", 0, ["1","2","3","4"], "MEDIUM"),
  ]),
  M("MTK", "Uang dan Belanja", "MEDIUM", [
    mc("Harga Rp5.000 diskon 20% bayar ?", 1, ["Rp3.000","Rp4.000","Rp4.500","Rp5.000"], "MEDIUM"),
    mc("Beli Rp12.500 bayar Rp20.000 kembali ?", 1, ["Rp5.000","Rp7.500","Rp8.000","Rp10.000"], "MEDIUM"),
    mc("Harga 3 buku @Rp2.500 = ?", 1, ["Rp6.000","Rp7.500","Rp8.000","Rp9.000"], "MEDIUM"),
    mc("Uang Rp50.000 beli Rp32.500 sisa ?", 0, ["Rp17.500","Rp18.000","Rp20.000","Rp22.500"], "MEDIUM"),
    mc("Harga Rp15.000 diskon 10% jadi ?", 1, ["Rp12.500","Rp13.500","Rp14.000","Rp14.500"], "MEDIUM"),
    mc("5 kg @Rp8.000 total ?", 1, ["Rp35.000","Rp40.000","Rp45.000","Rp50.000"], "MEDIUM"),
    mc("Harga 2 pensil @Rp1.500 + 1 buku Rp3.000 = ?", 2, ["Rp4.500","Rp5.000","Rp6.000","Rp7.500"], "MEDIUM"),
    mc("Rp200.000 - Rp175.500 = ?", 1, ["Rp22.500","Rp24.500","Rp25.000","Rp27.500"], "MEDIUM"),
    mc("Harga total Rp45.000 dibayar 2 orang = ?", 1, ["Rp20.000","Rp22.500","Rp25.000","Rp27.500"], "MEDIUM"),
    mc("Uang Rp100.000 beli Rp78.500 kembali ?", 1, ["Rp20.500","Rp21.500","Rp22.500","Rp25.000"], "MEDIUM"),
  ]),
  M("IPA", "Makhluk Hidup", "EASY", [
    mc("Tumbuhan hijau membuat ?", 2, ["CO2","Protein","Makanan","Vitamin"], "EASY"),
    mc("Rantai makanan dimulai ?", 0, ["Tumbuhan","Herbivor","Karnivor","Manusia"], "EASY"),
    mc("Hewan aktif malam ?", 3, ["Ayam","Kucing","Anjing","Kelelawar"], "EASY"),
    mc("Metamorfosis kupu mulai ?", 1, ["Telur","Larva","Pupa","Kupu"], "EASY"),
    mc("Mutualisme contoh ?", 2, ["Kutu-kucing","Cacing-usus","Bunga-lebah","Benalu-pohon"], "EASY"),
    mc("Ekosistem interaksi ?", 0, ["Makhluk+lingkungan","Sesama","Udara","Tanah"], "EASY"),
    mc("Pengurai contoh ?", 1, ["Elang","Jamur","Rusa","Harimau"], "EASY"),
    mc("Populasi adalah ?", 0, ["Individu sejenis","Berbagai jenis","Komunitas","Ekosistem"], "EASY"),
    mc("Konsumen puncak ?", 2, ["Rusa","Kambing","Harimau","Belalang"], "EASY"),
    mc("Cacing tanah peran ?", 2, ["Produsen","Konsumen","Pengurai","Herbivor"], "EASY"),
  ]),
  M("IPA", "Gaya dan Gerak", "EASY", [
    mc("Mendorong meja pakai gaya ?", 0, ["Otot","Listrik","Magnet","Pegas"], "EASY"),
    mc("Sepeda direm karena gaya ?", 1, ["Dorong","Gesek","Pegas","Magnet"], "EASY"),
    mc("Kincir angin karena ?", 0, ["Angin","Air","Api","Listrik"], "EASY"),
    mc("Paku ditarik magnet karena ?", 0, ["Gaya magnet","Gaya listrik","Gravitasi","Gesek"], "EASY"),
    mc("Makanan diubah jadi ?", 0, ["Energi","Cahaya","Suara","Panas"], "EASY"),
    mc("Lampu listrik jadi ?", 1, ["Panas","Cahaya","Suara","Gerak"], "EASY"),
    mc("Setrika listrik jadi ?", 0, ["Panas","Cahaya","Suara","Gerak"], "EASY"),
    mc("Pesawat sederhana tuas ?", 0, ["Jungkat-jungkit","Lampu","Radio","TV"], "EASY"),
    mc("Bidang miring contoh ?", 0, ["Tangga","Lift","Eskalator","Tali"], "EASY"),
    mc("Katrol untuk ?", 0, ["Mengangkat","Mendorong","Menarik","Memotong"], "EASY"),
  ]),
  M("IPA", "Makanan Sehat", "EASY", [
    mc("4 sehat 5 sempurna ?", 0, ["Nasi+lauk+sayur+buah+susu","Nasi+air","Sayur+buah","Lauk"], "EASY"),
    mc("Karbohidrat di ?", 0, ["Nasi","Ikan","Telur","Susu"], "EASY"),
    mc("Protein di ?", 1, ["Nasi","Ikan","Roti","Gula"], "EASY"),
    mc("Vitamin C di ?", 2, ["Ikan","Telur","Jeruk","Nasi"], "EASY"),
    mc("Kalsium untuk ?", 2, ["Mata","Rambut","Tulang","Kulit"], "EASY"),
    mc("Zat besi di ?", 3, ["Nasi","Susu","Jeruk","Bayam"], "EASY"),
    mc("Gula beri ?", 0, ["Energi","Vitamin","Protein","Serat"], "EASY"),
    mc("Serat untuk ?", 2, ["Jantung","Mata","Pencernaan","Paru"], "EASY"),
    mc("Air penting untuk ?", 3, ["Main","Tidur","TV","Cairan tubuh"], "EASY"),
    mc("Gizi seimbang mencegah ?", 0, ["Penyakit","Kekayaan","Keindahan","Kekuatan"], "EASY"),
  ]),
  M("IPA", "Bumi", "EASY", [
    mc("Bumi berputar pada ?", 0, ["Poros","Matahari","Bulan","Bintang"], "EASY"),
    mc("Bumi berevolusi ? hari", 1, ["360","365","366","370"], "EASY"),
    mc("Pasang surut karena ?", 1, ["Matahari","Bulan","Angin","Gempa"], "EASY"),
    mc("Tanah subur banyak ?", 0, ["Humus","Pasir","Liat","Batu"], "EASY"),
    mc("Erosi pengikisan ?", 0, ["Tanah","Batu","Air","Udara"], "EASY"),
    mc("Gunung meletus keluar ?", 0, ["Lava","Air","Es","Api"], "EASY"),
    mc("Gempa diukur ?", 2, ["Barometer","Termometer","Seismograf","Higrometer"], "EASY"),
    mc("Ozon lindungi dari ?", 0, ["UV","Cahaya","Angin","Hujan"], "EASY"),
    mc("Hujan asam akibat ?", 0, ["Polusi","Hujan","Angin","Panas"], "EASY"),
    mc("Pemanasan global karena ?", 0, ["Gas rumah kaca","Ozon","Hujan","Angin"], "EASY"),
  ]),
  M("IPA", "Teknologi", "EASY", [
    mc("Telepon ditemukan ?", 2, ["Edison","Watt","Bell","Einstein"], "EASY"),
    mc("Radio pakai ?", 2, ["Cahaya","Listrik","Gelombang","Suara"], "EASY"),
    mc("Panel surya ubah ?", 0, ["Cahaya ke listrik","Air ke listrik","Angin ke listrik","Panas"], "EASY"),
    mc("Kincir angin hasilkan ?", 0, ["Listrik","Air","Api","Angin"], "EASY"),
    mc("Mikroskop lihat ?", 0, ["Sel","Bintang","Jauh","Peta"], "EASY"),
    mc("Teleskop lihat ?", 1, ["Sel","Bintang","Mikroba","Atom"], "EASY"),
    mc("Termometer ukur ?", 2, ["Lembab","Tekanan","Suhu","Hujan"], "EASY"),
    mc("Barometer ukur ?", 1, ["Suhu","Tekanan udara","Lembab","Angin"], "EASY"),
    mc("Komputer alat ?", 0, ["Elektronik","Mekanik","Manual","Tradisional"], "EASY"),
    mc("Teknologi tepat guna ?", 0, ["Kompor biogas","HP","TV","Komputer"], "EASY"),
  ]),
  M("BINDO", "Ide Pokok", "MEDIUM", [
    mc("Ide pokok disebut juga ?", 0, ["Gagasan utama","Kesimpulan","Judul","Topik"], "MEDIUM"),
    mc("Ide pokok bisa di ?", 3, ["Awal","Tengah","Akhir","Semua"], "MEDIUM"),
    mc("Kalimat penjelas fungsi ?", 0, ["Menjelaskan","Membuka","Menutup","Singkat"], "MEDIUM"),
    mc("Deduktif ide pokok di ?", 0, ["Awal","Akhir","Tengah","Menyebar"], "MEDIUM"),
    mc("Induktif ide pokok di ?", 1, ["Awal","Akhir","Tengah","Menyebar"], "MEDIUM"),
    mc("Topik bacaan dari ?", 0, ["Judul","Gambar","Penulis","Halaman"], "MEDIUM"),
    mc("Kesimpulan berisi ?", 0, ["Inti bacaan","Opini","Cerita","Latar"], "MEDIUM"),
    mc("Berita harus ?", 0, ["Faktual","Fiksi","Imajinatif","Bersambung"], "MEDIUM"),
    mc("5W+1H unsur ?", 0, ["Berita","Puisi","Dongeng","Pantun"], "MEDIUM"),
    mc("Apa,Siapa,Dimana,Kapan,Mengapa,Bagaimana = ?", 0, ["5W+1H","4W+2H","6W","5H"], "MEDIUM"),
  ]),
  M("BINDO", "Dongeng/Legenda", "EASY", [
    mc("Malin Kundang dari ?", 1, ["Jawa","Sumbar","Kaltim","Sulsel"], "EASY"),
    mc("Sangkuriang jadi ?", 1, ["Danau Toba","Tangkuban Perahu","Prambanan","Merapi"], "EASY"),
    mc("Roro Jonggrang dari ?", 0, ["Jateng","Jabar","Bali","Sumatra"], "EASY"),
    mc("Prambanan terkait ?", 0, ["Roro Jonggrang","Malin Kundang","Kancil","Bawang"], "EASY"),
    mc("Cerita rakyat termasuk ?", 0, ["Fiksi","Nonfiksi","Sejarah","Berita"], "EASY"),
    mc("Legenda Danau Toba dari ?", 0, ["Sumut","Jawa","Kalteng","Papua"], "EASY"),
    mc("Cerita rakyat disebar ?", 0, ["Lisan","Tertulis","Digital","Cetak"], "EASY"),
    mc("Bawang Merah Bawang Putih ?", 3, ["Fabel","Legenda","Mite","Dongeng"], "EASY"),
    mc("Nilai dalam cerita rakyat ?", 3, ["Sosial","Budaya","Moral","Semua"], "EASY"),
    mc("Keong Emas termasuk ?", 0, ["Dongeng","Legenda","Mite","Sage"], "EASY"),
  ]),
  M("BINDO", "Puisi", "MEDIUM", [
    mc("Puisi berirama dan ?", 0, ["Berima","Berjudul","Panjang","Bersambung"], "MEDIUM"),
    mc("Puisi baru tak terikat ?", 0, ["Jumlah baris","Makna","Pesan","Tema"], "MEDIUM"),
    mc("Personifikasi contoh ?", 0, ["Angin berbisik","Budi lari","Matahari terbit","Air mengalir"], "MEDIUM"),
    mc("Majas perbandingan kata ?", 0, ["Seperti","Dan","Atau","Namun"], "MEDIUM"),
    mc("Citraan penglihatan ?", 2, ["Sejuk","Harum","Terang","Manis"], "MEDIUM"),
    mc("Tema puisi bisa ?", 3, ["Alam","Sosial","Cinta","Semua"], "MEDIUM"),
    mc("Pantun bersajak ?", 0, ["a-b-a-b","a-a-a-a","a-b-b-a","a-a-b-b"], "MEDIUM"),
    mc("Syair bersajak ?", 1, ["a-b-a-b","a-a-a-a","a-b-b-a","a-a-b-b"], "MEDIUM"),
    mc("Diksi artinya ?", 0, ["Pilihan kata","Persamaan bunyi","Irama","Tema"], "MEDIUM"),
    mc("Rima artinya ?", 0, ["Persamaan bunyi","Pilihan kata","Irama","Tema"], "MEDIUM"),
  ]),
  M("BINDO", "Wawancara", "MEDIUM", [
    mc("Yang diwawancarai ?", 1, ["Pewawancara","Narasumber","Reporter","Jurnalis"], "MEDIUM"),
    mc("Pertanyaan disiapkan ?", 0, ["Sebelum","Sesudah","Saat","Tidak"], "MEDIUM"),
    mc("Tujuan wawancara ?", 0, ["Dapat info","Bercerita","Bertengkar","Bergosip"], "MEDIUM"),
    mc("Sikap pewawancara ?", 0, ["Sopan","Kasar","Marah","Cepat"], "MEDIUM"),
    mc("Hasil wawancara jadi ?", 0, ["Laporan","Puisi","Pantun","Cerita"], "MEDIUM"),
    mc("Pewawancara bertanya ?", 0, ["Narasumber","Teman","Sendiri","Guru"], "MEDIUM"),
    mc("Bahasa wawancara ?", 0, ["Santun","Kasar","Baku","Daerah"], "MEDIUM"),
    mc("Wawancara bisa via ?", 3, ["Langsung","Telepon","Online","Semua"], "MEDIUM"),
    mc("Pertanyaan terbuka = ?", 0, ["Jawaban panjang","Ya/tidak","Angka","Satu kata"], "MEDIUM"),
    mc("Pertanyaan tertutup = ?", 1, ["Panjang","Ya/tidak","Cerita","Penjelasan"], "MEDIUM"),
  ]),
  M("BINDO", "Kalimat Efektif", "HARD", [
    mc("Kalimat efektif harus ?", 1, ["Panjang","Jelas","Banyak kata","Bertele-tele"], "HARD"),
    mc("Tidak efektif contoh ?", 3, ["Adik belajar","Ibu masak","Ayah baca","Agar supaya"], "HARD"),
    mc("Kehematan artinya ?", 0, ["Hemat kata","Hemat biaya","Hemat waktu","Hemat tenaga"], "HARD"),
    mc("SPOK contoh ?", 0, ["Budi membaca buku di kamar","Budi baca","Budi","Buku"], "HARD"),
    mc("Di yang benar ?", 2, ["Dirumah","di rumah","Di rumah","diRumah"], "HARD"),
    mc("Kalimat ambigu ?", 3, ["Ibu masak","Ayah baca","Adik mandi","Ibu masak enak"], "HARD"),
    mc("Kesejajaran artinya ?", 0, ["Bentuk sama","Arti sama","Panjang sama","Warna sama"], "HARD"),
    mc("Ayah pergi ke kantor. Kantor = ?", 3, ["S","P","O","K"], "HARD"),
    mc("Penghubung intrakalimat ?", 3, ["Dan","Karena","Tetapi","Semua"], "HARD"),
    mc("Kalimat perintah diakhiri ?", 2, ["Titik","Tanya","Seru","Koma"], "HARD"),
  ]),
  M("IPS", "Peta dan Atlas", "EASY", [
    mc("Peta gambaran bidang ?", 1, ["Lengkung","Datar","Miring","Vertikal"], "EASY"),
    mc("Penunjuk arah peta ?", 2, ["Legenda","Skala","Orientasi","Garis tepi"], "EASY"),
    mc("Warna hijau peta ?", 1, ["Laut","Dataran rendah","Pegunungan","Gurun"], "EASY"),
    mc("Legenda berisi ?", 0, ["Keterangan simbol","Judul","Arah","Skala"], "EASY"),
    mc("Atlas kumpulan ?", 1, ["Gambar","Peta","Foto","Tabel"], "EASY"),
    mc("Globe model ?", 1, ["Datar","Bumi","Segitiga","Persegi"], "EASY"),
    mc("Garis lintang horizontal ?", 0, ["Utara-selatan","Timur-barat","Diagonal","Vertikal"], "EASY"),
    mc("Garis bujur vertikal ?", 1, ["Utara-selatan","Timur-barat","Diagonal","Horizontal"], "EASY"),
    mc("Simbol sungai ?", 1, ["Lurus","Berkelok","Titik","Kotak"], "EASY"),
    mc("Warna biru artinya ?", 1, ["Daratan","Perairan","Pegunungan","Kota"], "EASY"),
  ]),
  M("IPS", "Kenampakan Alam", "EASY", [
    mc("Gunung tertinggi di Jawa ?", 1, ["Merbabu","Semeru","Merapi","Sumbing"], "EASY"),
    mc("Sungai terpanjang Jawa ?", 1, ["Ciliwung","Bengawan Solo","Brantas","Serayu"], "EASY"),
    mc("Pulau terbesar ?", 0, ["Kalimantan","Jawa","Sumatra","Papua"], "EASY"),
    mc("Danau terbesar ?", 0, ["Toba","Singkarak","Maninjau","Bratan"], "EASY"),
    mc("Selat Jawa-Sumatra ?", 1, ["Malaka","Sunda","Karimata","Lombok"], "EASY"),
    mc("Laut terluas Indonesia ?", 2, ["Jawa","Flores","Banda","Natuna"], "EASY"),
    mc("Selat Malaka antara ?", 0, ["RI-Malaysia","RI-Australia","RI-Filipina","RI-PNG"], "EASY"),
    mc("Samudra di selatan RI ?", 0, ["Hindia","Pasifik","Atlantik","Arktik"], "EASY"),
    mc("Gunung Merapi di ?", 1, ["Jabar","Jateng-DIY","Jatim","Bali"], "EASY"),
    mc("Sungai Musi di ?", 1, ["Jawa","Sumsel","Kalteng","Sulsel"], "EASY"),
  ]),
  M("IPS", "Keragaman Budaya", "EASY", [
    mc("Rumah Joglo dari ?", 0, ["Jateng","Sumut","Papua","Sulsel"], "EASY"),
    mc("Tari Kecak dari ?", 1, ["Jawa","Bali","Sunda","Sumatra"], "EASY"),
    mc("Angklung dari ?", 0, ["Jabar","Jatim","Bali","Sumut"], "EASY"),
    mc("Candi Borobudur di ?", 2, ["Jakarta","Yogya","Magelang","Solo"], "EASY"),
    mc("Rendang dari ?", 1, ["Jawa","Sumbar","Sulsel","Kaltim"], "EASY"),
    mc("Batik dari ?", 0, ["Jawa","Bali","Sumatra","Kalimantan"], "EASY"),
    mc("Wayang dari ?", 0, ["Jawa","Bali","Sunda","Madura"], "EASY"),
    mc("Gamelan alat musik ?", 0, ["Tradisional","Modern","Elektrik","Dawai"], "EASY"),
    mc("Tari Samber dari ?", 2, ["Jawa","Bali","Papua","Sunda"], "EASY"),
    mc("Ngaben tradisi ?", 1, ["Jawa","Bali","Sumut","Kaltim"], "EASY"),
  ]),
  M("IPS", "Sejarah", "MEDIUM", [
    mc("Proklamasi 17/8/1945 ?", 0, ["Kemerdekaan","Hari pahlawan","Kebangkitan","Sumpah"], "MEDIUM"),
    mc("Teks proklamasi diketik ?", 2, ["Soekarno","Hatta","Sayuti Melik","Subarjo"], "MEDIUM"),
    mc("Penjahit bendera ?", 0, ["Fatmawati","Kartini","Cut Nyak","RA Kartini"], "MEDIUM"),
    mc("Lagu Indonesia Raya ciptaan ?", 0, ["WR Supratman","Sudirman","Hatta","Soekarno"], "MEDIUM"),
    mc("Bendera merah putih dikibarkan ?", 0, ["17/8/1945","18/8/1945","1/6/1945","28/10/1928"], "MEDIUM"),
    mc("Sumpah Pemuda 28/10/1928 ?", 0, ["Satu nusa bangsa bahasa","Kemerdekaan","Kebangkitan","Proklamasi"], "MEDIUM"),
    mc("Pahlawan Diponegoro dari ?", 0, ["Jawa","Sumatra","Kalimantan","Sulawesi"], "MEDIUM"),
    mc("Pahlawan Pattimura dari ?", 2, ["Jawa","Sumatra","Maluku","Papua"], "MEDIUM"),
    mc("Hari Kebangkitan Nasional ?", 0, ["20 Mei","17 Agustus","1 Juni","28 Oktober"], "MEDIUM"),
    mc("Hari Pancasila ?", 2, ["20 Mei","17 Agustus","1 Juni","28 Oktober"], "MEDIUM"),
  ]),
  M("IPS", "Kegiatan Ekonomi", "MEDIUM", [
    mc("Produksi artinya ?", 0, ["Menghasilkan","Menyalurkan","Menggunakan","Membeli"], "MEDIUM"),
    mc("Distribusi artinya ?", 0, ["Menyalurkan","Menghasilkan","Menggunakan","Membeli"], "MEDIUM"),
    mc("Konsumsi artinya ?", 0, ["Menggunakan","Menghasilkan","Menyalurkan","Menjual"], "MEDIUM"),
    mc("Pasar tempat ?", 0, ["Jual-beli","Belajar","Bekerja","Berobat"], "MEDIUM"),
    mc("Koperasi asas ?", 1, ["Modal","Kekeluargaan","Untung","Pasar"], "MEDIUM"),
    mc("BUMN contoh ?", 0, ["Pertamina","Indomaret","Alfamart","Gojek"], "MEDIUM"),
    mc("Pajak untuk ?", 0, ["Pembangunan","Pribadi","Sekolah","Keluarga"], "MEDIUM"),
    mc("Permintaan jumlah ?", 0, ["Dibeli","Dijual","Ditukar","Dipinjam"], "MEDIUM"),
    mc("Penawaran jumlah ?", 0, ["Dijual","Dibeli","Ditukar","Dipinjam"], "MEDIUM"),
    mc("Koperasi simpan pinjam ?", 0, ["Simpan+pinjam","Jual","Produksi","Konsumsi"], "MEDIUM"),
  ]),
  M("PPKN", "Pancasila", "EASY", [
    mc("Dasar negara Indonesia ?", 0, ["Pancasila","UUD","Proklamasi","Bhineka"], "EASY"),
    mc("Sila 1 Pancasila ?", 1, ["Kemanusiaan","Ketuhanan YME","Persatuan","Keadilan"], "EASY"),
    mc("Lambang sila 2 ?", 1, ["Bintang","Rantai","Pohon beringin","Padi kapas"], "EASY"),
    mc("Pohon beringin sila ?", 2, ["1","2","3","4"], "EASY"),
    mc("Kepala banteng sila ?", 3, ["1","2","3","4"], "EASY"),
    mc("Padi kapas sila ?", 3, ["2","3","4","5"], "EASY"),
    mc("Jumlah sila ?", 1, ["4","5","6","7"], "EASY"),
    mc("Pancasila artinya ?", 0, ["Lima dasar","Lima aturan","Lima tujuan","Lima cara"], "EASY"),
    mc("Pembukaan UUD alinea ke-4 berisi ?", 0, ["Pancasila","Proklamasi","Cita-cita","Tujuan"], "EASY"),
    mc("Pancasila disahkan tgl ?", 2, ["1 Juni","17 Agt","18 Agt","29 Apr"], "EASY"),
  ]),
  M("PPKN", "Hak dan Kewajiban", "MEDIUM", [
    mc("Hak anak ?", 1, ["Hukuman","Pendidikan","Pekerjaan","Kekuasaan"], "MEDIUM"),
    mc("Kewajiban siswa ?", 1, ["Bermain","Belajar","Tidur","Liburan"], "MEDIUM"),
    mc("Hak di rumah ?", 3, ["Kasih sayang","Bermain","Makan","Semua"], "MEDIUM"),
    mc("Kewajiban di rumah ?", 0, ["Bantu ortu","Bermain","Makan","Tidur"], "MEDIUM"),
    mc("Hak warga pasal ?", 1, ["27","28","29","30"], "MEDIUM"),
    mc("Pendidikan gratis pasal ?", 1, ["29","31","33","34"], "MEDIUM"),
    mc("Contoh hak sekolah ?", 0, ["Dapat ilmu","Bayar","Jaga bersih","Patuhi"], "MEDIUM"),
    mc("Kewajiban sekolah ?", 1, ["Terima uang","Belajar","Bermain","Istirahat"], "MEDIUM"),
    mc("HAM singkatan ?", 1, ["Hak Ahli","Hak Asasi Manusia","Hak Akhir","Hak Alam"], "MEDIUM"),
    mc("Pembatasan HAM pasal ?", 0, ["28J","27","29","30"], "MEDIUM"),
  ]),
  M("PPKN", "Musyawarah", "EASY", [
    mc("Musyawarah ambil keputusan ?", 1, ["Sendiri","Bersama","Paksa","Tertutup"], "EASY"),
    mc("Hasil mufakat ?", 0, ["Dilaksanakan","Ditolak","Diabaikan","Dirubah"], "EASY"),
    mc("Musyawarah sila ke ?", 2, ["2","3","4","5"], "EASY"),
    mc("Dalam musyawarah harus ?", 1, ["Paksakan","Hargai pendapat","Diam","Marah"], "EASY"),
    mc("Keputusan bersama = ?", 0, ["Mufakat","Paksaan","Perintah","Usul"], "EASY"),
    mc("Voting jika ?", 1, ["Mufakat","Tidak mufakat","Awal","Aman"], "EASY"),
    mc("Peserta berhak ?", 0, ["Pendapat","Marah","Pulang","Diam"], "EASY"),
    mc("Gotong royong nilai ?", 1, ["Individual","Kebersamaan","Egois","Kompetisi"], "EASY"),
    mc("Pemilihan ketua kelas ?", 0, ["Musyawarah","Perang","Tunjuk","Acak"], "EASY"),
    mc("Ketua tugas ?", 0, ["Memimpin","Bicara","Diam","Menulis"], "EASY"),
  ]),
  M("PPKN", "Bhinneka", "EASY", [
    mc("Bhineka artinya ?", 0, ["Berbeda satu","Satu semua","Teguh","Indah"], "EASY"),
    mc("Semboyan di ?", 1, ["Bendera","Lambang negara","UUD","Pancasila"], "EASY"),
    mc("Sikap pada keberagaman ?", 0, ["Toleransi","Diskriminasi","Etnosentrisme","Primordial"], "EASY"),
    mc("Agama diakui ?", 2, ["4","5","6","7"], "EASY"),
    mc("Suku Indonesia ?", 1, ["100","1.300","500","50"], "EASY"),
    mc("Faktor keberagaman ?", 3, ["Letak strategis","Geografis","Sejarah","Semua"], "EASY"),
    mc("Contoh toleransi ?", 0, ["Hormati tradisi","Rendahkan","Anggap terbaik","Tolak"], "EASY"),
    mc("Bhineka merajut ?", 1, ["Perbedaan","Persatuan","Persaingan","Pertikaian"], "EASY"),
    mc("Garuda Pancasila ?", 0, ["Lambang negara","Bendera","Lagu","Pahlawan"], "EASY"),
    mc("Keberagaman adalah ?", 0, ["Anugerah","Kutukan","Bencana","Masalah"], "EASY"),
  ]),
  M("PPKN", "Pemerintahan", "MEDIUM", [
    mc("Kepala negara RI ?", 1, ["PM","Presiden","Raja","Gubernur"], "MEDIUM"),
    mc("Bentuk negara ?", 1, ["Federal","Kesatuan","Serikat","Konfederasi"], "MEDIUM"),
    mc("Kepala desa disebut ?", 0, ["Kades","Camat","Bupati","Gubernur"], "MEDIUM"),
    mc("Kepala daerah provinsi ?", 3, ["Kades","Camat","Bupati","Gubernur"], "MEDIUM"),
    mc("DPR singkatan ?", 0, ["Dewan Perwakilan Rakyat","Dewan Pemerintah","Dana Pembangunan","Delegasi"], "MEDIUM"),
    mc("Masa jabatan presiden ?", 1, ["4","5","6","7"], "MEDIUM"),
    mc("Pemilu tiap ? tahun", 1, ["4","5","6","7"], "MEDIUM"),
    mc("Lembaga yudikatif ?", 2, ["DPR","Presiden","MA","BPK"], "MEDIUM"),
    mc("Lembaga legislatif ?", 0, ["DPR","Presiden","MA","BPK"], "MEDIUM"),
    mc("Lembaga eksekutif ?", 1, ["DPR","Presiden","MA","BPK"], "MEDIUM"),
  ]),
  M("BING", "Greetings", "EASY", [
    mc("Good morning = ?", 2, ["Selamat sore","Selamat malam","Selamat pagi","Selamat siang"], "EASY"),
    mc("Selamat siang = ?", 3, ["Good morn","Good eve","Good night","Good afternoon"], "EASY"),
    mc("How are you? I am ?", 0, ["Fine","Bad","Tall","Short"], "EASY"),
    mc("Goodbye = ?", 1, ["Halo","Selamat tinggal","Terima kasih","Maaf"], "EASY"),
    mc("Thank you = ?", 2, ["Halo","Maaf","Terima kasih","Selamat"], "EASY"),
    mc("What is your name? My name ?", 1, ["Am","Is","Are","Be"], "EASY"),
    mc("Nice to meet you = ?", 0, ["Senang bertemu","Apa kabar","Selamat pagi","Sampai jumpa"], "EASY"),
    mc("Good evening = ?", 3, ["Pagi","Siang","Sore","Malam"], "EASY"),
    mc("How do you do = ?", 0, ["How do you do","I am fine","Thank you","Goodbye"], "EASY"),
    mc("See you later = ?", 0, ["Sampai jumpa","Selamat pagi","Terima kasih","Maaf"], "EASY"),
  ]),
  M("BING", "Daily Activities", "EASY", [
    mc("I ... breakfast at 6", 1, ["Eat","Have","Take","Make"], "EASY"),
    mc("She ... to school", 1, ["Go","Goes","Going","Went"], "EASY"),
    mc("We ... homework", 1, ["Does","Do","Did","Done"], "EASY"),
    mc("He ... up at 5", 1, ["Wake","Wakes","Woke","Waking"], "EASY"),
    mc("They ... TV after dinner", 0, ["Watch","Watches","Watched","Watching"], "EASY"),
    mc("Mother ... lunch", 1, ["Cook","Cooks","Cooked","Cooking"], "EASY"),
    mc("I ... my teeth", 0, ["Brush","Brushes","Brushed","Brushing"], "EASY"),
    mc("Father ... to office", 1, ["Go","Goes","Going","Went"], "EASY"),
    mc("We ... dinner at 7", 1, ["Eat","Have","Take","Make"], "EASY"),
    mc("I ... to bed at 9", 0, ["Go","Goes","Going","Went"], "EASY"),
  ]),
  M("BING", "My School", "EASY", [
    mc("I study at SD ?", 0, ["Nusantara","Negeri","International","Nasional"], "EASY"),
    mc("My teacher ... me", 1, ["Teach","Teaches","Teaching","Taught"], "EASY"),
    mc("We ... in the classroom", 0, ["Learn","Learns","Learning","Learned"], "EASY"),
    mc("I ... Math on Monday", 0, ["Study","Studies","Studying","Studied"], "EASY"),
    mc("Students ... in the library", 0, ["Read","Reads","Reading","Readed"], "EASY"),
    mc("We ... in the yard", 0, ["Play","Plays","Playing","Played"], "EASY"),
    mc("The classroom ... clean", 1, ["Am","Is","Are","Be"], "EASY"),
    mc("I ... my teacher very much", 0, ["Like","Likes","Liking","Liked"], "EASY"),
    mc("The bell ... at 7 AM", 1, ["Ring","Rings","Ringing","Rang"], "EASY"),
    mc("We ... at 2 PM", 0, ["Go home","Goes home","Going","Went"], "EASY"),
  ]),
  M("BING", "My Family", "EASY", [
    mc("My mother is a ?", 3, ["Teacher","Doctor","Nurse","Housewife"], "EASY"),
    mc("My father is a ?", 3, ["Policeman","Driver","Doctor","Any job"], "EASY"),
    mc("I have one ?", 0, ["Brother","Father","Mother","Uncle"], "EASY"),
    mc("My grandparents are ?", 1, ["Young","Old","Small","Big"], "EASY"),
    mc("My uncle is my mother's ?", 0, ["Brother","Father","Son","Friend"], "EASY"),
    mc("My aunt is my mother's ?", 0, ["Sister","Mother","Daughter","Friend"], "EASY"),
    mc("My cousin is my uncle's ?", 0, ["Child","Father","Mother","Friend"], "EASY"),
    mc("My parents = my ?", 0, ["Father and mother","Sister brother","Uncle aunt","Friend"], "EASY"),
    mc("We are a happy ?", 0, ["Family","School","Class","Group"], "EASY"),
    mc("I ... my family", 0, ["Love","Loves","Loving","Loved"], "EASY"),
  ]),
  M("BING", "Weather and Seasons", "EASY", [
    mc("Today is ... (rain)", 1, ["Sunny","Rainy","Cloudy","Windy"], "EASY"),
    mc("The weather is ... (hot)", 2, ["Cold","Cool","Hot","Warm"], "EASY"),
    mc("It is ... in the sky at night", 2, ["Rain","Snow","Stars","Wind"], "EASY"),
    mc("The ... shines in the morning", 1, ["Moon","Sun","Star","Cloud"], "EASY"),
    mc("We use ... when it rains", 3, ["Hat","Gloves","Jacket","Umbrella"], "EASY"),
    mc("The sky is ... on a sunny day", 1, ["Grey","Blue","Black","Red"], "EASY"),
    mc("In Indonesia there are ... seasons", 0, ["Two","Three","Four","One"], "EASY"),
    mc("Dry season in Indonesian = ?", 1, ["Hujan","Kemarau","Semi","Gugur"], "EASY"),
    mc("Rainy season in Indonesian = ?", 0, ["Hujan","Kemarau","Semi","Gugur"], "EASY"),
    mc("The wind is ... today", 0, ["Strong","Weak","Fast","Slow"], "EASY"),
  ]),
];

async function main() {
  const classes = await prisma.class.findMany({ orderBy: { gradeLevel: "asc" } });
  const subjects = await prisma.subject.findMany();

  // Grades 3-5 all use G3 materials (adjusted per grade via existing structure)
  // We assign each grade the same topic structure
  for (const cls of classes) {
    if (cls.gradeLevel < 3 || cls.gradeLevel > 5) continue;
    for (let i = 0; i < G3.length; i++) {
      const def = G3[i];
      const subj = subjects.find(s => s.code === def.cs)!;
      if (!subj) continue;
      const cs = await prisma.classSubject.findFirst({ where: { classId: cls.id, subjectId: subj.id } });
      if (!cs) continue;
      // Check if already exists
      const existing = await prisma.material.findFirst({ where: { classSubjectId: cs.id, title: def.title } });
      if (existing) continue;
      const mat = await prisma.material.create({
        data: { title: def.title, classSubjectId: cs.id, difficulty: def.diff, isPublished: true, orderIndex: i + 1 },
      });
      for (const q of def.qs) {
        await prisma.question.create({
          data: { materialId: mat.id, questionText: q.q, options: q.o, correctAnswer: q.a, difficulty: q.d, orderIndex: def.qs.indexOf(q) + 1 },
        });
      }
      console.log(`  ${cls.name} ${def.cs} - ${def.title}: ${def.qs.length} soal`);
    }
  }
  console.log("\nGrades 3-5 seeded!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
