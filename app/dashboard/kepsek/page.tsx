"use client";
import React, { useEffect, useState } from "react";
import { TrendingUp, Users, BookCheck, AlertCircle, BarChart3, Info } from "lucide-react";

export default function KepsekDashboard() {
  const [data, setData] = useState({ totalStudents: 0, totalTeachers: 0, schoolAvgScore: 0, classAverages: [] });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [progressRes, studentsRes] = await Promise.allSettled([
          fetch("/api/progress?role=PRINCIPAL"),
          fetch("/api/students?includeProgress=true")
        ]);

        if (progressRes.status === "fulfilled" && progressRes.value.ok) {
          const json = await progressRes.value.json();
          setData({
            totalStudents: json.totalStudents ?? 0,
            totalTeachers: json.totalTeachers ?? 0,
            schoolAvgScore: json.schoolAvgScore ?? 0,
            classAverages: json.classAverages ?? [],
          });
        }
        
        if (studentsRes.status === "fulfilled" && studentsRes.value.ok) {
          const res = await studentsRes.value.json();
          setClasses(res.students || []); 
        }
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 min-h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#E8F5E9] pb-6">
        <h1 className="text-3xl font-black text-[#2E7D32]">Laporan Eksekutif</h1>
        <p className="text-[#2E7D32]/60">Pantau performa akademik sekolah secara real-time.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Siswa", value: data.totalStudents, icon: Users, color: "text-[#2E7D32]" },
          { label: "Rata-rata Nilai", value: `${data.schoolAvgScore}%`, icon: BookCheck, color: "text-[#00897B]" },
          { label: "Total Guru", value: data.totalTeachers, icon: TrendingUp, color: "text-[#1976D2]" },
          { label: "Status Sistem", value: "Optimal", icon: AlertCircle, color: "text-[#E53935]" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-[#E8F5E9] shadow-sm hover:shadow-md transition-shadow">
            <s.icon className={`${s.color} mb-3`} size={24} />
            <p className="text-xs font-bold text-gray-400 uppercase">{s.label}</p>
            <p className="text-2xl font-black text-[#2E7D32]">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Area - Menggunakan flex-1 agar selalu memenuhi sisa ruang */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Peringkat Kelas (Lebih Lebar) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[24px] border border-[#E8F5E9] shadow-sm">
          <h3 className="font-black text-[#2E7D32] mb-6">Distribusi Nilai Per Kelas</h3>
          
          {loading ? (
             <div className="space-y-4 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-50 rounded-xl" />)}</div>
          ) : data.classAverages.length > 0 ? (
            <div className="space-y-5">
              {data.classAverages.map((c: { className: string; avgScore: number }) => {
                const barColor = c.avgScore >= 85 ? "from-[#4CAF50] to-[#2E7D32]" : c.avgScore >= 75 ? "from-[#00897B] to-[#004D40]" : "from-[#FF8F00] to-[#E65100]";
                return (
                  <div key={c.className} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-black text-[#2E7D32] truncate" title={c.className}>{c.className}</span>
                    <div className="flex-1 bg-[#E8F5E9] rounded-full h-8 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
                        style={{ width: `${Math.min(c.avgScore, 100)}%` }}
                      />
                    </div>
                    <span className="w-14 text-right text-sm font-black text-[#2E7D32]">{c.avgScore}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Info className="text-[#2E7D32]/20 mb-3" size={48} />
              <p className="text-[#2E7D32]/50 font-bold">Data Belum Tersedia</p>
              <p className="text-xs text-[#2E7D32]/40">Menunggu input nilai dari guru mapel.</p>
            </div>
          )}
        </div>

{/* Kolom Kanan: Fokus pada "Health Check" */}
<div className="flex flex-col gap-6">
  {/* Kartu Status Penilaian */}
  <div className="bg-gradient-to-br from-[#2E7D32] to-[#004D40] p-8 rounded-[24px] text-white shadow-lg">
    <h3 className="font-black text-lg mb-2">Pantauan Kinerja Guru</h3>
    <p className="text-[#E8F5E9]/80 text-sm mb-6">Pastikan seluruh guru telah memvalidasi nilai di akhir semester ini.</p>
    <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl">
      <span className="text-xs font-bold">Progress Validasi</span>
      <span className="font-black">82%</span>
    </div>
  </div>

  {/* Kartu Notifikasi Log */}
  <div className="bg-white p-6 rounded-[24px] border border-[#E8F5E9] shadow-sm">
    <h3 className="font-black text-[#2E7D32] mb-4">Aktivitas Terbaru</h3>
    <div className="space-y-4">
      {[
        { user: "Budi Santoso", action: "Mengunggah Nilai", time: "10 mnt lalu" },
        { user: "Admin", action: "Backup Database", time: "2 jam lalu" }
      ].map((log, i) => (
        <div key={i} className="flex items-start gap-3 text-xs border-b border-[#F4F9F4] pb-2">
          <div className="w-2 h-2 rounded-full bg-[#4CAF50] mt-1" />
          <div>
            <p className="font-bold text-[#2E7D32]">{log.user}</p>
            <p className="text-[#2E7D32]/50">{log.action} • {log.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
      </div>
      </div>
  );
}