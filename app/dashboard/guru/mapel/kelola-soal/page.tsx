"use client";
import React, { Suspense, useEffect, useState } from "react";
import { ChevronLeft, Plus, Brain, Trash2, Edit3, CheckCircle, X, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Question = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
};

const LEVEL_LABEL: Record<string, string> = { EASY: "Mudah", MEDIUM: "Sedang", HARD: "Sulit" };

// Mengubah warna label tingkat kesulitan sesuai palet baru
const LEVEL_COLOR: Record<string, string> = {
  EASY:   "bg-[#E8F5E9] text-[#2E7D32]",  // Green Light & Dark
  MEDIUM: "bg-[#FFF8E1] text-[#FF8F00]",  // Orange Light & Dark
  HARD:   "bg-[#FFEBEE] text-[#E53935]",  // Red Light & Dark
};

// Mengubah warna indikator bar samping / progress
const LEVEL_BAR: Record<string, string> = {
  EASY: "bg-[#4CAF50]",   // Green
  MEDIUM: "bg-[#FF8F00]", // Orange
  HARD: "bg-[#E53935]",   // Red
};

function KelolaSoalForm() {
  const searchParams   = useSearchParams();
  const materialId     = searchParams.get("materialId") ?? "";
  const classSubjectId = searchParams.get("classSubjectId") ?? "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  // Form state
  const [qText, setQText]         = useState("");
  const [opts, setOpts]           = useState(["","","",""]);
  const [correct, setCorrect]     = useState("A");
  const [diff, setDiff]           = useState("MEDIUM");

  useEffect(() => {
    if (!materialId) { setLoading(false); return; }
    fetch(`/api/questions?materialId=${materialId}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setQuestions(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [materialId]);

  const counts = {
    EASY:   questions.filter(q => q.difficulty === "EASY").length,
    MEDIUM: questions.filter(q => q.difficulty === "MEDIUM").length,
    HARD:   questions.filter(q => q.difficulty === "HARD").length,
  };
  const CAPS = { EASY: 10, MEDIUM: 25, HARD: 15 };

async function handleSave() {
  setError("");
  if (!qText.trim()) { setError("Teks pertanyaan wajib diisi."); return; }
  if (opts.some(o => !o.trim())) { setError("Semua 4 pilihan jawaban wajib diisi."); return; }
  if (!materialId) { setError("materialId tidak ditemukan."); return; }
  if (counts[diff as keyof typeof counts] >= CAPS[diff as keyof typeof CAPS]) {
    setError(`Kapasitas soal ${LEVEL_LABEL[diff]} untuk bab ini sudah penuh.`); return;
  }

  const targetIndex = ["A", "B", "C", "D"].indexOf(correct);
  const selectedAnswerText = opts[targetIndex] ? opts[targetIndex].trim() : "";

  if (!selectedAnswerText) {
    setError("Kunci jawaban terpilih tidak boleh kosong.");
    return;
  }

  setSaving(true);
  try {
    const res = await fetch(`/api/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        materialId,
        questionText:  qText.trim(),
        options:       opts.map(o => o.trim()),
        correctAnswer: selectedAnswerText, // Mengirim teks jawaban (misal: "Jakarta") ke backend
        difficulty:    diff,
        orderIndex:    questions.length + 1,
      }),
    });
    
    if (!res.ok) {
      // Menangani error jika respons bukan JSON murni (seperti 405 HTML atau 500 Server Error)
      let errorMessage = `Server merespon dengan status ${res.status}.`;
      try {
        const data = await res.json();
        errorMessage = data.message || errorMessage;
      } catch {
        const textError = await res.text();
        console.error("Server murni string error:", textError);
      }
      setError(errorMessage);
      return;
    }

    const data = await res.json();
    // Memastikan kecocokan struktur data response dari backend
    if (data.success || data.question) {
      const newQuestion = data.question ?? data;
      setQuestions(prev => [...prev, newQuestion]);
      setShowForm(false);
      // Reset form ke kondisi semula
      setQText(""); 
      setOpts(["", "", "", ""]); 
      setCorrect("A"); 
      setDiff("MEDIUM");
    } else {
      setError(data.message ?? "Gagal menyimpan soal.");
    }
  } catch (err) {
    console.error("Eror submit kuis:", err);
    setError("Koneksi gagal atau format data salah. Coba lagi.");
  } finally {
    setSaving(false);
  }
}

