"use client";
import React, { useState, useEffect } from "react";
import {
  Search, Filter, MessageSquare, AlertCircle,
  CheckCircle2, Users, TrendingUp, Eye, ChevronRight
} from "lucide-react";
 
// Types
type StudentRow = {
  id: string;
  name: string;
  avg: number;
  status: "Sangat Baik" | "Normal" | "Butuh Perhatian";
  completionPercent: number;
  adaptiveLevel: string;
};
 
// Helpers
function getStatus(avg: number): StudentRow["status"] {
  if (avg >= 85) return "Sangat Baik";
  if (avg >= 75) return "Normal";
  return "Butuh Perhatian";
}
 
function statusStyle(status: StudentRow["status"]) {
  if (status === "Butuh Perhatian") return "bg-rose-100 text-rose-600";
  if (status === "Sangat Baik")     return "bg-emerald-100 text-emerald-600";
  return "bg-blue-100 text-blue-600";
}
 
function barColor(avg: number) {
  if (avg >= 85) return "bg-emerald-500";
  if (avg >= 75) return "bg-blue-500";
  return "bg-rose-500";
}
 
// Fallback dummy data (shown klo API blm adadata)
const DUMMY: StudentRow[] = [
  { id: "1", name: "Talitha Sukma",  avg: 88, status: "Sangat Baik",      completionPercent: 90, adaptiveLevel: "ADVANCED"  },
  { id: "2", name: "Budi Santoso",   avg: 65, status: "Butuh Perhatian",  completionPercent: 45, adaptiveLevel: "REMEDIAL"  },
  { id: "3", name: "Citra Lestari",  avg: 95, status: "Sangat Baik",      completionPercent: 100, adaptiveLevel: "ADVANCED" },
  { id: "4", name: "Dimas Anggara",  avg: 72, status: "Normal",           completionPercent: 65, adaptiveLevel: "STANDARD"  },
];
 
// Component
export default function MonitoringSiswa() {
  const [students, setStudents]   = useState<StudentRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<"Semua" | StudentRow["status"]>("Semua");
  const [showFilter, setShowFilter] = useState(false);
 
  // Fetch dr real API, fallback ke dummy klo kosong/error
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/students?includeProgress=true");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
 
        if (Array.isArray(data) && data.length > 0) {
          const rows: StudentRow[] = data.map((s: any) => {
            const totalScore = s.progress?.reduce(
              (sum: number, p: any) => sum + (p.totalScore ?? 0), 0
            ) ?? 0;
            const count = s.progress?.length || 1;
            const avg   = Math.round(totalScore / count);
            return {
              id:               s.id,
              name:             s.user?.name ?? "—",
              avg,
              status:           getStatus(avg),
              completionPercent: s.progress?.[0]?.completionPercent ?? 0,
              adaptiveLevel:    s.progress?.[0]?.adaptiveLevel ?? "STANDARD",
            };
          });
          setStudents(rows);
        } else {
          // array kosong alih ke dummy
          setStudents(DUMMY);
        }
      } catch {
        // Network/API not ready alih ke dummy
        setStudents(DUMMY);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
 
  // Derived stats
  const total        = students.length;
  const needHelp     = students.filter(s => s.status === "Butuh Perhatian").length;
  const classAvg     = total
    ? (students.reduce((sum, s) => sum + s.avg, 0) / total).toFixed(1)
    : "—";
 
  const stats = [
    { label: "Total Siswa",      value: String(total),   icon: Users,      color: "text-blue-600",   bg: "bg-blue-100"   },
    { label: "Rata-rata Kelas",  value: classAvg,        icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Butuh Perhatian",  value: String(needHelp), icon: AlertCircle, color: "text-rose-600",  bg: "bg-rose-100"   },
  ];
 
  // List (kena filter)
  const visible = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Semua" || s.status === filter;
    return matchSearch && matchFilter;
  });
 
  // Render 
  return (
    <div className="space-y-8">
 
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4"
          >
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
 
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Monitoring Siswa 📊</h1>
          <p className="text-slate-500 text-sm font-medium">
            Data real-time perkembangan kemampuan adaptif siswa.
          </p>
        </div>
 
        <div className="flex space-x-3 w-full md:w-auto relative">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full md:w-72 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
            />
          </div>
 
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(v => !v)}
              className="bg-white border border-slate-200 p-3 rounded-2xl text-slate-600 hover:bg-slate-50 shadow-sm"
            >
              <Filter size={20} />
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 w-48 overflow-hidden">
                {(["Semua", "Sangat Baik", "Normal", "Butuh Perhatian"] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setFilter(opt); setShowFilter(false); }}
                    className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors
                      ${filter === opt ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400 font-bold">
            Memuat data siswa...
          </div>
        ) : visible.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400 font-bold">
            Tidak ada siswa ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {["Nama Siswa", "Status", "Rata-rata", "Progress", "Level Adaptif", "Aksi"].map(h => (
                    <th
                      key={h}
                      className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visible.map(s => (
                  <tr key={s.id} className="hover:bg-indigo-50/30 transition-all group">
 
                    {/* Name */}
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          {s.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{s.name}</span>
                      </div>
                    </td>
 
                    {/* Status badge */}
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${statusStyle(s.status)}`}>
                        {s.status === "Butuh Perhatian"
                          ? <AlertCircle size={12} />
                          : <CheckCircle2 size={12} />}
                        <span>{s.status}</span>
                      </span>
                    </td>
 
                    {/* Avg score */}
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-lg">{s.avg}%</span>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1">
                          <div
                            className={`h-full rounded-full ${barColor(s.avg)}`}
                            style={{ width: `${s.avg}%` }}
                          />
                        </div>
                      </div>
                    </td>
 
                    {/* Completion */}
                    <td className="px-8 py-5">
                      <span className="font-bold text-slate-600">
                        {Math.round(s.completionPercent)}%
                      </span>
                    </td>
 
                    {/* Adaptive level */}
                    <td className="px-8 py-5">
                      <span className={`text-xs font-black px-3 py-1 rounded-lg ${
                        s.adaptiveLevel === "ADVANCED"  ? "bg-indigo-100 text-indigo-700" :
                        s.adaptiveLevel === "REMEDIAL"  ? "bg-rose-100   text-rose-700"   :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {s.adaptiveLevel === "ADVANCED"  ? "Maju" :
                         s.adaptiveLevel === "REMEDIAL"  ? "Remedial" : "Standar"}
                      </span>
                    </td>
 
                    {/* Actions */}
                    <td className="px-8 py-5">
                      <div className="flex space-x-2">
                        <button className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm" title="Kirim Pesan">
                          <MessageSquare size={16} />
                        </button>
                        <button className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-200 rounded-2xl transition-all shadow-sm" title="Lihat Detail">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
 
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
 
      {/* Footer count */}
      {!loading && (
        <p className="text-xs text-slate-400 font-medium text-right">
          Menampilkan {visible.length} dari {total} siswa
        </p>
      )}
    </div>
  );
}
