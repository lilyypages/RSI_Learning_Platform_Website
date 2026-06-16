"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Video, FileText, HelpCircle, Trash2, Edit3, Loader2, BookOpen, X } from "lucide-react";

interface Material {
  id: string;
  title: string;
  contentText?: string;
  videos?: Array<{ id: string; title: string }>;
  questions?: Array<{ id: string }>;
}

function KelolaMateriForm() {
  const searchParams = useSearchParams();
  const classSubjectId = searchParams.get("classSubjectId") ?? "";

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Tambah Bab Baru
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadMaterials = () => {
    if (!classSubjectId) return;
    setLoading(true);
    fetch(`/api/materials?classSubjectId=${classSubjectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMaterials(data);
        else if (data.success && Array.isArray(data.materials)) setMaterials(data.materials);
      })
      .catch((err) => console.error("Gagal load materi:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMaterials();
  }, [classSubjectId]);

  // Fungsi membuat Bab Kosong Pertama Kali
  async function handleCreateBab(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    setModalError("");
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classSubjectId,
          title: newTitle.trim(),
          contentText: null, // Kosong dulu, diisi nanti saat klik edit/input materi
          orderIndex: materials.length + 1,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowModal(false);
        setNewTitle("");
        loadMaterials(); // Refresh list otomatis
      } else {
        setModalError(data.message ?? "Gagal membuat bab baru.");
      }
    } catch {
      setModalError("Koneksi gagal. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
  if (!confirm("Apakah Anda yakin ingin menghapus Bab ini beserta seluruh isinya?")) return;

  try {
    const res = await fetch(`/api/materials/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    
    if (res.ok && data.success) {
      alert("Bab berhasil dihapus!");
      loadMaterials(); // Refresh data list setelah berhasil dihapus
    } else {
      alert(data.message || "Gagal menghapus bab.");
    }
  } catch (err) {
    alert("Terjadi kesalahan koneksi.");
  }
}

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <Link href="/dashboard/guru/mapel" className="flex items-center text-[#2E7D32]/70 font-bold text-sm hover:text-[#2E7D32] w-fit transition-colors">
        <ChevronLeft size={18} /> Kembali ke Kurikulum
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
        <div>
          <h1 className="text-2xl font-black text-[#2E7D32]">Daftar Bab & Silabus Pembelajaran 📚</h1>
          <p className="text-[#2E7D32]/60 text-sm font-medium">Buat kerangka bab terlebih dahulu, lalu isi konten modul multimedia beserta butir kuis evaluasinya.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-6 py-4 rounded-[24px] font-black flex items-center space-x-2 shadow-[0_8px_32px_rgba(76,175,80,0.15)] transition-all text-sm flex-shrink-0"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Buat Bab Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#2E7D32]/50 font-bold flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" /> Memuat struktur silabus...
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white p-12 rounded-[24px] border border-dashed border-[#2E7D32]/20 text-center space-y-3">
          <p className="font-bold text-[#2E7D32]/60 text-lg">Belum ada Bab pembelajaran di kelas ini.</p>
          <p className="text-xs text-[#2E7D32]/40 max-w-sm mx-auto">Silakan klik tombol <b>"Buat Bab Baru"</b> di atas untuk menyusun modul utama pertama Anda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {materials.map((m, idx) => {
            const totalSoal = m.questions?.length ?? 0;
            const adaVideo = m.videos && m.videos.length > 0;

            return (
              <div key={m.id} className="bg-white p-6 rounded-[24px] border border-[#E8F5E9] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-[#4CAF50]/30 transition-colors">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-black px-2.5 py-1 rounded-md">BAB {idx + 1}</span>
                    <h3 className="font-black text-lg text-[#2E7D32] truncate">{m.title}</h3>
                  </div>
                  
                  {/* Indikator Kelengkapan Isi Modul */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#2E7D32]/50 font-bold">
                    <span className="flex items-center space-x-1">
                      <FileText size={14} className={m.contentText ? "text-[#00897B]" : "text-gray-300"} />
                      <span>{m.contentText ? "Materi Teks Lengkap" : "Teks Belum Diisi"}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Video size={14} className={adaVideo ? "text-[#FF8F00]" : "text-gray-300"} />
                      <span>{adaVideo ? "Video Tersemat" : "Tanpa Video"}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <HelpCircle size={14} className={totalSoal > 0 ? "text-[#1976D2]" : "text-gray-300"} />
                      <span>{totalSoal} Butir Soal Adaptif</span>
                    </span>
                  </div>
                </div>

                {/* Kelompok Aksi Manajemen Konten */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end flex-shrink-0">
                  {/* Tombol Input Konten Teks & Video */}
                  <Link href={`/dashboard/guru/mapel/input-materi?materialId=${m.id}&classSubjectId=${classSubjectId}`}>
                    <button className="px-4 py-3 bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white rounded-[18px] text-xs font-black flex items-center space-x-1.5 transition-all">
                      <BookOpen size={14} />
                      <span>Isi/Edit Materi</span>
                    </button>
                  </Link>

                  {/* Navigasi Kelola Soal diikat langsung ke materialId agar spesifik! */}
                  <Link href={`/dashboard/guru/mapel/kelola-soal?materialId=${m.id}&classSubjectId=${classSubjectId}`}>
                    <button className="px-4 py-3 bg-[#FFF8E1] text-[#FF8F00] hover:bg-[#FF8F00] hover:text-white rounded-[18px] text-xs font-black flex items-center space-x-1.5 transition-all">
                      <HelpCircle size={14} strokeWidth={2.5} />
                      <span>Kelola Kuis ({totalSoal})</span>
                    </button>
                  </Link>

                    <button 
                    onClick={() => handleDelete(m.id)} // 🌟 Panggil fungsi di sini
                    className="p-3 bg-[#FFEBEE] text-[#E53935] hover:bg-[#E53935] hover:text-white rounded-[16px] transition-colors" 
                    title="Hapus Bab">                    
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL POPUP TAMBAH KERANGKA BAB */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full border border-[#E8F5E9] shadow-2xl relative space-y-6">
            <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
            <div>
              <h3 className="text-xl font-black text-[#2E7D32]">Buat Bab Baru 🆕</h3>
              <p className="text-xs text-gray-400 font-medium">Tentukan nama atau topik besar materi bab yang akan diajarkan.</p>
            </div>

            <form onSubmit={handleCreateBab} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-[#2E7D32]/60 uppercase tracking-wider">Judul / Topik Bab</label>
                <input 
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Mengenal Ekosistem & Rantai Makanan"
                  className="w-full p-4 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[20px] font-bold text-[#2E7D32] outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm"
                />
              </div>

              {modalError && <p className="text-xs font-bold text-red-500">{modalError}</p>}

              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-500 font-bold rounded-[20px] text-sm hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-[#4CAF50] text-white font-black rounded-[20px] text-sm hover:bg-[#2E7D32] shadow-md transition-all flex items-center justify-center gap-1"
                >
                  {submitting ? "Memproses..." : "Tambahkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KelolaMateri() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 size={24} className="animate-spin text-[#4CAF50]" /></div>}>
      <KelolaMateriForm />
    </Suspense>
  );
}