async function handleDelete(id: string) {
  if (!confirm("Apakah Anda yakin ingin menghapus soal ini?")) return;
  try {
    // Menembak tepat ke endpoint dynamic route /api/questions/[questionId]
    const res = await fetch(`/api/questions/${id}`, { 
      method: "DELETE" 
    });
    
    // 🌟 PERBAIKAN BUG: Harus dicek res.ok dulu sebelum menghapus dari layar (state UI)
    if (res.ok) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    } else {
      let msg = "Gagal menghapus soal dari server.";
      try {
        const data = await res.json();
        msg = data.message || msg;
      } catch {}
      alert(msg);
    }
  } catch (err) {
    console.error("Eror saat menghapus soal:", err);
    alert("Koneksi gagal. Coba lagi.");
  }
}

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Mengubah warna link kembali ke hijau tua */}
      <Link href={`/dashboard/guru/mapel/kelola-materi?classSubjectId=${classSubjectId}`} className="flex items-center text-[#2E7D32]/70 font-bold text-sm hover:text-[#2E7D32] w-fit transition-colors">
        <ChevronLeft size={18} /> Kembali
      </Link>

      <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        <div>
          <h1 className="text-2xl font-black text-[#2E7D32]">Bank Soal Adaptif 🧠</h1>
          <p className="text-[#2E7D32]/60 text-sm font-medium">
            {materialId ? `Material ID: ${materialId.slice(0,8)}...` : "Pilih materi dari halaman Mapel"}
          </p>
        </div>
        {/* Tombol Buat Soal Baru menggunakan --green (#4CAF50) atau --red ketika batal */}
        <button
          onClick={() => setShowForm(v => !v)}
          className={`text-white px-6 py-3 rounded-[24px] font-black flex items-center space-x-2 shadow-md transition-all ${
            showForm 
              ? "bg-[#E53935] hover:bg-[#C62828]" 
              : "bg-[#4CAF50] hover:bg-[#2E7D32] shadow-[0_8px_32px_rgba(76,175,80,0.15)]"
          }`}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          <span>{showForm ? "Batal" : "Buat Soal Baru"}</span>
        </button>
      </div>

      {/* Adaptive stats bar - Diubah dari gradient indigo ke gradient kombinasi Green & Teal */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#00897B] p-8 rounded-[24px] text-white flex items-center justify-between shadow-[0_8px_32px_rgba(46,125,50,0.2)]">
        <div className="space-y-1">
          <h4 className="text-lg font-black flex items-center space-x-2">
            <Brain size={24} /><span>Mode Adaptif Aktif</span>
          </h4>
          <p className="text-[#E8F5E9] text-sm opacity-90 max-w-md">
            Mudah → Sedang → Sulit (maks: 10/25/15 soal)
          </p>
        </div>
        <div className="hidden md:flex space-x-8">
          {(["EASY","MEDIUM","HARD"] as const).map(lv => (
            <div key={lv} className="text-center">
              <p className="text-2xl font-black">{counts[lv]}<span className="text-sm opacity-60">/{CAPS[lv]}</span></p>
              <p className="text-[10px] uppercase tracking-wider font-black opacity-75">{LEVEL_LABEL[lv]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* New question form */}
      {showForm && (
        <div className="bg-white p-8 rounded-[24px] border-2 border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.1)] space-y-6">
          <h3 className="font-black text-[#2E7D32] text-lg">Buat Soal Baru</h3>

          <div>
            <label className="text-xs font-black text-[#2E7D32]/50 uppercase tracking-widest block mb-2">Teks Pertanyaan *</label>
            <textarea
              value={qText} onChange={e => setQText(e.target.value)}
              rows={3} placeholder="Tulis pertanyaan di sini..."
              className="w-full p-4 bg-[#FFFBF0] rounded-[24px] outline-none focus:ring-2 focus:ring-[#4CAF50] font-medium text-[#2E7D32] border border-[#E8F5E9]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["A","B","C","D"].map((ltr, i) => (
              <div key={ltr} className="flex items-center space-x-3">
                {/* Badge huruf pilihan jawaban */}
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${
                  correct === ltr ? "bg-[#4CAF50] text-white" : "bg-[#E8F5E9] text-[#2E7D32]/70"
                }`}>{ltr}</span>
                <input
                  type="text" value={opts[i]} onChange={e => setOpts(o => o.map((v,j) => j===i ? e.target.value : v))}
                  placeholder={`Pilihan ${ltr}`}
                  className="flex-1 p-3 bg-[#FFFBF0] rounded-[24px] outline-none focus:ring-2 focus:ring-[#4CAF50]/50 font-medium text-[#2E7D32] border border-[#E8F5E9]"
                />
                <button onClick={() => setCorrect(ltr)} className={`text-sm font-black px-2 py-1 rounded-lg transition-colors ${correct === ltr ? "text-[#2E7D32]" : "text-[#2E7D32]/30 hover:text-[#2E7D32]"}`}>
                  ✓
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-xs font-black text-[#2E7D32]/50 uppercase tracking-widest">Tingkat Kesulitan:</label>
            {(["EASY","MEDIUM","HARD"] as const).map(lv => (
              <button key={lv} onClick={() => setDiff(lv)}
                className={`px-4 py-2 rounded-[24px] text-xs font-black transition-all ${diff === lv ? LEVEL_COLOR[lv] : "bg-[#E8F5E9]/50 text-[#2E7D32]/40"}`}>
                {LEVEL_LABEL[lv]}
              </button>
            ))}
          </div>

          {error && <p className="text-[#E53935] font-bold text-sm">{error}</p>}

          <button onClick={handleSave} disabled={saving}
            className="flex items-center space-x-2 bg-[#4CAF50] hover:bg-[#2E7D32] text-white px-8 py-3 rounded-[24px] font-black disabled:opacity-60 transition-all shadow-md">
            <Save size={18} />
            <span>{saving ? "Menyimpan..." : "Simpan Soal"}</span>
          </button>
        </div>
      )}

      {/* Question list */}
      {loading ? (
        <p className="text-[#2E7D32]/50 text-center py-12 font-medium">Memuat soal...</p>
      ) : questions.length === 0 ? (
        <p className="text-[#2E7D32]/50 text-center py-12 font-medium">Belum ada soal. Klik "Buat Soal Baru" untuk mulai.</p>
      ) : (
        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id} className="bg-white p-8 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:border-[#4CAF50] transition-all relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${LEVEL_BAR[q.difficulty] ?? "bg-[#E8F5E9]"}`} />
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${LEVEL_COLOR[q.difficulty] ?? ""}`}>
                    Level {LEVEL_LABEL[q.difficulty] ?? q.difficulty}
                  </span>
                  <h4 className="text-xl font-bold text-[#2E7D32] leading-tight">
                    <span className="text-[#2E7D32]/30 mr-2">Q:</span>{q.questionText}
                  </h4>
                  {/* Status Jawaban menggunakan basis warna Teal lembut */}
                  <div className="flex items-center space-x-2 text-sm text-[#00897B] font-bold bg-[#E0F2F1] w-fit px-3 py-1 rounded-lg">
                    <CheckCircle size={14} />
                    <span>Jawaban: {q.correctAnswer}</span>
                  </div>
                </div>
                <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 justify-end">
                  {/* Tombol Aksi menggunakan Orange Lembut untuk Edit, dan Red Lembut untuk Delete */}
                  <button className="p-4 bg-[#FFF8E1] text-[#FF8F00] hover:bg-[#FF8F00] hover:text-white rounded-[16px] transition-all">
                    <Edit3 size={20} />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-4 bg-[#FFEBEE] text-[#E53935] hover:bg-[#E53935] hover:text-white rounded-[16px] transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function KelolaSoal() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 size={24} className="animate-spin text-[#4CAF50]" /></div>}>
      <KelolaSoalForm />
    </Suspense>
  );
}