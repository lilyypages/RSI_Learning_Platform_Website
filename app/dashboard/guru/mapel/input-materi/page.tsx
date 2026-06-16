"use client";
import React, { Suspense, useEffect, useState } from "react";
import { ChevronLeft, Save, Video, FileText, Plus, Trash2, Globe, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function InputMateriForm() {
  const searchParams = useSearchParams();
  const classSubjectId = searchParams.get("classSubjectId") ?? "";
  const materialId = searchParams.get("materialId") ?? ""; // 🌟 Mengambil ID Bab spesifik

  const [title, setTitle] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [poinMateri, setPoinMateri] = useState<string[]>([""]);
  
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // 🌟 Auto-fetch data bab yang sudah ada agar guru bisa melanjutkan pengisian data
  useEffect(() => {
    if (!materialId) return;
    setLoadingData(true);
    fetch(`/api/materials?classSubjectId=${classSubjectId}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.materials || [];
        const currentBab = list.find((m: any) => m.id === materialId);
        
        if (currentBab) {
          setTitle(currentBab.title);
          if (currentBab.contentText) {
            setPoinMateri(currentBab.contentText.split("\n"));
          }
          if (currentBab.videos && currentBab.videos.length > 0) {
            setEmbedUrl(currentBab.videos[0].embedUrl || "");
            setVideoTitle(currentBab.videos[0].title || "");
          }
        }
      })
      .catch((err) => console.error("Gagal mengambil detail Bab:", err))
      .finally(() => setLoadingData(false));
  }, [materialId, classSubjectId]);

  function updatePoin(i: number, val: string) {
    setPoinMateri(prev => prev.map((p, idx) => idx === i ? val : p));
  }
  function removePoin(i: number) {
    setPoinMateri(prev => prev.filter((_, idx) => idx !== i));
  }

async function handleSave() {
  setError("");
  setSaved(false);
  if (!title.trim()) { setError("Judul materi wajib diisi."); return; }
  if (!materialId) { setError("ID Bab tidak ditemukan."); return; } // 🌟 Validasi penting

  const contentText = poinMateri.filter(p => p.trim()).join("\n");

  setSaving(true);
  try {
    const res = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classSubjectId,
        materialId, // 🌟 PASTIKAN INI IKUT DIKIRIM KE BACKEND!
        title: title.trim(),
        contentText: contentText || null,
        embedUrl: embedUrl.trim() || undefined,
        videoTitle: videoTitle.trim() || title.trim(),
        difficulty: "MEDIUM",
      }),
    });
    
    const data = await res.json();
    if (res.ok && data.success) {
      setSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError(data.message ?? "Gagal menyimpan detail materi.");
    }
  } catch {
    setError("Koneksi gagal. Coba lagi.");
  } finally {
    setSaving(false);
  }
}

  if (loadingData) {
    return (
      <div className="flex flex-col h-64 items-center justify-center text-[#2E7D32] font-bold gap-2">
        <Loader2 className="animate-spin text-[#4CAF50]" />
        <span>Memuat data detail modul bab...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Link 
        href={`/dashboard/guru/mapel/kelola-materi?classSubjectId=${classSubjectId}`} 
        className="flex items-center text-[#2E7D32]/70 font-bold text-sm hover:text-[#2E7D32] w-fit transition-colors"
      >
        <ChevronLeft size={18} /> Kembali ke Daftar Bab
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
        <div>
          <h1 className="text-2xl font-black text-[#2E7D32]">Kelola Konten Materi 📝</h1>
          <p className="text-[#2E7D32]/60 text-sm font-medium">
            Lengkapi media pengajaran interaktif untuk Bab ini.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#4CAF50] hover:bg-[#2E7D32] disabled:opacity-60 text-white px-8 py-3 rounded-[24px] font-black flex items-center space-x-2 shadow-[0_8px_32px_rgba(76,175,80,0.15)] transition-all"
        >
          <Save size={18} />
          <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>

      {saved && (
        <div className="flex items-center space-x-3 p-4 bg-[#E8F5E9] border border-[#A5D6A7] rounded-[24px] text-[#2E7D32] font-bold">
          <CheckCircle2 size={20} />
          <span>Konten bab berhasil disinkronisasi ke siswa!</span>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-[#FFEBEE] border border-[#FFCDD2] rounded-[24px] text-[#E53935] font-bold text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Bagian Judul */}
        <div className="bg-white p-8 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.05)] space-y-4">
          <label className="block text-xs font-black text-[#2E7D32]/50 uppercase tracking-widest">Judul Bab / Materi *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Contoh: Bagaimana Tumbuhan Makan (Fotosintesis)"
            className="w-full p-4 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[24px] outline-none focus:ring-2 focus:ring-[#4CAF50] font-bold text-lg text-[#2E7D32] placeholder-[#2E7D32]/30"
          />
        </div>

        {/* Bagian Video */}
        <div className="bg-white p-8 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex items-center space-x-2 text-[#FF8F00] font-black uppercase tracking-widest text-xs">
            <Video size={18} />
            <span>Link Video Penjelasan (Opsional)</span>
          </div>
          <input
            type="text"
            value={videoTitle}
            onChange={e => setVideoTitle(e.target.value)}
            placeholder="Judul video penunjang"
            className="w-full p-4 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[24px] outline-none focus:ring-2 focus:ring-[#FF8F00]/50 font-medium text-[#2E7D32] placeholder-[#2E7D32]/30"
          />
          <div className="relative">
            <Globe className="absolute left-4 top-4 text-[#2E7D32]/40" size={20} />
            <input
              type="text"
              value={embedUrl}
              onChange={e => setEmbedUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full p-4 pl-12 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[24px] outline-none focus:ring-2 focus:ring-[#FF8F00] font-medium text-[#2E7D32] placeholder-[#2E7D32]/30"
            />
          </div>
        </div>

        {/* Bagian Poin Materi */}
        <div className="bg-white p-8 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.05)] space-y-6">
          <div className="flex items-center space-x-2 text-[#00897B] font-black uppercase tracking-widest text-xs">
            <FileText size={18} />
            <span>Rangkuman Materi Utama</span>
          </div>
          <div className="space-y-4">
            {poinMateri.map((poin, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#E0F2F1] text-[#00897B] rounded-full flex items-center justify-center font-black text-xs flex-shrink-0">
                  {i + 1}
                </div>
                <input
                  type="text"
                  value={poin}
                  onChange={e => updatePoin(i, e.target.value)}
                  placeholder={`Masukkan materi paragraf ke-${i + 1}...`}
                  className="flex-1 p-4 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[24px] outline-none focus:ring-2 focus:ring-[#00897B] font-medium text-[#2E7D32] placeholder-[#2E7D32]/30"
                />
                <button onClick={() => removePoin(i)} className="p-2 text-[#2E7D32]/30 hover:text-[#E53935] transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setPoinMateri(p => [...p, ""])}
              className="w-full py-4 border-2 border-dashed border-[#E8F5E9] rounded-[24px] text-[#2E7D32]/40 font-bold hover:border-[#4CAF50] hover:text-[#2E7D32] transition-all flex items-center justify-center space-x-2"
            >
              <Plus size={18} />
              <span>Tambah Baris Materi Baru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InputMateri() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 size={24} className="animate-spin text-[#4CAF50]" /></div>}>
      <InputMateriForm />
    </Suspense>
  );
}