"use client";
import React, { useEffect, useState } from "react";
import { TrendingUp, Calendar, Target, Award } from "lucide-react";

type ProgressItem = {
  subject: string;
  subjectName?: string; // Fallback jika key API menggunakan subjectName
  totalScore: number;
  completionPercent: number;
  adaptiveLevel: string;
};

export default function GrafikKemajuan() {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then(r => r.json())
      .then(data => {
        // Mendukung array langsung atau objek bertipe { progress: [...] }
        if (Array.isArray(data)) {
          setProgress(data);
        } else if (data && Array.isArray(data.progress)) {
          setProgress(data.progress);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgScore = progress.length
    ? Math.round(progress.reduce((s, p) => s + (p.totalScore ?? 0), 0) / progress.length)
    : 0;

  const predikat = avgScore >= 85 ? "Sangat Baik" : avgScore >= 75 ? "Baik" : "Perlu Perhatian";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Halaman */}
      <header>
        <h1 className="text-3xl font-black text-[#2E7D32] tracking-tight">Grafik Kemajuan Belajar 📈</h1>
        <p className="text-[#2E7D32]/60 font-bold text-sm mt-1">Visualisasi capaian kompetensi akademik berdasarkan riwayat kuis adaptif anak.</p>
      </header>

      {/* Grid Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Target KKM",  value: "75",             icon: Target,     bg: "bg-[#E0F2F1]", color: "text-[#00897B]" }, // Teal
          { label: "Rata-rata",   value: loading ? "..." : `${avgScore}`, icon: TrendingUp, bg: "bg-[#E8F5E9]", color: "text-[#2E7D32]" }, // Green
          { label: "Predikat",    value: loading ? "..." : predikat,  icon: Award,     bg: "bg-[#FFFBF0]", color: "text-[#FF8F00]" }, // Amber/Orange
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_24px_rgba(0,0,0,0.02)] flex items-center space-x-4">
            <div className={`p-4 ${s.bg} ${s.color} rounded-[16px] shrink-0`}><s.icon size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-[#2E7D32]/50 uppercase tracking-widest">{s.label}</p>
              <p className="text-xl font-black text-[#2E7D32] mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grafik Batang Kompetensi */}
      <div className="bg-white p-8 md:p-10 rounded-[24px] border border-[#E8F5E9] shadow-[0_12px_32px_rgba(0,0,0,0.03)]">
        <h3 className="font-black text-[#2E7D32] text-lg mb-8 flex items-center space-x-3">
          <Calendar size={20} className="text-[#00897B]" />
          <span>Progress Per Mata Pelajaran</span>
        </h3>

        {loading ? (
          <div className="text-center py-12 space-y-3">
            <div className="animate-spin w-8 h-8 border-4 border-[#4CAF50] border-t-transparent rounded-full mx-auto" />
            <p className="text-[#2E7D32]/40 font-bold text-sm">Memuat grafik kompetensi...</p>
          </div>
        ) : progress.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#2E7D32]/40 font-black text-sm">Belum ada rekaman kuis yang tersedia.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {progress.map((p, i) => {
              const score = p.totalScore ?? 0;
              const subjectLabel = p.subject || p.subjectName || "Mata Pelajaran";
              
              // Penentuan warna bar sesuai performa nilai
              const barColor = score >= 85 ? "bg-[#4CAF50]" : score >= 75 ? "bg-[#00897B]" : "bg-[#FF8F00]";

              return (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                  {/* Label Mapel */}
                  <span className="w-full sm:w-40 text-sm font-black text-[#2E7D32]/80 truncate">
                    {subjectLabel}
                  </span>
                  
                  {/* Container Progress Bar */}
                  <div className="flex-1 bg-[#FFFBF0] border border-[#E8F5E9] h-5 rounded-full overflow-hidden p-[2px] relative flex items-center">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                    {/* Garis bantu penanda KKM 75% secara absolut di dalam bar */}
                    <div 
                      className="absolute top-0 bottom-0 border-l border-dashed border-[#00897B]/30 pointer-events-none"
                      style={{ left: "75%" }}
                      title="Garis Batas KKM (75)"
                    />
                  </div>
                  
                  {/* Angka Nilai */}
                  <span className={`w-12 text-right text-sm font-black ${score >= 75 ? "text-[#2E7D32]" : "text-[#FF8F00]"}`}>
                    {score}%
                  </span>
                </div>
              );
            })}

            {/* Keterangan Tambahan di Bawah Grafik */}
            <div className="pt-6 border-t border-[#E8F5E9] flex flex-wrap gap-4 items-center justify-between text-[11px] font-bold text-[#2E7D32]/50">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 bg-[#4CAF50] rounded-sm" />
                  <span>Sangat Baik (≥85)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 bg-[#00897B] rounded-sm" />
                  <span>Tuntas (75-84)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 bg-[#FF8F00] rounded-sm" />
                  <span>Perlu Pendampingan (&lt;75)</span>
                </div>
              </div>
              <p className="italic text-[#00897B]">Garis putus-putus menunjukkan batas ketuntasan minimum (KKM)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
