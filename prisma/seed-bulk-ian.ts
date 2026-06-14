import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  database: "rsi_ian",
  user: "postgres",
  password: "postgres",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
const LABELS = ["A", "B", "C", "D"];
type QDef = { q: string; o: string[]; a: string; d: string };

function genQuestions(maker: (i: number) => QDef, count = 10): QDef[] {
  return Array.from({ length: count }, (_, i) => maker(i + 1));
}

const subjectDefs: {
  name: string; code: string;
  materials: { title: string; difficulty: string; questions: QDef[] }[];
}[] = [
  {
    name: "Matematika", code: "MTK",
    materials: [
      {
        title: "Bilangan Bulat", difficulty: "EASY",
        questions: [
          { q: "5 + 3 = ?", o: ["5","8","10","15"], a: "8", d: "EASY" },
          { q: "12 - 7 = ?", o: ["4","5","6","7"], a: "5", d: "EASY" },
          { q: "-3 + 7 = ?", o: ["-10","-4","4","10"], a: "4", d: "EASY" },
          { q: "25 + (-10) = ?", o: ["-35","15","35","-15"], a: "15", d: "EASY" },
          { q: "8 x 6 = ?", o: ["42","48","54","56"], a: "48", d: "EASY" },
          { q: "72 : 9 = ?", o: ["6","7","8","9"], a: "8", d: "EASY" },
          { q: "-5 x (-4) = ?", o: ["-20","20","-9","9"], a: "20", d: "EASY" },
          { q: "100 - 37 = ?", o: ["63","67","73","77"], a: "63", d: "EASY" },
          { q: "15 + (-8) = ?", o: ["7","-7","23","-23"], a: "7", d: "EASY" },
          { q: "49 : (-7) = ?", o: ["-7","7","-6","6"], a: "-7", d: "EASY" },
        ],
      },
      {
        title: "Pecahan", difficulty: "MEDIUM",
        questions: [
          { q: "1/2 + 1/4 = ?", o: ["1/6","2/6","3/4","1/4"], a: "3/4", d: "MEDIUM" },
          { q: "2/3 dari 90 adalah ?", o: ["45","60","30","75"], a: "60", d: "MEDIUM" },
          { q: "3/5 + 1/5 = ?", o: ["2/5","4/5","3/10","5/3"], a: "4/5", d: "MEDIUM" },
          { q: "5/6 - 1/3 = ?", o: ["1/2","4/6","2/3","3/6"], a: "1/2", d: "MEDIUM" },
          { q: "2/4 disederhanakan menjadi ?", o: ["1/4","1/2","2/8","4/2"], a: "1/2", d: "MEDIUM" },
          { q: "3/8 + 1/4 = ?", o: ["4/12","5/8","3/12","7/8"], a: "5/8", d: "MEDIUM" },
          { q: "7/10 - 2/5 = ?", o: ["3/10","5/5","9/10","1/2"], a: "3/10", d: "MEDIUM" },
          { q: "Bentuk desimal dari 3/4 adalah ?", o: ["0,25","0,5","0,75","1,25"], a: "0,75", d: "MEDIUM" },
          { q: "1/3 + 1/6 = ?", o: ["2/9","1/2","2/6","3/6"], a: "1/2", d: "MEDIUM" },
          { q: "4/5 - 1/10 = ?", o: ["3/5","7/10","3/10","8/10"], a: "7/10", d: "MEDIUM" },
        ],
      },
      {
        title: "Bangun Datar", difficulty: "HARD",
        questions: [
          { q: "Luas persegi s=5 cm ?", o: ["10 cm²","15 cm²","20 cm²","25 cm²"], a: "25 cm²", d: "HARD" },
          { q: "Keliling persegi panjang 6x4 cm ?", o: ["10 cm","20 cm","24 cm","30 cm"], a: "20 cm", d: "HARD" },
          { q: "Luas segitiga alas 8 cm, tinggi 6 cm ?", o: ["14 cm²","24 cm²","48 cm²","28 cm²"], a: "24 cm²", d: "HARD" },
          { q: "Luas lingkaran r=7 cm, π=22/7 ?", o: ["154 cm²","44 cm²","77 cm²","308 cm²"], a: "154 cm²", d: "HARD" },
          { q: "Keliling lingkaran d=14 cm ?", o: ["44 cm","22 cm","88 cm","66 cm"], a: "44 cm", d: "HARD" },
          { q: "Luas trapesium (8+12), t=5 ?", o: ["50 cm²","100 cm²","40 cm²","60 cm²"], a: "50 cm²", d: "HARD" },
          { q: "Keliling segitiga sama sisi s=9 cm ?", o: ["18 cm","27 cm","36 cm","81 cm"], a: "27 cm", d: "HARD" },
          { q: "Luas jajar genjang a=10 cm, t=7 cm ?", o: ["34 cm²","70 cm²","140 cm²","17 cm²"], a: "70 cm²", d: "HARD" },
          { q: "Volume kubus s=4 cm ?", o: ["16 cm³","64 cm³","32 cm³","48 cm³"], a: "64 cm³", d: "HARD" },
          { q: "Volume balok 5x3x2 cm ?", o: ["10 cm³","15 cm³","30 cm³","25 cm³"], a: "30 cm³", d: "HARD" },
        ],
      },
      {
        title: "Aljabar Dasar", difficulty: "MEDIUM",
        questions: [
          { q: "x + 5 = 12, x = ?", o: ["5","6","7","17"], a: "7", d: "MEDIUM" },
          { q: "2x + 3 = 11, x = ?", o: ["2","4","5","8"], a: "4", d: "MEDIUM" },
          { q: "3x - 7 = 8, x = ?", o: ["3","5","7","15"], a: "5", d: "MEDIUM" },
          { q: "x/4 = 3, x = ?", o: ["7","8","12","1"], a: "12", d: "MEDIUM" },
          { q: "2(x + 3) = 14, x = ?", o: ["4","7","11","5"], a: "4", d: "MEDIUM" },
          { q: "x² = 49, x positif = ?", o: ["6","7","8","9"], a: "7", d: "MEDIUM" },
          { q: "5x + 2 = 3x + 10, x = ?", o: ["2","4","6","8"], a: "4", d: "MEDIUM" },
          { q: "3x + 2x = ?", o: ["5x","6x","5x²","x"], a: "5x", d: "MEDIUM" },
          { q: "a = 3, 2a + 5 = ?", o: ["8","10","11","6"], a: "11", d: "MEDIUM" },
          { q: "4(2x-1) = 28, x = ?", o: ["4","6","8","7"], a: "4", d: "MEDIUM" },
        ],
      },
      {
        title: "Perbandingan", difficulty: "MEDIUM",
        questions: [
          { q: "3 : 5 sama dengan ?", o: ["6:8","6:10","9:10","12:15"], a: "6:10", d: "MEDIUM" },
          { q: "A:B = 2:3, B=15, A = ?", o: ["5","10","12","8"], a: "10", d: "MEDIUM" },
          { q: "Skala 1:100.000, peta 4 cm, jarak ?", o: ["4 km","40 km","400 km","0,4 km"], a: "4 km", d: "MEDIUM" },
          { q: "Ali : Budi = 3:4, total Rp70.000, Budi ?", o: ["Rp30.000","Rp40.000","Rp35.000","Rp45.000"], a: "Rp40.000", d: "MEDIUM" },
          { q: "6 orang selesai 12 hari, 4 orang ?", o: ["8 hari","18 hari","16 hari","14 hari"], a: "18 hari", d: "MEDIUM" },
          { q: "15 : 20 sederhanakan ?", o: ["3:5","3:4","5:4","2:3"], a: "3:4", d: "MEDIUM" },
          { q: "5 kg Rp60.000, 8 kg ?", o: ["Rp96.000","Rp90.000","Rp100.000","Rp80.000"], a: "Rp96.000", d: "MEDIUM" },
          { q: "60 km/jam, jarak 180 km, waktu ?", o: ["2 jam","3 jam","4 jam","5 jam"], a: "3 jam", d: "MEDIUM" },
          { q: "Peta 1:250.000, 2 cm = ?", o: ["2,5 km","5 km","25 km","50 km"], a: "5 km", d: "MEDIUM" },
          { q: "3 : 5 = 15 : x, x = ?", o: ["20","25","30","35"], a: "25", d: "MEDIUM" },
        ],
      },
      {
        title: "Statistika Dasar", difficulty: "MEDIUM",
        questions: [
          { q: "Nilai 7,8,6,9,7, rata-rata = ?", o: ["7","7,4","7,6","8"], a: "7,4", d: "MEDIUM" },
          { q: "Modus 3,4,4,5,6,4,7 = ?", o: ["3","4","5","6"], a: "4", d: "MEDIUM" },
          { q: "Median 5,7,8,6,9 = ?", o: ["6","7","8","5"], a: "7", d: "MEDIUM" },
          { q: "Jangkauan 12,15,18,20,25 = ?", o: ["10","13","15","20"], a: "13", d: "MEDIUM" },
          { q: "Rata-rata 8,9,7,10,6 = ?", o: ["7","8","8,5","9"], a: "8", d: "MEDIUM" },
          { q: "Modus 2,2,3,4,5,5,5,6 = ?", o: ["2","3","5","6"], a: "5", d: "MEDIUM" },
          { q: "Median 3,6,8,10,12,15 = ?", o: ["7","8","9","10"], a: "9", d: "MEDIUM" },
          { q: "Jangkauan interkuartil 4,6,8,10,12 = ?", o: ["4","6","8","10"], a: "6", d: "MEDIUM" },
          { q: "Rata-rata 3 angka = 15, jumlah = ?", o: ["30","45","50","60"], a: "45", d: "MEDIUM" },
          { q: "Nilai 85,90,78, rata-rata = ?", o: ["84","84,3","85","85,3"], a: "84,3", d: "MEDIUM" },
        ],
      },
      {
        title: "Geometri Ruang", difficulty: "HARD",
        questions: [
          { q: "Volume tabung r=7, t=10 (π=22/7) ?", o: ["1.540 cm³","3.080 cm³","770 cm³","2.310 cm³"], a: "1.540 cm³", d: "HARD" },
          { q: "Volume kerucut r=7, t=12 (π=22/7) ?", o: ["616 cm³","1.848 cm³","308 cm³","924 cm³"], a: "616 cm³", d: "HARD" },
          { q: "Volume bola r=7 (π=22/7) ?", o: ["1.437,3 cm³","2.156 cm³","718,7 cm³","4.312 cm³"], a: "1.437,3 cm³", d: "HARD" },
          { q: "LP kubus s=6 cm ?", o: ["36 cm²","216 cm²","72 cm²","108 cm²"], a: "216 cm²", d: "HARD" },
          { q: "Volume prisma L=20 cm², t=15 cm ?", o: ["100 cm³","200 cm³","300 cm³","400 cm³"], a: "300 cm³", d: "HARD" },
          { q: "LP balok 5x4x3 cm ?", o: ["94 cm²","60 cm²","120 cm²","80 cm²"], a: "94 cm²", d: "HARD" },
          { q: "Volume limas L=36 cm², t=10 cm ?", o: ["120 cm³","360 cm³","180 cm³","240 cm³"], a: "120 cm³", d: "HARD" },
          { q: "LS tabung r=5, t=8 (π=3,14) ?", o: ["125,6 cm²","251,2 cm²","200 cm²","150 cm²"], a: "251,2 cm²", d: "HARD" },
          { q: "Volume tabung d=14, t=20 (π=22/7) ?", o: ["3.080 cm³","6.160 cm³","1.540 cm³","4.400 cm³"], a: "3.080 cm³", d: "HARD" },
          { q: "LP bola r=10 (π=3,14) ?", o: ["1.256 cm²","628 cm²","2.512 cm²","3.140 cm²"], a: "1.256 cm²", d: "HARD" },
        ],
      },
      {
        title: "Aritmatika Sosial", difficulty: "MEDIUM",
        questions: [
          { q: "Rp50.000 diskon 20%, bayar ?", o: ["Rp30.000","Rp35.000","Rp40.000","Rp45.000"], a: "Rp40.000", d: "MEDIUM" },
          { q: "Bruto 50 kg, tara 2%, netto = ?", o: ["48 kg","49 kg","47 kg","45 kg"], a: "49 kg", d: "MEDIUM" },
          { q: "Bunga 12%/th, Rp1.000.000, 6 bln, bunga ?", o: ["Rp50.000","Rp60.000","Rp70.000","Rp80.000"], a: "Rp60.000", d: "MEDIUM" },
          { q: "Beli Rp80.000, untung 15%, jual ?", o: ["Rp88.000","Rp90.000","Rp92.000","Rp95.000"], a: "Rp92.000", d: "MEDIUM" },
          { q: "Rugi 10%, jual Rp45.000, beli ?", o: ["Rp48.000","Rp49.500","Rp50.000","Rp55.000"], a: "Rp50.000", d: "MEDIUM" },
          { q: "Tabungan Rp2.400.000, bunga 10%/th, 8 bln ?", o: ["Rp2.560.000","Rp2.600.000","Rp2.640.000","Rp2.680.000"], a: "Rp2.560.000", d: "MEDIUM" },
          { q: "Diskon 15% Rp120.000, bayar ?", o: ["Rp98.000","Rp100.000","Rp102.000","Rp105.000"], a: "Rp102.000", d: "MEDIUM" },
          { q: "Untung 20%, jual Rp180.000, beli ?", o: ["Rp140.000","Rp144.000","Rp150.000","Rp160.000"], a: "Rp150.000", d: "MEDIUM" },
          { q: "Bruto 100 kg, netto 97 kg, %tara ?", o: ["1%","2%","3%","4%"], a: "3%", d: "MEDIUM" },
          { q: "Pajak 10%, gaji bersih Rp3.600.000, kotor ?", o: ["Rp3.800.000","Rp3.960.000","Rp4.000.000","Rp4.200.000"], a: "Rp4.000.000", d: "MEDIUM" },
        ],
      },
      {
        title: "Persamaan Garis", difficulty: "HARD",
        questions: [
          { q: "Gradien y = 3x + 5 ?", o: ["3","5","-3","-5"], a: "3", d: "HARD" },
          { q: "Gradien melalui (2,3) dan (4,7) ?", o: ["1","2","3","4"], a: "2", d: "HARD" },
          { q: "Persamaan gradien 2 melalui (0,1) ?", o: ["y=x+1","y=2x+1","y=2x-1","y=x+2"], a: "y=2x+1", d: "HARD" },
          { q: "Potong sumbu y dari y = 2x - 4 ?", o: ["(0,2)","(0,-4)","(2,0)","(-4,0)"], a: "(0,-4)", d: "HARD" },
          { q: "Gradien 2x + 3y = 6 ?", o: ["2/3","-2/3","3/2","-3/2"], a: "-2/3", d: "HARD" },
          { q: "Sejajar y=3x+1 lewat (1,2) ?", o: ["y=3x-1","y=3x+2","y=3x-2","y=3x+1"], a: "y=3x-1", d: "HARD" },
          { q: "Tegak lurus y = -1/2x + 3, gradien ?", o: ["-2","2","-1/2","1/2"], a: "2", d: "HARD" },
          { q: "Melalui (0,0) dan (3,6) ?", o: ["y=2x","y=3x","y=6x","y=x"], a: "y=2x", d: "HARD" },
          { q: "Potong sumbu x dari y = 3x - 9 ?", o: ["(0,3)","(3,0)","(-9,0)","(0,-9)"], a: "(3,0)", d: "HARD" },
          { q: "Gradien garis horizontal ?", o: ["0","1","tak hingga","-1"], a: "0", d: "HARD" },
        ],
      },
      {
        title: "Himpunan", difficulty: "MEDIUM",
        questions: [
          { q: "Bilangan prima < 10 ?", o: ["{1,2,3,5,7}","{2,3,5,7}","{2,3,5,7,9}","{1,3,5,7}"], a: "{2,3,5,7}", d: "MEDIUM" },
          { q: "n(A)=8, n(B)=5, n(A∩B)=3, n(A∪B)= ?", o: ["8","10","13","16"], a: "10", d: "MEDIUM" },
          { q: "Himpunan kosong lambang ?", o: ["{ }","{0}","Ø","{Ø}"], a: "Ø", d: "MEDIUM" },
          { q: "Banyak himpunan bagian {a,b,c} ?", o: ["3","6","8","9"], a: "8", d: "MEDIUM" },
          { q: "A={1,2,3}, B={3,4,5}, A∩B = ?", o: ["{1,2}","{3}","{4,5}","{1,2,3,4,5}"], a: "{3}", d: "MEDIUM" },
          { q: "S={1,2,3,4,5}, A={2,4}, A' = ?", o: ["{1,3,5}","{1,2,3}","{3,5}","{1,2,3,4,5}"], a: "{1,3,5}", d: "MEDIUM" },
          { q: "n(S)=30, n(A)=12, n(B)=15, n(A∩B)=5, n(A∪B)'= ?", o: ["5","8","10","12"], a: "8", d: "MEDIUM" },
          { q: "A={x|1<x≤4, bil. bulat} = ?", o: ["{1,2,3}","{2,3,4}","{2,3}","{1,2,3,4}"], a: "{2,3,4}", d: "MEDIUM" },
          { q: "n({x|x<5, x asli}) = ?", o: ["3","4","5","6"], a: "4", d: "MEDIUM" },
          { q: "Diagram Venn untuk ?", o: ["Himpunan","Fungsi","Garis","Matriks"], a: "Himpunan", d: "MEDIUM" },
        ],
      },
    ],
  },
  {
    name: "Ilmu Pengetahuan Alam", code: "IPA",
    materials: [
      {
        title: "Tata Surya", difficulty: "EASY",
        questions: [
          { q: "Planet terdekat Matahari ?", o: ["Venus","Merkurius","Bumi","Mars"], a: "Merkurius", d: "EASY" },
          { q: "Bumi mengelilingi Matahari disebut ?", o: ["Rotasi","Revolusi","Presesi","Nutasi"], a: "Revolusi", d: "EASY" },
          { q: "Planet terbesar ?", o: ["Saturnus","Jupiter","Neptunus","Uranus"], a: "Jupiter", d: "EASY" },
          { q: "Satelit alami Bumi ?", o: ["Matahari","Bulan","Bintang","Asteroid"], a: "Bulan", d: "EASY" },
          { q: "Planet bercincin jelas ?", o: ["Jupiter","Uranus","Neptunus","Saturnus"], a: "Saturnus", d: "EASY" },
          { q: "Penyebab siang-malam ?", o: ["Revolusi Bumi","Rotasi Bumi","Gerhana","Gravitasi"], a: "Rotasi Bumi", d: "EASY" },
          { q: "Bintang Kejora ?", o: ["Mars","Venus","Merkurius","Jupiter"], a: "Venus", d: "EASY" },
          { q: "Komet 76 tahun ?", o: ["Halley","Hale-Bopp","Hyakutake","Encke"], a: "Halley", d: "EASY" },
          { q: "Lapisan ozon di ?", o: ["Troposfer","Stratosfer","Mesosfer","Termosfer"], a: "Stratosfer", d: "EASY" },
          { q: "Gerhana matahari terjadi saat ?", o: ["Bumi di antara M dan B","Bulan di antara M dan B","M di antara B dan B","Semua benar"], a: "Bulan di antara M dan B", d: "EASY" },
        ],
      },
      {
        title: "Sistem Pencernaan", difficulty: "MEDIUM",
        questions: [
          { q: "Enzim amilase dihasilkan ?", o: ["Lambung","Pankreas","Usus","Hati"], a: "Pankreas", d: "MEDIUM" },
          { q: "Penyerapan sari makanan di ?", o: ["Lambung","Usus Halus","Usus Besar","Mulut"], a: "Usus Halus", d: "MEDIUM" },
          { q: "Fungsi hati ?", o: ["Menyerap air","Menghasilkan empedu","Mencerna protein","Menyerap vitamin"], a: "Menghasilkan empedu", d: "MEDIUM" },
          { q: "Penyebab mag ?", o: ["Infeksi bakteri","Asam lambung berlebih","Keracunan","Alergi"], a: "Asam lambung berlebih", d: "MEDIUM" },
          { q: "Enzim pepsin mencerna ?", o: ["Karbohidrat","Protein","Lemak","Vitamin"], a: "Protein", d: "MEDIUM" },
          { q: "Organ penghasil insulin ?", o: ["Hati","Lambung","Pankreas","Ginjal"], a: "Pankreas", d: "MEDIUM" },
          { q: "Usus buntu disebut ?", o: ["Kolon","Sekum","Rektum","Duodenum"], a: "Sekum", d: "MEDIUM" },
          { q: "Empedu mencerna ?", o: ["Karbohidrat","Protein","Lemak","Vitamin"], a: "Lemak", d: "MEDIUM" },
          { q: "Gigi pengunyah ?", o: ["Seri","Taring","Geraham","Susu"], a: "Geraham", d: "MEDIUM" },
          { q: "Amylase di mulut mengubah ?", o: ["Protein→asam amino","Lemak→asam lemak","Karbo→gula sederhana","Vitamin→mineral"], a: "Karbo→gula sederhana", d: "MEDIUM" },
        ],
      },
      {
        title: "Sistem Pernapasan", difficulty: "MEDIUM",
        questions: [
          { q: "Organ utama pernapasan ?", o: ["Hidung","Trakea","Paru-paru","Bronkus"], a: "Paru-paru", d: "MEDIUM" },
          { q: "Pertukaran O2-CO2 di ?", o: ["Bronkus","Trakea","Alveolus","Faring"], a: "Alveolus", d: "MEDIUM" },
          { q: "TBC disebabkan ?", o: ["Virus","Bakteri","Jamur","Parasit"], a: "Bakteri", d: "MEDIUM" },
          { q: "Diafragma membantu ?", o: ["Pencernaan","Pernapasan","Sirkulasi","Ekskresi"], a: "Pernapasan", d: "MEDIUM" },
          { q: "Fungsi rambut hidung ?", o: ["Menghangatkan","Menyaring","Melembabkan","Semua benar"], a: "Menyaring", d: "MEDIUM" },
          { q: "Asma adalah ?", o: ["Infeksi paru","Penyempitan saluran napas","Kanker paru","Radang tenggorokan"], a: "Penyempitan saluran napas", d: "MEDIUM" },
          { q: "Oksigen masuk darah melalui ?", o: ["Difusi","Osmosis","Transport aktif","Endositosis"], a: "Difusi", d: "MEDIUM" },
          { q: "Frekuensi napas normal dewasa ?", o: ["10-12/menit","16-20/menit","25-30/menit","30-40/menit"], a: "16-20/menit", d: "MEDIUM" },
          { q: "Udara sisa di paru disebut ?", o: ["Tidal","Residu","Komplementer","Vital"], a: "Residu", d: "MEDIUM" },
          { q: "Bronkitis peradangan pada ?", o: ["Alveolus","Bronkus","Trakea","Faring"], a: "Bronkus", d: "MEDIUM" },
        ],
      },
      {
        title: "Sistem Peredaran Darah", difficulty: "MEDIUM",
        questions: [
          { q: "Peredaran darah kecil: jantung → ?", o: ["Paru→jantung","Seluruh tubuh→jantung","Hati→jantung","Ginjal→jantung"], a: "Paru→jantung", d: "MEDIUM" },
          { q: "Pembuluh darah kaya O2 ?", o: ["Vena","Arteri","Kapiler","Limfa"], a: "Arteri", d: "MEDIUM" },
          { q: "Jumlah ruang jantung ?", o: ["2","3","4","5"], a: "4", d: "MEDIUM" },
          { q: "Darah merah karena ?", o: ["Oksigen","Hemoglobin","CO2","Nutrisi"], a: "Hemoglobin", d: "MEDIUM" },
          { q: "Tekanan darah normal ?", o: ["120/60","120/80","130/90","140/100"], a: "120/80", d: "MEDIUM" },
          { q: "Fungsi sel darah putih ?", o: ["Angkut O2","Melawan infeksi","Bekukan darah","Angkut nutrisi"], a: "Melawan infeksi", d: "MEDIUM" },
          { q: "Donor universal ?", o: ["A","B","AB","O"], a: "O", d: "MEDIUM" },
          { q: "Alat ukur tekanan darah ?", o: ["Stetoskop","Termometer","Tensimeter","EKG"], a: "Tensimeter", d: "MEDIUM" },
          { q: "Katup vena mencegah ?", o: ["Aliran cepat","Aliran balik","Penyaringan","Suhu"], a: "Aliran balik", d: "MEDIUM" },
          { q: "Anemia kekurangan ?", o: ["Sel darah putih","Sel darah merah","Trombosit","Plasma"], a: "Sel darah merah", d: "MEDIUM" },
        ],
      },
      {
        title: "Sistem Ekskresi", difficulty: "MEDIUM",
        questions: [
          { q: "Ginjal menghasilkan ?", o: ["Urine","Keringat","Empedu","Air mata"], a: "Urine", d: "MEDIUM" },
          { q: "Kulit keluarkan keringat via ?", o: ["Pori-pori","Folikel","Kelenjar minyak","Pembuluh darah"], a: "Pori-pori", d: "MEDIUM" },
          { q: "Zat sisa hati ?", o: ["Urea","CO2","Bilirubin","Asam urat"], a: "Bilirubin", d: "MEDIUM" },
          { q: "Nefron unit fungsional ?", o: ["Hati","Paru-paru","Ginjal","Kulit"], a: "Ginjal", d: "MEDIUM" },
          { q: "Batu ginjal disebabkan ?", o: ["Kristal mineral","Infeksi bakteri","Virus","Kurang vitamin"], a: "Kristal mineral", d: "MEDIUM" },
          { q: "Penyaring darah di ginjal ?", o: ["Medula","Korteks","Glomerulus","Pelvis"], a: "Glomerulus", d: "MEDIUM" },
          { q: "Fungsi utama kulit ?", o: ["Atur suhu","Lindungi tubuh","Keluarkan keringat","Semua benar"], a: "Semua benar", d: "MEDIUM" },
          { q: "Paru keluarkan zat sisa ?", o: ["Urine","Keringat","CO2+uap air","Empedu"], a: "CO2+uap air", d: "MEDIUM" },
          { q: "Dialisis untuk gagal ?", o: ["Hati","Ginjal","Jantung","Paru"], a: "Ginjal", d: "MEDIUM" },
          { q: "Bilirubin dari pemecahan ?", o: ["Protein","Lemak","Sel darah merah","Karbohidrat"], a: "Sel darah merah", d: "MEDIUM" },
        ],
      },
      {
        title: "Sistem Saraf dan Indra", difficulty: "HARD",
        questions: [
          { q: "Saraf pusat terdiri ?", o: ["Otak+sumsum tulang","Saraf tepi+otonom","Neuron sensorik+motorik","Semua benar"], a: "Otak+sumsum tulang", d: "HARD" },
          { q: "Pengatur jumlah cahaya di mata ?", o: ["Kornea","Retina","Iris","Lensa"], a: "Iris", d: "HARD" },
          { q: "Penangkap gelombang suara ?", o: ["Rumah siput","Gendang telinga","Daun telinga","Saluran telinga"], a: "Daun telinga", d: "HARD" },
          { q: "Reseptor pengecap di ?", o: ["Hidung","Lidah","Kulit","Telinga"], a: "Lidah", d: "HARD" },
          { q: "Miopi dibantu lensa ?", o: ["Cembung","Cekung","Silinder","Bifokal"], a: "Cekung", d: "HARD" },
          { q: "Hormon pertumbuhan ?", o: ["Insulin","Tiroksin","Somatotropin","Adrenalin"], a: "Somatotropin", d: "HARD" },
          { q: "Saraf dari indra ke otak ?", o: ["Motorik","Sensorik","Otonom","Simpatik"], a: "Sensorik", d: "HARD" },
          { q: "Otak atur keseimbangan ?", o: ["Otak besar","Otak kecil","Sumsum lanjutan","Hipotalamus"], a: "Otak kecil", d: "HARD" },
          { q: "Kelenjar hormon pertumbuhan ?", o: ["Tiroid","Hipofisis","Adrenal","Pankreas"], a: "Hipofisis", d: "HARD" },
          { q: "Gerakan refleks via ?", o: ["Otak","Sumsum tulang belakang","Saraf tepi","Hipotalamus"], a: "Sumsum tulang belakang", d: "HARD" },
        ],
      },
      {
        title: "Energi dan Daya", difficulty: "MEDIUM",
        questions: [
          { q: "Satuan energi SI ?", o: ["Newton","Joule","Watt","Ampere"], a: "Joule", d: "MEDIUM" },
          { q: "Energi kinetik tergantung ?", o: ["Massa+kecepatan","Massa+tinggi","Berat+waktu","Gaya+jarak"], a: "Massa+kecepatan", d: "MEDIUM" },
          { q: "Hk. kekekalan energi ?", o: ["Energi diciptakan","Energi tdk diciptakan","Energi berkurang","Energi bertambah"], a: "Energi tdk diciptakan", d: "MEDIUM" },
          { q: "Energi potensial gravitasi tergantung ?", o: ["Massa+kecepatan","Massa+tinggi","Berat+waktu","Gaya+jarak"], a: "Massa+tinggi", d: "MEDIUM" },
          { q: "Daya = ?", o: ["Usaha/waktu","Gaya/luas","Energi/massa","Usaha/jarak"], a: "Usaha/waktu", d: "MEDIUM" },
          { q: "1 kWh = ?", o: ["3,6×10³ J","3,6×10⁶ J","3,6×10⁹ J","3,6×10² J"], a: "3,6×10⁶ J", d: "MEDIUM" },
          { q: "Alat listrik→panas ?", o: ["Lampu","Kipas","Setrika","Radio"], a: "Setrika", d: "MEDIUM" },
          { q: "Energi di baterai ?", o: ["Kinetik","Potensial","Kimia","Nuklir"], a: "Kimia", d: "MEDIUM" },
          { q: "Efisiensi energi = ?", o: ["Input/output","Output/input","Total×100%","Hilang/total"], a: "Output/input", d: "MEDIUM" },
          { q: "Energi hanya dapat ?", o: ["Diciptakan","Berubah bentuk","Dihilangkan","Diabaikan"], a: "Berubah bentuk", d: "MEDIUM" },
        ],
      },
      {
        title: "Gaya dan Gerak", difficulty: "EASY",
        questions: [
          { q: "Hk Newton I: ?", o: ["F=ma","Aksi=reaksi","Kelembaman","Gravitasi"], a: "Kelembaman", d: "EASY" },
          { q: "Resultan gaya 0 menyebabkan ?", o: ["Diam","GLB","Diam/GLB","Gerak melingkar"], a: "Diam/GLB", d: "EASY" },
          { q: "Satuan gaya SI ?", o: ["Kg","Newton","Joule","Watt"], a: "Newton", d: "EASY" },
          { q: "Makin besar massa → ?", o: ["Kecepatan","Percepatan","Gaya gravitasi","Kelembaman"], a: "Kelembaman", d: "EASY" },
          { q: "Gaya gesek berlawanan ?", o: ["Arah gerak","Permukaan","Berat","Semua benar"], a: "Arah gerak", d: "EASY" },
          { q: "Hk Newton III: ?", o: ["F=ma","Aksi=reaksi","Kelembaman","Kekekalan energi"], a: "Aksi=reaksi", d: "EASY" },
          { q: "Gaya tarik ke pusat Bumi ?", o: ["Listrik","Magnet","Gravitasi","Gesek"], a: "Gravitasi", d: "EASY" },
          { q: "Percepatan gravitasi Bumi ?", o: ["9,8 m/s²","10 m/s²","9,8 km/s²","100 m/s²"], a: "9,8 m/s²", d: "EASY" },
          { q: "Saat rem sepeda terjadi ?", o: ["GLB","GLBB dipercepat","GLBB diperlambat","Melingkar"], a: "GLBB diperlambat", d: "EASY" },
          { q: "Mobil berbelok, gaya ?", o: ["Gravitasi","Gesek","Sentripetal","Pegas"], a: "Sentripetal", d: "EASY" },
        ],
      },
      {
        title: "Sumber Daya Alam", difficulty: "EASY",
        questions: [
          { q: "SDA terbarukan contoh ?", o: ["Minyak bumi","Batu bara","Air","Emas"], a: "Air", d: "EASY" },
          { q: "Energi utama Bumi ?", o: ["Bulan","Bintang","Matahari","Api"], a: "Matahari", d: "EASY" },
          { q: "Minyak bumi termasuk ?", o: ["Terbarukan","Tidak terbarukan","Hayati","Organik"], a: "Tidak terbarukan", d: "EASY" },
          { q: "Energi alternatif ramah ?", o: ["Batu bara","Solar","Tenaga surya","Bensin"], a: "Tenaga surya", d: "EASY" },
          { q: "Fungsi hutan ?", o: ["Paru-paru dunia","Sumber O2","Habitat","Semua benar"], a: "Semua benar", d: "EASY" },
          { q: "Dampak batu bara ?", o: ["Polusi udara","Pemanasan global","Hujan asam","Semua benar"], a: "Semua benar", d: "EASY" },
          { q: "Panas bumi berasal dari ?", o: ["Matahari","Inti Bumi","Air","Angin"], a: "Inti Bumi", d: "EASY" },
          { q: "PLTA memanfaatkan ?", o: ["Pasang surut","Arus sungai","Bendungan","Gelombang"], a: "Bendungan", d: "EASY" },
          { q: "Reboisasi artinya ?", o: ["Menebang hutan","Menanam hutan","Membakar hutan","Melindungi hutan"], a: "Menanam hutan", d: "EASY" },
          { q: "Biodiesel dari ?", o: ["Minyak bumi","Minyak nabati","Batu bara","Gas alam"], a: "Minyak nabati", d: "EASY" },
        ],
      },
      {
        title: "Ekosistem", difficulty: "EASY",
        questions: [
          { q: "Produsen di air ?", o: ["Ikan","Fitoplankton","Zooplankton","Udang"], a: "Fitoplankton", d: "EASY" },
          { q: "Rantai makanan mulai ?", o: ["Konsumen","Produsen","Pengurai","Karnivora"], a: "Produsen", d: "EASY" },
          { q: "Simbiosis untung-rugi ?", o: ["Mutualisme","Komensalisme","Parasitisme","Netralisme"], a: "Parasitisme", d: "EASY" },
          { q: "Cacing tanah peran ?", o: ["Produsen","Konsumen","Pengurai","Karnivora"], a: "Pengurai", d: "EASY" },
          { q: "Contoh mutualisme ?", o: ["Kutu-kucing","Bunga-lebah","Benalu-pohon","Cacing-usus"], a: "Bunga-lebah", d: "EASY" },
          { q: "Populasi adalah ?", o: ["Individu sejenis","Berbagai jenis","Ekosisitem","Komunitas"], a: "Individu sejenis", d: "EASY" },
          { q: "Faktor biotik ?", o: ["Air","Tanah","Hewan","Cahaya"], a: "Hewan", d: "EASY" },
          { q: "Ekosistem air tawar ?", o: ["Laut","Sungai","Terumbu karang","Pantai"], a: "Sungai", d: "EASY" },
          { q: "Konsumen puncak ?", o: ["Herbivora","Karnivora puncak","Omnivora","Dekomposer"], a: "Karnivora puncak", d: "EASY" },
          { q: "Ozon lindungi dari ?", o: ["Sinar UV","Sinar X","Sinar gamma","Inframerah"], a: "Sinar UV", d: "EASY" },
        ],
      },
    ],
  },
  {
    name: "Bahasa Indonesia", code: "BINDO",
    materials: [
      {
        title: "Teks Deskripsi", difficulty: "EASY",
        questions: [
          { q: "Teks menggambarkan objek disebut ?", o: ["Narasi","Deskripsi","Eksposisi","Argumentasi"], a: "Deskripsi", d: "EASY" },
          { q: "Ciri teks deskripsi ?", o: ["Berisi percakapan","Menggambarkan detail","Berisi argumen","Fiksi"], a: "Menggambarkan detail", d: "EASY" },
          { q: "Judul teks deskripsi ?", o: ["Liburan Pantai","Keindahan Raja Ampat","Cara Masak Nasi","Sejarah Indonesia"], a: "Keindahan Raja Ampat", d: "EASY" },
          { q: "Teks deskripsi pakai kata ?", o: ["Kerja imperatif","Sifat","Tanya","Sambung"], a: "Sifat", d: "EASY" },
          { q: "Struktur deskripsi ?", o: ["Pernyataan umum+deskripsi","Orientasi-krisis","Abstrak-koda","Pendahuluan-penutup"], a: "Pernyataan umum+deskripsi", d: "EASY" },
          { q: "'Pantai pasir putih' termasuk ?", o: ["Narasi","Deskripsi","Eksposisi","Persuasi"], a: "Deskripsi", d: "EASY" },
          { q: "Sinonim 'indah' ?", o: ["Jelek","Cantik","Kotor","Busuk"], a: "Cantik", d: "EASY" },
          { q: "Tujuan deskripsi ?", o: ["Membujuk","Menggambarkan","Menjelaskan cara","Menceritakan"], a: "Menggambarkan", d: "EASY" },
          { q: "Kalimat deskripsi ?", o: ["Ibu pergi pasar","Rumah itu besar nyaman","Adik belajar","Ayah baca koran"], a: "Rumah itu besar nyaman", d: "EASY" },
          { q: "Deskripsi subjektif berarti ?", o: ["Berdasarkan fakta","Opini penulis","Data","Sejarah"], a: "Opini penulis", d: "EASY" },
        ],
      },
      {
        title: "Teks Narasi", difficulty: "MEDIUM",
        questions: [
          { q: "Teks menceritakan peristiwa ?", o: ["Deskripsi","Narasi","Eksposisi","Persuasi"], a: "Narasi", d: "MEDIUM" },
          { q: "Struktur narasi ?", o: ["Pernyataan+deskripsi","Orientasi-komplikasi-resolusi","Tesis-argumen","Judul-langkah"], a: "Orientasi-komplikasi-resolusi", d: "MEDIUM" },
          { q: "Tokoh fiksi disebut ?", o: ["Nyata","Rekaan","Sejarah","Ilmiah"], a: "Rekaan", d: "MEDIUM" },
          { q: "Latar cerita mencakup ?", o: ["Tema","Waktu+tempat+suasana","Tokoh","Amanat"], a: "Waktu+tempat+suasana", d: "MEDIUM" },
          { q: "Alur maju bergerak ?", o: ["Mundur","Ke depan","Campuran","Statis"], a: "Ke depan", d: "MEDIUM" },
          { q: "Contoh fiksi ?", o: ["Biografi","Dongeng","Laporan","Berita"], a: "Dongeng", d: "MEDIUM" },
          { q: "Sudut pandang orang I pakai ?", o: ["Dia","Aku","Mereka","Kalian"], a: "Aku", d: "MEDIUM" },
          { q: "Amanat adalah ?", o: ["Latar","Pesan moral","Alur","Tokoh"], a: "Pesan moral", d: "MEDIUM" },
          { q: "Konflik adalah ?", o: ["Latar","Permasalahan","Tokoh","Tema"], a: "Permasalahan", d: "MEDIUM" },
          { q: "Resolusi berisi ?", o: ["Penyelesaian","Pengenalan tokoh","Klimaks","Penutup"], a: "Penyelesaian", d: "MEDIUM" },
        ],
      },
      {
        title: "Teks Eksposisi", difficulty: "MEDIUM",
        questions: [
          { q: "Teks informatif objektif ?", o: ["Narasi","Deskripsi","Eksposisi","Persuasi"], a: "Eksposisi", d: "MEDIUM" },
          { q: "Struktur eksposisi ?", o: ["Orientasi-resolusi","Tesis-argumen-penutup","Pernyataan-deskripsi","Judul-langkah"], a: "Tesis-argumen-penutup", d: "MEDIUM" },
          { q: "Ciri eksposisi ?", o: ["Fiksi","Objektif faktual","Subjektif","Menghibur"], a: "Objektif faktual", d: "MEDIUM" },
          { q: "Kata hubung eksposisi ?", o: ["Kemudian","Selain itu","Setelah itu","Pada suatu hari"], a: "Selain itu", d: "MEDIUM" },
          { q: "Topik eksposisi ?", o: ["Manfaat Olahraga","Liburan Bali","Cinderella","Pantai Indah"], a: "Manfaat Olahraga", d: "MEDIUM" },
          { q: "Tesis berisi ?", o: ["Argumen","Pendapat penulis","Contoh","Penutup"], a: "Pendapat penulis", d: "MEDIUM" },
          { q: "Fakta sebagai ?", o: ["Hiasan","Penguat argumen","Pembuka","Penutup"], a: "Penguat argumen", d: "MEDIUM" },
          { q: "Eksposisi termasuk ?", o: ["Fiksi","Nonfiksi","Sastra","Imajinatif"], a: "Nonfiksi", d: "MEDIUM" },
          { q: "Kata kerja mental ?", o: ["Berlari","Mempercayai","Memasak","Menulis"], a: "Mempercayai", d: "MEDIUM" },
          { q: "Pernyataan ulang berisi ?", o: ["Argumen baru","Kesimpulan","Orientasi","Latar"], a: "Kesimpulan", d: "MEDIUM" },
        ],
      },
      {
        title: "Puisi", difficulty: "MEDIUM",
        questions: [
          { q: "Puisi mengutamakan ?", o: ["Panjang cerita","Keindahan bahasa","Alur","Tokoh"], a: "Keindahan bahasa", d: "MEDIUM" },
          { q: "Baris puisi disebut ?", o: ["Bait","Larik","Rima","Diksi"], a: "Larik", d: "MEDIUM" },
          { q: "Kumpulan baris ?", o: ["Larik","Bait","Rima","Irama"], a: "Bait", d: "MEDIUM" },
          { q: "Persamaan bunyi ?", o: ["Irama","Rima","Diksi","Majas"], a: "Rima", d: "MEDIUM" },
          { q: "Pilihan kata ?", o: ["Rima","Irama","Diksi","Majas"], a: "Diksi", d: "MEDIUM" },
          { q: "Majas perbandingan kata ?", o: ["Seperti","Dan","Atau","Namun"], a: "Seperti", d: "MEDIUM" },
          { q: "Citraan adalah ?", o: ["Gambaran pancaindra","Alur","Latar","Tokoh"], a: "Gambaran pancaindra", d: "MEDIUM" },
          { q: "Tema adalah ?", o: ["Judul","Pokok pikiran","Baris","Bait"], a: "Pokok pikiran", d: "MEDIUM" },
          { q: "Contoh puisi lama ?", o: ["Soneta","Pantun","Balada","Elegi"], a: "Pantun", d: "MEDIUM" },
          { q: "Sampiran di ?", o: ["Syair","Pantun","Soneta","Gurindam"], a: "Pantun", d: "MEDIUM" },
        ],
      },
      {
        title: "Cerita Rakyat", difficulty: "EASY",
        questions: [
          { q: "Cerita dianggap benar ?", o: ["Fabel","Legenda","Mitos","Dongeng"], a: "Legenda", d: "EASY" },
          { q: "Asal-usul tempat ?", o: ["Fabel","Legenda","Mitos","Sage"], a: "Legenda", d: "EASY" },
          { q: "Tokoh fabel ?", o: ["Manusia","Dewa","Hewan","Tumbuhan"], a: "Hewan", d: "EASY" },
          { q: "Malin Kundang dari ?", o: ["Jawa","Sumatera Barat","Kalimantan","Sulawesi"], a: "Sumatera Barat", d: "EASY" },
          { q: "Cerita rakyat disebar ?", o: ["Tertulis","Lisan","Digital","Cetak"], a: "Lisan", d: "EASY" },
          { q: "Fungsi cerita rakyat ?", o: ["Hiburan","Pendidikan moral","Pelestarian budaya","Semua benar"], a: "Semua benar", d: "EASY" },
          { q: "Sangkuriang → ?", o: ["Danau Toba","Tangkuban Perahu","Candi Prambanan","Merapi"], a: "Tangkuban Perahu", d: "EASY" },
          { q: "Mite tentang ?", o: ["Hewan","Dewa+gaib","Sejarah","Pahlawan"], a: "Dewa+gaib", d: "EASY" },
          { q: "Cerita rakyat termasuk ?", o: ["Modern","Lama","Populer","Ilmiah"], a: "Lama", d: "EASY" },
          { q: "Nilai cerita rakyat ?", o: ["Sosial","Budaya","Moral","Semua benar"], a: "Semua benar", d: "EASY" },
        ],
      },
      {
        title: "Kata Baku", difficulty: "MEDIUM",
        questions: [
          { q: "Baku dari 'aktif' ?", o: ["Aktif","Aktip","Aktif","Aktif"], a: "Aktif", d: "MEDIUM" },
          { q: "Baku benar ?", o: ["Cendikiawan","Cendekiawan","Cendikiawan","Cendikiawan"], a: "Cendekiawan", d: "MEDIUM" },
          { q: "Baku 'kualitas' ?", o: ["Kualitas","Kwalitas","Kwalitet","Kwalitas"], a: "Kualitas", d: "MEDIUM" },
          { q: "Baku 'ijin' → ?", o: ["Ijin","Izin","Idzin","Isin"], a: "Izin", d: "MEDIUM" },
          { q: "Baku 'jadwal' ?", o: ["Jadwal","Jadual","Jaduwal","Jadwall"], a: "Jadwal", d: "MEDIUM" },
          { q: "Baku 'karir' ?", o: ["Karir","Karier","Karier","Karir"], a: "Karier", d: "MEDIUM" },
          { q: "Baku 'syah' ?", o: ["Syah","Sah","Syah","Shah"], a: "Sah", d: "MEDIUM" },
          { q: "Baku 'apotik' ?", o: ["Apotik","Apotek","Apoteik","Apotik"], a: "Apotek", d: "MEDIUM" },
          { q: "Baku 'sistem' ?", o: ["Sistim","Sistem","Sistim","Sistem"], a: "Sistem", d: "MEDIUM" },
          { q: "Baku 'diagnosa' ?", o: ["Diagnosa","Diagnosis","Diagnos","Diagnose"], a: "Diagnosis", d: "MEDIUM" },
        ],
      },
      {
        title: "Kalimat Efektif", difficulty: "HARD",
        questions: [
          { q: "Kalimat efektif adalah ?", o: ["Panjang","Jelas mudah dipahami","Banyak kata","Bertele-tele"], a: "Jelas mudah dipahami", d: "HARD" },
          { q: "Kalimat tidak efektif ?", o: ["Adik belajar","Adik tekun","Adik rajin","Agar supaya adik belajar"], a: "Agar supaya adik belajar", d: "HARD" },
          { q: "Kehematan berarti ?", o: ["Hemat kata","Hemat biaya","Hemat waktu","Hemat tenaga"], a: "Hemat kata", d: "HARD" },
          { q: "Kalimat tunggal punya ?", o: ["Subjek+predikat","Subjek+objek","Predikat+objek","Objek+keterangan"], a: "Subjek+predikat", d: "HARD" },
          { q: "'Daripada' untuk ?", o: ["Perbandingan","Waktu","Tempat","Sebab"], a: "Perbandingan", d: "HARD" },
          { q: "'Budi membaca buku' pola ?", o: ["S-P-O","S-P","S-P-O-K","S-P-K"], a: "S-P-O", d: "HARD" },
          { q: "'di' benar ?", o: ["Dirumah","di rumah","Di rumah","diRumah"], a: "Di rumah", d: "HARD" },
          { q: "Kalimat ambigu ?", o: ["Ibu memasak","Ibu di dapur","Ibu memasak sayur","Ibu memasak enak"], a: "Ibu memasak enak", d: "HARD" },
          { q: "Kesejajaran artinya ?", o: ["Bentuk sama","Arti sama","Panjang sama","Warna sama"], a: "Bentuk sama", d: "HARD" },
          { q: "Penghubung intrakalimat ?", o: ["Dan","Karena","Tetapi","Semua benar"], a: "Semua benar", d: "HARD" },
        ],
      },
      {
        title: "Surat Resmi", difficulty: "MEDIUM",
        questions: [
          { q: "Bagian berisi tanggal ?", o: ["Kop surat","Tanggal surat","Lampiran","Perihal"], a: "Tanggal surat", d: "MEDIUM" },
          { q: "Kop berisi ?", o: ["Alamat tujuan","Identitas lembaga","Tanggal","Tanda tangan"], a: "Identitas lembaga", d: "MEDIUM" },
          { q: "Salam pembuka resmi ?", o: ["Halo","Assalamualaikum","Dengan hormat","Hai"], a: "Dengan hormat", d: "MEDIUM" },
          { q: "Nomor surat fungsi ?", o: ["Hiasan","Dokumentasi","Pemanis","Penanda waktu"], a: "Dokumentasi", d: "MEDIUM" },
          { q: "Lampiran menunjukkan ?", o: ["Isi surat","Dokumen tambahan","Tujuan","Tanggal"], a: "Dokumen tambahan", d: "MEDIUM" },
          { q: "Perihal berisi ?", o: ["Lampiran","Pokok masalah","Salam","Penutup"], a: "Pokok masalah", d: "MEDIUM" },
          { q: "Penutup surat resmi ?", o: ["Sampai jumpa","Hormat saya","Sekian","Bye"], a: "Hormat saya", d: "MEDIUM" },
          { q: "Tanda tangan di ?", o: ["Atas","Bawah","Tengah","Samping"], a: "Bawah", d: "MEDIUM" },
          { q: "Bahasa surat resmi ?", o: ["Gaul","Baku","Daerah","Asing"], a: "Baku", d: "MEDIUM" },
          { q: "Alamat tujuan di ?", o: ["Kiri","Kanan","Tengah","Bawah"], a: "Kiri", d: "MEDIUM" },
        ],
      },
      {
        title: "Majas", difficulty: "HARD",
        questions: [
          { q: "Perbandingan 'seperti' ?", o: ["Metafora","Personifikasi","Asosiasi","Hiperbola"], a: "Asosiasi", d: "HARD" },
          { q: "Benda mati seolah hidup ?", o: ["Metafora","Personifikasi","Metonimia","Litotes"], a: "Personifikasi", d: "HARD" },
          { q: "Tanpa kata pembanding ?", o: ["Asosiasi","Metafora","Personifikasi","Hiperbola"], a: "Metafora", d: "HARD" },
          { q: "Melebih-lebihkan ?", o: ["Litotes","Hiperbola","Ironi","Sarkasme"], a: "Hiperbola", d: "HARD" },
          { q: "Merendahkan diri ?", o: ["Hiperbola","Litotes","Ironi","Sarkasme"], a: "Litotes", d: "HARD" },
          { q: "Sindiran halus ?", o: ["Sarkasme","Ironi","Sinisme","Satire"], a: "Ironi", d: "HARD" },
          { q: "Personifikasi contoh ?", o: ["Angin berbisik","Budi berlari","Matahari terbit","Air mengalir"], a: "Angin berbisik", d: "HARD" },
          { q: "Hiperbola contoh ?", o: ["Keringatnya sungai","Dia cantik","Buku tebal","Rumah besar"], a: "Keringatnya sungai", d: "HARD" },
          { q: "Metonimia pakai ?", o: ["Ciri benda","Nama merek","Kata pembanding","Sindiran"], a: "Nama merek", d: "HARD" },
          { q: "Litotes contoh ?", o: ["Rumah gubuk saya","Dia kaya","Gunung tinggi","Laut luas"], a: "Rumah gubuk saya", d: "HARD" },
        ],
      },
      {
        title: "Prosa Fiksi", difficulty: "MEDIUM",
        questions: [
          { q: "Cerpen singkatan dari ?", o: ["Cerita panjang","Cerita pendek","Cerita bersambung","Cerita lama"], a: "Cerita pendek", d: "MEDIUM" },
          { q: "Novel adalah cerita ?", o: ["Pendek","Panjang","Sedang","Mini"], a: "Panjang", d: "MEDIUM" },
          { q: "Penokohan adalah ?", o: ["Penggambaran watak","Alur cerita","Latar","Sudut pandang"], a: "Penggambaran watak", d: "MEDIUM" },
          { q: "Tokoh protagonis adalah ?", o: ["Tokoh jahat","Tokoh baik","Tokoh utama","Tokoh figuran"], a: "Tokoh baik", d: "MEDIUM" },
          { q: "Tokoh antagonis adalah ?", o: ["Tokoh baik","Tokoh jahat","Tokoh utama","Tokoh sampingan"], a: "Tokoh jahat", d: "MEDIUM" },
          { q: "Alur mundur disebut ?", o: ["Regresif","Flashback","Progresif","Campuran"], a: "Flashback", d: "MEDIUM" },
          { q: "Latar tempat contohnya ?", o: ["Di sekolah","Pagi hari","Sedih","Cinta"], a: "Di sekolah", d: "MEDIUM" },
          { q: "Sudut pandang orang III pakai ?", o: ["Aku","Dia","Kami","Kita"], a: "Dia", d: "MEDIUM" },
          { q: "Klimaks adalah puncak ?", o: ["Konflik","Penutup","Pembuka","Latar"], a: "Konflik", d: "MEDIUM" },
          { q: "Novel 'Laskar Pelangi' karya ?", o: ["Andrea Hirata","Pramoedya","Tere Liye","Dewi Lestari"], a: "Andrea Hirata", d: "MEDIUM" },
        ],
      },
    ],
  },
];

