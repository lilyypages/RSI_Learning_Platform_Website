"use client";
import React, { useState, useEffect } from "react";
import { Send, Download, FileCheck, CheckCircle2, User, MessageSquare } from "lucide-react";

interface Student {
  id: string;
  name: string;
  adaptiveLevel: string;
}

export default function LaporanMingguan() {
  const [catatanKelas, setCatatanKelas] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  // State untuk menyimpan catatan per individu siswa: { "student-id-1": "catatannya", ... }
  const [catatanIndividu, setCatatanIndividu] = useState<Record<string, string>>({});
  
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [classSubjectId, setClassSubjectId] = useState<string | null>(null);

  // 1. Ambil data classSubjectId pertama
  useEffect(() => {
    fetch("/api/materials")
      .then(r => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const targetId = data[0].classSubjectId;
          setClassSubjectId(targetId);
          // Setelah dapat kelas, langsung ambil daftar siswanya
          fetchStudents(targetId);
        }
      })
      .catch(() => {});
  }, []);

// 2. Fungsi mengambil daftar siswa berdasarkan kelas
async function fetchStudents(subjectId: string) {
  setLoadingStudents(true);
  setError("");
  try {
    // 🌟 Panggil ke API students sambil melempar includeProgress atau classSubjectId
    const res = await fetch(`/api/students?includeProgress=true`);
    if (!res.ok) throw new Error("Gagal mengambil data dari API");
    
    const json = await res.json();

    // Sesuaikan dengan struktur response API kamu (apakah json langsung array, atau json.students)
    if (json.success && Array.isArray(json.students)) {
      // Petakan data agar sesuai dengan struktur state frontend
      const mappedStudents = json.students.map((s: any) => ({
        id: s.id,
        name: s.user?.name ?? "Tanpa Nama",
        // Ambil adaptive level terakhir seperti di halaman monitoring kamu kemarin
        adaptiveLevel: s.progress && s.progress.length > 0 
          ? s.progress[s.progress.length - 1]?.adaptiveLevel ?? "STANDARD"
          : "STANDARD"
      }));
      setStudents(mappedStudents);
    } else if (Array.isArray(json)) {
      // Antisipasi jika API langsung mengembalikan array mentah
      setStudents(json);
    }
  } catch (err) {
    console.error("Error fetching students untuk laporan:", err);
    setError("Gagal memuat daftar siswa untuk kelas ini.");
  } finally {
    setLoadingStudents(false);
  }
}

  // 3. Handler mengubah input catatan siswa tertentu
  const handleStudentNoteChange = (studentId: string, value: string) => {
    setCatatanIndividu(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  // 4. Proses pengiriman data komplit ke API
  async function handleSend() {
    if (!classSubjectId) {
      setError("Belum ada data kelas tersedia.");
      return;
    }
    setSending(true);
    setError("");

    // Petakan catatan ke format array yang siap disimpan di database per anak
    const laporanSiswa = students.map(s => ({
      studentId: s.id,
      catatanIndividu: catatanIndividu[s.id] || "" // Kosong jika guru tidak mengisi
    }));

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          classSubjectId, 
          catatanKelas,       // Untuk konsumsi semua ortu
          laporanSiswa        // Array berisi catatan personal per anak
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
      } else {
        setError(data.message ?? "Gagal mengirim laporan.");
      }
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white p-8 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        
        {/* HEADER */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-[#E8F5E9] text-[#2E7D32] rounded-[16px]">
            <FileCheck size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#2E7D32]">Review & Kirim Laporan Mingguan</h2>
            <p className="text-[#2E7D32]/60 text-sm font-medium">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {sent ? (
          /* SCREEN SUKSES */
          <div className="flex flex-col items-center py-12 space-y-4">
            <CheckCircle2 size={48} className="text-[#4CAF50]" />
            <p className="text-xl font-black text-[#2E7D32]">Laporan Berhasil Dikirim!</p>
            <p className="text-[#2E7D32]/70 text-sm font-medium text-center">
              Laporan umum kelas dan catatan khusus individu telah masuk ke dashboard masing-masing orang tua.
            </p>
            <button
              onClick={() => { setSent(false); setCatatanKelas(""); setCatatanIndividu({}); }}
              className="mt-4 px-6 py-3 bg-[#E8F5E9] text-[#2E7D32] rounded-[24px] font-black text-sm hover:bg-[#FFFDE7] transition-colors"
            >
              Kirim Laporan Baru
            </button>
          </div>
        ) : (
          /* FORM INPUT */
          <div className="space-y-6 border-t border-[#E8F5E9]/50 pt-6">
            
            {/* 1. INPUT CATATAN UMUM KELAS */}
            <div className="p-5 border border-[#E8F5E9] rounded-[24px] bg-white">
              <label className="block text-xs font-black text-[#2E7D32]/60 uppercase tracking-widest mb-2">
                📢 Catatan Umum Kelas (Dilihat Semua Orang Tua)
              </label>
              <textarea
                className="w-full p-4 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[16px] text-sm text-[#2E7D32] placeholder-[#2E7D32]/30 outline-none focus:ring-2 focus:ring-[#4CAF50]/50 font-medium"
                placeholder="Contoh: Pekan ini kelas fokus pada penguatan pemahaman logika matematika dasar..."
                rows={3}
                value={catatanKelas}
                onChange={e => setCatatanKelas(e.target.value)}
              />
            </div>

            {/* 2. INPUT INDIVIDU PER SISWA */}
            <div className="p-5 border border-[#E8F5E9] rounded-[24px] bg-white space-y-4">
              <div>
                <label className="block text-xs font-black text-[#2E7D32]/60 uppercase tracking-widest">
                  👤 Catatan Khusus Individu Siswa (Hanya Dilihat Ortu Bersangkutan)
                </label>
                <p className="text-[11px] text-[#2E7D32]/50 font-medium mt-0.5">
                  Berikan feedback personal mengenai perilaku atau fokus belajar anak minggu ini.
                </p>
              </div>

              {loadingStudents ? (
                <div className="text-center py-6 text-sm text-[#2E7D32]/50 font-bold">
                  Memuat daftar siswa...
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-6 text-sm text-[#2E7D32]/50 font-bold">
                  Tidak ada data siswa.
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 asset-scroll-clean">
                  {students.map((student) => (
                    <div 
                      key={student.id} 
                      className="p-4 bg-[#FFFBF0]/60 border border-[#E8F5E9] rounded-[20px] flex flex-col md:flex-row md:items-center gap-4 hover:border-[#4CAF50]/30 transition-colors"
                    >
                      {/* Profil Singkat Siswa */}
                      <div className="flex items-center space-x-3 md:w-1/3 flex-shrink-0">
                        <div className="w-9 h-9 bg-[#E8F5E9] rounded-full flex items-center justify-center font-black text-[#2E7D32] text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[#2E7D32] truncate">{student.name}</p>
                          <span className="text-[9px] bg-white px-2 py-0.5 rounded border border-[#E8F5E9] font-black text-[#2E7D32]/60">
                            {student.adaptiveLevel}
                          </span>
                        </div>
                      </div>

                      {/* Kotak Input Fleksibel Per Anak */}
                      <div className="flex-1 relative">
                        <MessageSquare className="absolute left-3 top-3.5 text-[#2E7D32]/30" size={14} />
                        <input
                          type="text"
                          placeholder={`Catatan untuk ortu ${student.name.split(" ")[0]}... (opsional)`}
                          value={catatanIndividu[student.id] || ""}
                          onChange={(e) => handleStudentNoteChange(student.id, e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8F5E9] rounded-[14px] text-xs text-[#2E7D32] placeholder-[#2E7D32]/30 outline-none focus:ring-2 focus:ring-[#4CAF50]/30 font-medium shadow-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ERROR HANDLING */}
            {error && (
              <p className="text-sm text-[#E53935] font-bold px-2">{error}</p>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-4 flex space-x-4">
              <button
                onClick={handleSend}
                disabled={sending || loadingStudents}
                className="flex-1 bg-[#4CAF50] hover:bg-[#2E7D32] disabled:opacity-60 text-white py-4 rounded-[24px] font-black flex items-center justify-center space-x-2 shadow-[0_8px_32px_rgba(76,175,80,0.15)] transition-all"
              >
                <Send size={18} />
                <span>{sending ? "Mengirim Laporan..." : "Kirim Laporan Kolektif"}</span>
              </button>
              
              <button className="px-6 py-4 bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#FFFDE7] rounded-[24px] font-black transition-colors">
                <Download size={18} />
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}