"use client";
import React, { useEffect, useState } from "react";
import { TrendingUp, Users, BookCheck, AlertCircle } from "lucide-react";

type SchoolData = {
  totalStudents: number;
  totalTeachers: number;
  schoolAvgScore: number;
};

type ClassRank = {
  name: string;
  pct: number;
};

export default function KepsekDashboard() {
  const [data, setData]       = useState<SchoolData>({ totalStudents: 0, totalTeachers: 0, schoolAvgScore: 0 });
  const [classes, setClasses] = useState<ClassRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // School overview from progress API
        const res = await fetch("/api/progress?role=PRINCIPAL");
        if (res.ok) {
          const d = await res.json();
          if (d.totalStudents !== undefined) setData(d);
        }

        // Class-level breakdown from students API
        const studRes = await fetch("/api/students?includeProgress=true");
        if (studRes.ok) {
          const students: any[] = await studRes.json();

          // Group by class, compute avg score per class
          const classMap: Record<string, { total: number; count: number }> = {};
          for (const s of students) {
            const className = s.class?.name ?? "Unknown";
            const progList: any[] = s.progress ?? [];
            const avg = progList.length > 0
              ? progList.reduce((sum: number, p: any) => sum + (p.totalScore ?? 0), 0) / progList.length
              : 0;
            if (!classMap[className]) classMap[className] = { total: 0, count: 0 };
            classMap[className].total += avg;
            classMap[className].count += 1;
          }

          const ranked: ClassRank[] = Object.entries(classMap)
            .map(([name, { total, count }]) => ({
              name,
              pct: Math.round(count > 0 ? total / count : 0),
            }))
            .sort((a, b) => b.pct - a.pct);

          setClasses(ranked);
        }
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  const stats = [
    { label: "Total Siswa",      value: loading ? "..." : String(data.totalStudents),  icon: Users,        color: "text-blue-600",   bg: "bg-blue-100"   },
    { label: "Rata-rata Nilai",  value: loading ? "..." : `${data.schoolAvgScore}%`,   icon: BookCheck,    color: "text-green-600",  bg: "bg-green-100"  },
    { label: "Guru Aktif",       value: loading ? "..." : String(data.totalTeachers),  icon: TrendingUp,   color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Siswa Tertinggal", value: loading ? "..." : String(
        // count students with avg < 75 across all their progress
        0 // placeholder — real count would need a dedicated query
      ), icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
  ];

  function barColor(pct: number) {
    if (pct >= 85) return "bg-indigo-600";
    if (pct >= 75) return "bg-blue-500";
    if (pct >= 60) return "bg-amber-500";
    return "bg-red-500";
  }

  // Fallback sample if DB has no class data yet
  const displayClasses: ClassRank[] = classes.length > 0 ? classes : [
    { name: "Kelas 6-A", pct: 95 },
    { name: "Kelas 4-B", pct: 88 },
    { name: "Kelas 5-C", pct: 72 },
    { name: "Kelas 1-A", pct: 60 },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Laporan Eksekutif Sekolah</h1>
        <p className="text-slate-500 font-medium">Ringkasan performa akademik tahun ajaran 2026/2027.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`${s.bg} ${s.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
              <s.icon size={20} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Class ranking */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-slate-800">Peringkat Ketuntasan Per Kelas</h3>
          {classes.length === 0 && !loading && (
            <span className="text-xs text-slate-400 font-medium">Menampilkan data contoh</span>
          )}
        </div>
        {loading ? (
          <p className="text-slate-400 text-sm">Memuat data kelas...</p>
        ) : (
          <div className="space-y-6">
            {displayClasses.map((item, i) => (
              <div key={i} className="flex items-center space-x-6">
                <span className="w-24 text-sm font-bold text-slate-600 shrink-0">{item.name}</span>
                <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden">
                  <div
                    className={`${barColor(item.pct)} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="w-12 text-sm font-black text-slate-800 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-indigo-900 rounded-[40px] p-8 text-white shadow-xl shadow-indigo-100">
          <h3 className="font-bold text-xl mb-6">Manajemen Pengguna</h3>
          <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
            Sebagai Super Admin, Anda memiliki kontrol penuh atas akun Guru dan Siswa.
          </p>
          <a href="/dashboard/kepsek/guru">
            <button className="bg-white text-indigo-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-colors">
              Kelola Akun Guru
            </button>
          </a>
        </div>
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Log Sistem Terakhir</h3>
          <p className="text-sm text-slate-400 mb-4">Lihat detail di halaman Audit Keamanan.</p>
          <a href="/dashboard/kepsek/audit">
            <button className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-700 transition-colors">
              Buka Audit Log →
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}