// ── SUBJECTS TO ADD ──
const newSubjects = [
  {
    name: "PPKn", code: "PPKN",
    materials: [
      {
        title: "Pancasila sebagai Dasar Negara", difficulty: "EASY",
        questions: [
          { q: "Pancasila dalam ?", o: ["UUD 1945","Pembukaan UUD 1945","Batang Tubuh","Penjelasan"], a: "Pembukaan UUD 1945", d: "EASY" },
          { q: "Sila pertama ?", o: ["Kemanusiaan","Ketuhanan YME","Persatuan","Keadilan"], a: "Ketuhanan YME", d: "EASY" },
          { q: "Lambang sila ke-2 ?", o: ["Bintang","Rantai","Pohon beringin","Padi-kapas"], a: "Rantai", d: "EASY" },
          { q: "Pohon beringin sila ke ?", o: ["1","2","3","4"], a: "3", d: "EASY" },
          { q: "Kerakyatan sila ke ?", o: ["2","3","4","5"], a: "4", d: "EASY" },
          { q: "Pancasila artinya ?", o: ["Lima dasar","Lima aturan","Lima tujuan","Lima cara"], a: "Lima dasar", d: "EASY" },
          { q: "BPUPKI dibentuk ?", o: ["1 Maret 1945","29 April 1945","17 Agustus 1945","18 Agustus 1945"], a: "29 April 1945", d: "EASY" },
          { q: "Pengusul nama Pancasila ?", o: ["Soekarno","Hatta","Yamin","Soepomo"], a: "Soekarno", d: "EASY" },
          { q: "Keadilan sosial sila ke ?", o: ["3","4","5","2"], a: "5", d: "EASY" },
          { q: "Pancasila disahkan ?", o: ["1 Juni 1945","18 Agustus 1945","17 Agustus 1945","29 April 1945"], a: "18 Agustus 1945", d: "EASY" },
        ],
      },
      {
        title: "UUD 1945", difficulty: "MEDIUM",
        questions: [
          { q: "UUD 1945 ditetapkan oleh ?", o: ["BPUPKI","PPKI","DPR","MPR"], a: "PPKI", d: "MEDIUM" },
          { q: "Pembukaan terdiri ?", o: ["3 alinea","4 alinea","5 alinea","6 alinea"], a: "4 alinea", d: "MEDIUM" },
          { q: "Kekuasaan tertinggi ?", o: ["Presiden","MPR","DPR","MA"], a: "MPR", d: "MEDIUM" },
          { q: "Amandemen berapa kali ?", o: ["2","3","4","5"], a: "4", d: "MEDIUM" },
          { q: "Pasal HAM ?", o: ["27-31","28A-28J","29-32","30-35"], a: "28A-28J", d: "MEDIUM" },
          { q: "Bentuk negara ?", o: ["Federal","Kesatuan","Serikat","Konfederasi"], a: "Kesatuan", d: "MEDIUM" },
          { q: "UUD 1945 bersifat ?", o: ["Tertulis","Tidak tertulis","Campuran","Tradisional"], a: "Tertulis", d: "MEDIUM" },
          { q: "Pasal 29 tentang ?", o: ["Pendidikan","Agama","Ekonomi","Pertahanan"], a: "Agama", d: "MEDIUM" },
          { q: "Jumlah bab setelah amandemen ?", o: ["16","20","21","18"], a: "21", d: "MEDIUM" },
          { q: "Presiden pasal 4 ayat 1 ?", o: ["Memegang kekuasaan","Membuat UU","Mengadili","Mengawasi"], a: "Memegang kekuasaan", d: "MEDIUM" },
        ],
      },
      {
        title: "Hak dan Kewajiban", difficulty: "MEDIUM",
        questions: [
          { q: "Hak pendidikan pasal ?", o: ["29","31","33","34"], a: "31", d: "MEDIUM" },
          { q: "Pajak pasal ?", o: ["23A","27","28A","30"], a: "23A", d: "MEDIUM" },
          { q: "Pendapat diatur UU ?", o: ["9/1998","22/1999","32/2004","23/2014"], a: "9/1998", d: "MEDIUM" },
          { q: "Hak mendapat ?", o: ["Pekerjaan","Kekayaan","Kekuasaan","Keturunan"], a: "Pekerjaan", d: "MEDIUM" },
          { q: "Pertahanan pasal ?", o: ["27 ayat 3","28 ayat 2","29 ayat 1","30 ayat 2"], a: "27 ayat 3", d: "MEDIUM" },
          { q: "HAM bersifat ?", o: ["Mutlak","Terbatas","Universal","Sementara"], a: "Universal", d: "MEDIUM" },
          { q: "Contoh hak ?", o: ["Bayar pajak","Patuhi hukum","Pilih pemilu","Jaga aman"], a: "Pilih pemilu", d: "MEDIUM" },
          { q: "Kewajiban ke negara ?", o: ["Menerima bantuan","Membela negara","Dapat pendidikan","Dapat kerja"], a: "Membela negara", d: "MEDIUM" },
          { q: "HAM singkatan ?", o: ["Hak Akhir","Hak Asasi","Hak Alam","Hak Atas"], a: "Hak Asasi", d: "MEDIUM" },
          { q: "Pembatasan HAM pasal ?", o: ["28J","27","29","30"], a: "28J", d: "MEDIUM" },
        ],
      },
      {
        title: "Lembaga Negara", difficulty: "MEDIUM",
        questions: [
          { q: "Legislatif pusat ?", o: ["DPR","MA","BPK","KY"], a: "DPR", d: "MEDIUM" },
          { q: "Yudikatif dijalankan ?", o: ["Presiden","DPR","MA","BPK"], a: "MA", d: "MEDIUM" },
          { q: "BPK periksa ?", o: ["UU","Keuangan","Kebijakan","Peradilan"], a: "Keuangan", d: "MEDIUM" },
          { q: "Pengawas hakim ?", o: ["MA","KY","MK","DPR"], a: "KY", d: "MEDIUM" },
          { q: "MPR terdiri ?", o: ["DPR+DPD","DPR+Presiden","DPD+Presiden","DPR+MA"], a: "DPR+DPD", d: "MEDIUM" },
          { q: "Presiden dipilih ?", o: ["Langsung rakyat","MPR","DPR","Partai"], a: "Langsung rakyat", d: "MEDIUM" },
          { q: "Masa jabatan presiden ?", o: ["4","5","6","7"], a: "5", d: "MEDIUM" },
          { q: "MK uji ?", o: ["PP","UU thd UUD","Kebijakan","Perda"], a: "UU thd UUD", d: "MEDIUM" },
          { q: "Pengelola pemilu ?", o: ["KPU","BAWASLU","DKPP","Semua benar"], a: "Semua benar", d: "MEDIUM" },
          { q: "DPR periode 2024-2029 ?", o: ["550","560","575","580"], a: "575", d: "MEDIUM" },
        ],
      },
      {
        title: "Otonomi Daerah", difficulty: "MEDIUM",
        questions: [
          { q: "Otonomi adalah ?", o: ["Urus rumah tangga","Pisah diri","Negara baru","Tolak pusat"], a: "Urus rumah tangga", d: "MEDIUM" },
          { q: "Dasar hukum ?", o: ["UU 22/1999","UU 32/2004","UU 23/2014","Semua benar"], a: "Semua benar", d: "MEDIUM" },
          { q: "Kepala daerah via ?", o: ["Pilkada","Ditunjuk presiden","DPRD","Gubernur"], a: "Pilkada", d: "MEDIUM" },
          { q: "Wewenang pusat ?", o: ["Pendidikan","Pertahanan","Kesehatan","Pariwisata"], a: "Pertahanan", d: "MEDIUM" },
          { q: "DPRD adalah ?", o: ["Eksekutif","Legislatif","Yudikatif","Federatif"], a: "Legislatif", d: "MEDIUM" },
          { q: "Gubernur kepala ?", o: ["Provinsi","Kabupaten","Kota","Kecamatan"], a: "Provinsi", d: "MEDIUM" },
          { q: "DAU singkatan ?", o: ["Dana Alokasi Umum","Dana Bagi Hasil","Dana Khusus","Dana Darurat"], a: "Dana Alokasi Umum", d: "MEDIUM" },
          { q: "Pembagian daerah ?", o: ["Provinsi+kota","Provinsi+kab","Prov+kab+kota","Kab+kota"], a: "Prov+kab+kota", d: "MEDIUM" },
          { q: "Desentralisasi artinya ?", o: ["Penyerahan ke daerah","Pemusatan","Pembagian","Pemisahan"], a: "Penyerahan ke daerah", d: "MEDIUM" },
          { q: "Tujuan otonomi ?", o: ["Kesejahteraan","Pemerataan","Demokratisasi","Semua benar"], a: "Semua benar", d: "MEDIUM" },
        ],
      },
      {
        title: "Demokrasi Indonesia", difficulty: "HARD",
        questions: [
          { q: "Demokrasi artinya ?", o: ["Pemerintahan rakyat","Pemerintahan raja","Bangsawan","Militer"], a: "Pemerintahan rakyat", d: "HARD" },
          { q: "Demokrasi Pancasila berdasar ?", o: ["Nilai Pancasila","Demokrasi Barat","Demokrasi Timur","Campuran"], a: "Nilai Pancasila", d: "HARD" },
          { q: "Pemilu asas ?", o: ["LUBER","Terbatas","Tidak langsung","Perwakilan"], a: "LUBER", d: "HARD" },
          { q: "Sistem pemerintahan ?", o: ["Presidensial","Parlementer","Campuran","Federal"], a: "Presidensial", d: "HARD" },
          { q: "Kedaulatan rakyat via ?", o: ["Referendum","Pemilu","Musyawarah","Semua benar"], a: "Semua benar", d: "HARD" },
          { q: "Ciri demokrasi Pancasila ?", o: ["Musyawarah","Voting","Keputusan mutlak","Kebebasan tanpa batas"], a: "Musyawarah", d: "HARD" },
          { q: "Indonesia menganut ?", o: ["Langsung","Perwakilan","Langsung+perwakilan","Terbatas"], a: "Langsung+perwakilan", d: "HARD" },
          { q: "Demokrasi pasal ?", o: ["1 ayat 2","2 ayat 1","3 ayat 2","4 ayat 1"], a: "1 ayat 2", d: "HARD" },
          { q: "Kebebasan pers pilar ke ?", o: ["1","2","3","4"], a: "4", d: "HARD" },
          { q: "Fungsi parpol ?", o: ["Komunikasi","Rekruitmen","Partisipasi","Semua benar"], a: "Semua benar", d: "HARD" },
        ],
      },
      {
        title: "Bhinneka Tunggal Ika", difficulty: "EASY",
        questions: [
          { q: "Artinya ?", o: ["Berbeda tetap satu","Satu untuk semua","Bersatu teguh","Berbeda indah"], a: "Berbeda tetap satu", d: "EASY" },
          { q: "Terdapat pada ?", o: ["Bendera","Lambang negara","UUD 1945","Pancasila"], a: "Lambang negara", d: "EASY" },
          { q: "Keberagaman meliputi ?", o: ["Suku agama ras","Budaya bahasa","Adat","Semua benar"], a: "Semua benar", d: "EASY" },
          { q: "Sikap tepat ?", o: ["Toleransi","Diskriminasi","Etnosentrisme","Primordialisme"], a: "Toleransi", d: "EASY" },
          { q: "Bahasa daerah terbanyak ?", o: ["Sunda","Jawa","Batak","Bugis"], a: "Jawa", d: "EASY" },
          { q: "Agama diakui ?", o: ["4","5","6","7"], a: "6", d: "EASY" },
          { q: "Tarian daerah dari ?", o: ["Pusat","Daerah","Luar negeri","Pemerintah"], a: "Daerah", d: "EASY" },
          { q: "Faktor keberagaman ?", o: ["Letak strategis","Geografis","Sejarah","Semua benar"], a: "Semua benar", d: "EASY" },
          { q: "Sikap hargai ?", o: ["Hormati tradisi","Rendahkan budaya","Anggap terbaik","Tolak beda"], a: "Hormati tradisi", d: "EASY" },
          { q: "Gotong royong nilai ?", o: ["Individualis","Kebersamaan","Kompetisi","Egois"], a: "Kebersamaan", d: "EASY" },
        ],
      },
      {
        title: "Hukum dan Peradilan", difficulty: "HARD",
        questions: [
          { q: "Hukum bersifat ?", o: ["Mengikat","Opsional","Sementara","Lokal"], a: "Mengikat", d: "HARD" },
          { q: "Tujuan hukum ?", o: ["Keadilan","Kepastian","Kemanfaatan","Semua benar"], a: "Semua benar", d: "HARD" },
          { q: "Peradilan umum ?", o: ["PN+PT","PA","PTUN","PM"], a: "PN+PT", d: "HARD" },
          { q: "Hakim harus ?", o: ["Memihak","Netral","Opini","Dipengaruhi"], a: "Netral", d: "HARD" },
          { q: "Praduga tak bersalah ?", o: ["Dianggap bersalah","Tdk bersalah sampai terbukti","Bebas","Dihukum"], a: "Tdk bersalah sampai terbukti", d: "HARD" },
          { q: "Banding di ?", o: ["PN","PT","MA","MK"], a: "PT", d: "HARD" },
          { q: "MA pengadilan ?", o: ["Pertama","Banding","Kasasi","Khusus"], a: "Kasasi", d: "HARD" },
          { q: "Sumber formal ?", o: ["UU","Kebiasaan","Yurisprudensi","Semua benar"], a: "Semua benar", d: "HARD" },
          { q: "PTUN adili sengketa ?", o: ["Pidana","Perdata","Administrasi","Agama"], a: "Administrasi", d: "HARD" },
          { q: "Advokat beri ?", o: ["Pinjaman","Bantuan hukum","Pinjaman uang","Pendidikan"], a: "Bantuan hukum", d: "HARD" },
        ],
      },
      {
        title: "Globalisasi", difficulty: "MEDIUM",
        questions: [
          { q: "Globalisasi adalah ?", o: ["Integrasi global","Disintegrasi","Isolasi","Lokalisasi"], a: "Integrasi global", d: "MEDIUM" },
          { q: "Pendorong ?", o: ["Teknologi info","Perang","Bencana","Epidemi"], a: "Teknologi info", d: "MEDIUM" },
          { q: "Dampak positif ?", o: ["Akses info","Luntur budaya","Kesenjangan","Polusi"], a: "Akses info", d: "MEDIUM" },
          { q: "Dampak negatif ?", o: ["Pasar bebas","Westernisasi","Investasi","Transfer teknologi"], a: "Westernisasi", d: "MEDIUM" },
          { q: "Sikap terbaik ?", o: ["Tolak total","Terima filter","Terima semua","Abaikan"], a: "Terima filter", d: "MEDIUM" },
          { q: "Contoh globalisasi ?", o: ["Makanan tradisional","K-pop","Batik","Wayang"], a: "K-pop", d: "MEDIUM" },
          { q: "WTO organisasi ?", o: ["Nasional","Internasional","Regional","Lokal"], a: "Internasional", d: "MEDIUM" },
          { q: "MEA dimulai tahun ?", o: ["2010","2015","2020","2025"], a: "2015", d: "MEDIUM" },
          { q: "Hadapi globalisasi ?", o: ["Perkuat identitas","Tutup diri","Ikuti tren","Tinggalkan budaya"], a: "Perkuat identitas", d: "MEDIUM" },
          { q: "Globalisasi sebabkan ?", o: ["Ekonomi","Budaya","Pendidikan","Semua benar"], a: "Semua benar", d: "MEDIUM" },
        ],
      },
      {
        title: "Pertahanan dan Keamanan", difficulty: "MEDIUM",
        questions: [
          { q: "Sistem pertahanan ?", o: ["Sishankamrata","Sishankamnas","Siskamling","Siskompak"], a: "Sishankamrata", d: "MEDIUM" },
          { q: "TNI tugas ?", o: ["Kedaulatan","Keamanan dalam","Ketertiban","Penegakan hukum"], a: "Kedaulatan", d: "MEDIUM" },
          { q: "POLRI tugas ?", o: ["Luar negeri","Dalam negeri","Militer","Perang"], a: "Dalam negeri", d: "MEDIUM" },
          { q: "TNI terdiri ?", o: ["AD,AL,AU","Polisi","AD,AL","AL,AU"], a: "AD,AL,AU", d: "MEDIUM" },
          { q: "Bela negara pasal ?", o: ["27(3)","28(2)","30(1)","31(1)"], a: "27(3)", d: "MEDIUM" },
          { q: "Bela negara sikap ?", o: ["Bela tanah air","Individualis","Egois","Apatis"], a: "Bela tanah air", d: "MEDIUM" },
          { q: "Nonfisik bela negara ?", o: ["Bertempur","Belajar giat","Bawa senjata","Berperang"], a: "Belajar giat", d: "MEDIUM" },
          { q: "Panglima TNI diangkat ?", o: ["Menteri","Presiden","DPR","MA"], a: "Presiden", d: "MEDIUM" },
          { q: "Komponen cadangan ?", o: ["TNI","Polri","Rakyat terlatih","PNS"], a: "Rakyat terlatih", d: "MEDIUM" },
          { q: "Tugas pokok TNI ?", o: ["Tegakkan hukum","Lindungi negara","Lalu lintas","Pajak"], a: "Lindungi negara", d: "MEDIUM" },
        ],
      },
    ],
  },
  {
    name: "Ilmu Pengetahuan Sosial", code: "IPS",
    materials: [
      {
        title: "Peta dan Komponen", difficulty: "EASY",
        questions: [
          { q: "Peta gambaran di bidang ?", o: ["Lengkung","Datar","Miring","Vertikal"], a: "Datar", d: "EASY" },
          { q: "Penunjuk arah di peta ?", o: ["Legenda","Skala","Orientasi","Garis tepi"], a: "Orientasi", d: "EASY" },
          { q: "Skala 1:250.000 artinya ?", o: ["1cm=2,5km","1cm=25km","1cm=250km","1cm=2.500km"], a: "1cm=2,5km", d: "EASY" },
          { q: "Simbol sungai ?", o: ["Garis lurus","Garis berkelok","Titik","Biru"], a: "Garis berkelok", d: "EASY" },
          { q: "Legenda berisi ?", o: ["Judul","Keterangan simbol","Arah","Skala"], a: "Keterangan simbol", d: "EASY" },
          { q: "Garis suhu sama ?", o: ["Isobar","Isoterm","Isohyet","Kontur"], a: "Isoterm", d: "EASY" },
          { q: "Atlas kumpulan ?", o: ["Gambar","Peta","Foto","Tabel"], a: "Peta", d: "EASY" },
          { q: "Jarak sebenarnya = ?", o: ["JP × skala","JP ÷ skala","Skala ÷ JP","JP + skala"], a: "JP × skala", d: "EASY" },
          { q: "Inset peta fungsi ?", o: ["Lokasi","Utama","Tematik","Buta"], a: "Lokasi", d: "EASY" },
          { q: "Warna hijau artinya ?", o: ["Laut","Dataran rendah","Pegunungan","Gurun"], a: "Dataran rendah", d: "EASY" },
        ],
      },
      {
        title: "Keragaman Budaya", difficulty: "EASY",
        questions: [
          { q: "Rumah Joglo dari ?", o: ["Jateng","Sumut","Papua","Sulsel"], a: "Jateng", d: "EASY" },
          { q: "Tari Samber dari ?", o: ["Jawa","Bali","Sunda","Papua"], a: "Papua", d: "EASY" },
          { q: "Angklung dari ?", o: ["Jabar","Jatim","Bali","Sumut"], a: "Jabar", d: "EASY" },
          { q: "Bundo Kanduang dari ?", o: ["Sumbar","Sumut","Jambi","Riau"], a: "Sumbar", d: "EASY" },
          { q: "Candi Borobudur di ?", o: ["Jakarta","Yogya","Magelang","Solo"], a: "Magelang", d: "EASY" },
          { q: "Tari Kecak dari ?", o: ["Jawa","Bali","Sunda","Sumut"], a: "Bali", d: "EASY" },
          { q: "Lagu Ampar Pisang dari ?", o: ["Sumbar","Kalsel","Sulsel","Papua"], a: "Kalsel", d: "EASY" },
          { q: "Rencong dari ?", o: ["Jawa","Aceh","Sumbar","Sulsel"], a: "Aceh", d: "EASY" },
          { q: "Makanan UNESCO ?", o: ["Soto","Rendang","Gado-gado","Sate"], a: "Rendang", d: "EASY" },
          { q: "Ngaben tradisi ?", o: ["Jawa","Bali","Sumut","Kaltim"], a: "Bali", d: "EASY" },
        ],
      },
      {
        title: "Sejarah Kemerdekaan RI", difficulty: "MEDIUM",
        questions: [
          { q: "Proklamasi ?", o: ["16/8/1945","17/8/1945","18/8/1945","19/8/1945"], a: "17/8/1945", d: "MEDIUM" },
          { q: "Teks diketik ?", o: ["Soekarno","Hatta","Sayuti Melik","Ahmad Subarjo"], a: "Sayuti Melik", d: "MEDIUM" },
          { q: "Rengasdengklok ?", o: ["14/8","15/8","16/8","17/8"], a: "16/8", d: "MEDIUM" },
          { q: "Usul proklamasi di Jakarta ?", o: ["Soekarno","Hatta","Ahmad Subarjo","Soekarni"], a: "Ahmad Subarjo", d: "MEDIUM" },
          { q: "Penjahit bendera ?", o: ["Fatmawati","Kartini","Cut Nyak","R.A. Kartini"], a: "Fatmawati", d: "MEDIUM" },
          { q: "Pertempuran Surabaya ?", o: ["Bung Tomo","Sudirman","Sutan Sjahrir","Tan Malaka"], a: "Bung Tomo", d: "MEDIUM" },
          { q: "Lagu kebangsaan ?", o: ["Indonesia Pusaka","Indonesia Raya","Tanah Air","Bagimu Negeri"], a: "Indonesia Raya", d: "MEDIUM" },
          { q: "Jepang menyerah ?", o: ["6/8","9/8","14/8","15/8"], a: "14/8", d: "MEDIUM" },
          { q: "Bendera ?", o: ["Putih-merah","Merah-putih","Merah-putih-biru","Putih-merah-biru"], a: "Merah-putih", d: "MEDIUM" },
          { q: "Pembacaan proklamasi di ?", o: ["Istana Negara","Lapangan Ikada","Pegangsaan Timur 56","Gedung DPR"], a: "Pegangsaan Timur 56", d: "MEDIUM" },
        ],
      },
      {
        title: "Kegiatan Ekonomi", difficulty: "MEDIUM",
        questions: [
          { q: "Produksi adalah ?", o: ["Hasilkan barang","Habiskan barang","Salurkan barang","Gunakan barang"], a: "Hasilkan barang", d: "MEDIUM" },
          { q: "Distribusi adalah ?", o: ["Buat barang","Salurkan barang","Habiskan barang","Olah barang"], a: "Salurkan barang", d: "MEDIUM" },
          { q: "Konsumsi contoh ?", o: ["Bertani","Berbelanja","Distribusi","Produksi"], a: "Berbelanja", d: "MEDIUM" },
          { q: "Pasar tempat ?", o: ["Penjual+pembeli","Guru+murid","Dokter+pasien","Politisi"], a: "Penjual+pembeli", d: "MEDIUM" },
          { q: "BUMN milik ?", o: ["Swasta","Negara","Daerah","Asing"], a: "Negara", d: "MEDIUM" },
          { q: "Contoh BUMN ?", o: ["Pertamina","Indomaret","Alfamart","Gojek"], a: "Pertamina", d: "MEDIUM" },
          { q: "Permintaan jumlah ?", o: ["Ditawarkan","Diminta","Diproduksi","Didistribusi"], a: "Diminta", d: "MEDIUM" },
          { q: "Penawaran jumlah ?", o: ["Diminta","Ditawarkan","Dikonsumsi","Disimpan"], a: "Ditawarkan", d: "MEDIUM" },
          { q: "Inflasi kenaikan ?", o: ["Sementara","Umum terus","Musiman","Lokal"], a: "Umum terus", d: "MEDIUM" },
          { q: "BI atur ?", o: ["Moneter","Fiskal","Pendidikan","Luar negeri"], a: "Moneter", d: "MEDIUM" },
        ],
      },
      {
        title: "Kerajaan Hindu-Buddha", difficulty: "MEDIUM",
        questions: [
          { q: "Hindu tertua ?", o: ["Majapahit","Sriwijaya","Kutai","Singosari"], a: "Kutai", d: "MEDIUM" },
          { q: "Prasasti Yupa dari ?", o: ["Tarumanegara","Kutai","Sriwijaya","Mataram"], a: "Kutai", d: "MEDIUM" },
          { q: "Sriwijaya puncak abad ?", o: ["7","8","9","10"], a: "9", d: "MEDIUM" },
          { q: "Candi Prambanan dari ?", o: ["Mataram Kuno","Majapahit","Singosari","Sriwijaya"], a: "Mataram Kuno", d: "MEDIUM" },
          { q: "Majapahit puncak di ?", o: ["Gajah Mada","Hayam Wuruk","Radan Wijaya","Jayanegara"], a: "Hayam Wuruk", d: "MEDIUM" },
          { q: "Sumpah Palapa ?", o: ["Hayam","Gajah Mada","Radan","Tribhuwana"], a: "Gajah Mada", d: "MEDIUM" },
          { q: "Borobudur agama ?", o: ["Hindu","Buddha","Islam","Kristen"], a: "Buddha", d: "MEDIUM" },
          { q: "Sriwijaya di ?", o: ["Jawa","Sumatera","Kaltim","Sulsel"], a: "Sumatera", d: "MEDIUM" },
          { q: "Prasasti Mulawarman ?", o: ["Kutai","Tarumanegara","Sriwijaya","Mataram"], a: "Kutai", d: "MEDIUM" },
          { q: "Tarumanegara di ?", o: ["Jateng","Jabar","Jatim","Sumut"], a: "Jabar", d: "MEDIUM" },
        ],
      },
      {
        title: "Kerajaan Islam", difficulty: "MEDIUM",
        questions: [
          { q: "Islam pertama ?", o: ["Demak","Samudera Pasai","Mataram","Aceh"], a: "Samudera Pasai", d: "MEDIUM" },
          { q: "Walisongo di ?", o: ["Sumatera","Jawa","Kaltim","Sulsel"], a: "Jawa", d: "MEDIUM" },
          { q: "Masjid Agung Demak ?", o: ["Sunan Kalijaga","Sunan Bonang","Sunan Gunung Jati","Walisongo"], a: "Walisongo", d: "MEDIUM" },
          { q: "Mataram Islam oleh ?", o: ["Panembahan Senopati","Sultan Agung","Amangkurat","Diponegoro"], a: "Panembahan Senopati", d: "MEDIUM" },
          { q: "Sultan Hasanuddin dari ?", o: ["Aceh","Demak","Gowa","Ternate"], a: "Gowa", d: "MEDIUM" },
          { q: "Perang Diponegoro ?", o: ["1825-1830","1830-1835","1815-1820","1840-1845"], a: "1825-1830", d: "MEDIUM" },
          { q: "Aceh puncak di ?", o: ["Iskandar Muda","Alauddin","Hasanuddin","Agung"], a: "Iskandar Muda", d: "MEDIUM" },
          { q: "Sunan Ampel termasuk ?", o: ["Pahlawan","Walisongo","Sultan","Ulama"], a: "Walisongo", d: "MEDIUM" },
          { q: "Demak oleh ?", o: ["Radan Patah","Sultan Agung","Senopati","Diponegoro"], a: "Radan Patah", d: "MEDIUM" },
          { q: "Peninggalan Islam ?", o: ["Candi","Masjid","Prasasti Yupa","Arca"], a: "Masjid", d: "MEDIUM" },
        ],
      },
      {
        title: "SDA dan Pemanfaatan", difficulty: "EASY",
        questions: [
          { q: "Indonesia negara ?", o: ["Agraris","Maritim","Agraris+maritim","Industri"], a: "Agraris+maritim", d: "EASY" },
          { q: "Hasil tambang utama ?", o: ["Minyak+gas+batu bara","Gandum","Jagung","Teh"], a: "Minyak+gas+batu bara", d: "EASY" },
          { q: "Potensi laut ?", o: ["Perikanan","Pertanian","Peternakan","Perkebunan"], a: "Perikanan", d: "EASY" },
          { q: "Hutan mangrove ?", o: ["Cegah abrasi","Habitat ikan","Serap CO2","Semua benar"], a: "Semua benar", d: "EASY" },
          { q: "Daerah minyak ?", o: ["Kaltim","Papua","Riau","Semua benar"], a: "Semua benar", d: "EASY" },
          { q: "Kopi banyak di ?", o: ["Sumut+Jawa+Sulsel","Kaltim","Papua","Bali"], a: "Sumut+Jawa+Sulsel", d: "EASY" },
          { q: "SDA terbarukan ?", o: ["Hutan+air+ikan","Minyak","Batu bara","Emas"], a: "Hutan+air+ikan", d: "EASY" },
          { q: "Pemanfaatan SDA ?", o: ["Besar-besaran","Berkelanjutan","Eksploitatif","Sekali"], a: "Berkelanjutan", d: "EASY" },
          { q: "Sawit RI terbesar di ?", o: ["Asia","Dunia","ASEAN","Afrika"], a: "Dunia", d: "EASY" },
          { q: "Batubara di ?", o: ["Kaltim+Sumut","Jawa","Papua","Sulsel"], a: "Kaltim+Sumut", d: "EASY" },
        ],
      },
      {
        title: "Interaksi Antarruang", difficulty: "MEDIUM",
        questions: [
          { q: "Interaksi berupa ?", o: ["Perdagangan","Transportasi","Komunikasi","Semua benar"], a: "Semua benar", d: "MEDIUM" },
          { q: "Pendorong ?", o: ["Perbedaan SDA","Persamaan SDA","Isolasi","Kesamaan budaya"], a: "Perbedaan SDA", d: "MEDIUM" },
          { q: "Desa→kota disebut ?", o: ["Urbanisasi","Transmigrasi","Migrasi","Sirkuler"], a: "Urbanisasi", d: "MEDIUM" },
          { q: "Dampak positif urban ?", o: ["Tenaga kerja","Kepadatan","Kriminalitas","Kumuh"], a: "Tenaga kerja", d: "MEDIUM" },
          { q: "Transmigrasi ?", o: ["Desa→kota","Pulau padat→jarang","Kota→desa","Dalam kota"], a: "Pulau padat→jarang", d: "MEDIUM" },
          { q: "Pusat tumbuh dorong ?", o: ["Pembangunan","Kesenjangan","Ketimpangan","Isolasi"], a: "Pembangunan", d: "MEDIUM" },
          { q: "Teori inti ganda ?", o: ["Christaller","Harris+Ullman","Burgess","Hoyt"], a: "Harris+Ullman", d: "MEDIUM" },
          { q: "Faktor interaksi ?", o: ["Jarak","Biaya","Transportasi","Semua benar"], a: "Semua benar", d: "MEDIUM" },
          { q: "Globalisasi meningkatkan ?", o: ["Eksosbud","Ekonomi saja","Budaya saja","Politik saja"], a: "Eksosbud", d: "MEDIUM" },
          { q: "Contoh interaksi ?", o: ["Ekspor-impor","Pementasan budaya","Kerja sama daerah","Semua benar"], a: "Semua benar", d: "MEDIUM" },
        ],
      },
      {
        title: "Lembaga Sosial", difficulty: "MEDIUM",
        questions: [
          { q: "Lembaga atur hubungan ?", o: ["Keluarga","Pendidikan","Ekonomi","Politik"], a: "Keluarga", d: "MEDIUM" },
          { q: "Fungsi keluarga ?", o: ["Reproduksi","Sosialisasi","Perlindungan","Semua benar"], a: "Semua benar", d: "MEDIUM" },
          { q: "Pendidikan fungsi ?", o: ["Cerdaskan bangsa","Cari untung","Kekuasaan","Hiburan"], a: "Cerdaskan bangsa", d: "MEDIUM" },
          { q: "Ekonomi peran ?", o: ["Prod+distri+konsumsi","Pendidikan","Keluarga","Agama"], a: "Prod+distri+konsumsi", d: "MEDIUM" },
          { q: "Politik fungsi ?", o: ["Buat kebijakan","Atur ekonomi","Pendidikan","Sosialisasi"], a: "Buat kebijakan", d: "MEDIUM" },
          { q: "Agama fungsi ?", o: ["Pedoman hidup","Kekuasaan","Ekonomi","Politik"], a: "Pedoman hidup", d: "MEDIUM" },
          { q: "Lembaga sosial ?", o: ["RT/RW","Keluarga","Sekolah","Semua benar"], a: "Semua benar", d: "MEDIUM" },
          { q: "Norma adalah ?", o: ["Aturan masyarakat","Sekolah","Rumah","Negara"], a: "Aturan masyarakat", d: "MEDIUM" },
          { q: "Norma hukum ?", o: ["Memaksa+mengikat","Opsional","Sementara","Lokal"], a: "Memaksa+mengikat", d: "MEDIUM" },
          { q: "Lembaga terbentuk ?", o: ["Kebutuhan manusia","Keinginan","Peraturan","Globalisasi"], a: "Kebutuhan manusia", d: "MEDIUM" },
        ],
      },
      {
        title: "Penyimpangan Sosial", difficulty: "HARD",
        questions: [
          { q: "Penyimpangan adalah ?", o: ["Langgar norma","Ikuti norma","Biasa","Terpuji"], a: "Langgar norma", d: "HARD" },
          { q: "Primer contoh ?", o: ["Mencuri","Berkelahi","Bohong sekali","Korupsi"], a: "Bohong sekali", d: "HARD" },
          { q: "Sekunder adalah ?", o: ["Ringan","Berat berulang","Aman","Sementara"], a: "Berat berulang", d: "HARD" },
          { q: "Faktor penyebab ?", o: ["Lingkungan","Keluarga","Ekonomi","Semua benar"], a: "Semua benar", d: "HARD" },
          { q: "Korupsi termasuk ?", o: ["Primer","Sekunder","Ringan","Biasa"], a: "Sekunder", d: "HARD" },
          { q: "Pengendalian sosial ?", o: ["Cegah penyimpangan","Dorong","Abaikan","Perkuat"], a: "Cegah penyimpangan", d: "HARD" },
          { q: "Preventif contoh ?", o: ["Pendidikan moral","Hukuman","Sanksi","Denda"], a: "Pendidikan moral", d: "HARD" },
          { q: "Represif dilakukan ?", o: ["Sebelum","Sesudah","Saat","Tidak tentu"], a: "Sesudah", d: "HARD" },
          { q: "Agen pengendali ?", o: ["Keluarga+sekolah","Polisi saja","Hakim saja","Guru saja"], a: "Keluarga+sekolah", d: "HARD" },
          { q: "Tujuan pengendali ?", o: ["Ketertiban","Kebebasan","Kekacauan","Ketidakadilan"], a: "Ketertiban", d: "HARD" },
        ],
      },
    ],
  },
  {
    name: "Bahasa Inggris", code: "BING",
    materials: [
      {
        title: "Greetings", difficulty: "EASY",
        questions: [
          { q: "'Selamat pagi' in English ?", o: ["Good night","Good morning","Good evening","Good afternoon"], a: "Good morning", d: "EASY" },
          { q: "Response to 'How are you?' ?", o: ["I'm fine","I'm student","I'm from RI","I'm 15"], a: "I'm fine", d: "EASY" },
          { q: "Introduce yourself ?", o: ["My name is","How are you","Goodbye","Thanks"], a: "My name is", d: "EASY" },
          { q: "Meeting evening ?", o: ["Good morning","Good afternoon","Good evening","Good night"], a: "Good evening", d: "EASY" },
          { q: "Response 'Nice to meet you' ?", o: ["Nice too","Goodbye","Thanks","Sorry"], a: "Nice too", d: "EASY" },
          { q: "When leaving ?", o: ["Hello","Goodbye","How are you","Thanks"], a: "Goodbye", d: "EASY" },
          { q: "'How do you do' first meeting ?", o: ["First meeting","Parting","Help","Apologize"], a: "First meeting", d: "EASY" },
          { q: "Greeting 2 PM ?", o: ["Good morning","Good afternoon","Good evening","Good night"], a: "Good afternoon", d: "EASY" },
          { q: "Where from? I am from ?", o: ["Indonesia","Indonesian","Java","Jakarta"], a: "Indonesia", d: "EASY" },
          { q: "Response 'Thank you' ?", o: ["Welcome","Yes","No","Goodbye"], a: "Welcome", d: "EASY" },
        ],
      },
      {
        title: "Daily Activities", difficulty: "EASY",
        questions: [
          { q: "I ... breakfast.", o: ["Eat","Have","Take","Make"], a: "Have", d: "EASY" },
          { q: "She ... to school.", o: ["Go","Goes","Going","Went"], a: "Goes", d: "EASY" },
          { q: "We ... homework.", o: ["Does","Do","Did","Done"], a: "Do", d: "EASY" },
          { q: "He ... up at 5 AM.", o: ["Wake","Wakes","Woke","Waking"], a: "Wakes", d: "EASY" },
          { q: "They ... TV after dinner.", o: ["Watch","Watches","Watched","Watching"], a: "Watch", d: "EASY" },
          { q: "What time ... to bed?", o: ["Go","Goes","Going","Went"], a: "Go", d: "EASY" },
          { q: "My mother ... lunch.", o: ["Cook","Cooks","Cooked","Cooking"], a: "Cooks", d: "EASY" },
          { q: "I ... my teeth.", o: ["Brush","Brushes","Brushed","Brushing"], a: "Brush", d: "EASY" },
          { q: "She ... English Monday.", o: ["Study","Studies","Studied","Studying"], a: "Studies", d: "EASY" },
          { q: "Father ... to office.", o: ["Go","Goes","Going","Went"], a: "Goes", d: "EASY" },
        ],
      },
      {
        title: "Present Simple", difficulty: "MEDIUM",
        questions: [
          { q: "She ... to music.", o: ["Listen","Listens","Listening","Listened"], a: "Listens", d: "MEDIUM" },
          { q: "They ... play on Sunday.", o: ["Doesn't","Don't","Aren't","Isn't"], a: "Don't", d: "MEDIUM" },
          { q: "... he like coffee?", o: ["Do","Does","Is","Are"], a: "Does", d: "MEDIUM" },
          { q: "Sun ... in east.", o: ["Rise","Rises","Rose","Rising"], a: "Rises", d: "MEDIUM" },
          { q: "I ... a teacher.", o: ["Am","Is","Are","Be"], a: "Am", d: "MEDIUM" },
          { q: "We ... from RI.", o: ["Am","Is","Are","Be"], a: "Are", d: "MEDIUM" },
          { q: "She ... not like spicy.", o: ["Do","Does","Is","Are"], a: "Does", d: "MEDIUM" },
          { q: "My parents ... in JKT.", o: ["Live","Lives","Living","Lived"], a: "Live", d: "MEDIUM" },
          { q: "Cat ... milk.", o: ["Drink","Drinks","Drinking","Drank"], a: "Drinks", d: "MEDIUM" },
          { q: "We ... grandparents.", o: ["Visit","Visits","Visiting","Visited"], a: "Visit", d: "MEDIUM" },
        ],
      },
      {
        title: "Past Simple", difficulty: "MEDIUM",
        questions: [
          { q: "I ... to Bali last year.", o: ["Go","Went","Gone","Going"], a: "Went", d: "MEDIUM" },
          { q: "She ... homework.", o: ["Finish","Finished","Finishes","Finishing"], a: "Finished", d: "MEDIUM" },
          { q: "We ... not at school.", o: ["Was","Were","Are","Is"], a: "Were", d: "MEDIUM" },
          { q: "They ... a movie.", o: ["Watch","Watched","Watches","Watching"], a: "Watched", d: "MEDIUM" },
          { q: "He ... breakfast.", o: ["Have","Had","Has","Having"], a: "Had", d: "MEDIUM" },
          { q: "Did you ... the match?", o: ["See","Saw","Seen","Seeing"], a: "See", d: "MEDIUM" },
          { q: "She ... not come.", o: ["Do","Did","Was","Were"], a: "Did", d: "MEDIUM" },
          { q: "Grandfather ... in 2010.", o: ["Die","Died","Dies","Dying"], a: "Died", d: "MEDIUM" },
          { q: "Where ... you go?", o: ["Do","Did","Does","Are"], a: "Did", d: "MEDIUM" },
          { q: "I ... a letter.", o: ["Receive","Received","Receives","Receiving"], a: "Received", d: "MEDIUM" },
        ],
      },
      {
        title: "Descriptive Text", difficulty: "MEDIUM",
        questions: [
          { q: "Descriptive describes ?", o: ["Person/place/thing","Story","Argument","Procedure"], a: "Person/place/thing", d: "MEDIUM" },
          { q: "Structure ?", o: ["ID+desc","Ori+res","Thesis+arg","Goal+steps"], a: "ID+desc", d: "MEDIUM" },
          { q: "'Cat is fluffy' example of ?", o: ["Narration","Description","Exposition","Procedure"], a: "Description", d: "MEDIUM" },
          { q: "Adjectives used in ?", o: ["Descriptive","Procedure","Narrative","Report"], a: "Descriptive", d: "MEDIUM" },
          { q: "Purpose ?", o: ["Tell story","Describe","Explain how","Persuade"], a: "Describe", d: "MEDIUM" },
          { q: "Tense mostly used ?", o: ["Past","Present","Future","Perfect"], a: "Present", d: "MEDIUM" },
          { q: "Opposite of 'big' ?", o: ["Large","Small","Huge","Tiny"], a: "Small", d: "MEDIUM" },
          { q: "Synonym of 'beautiful' ?", o: ["Ugly","Pretty","Bad","Awful"], a: "Pretty", d: "MEDIUM" },
          { q: "Identification describes ?", o: ["Subject","Color","Size","Shape"], a: "Subject", d: "MEDIUM" },
          { q: "'Classroom is clean' is ?", o: ["Descriptive","Narrative","Persuasive","Argument"], a: "Descriptive", d: "MEDIUM" },
        ],
      },
      {
        title: "Procedure Text", difficulty: "MEDIUM",
        questions: [
          { q: "Procedure explains ?", o: ["How to do","Story","Description","Argument"], a: "How to do", d: "MEDIUM" },
          { q: "Structure ?", o: ["Goal+materials+steps","ID+desc","Ori+res","Thesis+arg"], a: "Goal+materials+steps", d: "MEDIUM" },
          { q: "Imperative in ?", o: ["Narrative","Procedure","Descriptive","Report"], a: "Procedure", d: "MEDIUM" },
          { q: "Example ?", o: ["How to fry rice","My holiday","My cat","History"], a: "How to fry rice", d: "MEDIUM" },
          { q: "First step ?", o: ["Conclusion","Goal","Materials","Steps"], a: "Goal", d: "MEDIUM" },
          { q: "'First crack eggs' is ?", o: ["Goal","Step","Material","Conclusion"], a: "Step", d: "MEDIUM" },
          { q: "Not imperative verb ?", o: ["Mix","Stir","Beautiful","Cut"], a: "Beautiful", d: "MEDIUM" },
          { q: "Action verbs used in ?", o: ["Procedure","Descriptive","Narrative","Report"], a: "Procedure", d: "MEDIUM" },
          { q: "Purpose ?", o: ["Entertain","Instruct","Describe","Persuade"], a: "Instruct", d: "MEDIUM" },
          { q: "Temporal conjunctions like ?", o: ["Then","However","Because","But"], a: "Then", d: "MEDIUM" },
        ],
      },
      {
        title: "Narrative Text", difficulty: "MEDIUM",
        questions: [
          { q: "Narrative tells ?", o: ["Story","Description","Argument","Instruction"], a: "Story", d: "MEDIUM" },
          { q: "Structure ?", o: ["Goal+steps","Ori+complication+res","ID+desc","Thesis+arg"], a: "Ori+complication+res", d: "MEDIUM" },
          { q: "Example ?", o: ["Cinderella","How to make cake","My dog","Reading importance"], a: "Cinderella", d: "MEDIUM" },
          { q: "Tense used ?", o: ["Past","Present","Future","Perfect"], a: "Past", d: "MEDIUM" },
          { q: "Complication is ?", o: ["Problem","Setting","Conclusion","Intro"], a: "Problem", d: "MEDIUM" },
          { q: "Fairy tales are ?", o: ["Narrative","Procedure","Report","Descriptive"], a: "Narrative", d: "MEDIUM" },
          { q: "Resolution is ?", o: ["Beginning","Solution","Setting","Char"], a: "Solution", d: "MEDIUM" },
          { q: "Characters in ?", o: ["Orientation","Complication","Resolution","Coda"], a: "Orientation", d: "MEDIUM" },
          { q: "Fable has ?", o: ["Animal characters","History","Science","Recipe"], a: "Animal characters", d: "MEDIUM" },
          { q: "Moral lesson in ?", o: ["Narrative","Procedure","Descriptive","Report"], a: "Narrative", d: "MEDIUM" },
        ],
      },
      {
        title: "Vocabulary: Animals", difficulty: "EASY",
        questions: [
          { q: "Baby cat ?", o: ["Puppy","Kitten","Cub","Foal"], a: "Kitten", d: "EASY" },
          { q: "Largest animal ?", o: ["Elephant","Blue whale","Giraffe","Rhino"], a: "Blue whale", d: "EASY" },
          { q: "Can fly ?", o: ["Fish","Bird","Snake","Frog"], a: "Bird", d: "EASY" },
          { q: "Lion lives in ?", o: ["Stable","Den","Nest","Cage"], a: "Den", d: "EASY" },
          { q: "Plural of 'mouse' ?", o: ["Mouses","Mice","Mices","Mouse"], a: "Mice", d: "EASY" },
          { q: "Baby dog ?", o: ["Kitten","Puppy","Cub","Foal"], a: "Puppy", d: "EASY" },
          { q: "Lives in water ?", o: ["Lion","Fish","Bird","Snake"], a: "Fish", d: "EASY" },
          { q: "Caterpillar→butterfly ?", o: ["Evolution","Metamorphosis","Growth","Adaptation"], a: "Metamorphosis", d: "EASY" },
          { q: "Cow sound ?", o: ["Woof","Meow","Moo","Baa"], a: "Moo", d: "EASY" },
          { q: "Group of sheep ?", o: ["Pack","Flock","Herd","School"], a: "Flock", d: "EASY" },
        ],
      },
      {
        title: "Vocabulary: Food", difficulty: "EASY",
        questions: [
          { q: "Drink when thirsty ?", o: ["Rice","Water","Bread","Meat"], a: "Water", d: "EASY" },
          { q: "Yellow long fruit ?", o: ["Apple","Banana","Orange","Grape"], a: "Banana", d: "EASY" },
          { q: "Eat soup with ?", o: ["Fork","Spoon","Knife","Plate"], a: "Spoon", d: "EASY" },
          { q: "Morning meal ?", o: ["Lunch","Dinner","Breakfast","Supper"], a: "Breakfast", d: "EASY" },
          { q: "Orange vegetable ?", o: ["Broccoli","Carrot","Spinach","Cabbage"], a: "Carrot", d: "EASY" },
          { q: "Sweet after meal ?", o: ["Appetizer","Dessert","Main","Snack"], a: "Dessert", d: "EASY" },
          { q: "Bread ingredient ?", o: ["Rice","Flour","Sugar","Milk"], a: "Flour", d: "EASY" },
          { q: "No meat person ?", o: ["Chef","Vegetarian","Baker","Butcher"], a: "Vegetarian", d: "EASY" },
          { q: "Orange drink ?", o: ["Tea","Coffee","Orange juice","Milk"], a: "Orange juice", d: "EASY" },
          { q: "'Nasi goreng' in English ?", o: ["Fried rice","Boiled rice","Steamed rice","Rice cake"], a: "Fried rice", d: "EASY" },
        ],
      },
      {
        title: "Reading Comprehension", difficulty: "HARD",
        questions: [
          { q: "Main idea called ?", o: ["Topic sentence","Detail","Conclusion","Example"], a: "Topic sentence", d: "HARD" },
          { q: "Supporting sentence ?", o: ["Contradicts","Supports","Ignores","Replaces"], a: "Supports", d: "HARD" },
          { q: "Synonym 'difficult' ?", o: ["Easy","Hard","Simple","Light"], a: "Hard", d: "HARD" },
          { q: "Antonym 'generous' ?", o: ["Kind","Stingy","Helpful","Caring"], a: "Stingy", d: "HARD" },
          { q: "Conclusion purpose ?", o: ["Introduce","Summarize","Give example","Ask"], a: "Summarize", d: "HARD" },
          { q: "Which is noun ?", o: ["Run","Beautiful","Happiness","Quickly"], a: "Happiness", d: "HARD" },
          { q: "Which is adjective ?", o: ["Quickly","Beautiful","Run","Happiness"], a: "Beautiful", d: "HARD" },
          { q: "Which is verb ?", o: ["Happiness","Beautiful","Run","Quickly"], a: "Run", d: "HARD" },
          { q: "Inference means ?", o: ["Conclusion","Question","Answer","Source"], a: "Conclusion", d: "HARD" },
          { q: "Reference word 'it' refers to ?", o: ["Previous noun","Verb","Adjective","Adverb"], a: "Previous noun", d: "HARD" },
        ],
      },
    ],
  },
];

