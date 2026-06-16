"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, BarChart3, BookOpen, CheckSquare, PlayCircle, 
  Trophy, Clock, Activity, AlertCircle, MessageSquare
} from "lucide-react";

export default function LaporanProgressSiswaGuru({ params }: { params: Promise<{ monitoringId: string }> }) {
  // Mengambil id dari parameter dinamis (berfungsi sebagai monitoringId)
  const { monitoringId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Memanggil API progres belajar siswa berdasarkan monitoringId
        const res = await fetch(`/api/students/${monitoringId}/progress`);
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.message || "Gagal memuat analitik belajar.");
        setData(json);
      } catch (err: any) {
        setError(err.message || "Gagal menyambung ke server.");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [monitoringId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-9 h-9 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#2E7D32]/60">Menyusun statistik belajar siswa...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[24px] p-6 text-center max-w-xl mx-auto space-y-3 my-10">
        <AlertCircle size={36} className="text-red-500 mx-auto" />
        <h3 className="font-black text-lg text-slate-800">Laporan Gagal Dimuat</h3>
        <p className="text-sm text-red-600 font-semibold">{error}</p>
        <Link href="/dashboard/guru/monitoring" className="inline-block px-4 py-2 bg-white border border-[#E8F5E9] rounded-xl text-xs font-bold text-[#2E7D32] shadow-sm">
          Kembali ke Tabel Monitoring
        </Link>
      </div>
    );
  }

  const { student, subjectProgress, allQuizSessions, videoStats } = data;

  return (
    <div className="space-y-6 max-w-full pb-12">
      
      {/* HEADER LAPORAN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <Link href="/dashboard/guru/monitoring" className="flex items-center gap-2 text-[#2E7D32]/60 hover:text-[#2E7D32] text-sm font-bold transition group w-fit">
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            Kembali ke Tabel Monitoring
          </Link>
          <h1 className="text-2xl font-black text-[#2E7D32] tracking-tight">Laporan Perkembangan Siswa 📊</h1>
          <p className="text-[#2E7D32]/70 text-sm font-medium">
            Memantau statistik materi, kuis, dan keaktifan belajar dari <strong className="text-[#4CAF50]">{student?.user?.name}</strong> ({student?.class?.name || "Tanpa Kelas"}).
          </p>
        </div>

        {/* Akses Pintas ke Ruang Chat */}
        <Link 
          href={`/dashboard/guru/chat?targetUserId=${student?.userId}`}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white rounded-[20px] text-sm font-black transition-all shadow-sm"
        >
          <MessageSquare size={16} />
          <span>Hubungi Siswa</span>
        </Link>
      </div>

      {/* RINGKASAN CARD ANALITIK */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E8F5E9] p-5 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.05)] space-y-1">
          <span className="text-[#2E7D32]/60 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={14} className="text-[#4CAF50]" /> Mapel Diikuti
          </span>
          <p className="text-3xl font-black text-[#2E7D32]">{subjectProgress?.length || 0}</p>
        </div>

        <div className="bg-white border border-[#E8F5E9] p-5 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.05)] space-y-1">
          <span className="text-[#2E7D32]/60 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare size={14} className="text-[#00897B]" /> Total Tes Kuis
          </span>
          <p className="text-3xl font-black text-[#2E7D32]">{allQuizSessions?.length || 0}</p>
        </div>

        <div className="bg-white border border-[#E8F5E9] p-5 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.05)] space-y-1">
          <span className="text-[#2E7D32]/60 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <PlayCircle size={14} className="text-[#FF8F00]" /> Video Ditonton
          </span>
          <p className="text-3xl font-black text-[#2E7D32]">
            {videoStats?.completedCount} <span className="text-xs font-bold text-[#2E7D32]/40">/ {videoStats?.totalWatched}</span>
          </p>
        </div>

        <div className="bg-white border border-[#E8F5E9] p-5 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.05)] space-y-1">
          <span className="text-[#2E7D32]/60 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <Trophy size={14} className="text-[#E53935]" /> Akumulasi Skor
          </span>
          <p className="text-3xl font-black text-[#4CAF50]">{student?.totalPoints || 0}</p>
        </div>
      </div>

      {/* DETAIL PROGRESS MATA PELAJARAN LENGKAP */}
      <div className="bg-white border border-[#E8F5E9] rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.05)] space-y-4">
        <h2 className="text-lg font-black text-[#2E7D32] flex items-center gap-2">
          <Activity size={20} className="text-[#4CAF50]" /> Capaian Kurikulum & Level Adaptif
        </h2>
        
        {subjectProgress?.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {subjectProgress.map((p: any) => (
              <div key={p.id} className="p-4 border border-[#E8F5E9] rounded-2xl space-y-3 hover:bg-[#FFFBF0]/40 transition bg-[#E8F5E9]/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-[#2E7D32] text-sm">{p.classSubject?.subject?.name}</h4>
                    <p className="text-[10px] text-[#2E7D32]/50 font-black tracking-wider uppercase">{p.classSubject?.subject?.code}</p>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${
                    p.adaptiveLevel === "ADVANCED" ? "bg-[#E3F2FD] text-[#1976D2]" :
                    p.adaptiveLevel === "REMEDIAL" ? "bg-[#FFEBEE] text-[#E53935]" : "bg-[#E8F5E9] text-[#2E7D32]"
                  }`}>
                    {p.adaptiveLevel === "ADVANCED" ? "Maju" : p.adaptiveLevel === "REMEDIAL" ? "Remedial" : "Standar"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#2E7D32]/70">
                    <span>Progres Penguasaan</span>
                    <span>{p.completionPercent || 0}%</span>
                  </div>
                  <div className="w-full bg-[#E8F5E9] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#4CAF50] h-full rounded-full transition-all" style={{ width: `${p.completionPercent || 0}%` }} />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 text-[#2E7D32]/50 font-bold border-t border-[#E8F5E9] border-dashed">
                  <span>Skor Mapel: <strong className="text-[#2E7D32]">{p.totalScore || 0}</strong></span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock size={12} /> 
                    {p.lastActivity ? new Date(p.lastActivity).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#2E7D32]/50 italic">Belum ada progres rekaman materi kurikulum sekolah.</p>
        )}
      </div>

      {/* JURNAL RIWAYAT SELURUH KUIS */}
      <div className="bg-white border border-[#E8F5E9] rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.05)] space-y-4">
        <h2 className="text-lg font-black text-[#2E7D32] flex items-center gap-2">
          <CheckSquare size={20} className="text-[#00897B]" /> Lembar Jurnal Evaluasi & Riwayat Kuis
        </h2>

        {allQuizSessions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#E8F5E9] text-[#2E7D32]/50 font-black text-[11px] uppercase tracking-wider">
                  <th className="pb-3">Mata Pelajaran</th>
                  <th className="pb-3 text-center">Akurasi Jawaban</th>
                  <th className="pb-3 text-center">Rekomendasi Hasil</th>
                  <th className="pb-3 text-center">Waktu Pengerjaan</th>
                  <th className="pb-3 text-right">Nilai Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8F5E9]/30 font-medium text-[#2E7D32]/80">
                {allQuizSessions.map((session: any) => (
                  <tr key={session.id} className="hover:bg-[#FFFBF0]/60 transition-colors">
                    <td className="py-3.5 font-black text-[#2E7D32]">
                      Kuis {session.classSubject?.subject?.name || "Mata Pelajaran"}
                    </td>
                    <td className="py-3.5 text-center text-xs font-bold">
                      <span className="text-[#00897B]">{session.correctCount} Benar</span>
                      <span className="mx-1 text-[#2E7D32]/30">/</span>
                      <span className="text-[#E53935]">{session.wrongCount} Salah</span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-black uppercase ${
                        session.resultLevel === "ADVANCED" ? "bg-[#E3F2FD] text-[#1976D2]" :
                        session.resultLevel === "REMEDIAL" ? "bg-[#FFEBEE] text-[#E53935]" : "bg-[#E8F5E9] text-[#2E7D32]"
                      }`}>
                        {session.resultLevel === "ADVANCED" ? "Maju" : session.resultLevel === "REMEDIAL" ? "Remedial" : "Standar"}
                      </span>
                    </td>
                    <td className="py-3.5 text-center text-xs text-[#2E7D32]/60 font-bold">
                      {session.startedAt ? new Date(session.startedAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}
                    </td>
                    <td className="py-3.5 text-right font-black text-lg text-[#4CAF50]">
                      {session.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#2E7D32]/50 italic py-2">Siswa belum memiliki riwayat pengerjaan ujian kuis mandiri.</p>
        )}
      </div>

    </div>
  );
}