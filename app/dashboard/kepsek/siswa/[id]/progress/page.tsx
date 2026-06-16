"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, BarChart3, BookOpen, CheckSquare, PlayCircle, 
  Trophy, Clock, Activity, AlertCircle, HelpCircle 
} from "lucide-react";

export default function LaporanProgressSiswa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/students/${id}/progress`);
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
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500">Menyusun statistik belajar siswa...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center max-w-xl mx-auto space-y-3 my-10">
        <AlertCircle size={36} className="text-red-500 mx-auto" />
        <h3 className="font-black text-lg text-slate-800">Laporan Gagal Dimuat</h3>
        <p className="text-sm text-red-600 font-semibold">{error}</p>
        <Link href={`/dashboard/kepsek/siswa/${id}`} className="inline-block px-4 py-2 bg-white border rounded-xl text-xs font-bold text-slate-700">
          Kembali ke Profil
        </Link>
      </div>
    );
  }

  const { student, subjectProgress, allQuizSessions, videoStats } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* HEADER LAPORAN */}
      <div className="space-y-1">
        <Link href={`/dashboard/kepsek/siswa/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition group w-fit">
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Kembali ke Profil Siswa
        </Link>
        <h1 className="text-3xl font-black text-slate-800 mt-1">Laporan Progress Akademik</h1>
        <p className="text-slate-500 font-medium">
          Memantau statistik materi, kuis, dan keaktifan belajar <strong className="text-indigo-600">{student?.user?.name}</strong> ({student?.class?.name || "Tanpa Kelas"}).
        </p>
      </div>

      {/* RINGKASAN CARD ANALITIK */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border p-5 rounded-3xl shadow-sm space-y-1">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
            <BookOpen size={14} className="text-indigo-500" /> Mapel Diikuti
          </span>
          <p className="text-3xl font-black text-slate-800">{subjectProgress?.length || 0}</p>
        </div>

        <div className="bg-white border p-5 rounded-3xl shadow-sm space-y-1">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
            <CheckSquare size={14} className="text-emerald-500" /> Total Tes Kuis
          </span>
          <p className="text-3xl font-black text-slate-800">{allQuizSessions?.length || 0}</p>
        </div>

        <div className="bg-white border p-5 rounded-3xl shadow-sm space-y-1">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
            <PlayCircle size={14} className="text-rose-500" /> Video Ditonton
          </span>
          <p className="text-3xl font-black text-slate-800">
            {videoStats?.completedCount} <span className="text-xs font-bold text-slate-400">/ {videoStats?.totalWatched}</span>
          </p>
        </div>

        <div className="bg-white border p-5 rounded-3xl shadow-sm space-y-1">
          <span className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
            <Trophy size={14} className="text-amber-500" /> Akumulasi Skor
          </span>
          <p className="text-3xl font-black text-indigo-600">{student?.totalPoints || 0}</p>
        </div>
      </div>

      {/* DETAIL PROGRESS MATA PELAJARAN LENGKAP */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Activity size={20} className="text-indigo-600" /> Laporan Kurikulum & Capaian Tingkat
        </h2>
        
        {subjectProgress?.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {subjectProgress.map((p: any) => (
              <div key={p.id} className="p-4 border rounded-2xl space-y-3 hover:shadow-sm transition bg-slate-50/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">{p.classSubject?.subject?.name}</h4>
                    <p className="text-xs text-slate-400 font-bold">{p.classSubject?.subject?.code}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    p.adaptiveLevel === "ADVANCED" ? "bg-purple-100 text-purple-700" :
                    p.adaptiveLevel === "STANDARD" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {p.adaptiveLevel || "BEGINNER"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Progress Kedalaman</span>
                    <span>{p.completionPercent || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${p.completionPercent || 0}%` }} />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 text-slate-400 font-semibold border-t border-slate-100 border-dashed">
                  <span>Skor Akumulasi: <strong className="text-slate-700">{p.totalScore || 0}</strong></span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> 
                    {p.lastActivity ? new Date(p.lastActivity).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">Belum ada progres rekaman materi kurikulum sekolah.</p>
        )}
      </div>

      {/* JURNAL RIWAYAT SELURUH KUIS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <CheckSquare size={20} className="text-emerald-600" /> Jurnal Riwayat Ujian & Kuis Keseluruhan
        </h2>

        {allQuizSessions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b text-slate-400 font-bold text-xs uppercase">
                  <th className="pb-3 font-black">Mata Pelajaran</th>
                  <th className="pb-3 font-black text-center">Akurasi Jawaban</th>
                  <th className="pb-3 font-black text-center">Rekomendasi Hasil</th>
                  <th className="pb-3 font-black text-center">Waktu Mulai</th>
                  <th className="pb-3 font-black text-right">Nilai Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium text-slate-700">
                {allQuizSessions.map((session: any) => (
                  <tr key={session.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 font-black text-slate-800">
                      Kuis {session.classSubject?.subject?.name || "Mata Pelajaran"}
                    </td>
                    <td className="py-3.5 text-center text-xs font-semibold">
                      <span className="text-emerald-600 font-bold">{session.correctCount} Benar</span>
                      <span className="mx-1 text-slate-300">/</span>
                      <span className="text-rose-500 font-bold">{session.wrongCount} Salah</span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded-lg font-bold text-slate-600">
                        {session.resultLevel || "STANDARD"}
                      </span>
                    </td>
                    <td className="py-3.5 text-center text-xs text-slate-400 font-semibold">
                      {session.startedAt ? new Date(session.startedAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}
                    </td>
                    <td className="py-3.5 text-right font-black text-lg text-indigo-600">
                      {session.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic py-2">Siswa belum memiliki riwayat pengerjaan ujian kuis mandiri.</p>
        )}
      </div>

    </div>
  );
}