async function main() {
  // Find class X-A
  const cls = await prisma.class.findFirst({ where: { name: "X-A" } });
  if (!cls) { console.error("Kelas X-A tidak ditemukan. Jalankan seed_full dulu."); return; }

  // Merge all subject definitions
  const allSubjectDefs = [...subjectDefs, ...newSubjects];

  for (const sdef of allSubjectDefs) {
    const existingSubject = await prisma.subject.findFirst({ where: { code: sdef.code } });
    let subject;
    if (existingSubject) {
      subject = existingSubject;
      console.log(`Subject ${sdef.code} sudah ada, lanjut...`);
    } else {
      subject = await prisma.subject.create({ data: { name: sdef.name, code: sdef.code } });
      console.log(`Subject ${sdef.code} dibuat`);
    }

    // Create or find ClassSubject
    let cs = await prisma.classSubject.findFirst({
      where: { classId: cls.id, subjectId: subject.id },
    });
    if (!cs) {
      const teacher = await prisma.teacher.findFirst();
      cs = await prisma.classSubject.create({
        data: { classId: cls.id, subjectId: subject.id, teacherId: teacher?.id ?? null, semester: 1, academicYear: 2026 },
      });
    }

    for (const mdef of sdef.materials) {
      const existingMaterial = await prisma.material.findFirst({
        where: { classSubjectId: cs.id, title: mdef.title },
      });
      if (existingMaterial) {
        console.log(`  Materi "${mdef.title}" sudah ada, skip...`);
        continue;
      }

      const material = await prisma.material.create({
        data: { title: mdef.title, classSubjectId: cs.id, difficulty: mdef.difficulty, isPublished: true, orderIndex: 1 },
      });

      for (const q of mdef.questions) {
        await prisma.question.create({
          data: {
            materialId: material.id,
            questionText: q.q,
            options: q.o,
            correctAnswer: q.a,
            difficulty: q.d,
            orderIndex: 1,
          },
        });
      }
      console.log(`  Materi "${mdef.title}" → ${mdef.questions.length} soal`);
    }
  }

  console.log("\n✅ Selesai! Semua materi dan soal sudah ditambahkan.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
