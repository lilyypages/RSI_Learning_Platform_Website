"use client";
import React, { useState, useEffect } from "react";
import { Send, Download, FileCheck, CheckCircle2 } from "lucide-react";

export default function LaporanMingguan() {
  const [catatan, setCatatan]     = useState("");
  const [sending, setSending]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [error, setError]         = useState("");
  const [classSubjectId, setClassSubjectId] = useState<string | null>(null);

  // Get first classSubjectId available utk guru ini
  useEffect(() => {
    fetch("/api/materials")
      .then(r => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setClassSubjectId(data[0].classSubjectId);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSend() {
    if (!classSubjectId) {
      setError("Belum ada data kelas tersedia.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classSubjectId, catatanKelas: catatan }),
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
      {/* Container utama diubah border border-[#E8F5E9] dan radius 24px */}
      <div className="bg-white p-8 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        <div className="flex items-center space-x-4 mb-6">
          {/* Badge icon disesuaikan ke warna Hijau Daun kustom */}
          <div className="p-3 bg-[#E8F5E9] text-[#2E7D32] rounded-[16px]">
            <FileCheck size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#2E7D32]">Review Laporan Mingguan</h2>
            <p className="text-[#2E7D32]/60 text-sm font-medium">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col items-center py-12 space-y-4">
            <CheckCircle2 size={48} className="text-[#4CAF50]" />
            <p className="text-xl font-black text-[#2E7D32]">Laporan Berhasil Dikirim!</p>
            <p className="text-[#2E7D32]/70 text-sm font-medium">Semua orang tua telah menerima laporan mingguan.</p>
            <button
              onClick={() => { setSent(false); setCatatan(""); }}
              className="mt-4 px-6 py-3 bg-[#E8F5E9] text-[#2E7D32] rounded-[24px] font-black text-sm hover:bg-[#FFFDE7] transition-colors"
            >
              Kirim Lagi
            </button>
          </div>
        ) : (
          <div className="space-y-4 border-t border-[#E8F5E9]/50 pt-6">
            {/* Status Data Siswa menggunakan background color cream kekuningan lembut */}
            <div className="p-4 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[24px] flex justify-between items-center">
              <div>
                <p className="font-bold text-[#2E7D32]">Status Data Siswa</p>
                <p className="text-xs text-[#2E7D32]/60 font-medium">Data progress siswa akan diambil otomatis.</p>
              </div>
              <span className="bg-[#E8F5E9] text-[#2EE7D32] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                Siap Kirim
              </span>
            </div>

            {/* Input area Catatan Umum */}
            <div className="p-4 border border-[#E8F5E9] rounded-[24px]">
              <label className="block text-xs font-black text-[#2E7D32]/50 uppercase tracking-widest mb-2">
                Catatan Umum Kelas (Opsional)
              </label>
              <textarea
                className="w-full p-4 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[16px] text-sm text-[#2E7D32] placeholder-[#2E7D32]/30 outline-none focus:ring-2 focus:ring-[#4CAF50]/50 font-medium"
                placeholder="Contoh: Seluruh siswa menunjukkan kemajuan pesat pada materi pecahan..."
                rows={3}
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
              />
            </div>

            {/* Error handling menggunakan warna Red cerah */}
            {error && (
              <p className="text-sm text-[#E53935] font-bold px-2">{error}</p>
            )}

            <div className="mt-8 flex space-x-4">
              {/* Tombol kirim utama diubah menjadi Hijau --green (#4CAF50) */}
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 bg-[#4CAF50] hover:bg-[#2E7D32] disabled:opacity-60 text-white py-4 rounded-[24px] font-black flex items-center justify-center space-x-2 shadow-[0_8px_32px_rgba(76,175,80,0.15)] transition-all"
              >
                <Send size={18} />
                <span>{sending ? "Mengirim..." : "Kirim Laporan ke Semua Ortu"}</span>
              </button>
              {/* Tombol download sekunder menggunakan background Hijau muda */}
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
