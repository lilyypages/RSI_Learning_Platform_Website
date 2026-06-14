"use client";
import React, { useState, useEffect } from "react";
import {
  Search, Filter, MessageSquare, AlertCircle,
  CheckCircle2, Users, TrendingUp, Eye
} from "lucide-react";
 
// Types sesuai dengan data terproses dari Prisma Schema
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
  if (status === "Butuh Perhatian") return "bg-[#FFEBEE] text-[#C62828]";
  if (status === "Sangat Baik")     return "bg-[#E0F2F1] text-[#00695C]";
  return "bg-[#E8F5E9] text-[#2E7D32]";
}
 
function barColor(avg: number) {
  if (avg >= 85) return "bg-[#00897B]";
  if (avg >= 75) return "bg-[#4CAF50]";
  return "bg-[#E53935]";
}
 
// Fallback dummy data jika API kosong/error
const DUMMY: StudentRow[] = [
  { id: "1", name: "Talitha Sukma",  avg: 88, status: "Sangat Baik",      completionPercent: 90, adaptiveLevel: "ADVANCED"  },
  { id: "2", name: "Budi Santoso",   avg: 65, status: "Butuh Perhatian",  completionPercent: 45, adaptiveLevel: "REMEDIAL"  },
  { id: "3", name: "Citra Lestari",  avg: 95, status: "Sangat Baik",      completionPercent: 100, adaptiveLevel: "ADVANCED" },
  { id: "4", name: "Dimas Anggara",  avg: 72, status: "Normal",           completionPercent: 65, adaptiveLevel: "STANDARD"  },
];
 
export default function MonitoringSiswa() {
  const [students, setStudents]   = useState<StudentRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<"Semua" | StudentRow["status"]>("Semua");
  const [showFilter, setShowFilter] = useState(false);
 
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/students?includeProgress=true");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
 
        if (Array.isArray(data) && data.length > 0) {
          const rows: StudentRow[] = data.map((s: any) => {
            const progressArray = s.progress || [];
            const count = progressArray.length;
 
            // 1. Hitung rata-rata totalScore dari StudentProgress[]
            const totalScore = progressArray.reduce(
              (sum: number, p: any) => sum + (p.totalScore ?? 0), 0
            );
            const avg = count > 0 ? Math.round(totalScore / count) : 0;
 
            // 2. Hitung rata-rata completionPercent (Prisma Real/Float)
            const totalCompletion = progressArray.reduce(
              (sum: number, p: any) => sum + (p.completionPercent ?? 0), 0
            );
            const completionPercent = count > 0 ? Math.round(totalCompletion / count) : 0;
 
            // 3. Ambil adaptiveLevel terakhir dari array progress
            const adaptiveLevel = count > 0 
              ? progressArray[count - 1]?.adaptiveLevel ?? "STANDARD"
              : "STANDARD";
 
            return {
              id: s.id,
              name: s.user?.name ?? "—", // Sesuai relasi model Student ke User
              avg,
              status: getStatus(avg),
              completionPercent,
              adaptiveLevel,
            };
          });
 
          // Urutkan peringkat berdasarkan rata-rata nilai tertinggi ke terendah
          rows.sort((a, b) => b.avg - a.avg);
 
          setStudents(rows);
        } else {
          setStudents(DUMMY.sort((a, b) => b.avg - a.avg));
        }
      } catch (err) {
        console.error(err);
        setStudents(DUMMY.sort((a, b) => b.avg - a.avg));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
 
  const total        = students.length;
  const needHelp     = students.filter(s => s.status === "Butuh Perhatian").length;
  const classAvg     = total
    ? (students.reduce((sum, s) => sum + s.avg, 0) / total).toFixed(1)
    : "—";
 
  const stats = [
    { label: "Total Siswa",      value: String(total),     icon: Users,       color: "text-[#2E7D32]",   bg: "bg-[#E8F5E9]"   },
    { label: "Rata-rata Kelas",  value: classAvg,         icon: TrendingUp, color: "text-[#FF8F00]", bg: "bg-[#FFF8E1]" },
    { label: "Butuh Perhatian",  value: String(needHelp), icon: AlertCircle, color: "text-[#E53935]",   bg: "bg-[#FFEBEE]"   },
  ];
 
  const visible = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Semua" || s.status === filter;
    return matchSearch && matchFilter;
  });
 
  return (
    <div className="space-y-8">
 
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex items-center space-x-4"
          >
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-[#2E7D32]/60 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-[#2E7D32]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
 
      {/* Header & Search/Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#2E7D32] tracking-tight">Monitoring Siswa 📊</h1>
          <p className="text-[#2E7D32]/70 text-sm font-medium">
            Data real-time perkembangan kemampuan adaptif siswa dari database.
          </p>
        </div>
 
        <div className="flex space-x-3 w-full md:w-auto relative">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-3 text-[#2E7D32]/40" size={18} />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-[#E8F5E9] rounded-[24px] text-sm w-full md:w-72 text-[#2E7D32] placeholder-[#2E7D32]/40 focus:ring-4 focus:ring-[#4CAF50]/10 outline-none transition-all font-medium shadow-sm"
            />
          </div>
 
          <div className="relative">
            <button
              onClick={() => setShowFilter(v => !v)}
              className="bg-white border border-[#E8F5E9] p-3 rounded-[24px] text-[#2E7D32] hover:bg-[#E8F5E9] shadow-sm transition-colors"
            >
              <Filter size={20} />
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 bg-white border border-[#E8F5E9] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] z-10 w-48 overflow-hidden">
                {(["Semua", "Sangat Baik", "Normal", "Butuh Perhatian"] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setFilter(opt); setShowFilter(false); }}
                    className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors
                      ${filter === opt ? "bg-[#E8F5E9] text-[#2E7D32]" : "text-[#2E7D32]/80 hover:bg-[#FFFDE7]/50"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* Students Data Table */}
      <div className="bg-white rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#2E7D32]/50 font-bold">
            Memuat data siswa dari database...
          </div>
        ) : visible.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-[#2E7D32]/50 font-bold">
            Tidak ada siswa ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#E8F5E9]/50 border-b border-[#E8F5E9]">
                  {["Peringkat", "Nama Siswa", "Status", "Rata-rata", "Progress", "Level Adaptif", "Aksi"].map(h => (
                    <th
                      key={h}
                      className="px-8 py-5 text-[11px] font-black text-[#2E7D32]/60 uppercase tracking-[0.2em]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8F5E9]/50">
                {visible.map((s, index) => (
                  <tr key={s.id} className="hover:bg-[#FFFBF0] transition-all group">
                    
                    {/* Urutan Peringkat berdasarkan sorting nilai */}
                    <td className="px-8 py-5 font-black text-[#2E7D32]/60 text-sm">
                      #{index + 1}
                    </td>
 
                    {/* Nama Siswa */}
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#E8F5E9] rounded-full flex items-center justify-center font-black text-[#2E7D32] group-hover:bg-[#4CAF50] group-hover:text-white transition-colors">
                          {s.name.charAt(0)}
                        </div>
                        <span className="font-bold text-[#2E7D32]">{s.name}</span>
                      </div>
                    </td>
 
                    {/* Status Badge */}
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${statusStyle(s.status)}`}>
                        {s.status === "Butuh Perhatian"
                          ? <AlertCircle size={12} />
                          : <CheckCircle2 size={12} />}
                        <span>{s.status}</span>
                      </span>
                    </td>
 
                    {/* Rata-rata Nilai */}
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-[#2E7D32] text-lg">{s.avg}%</span>
                        <div className="w-24 bg-[#E8F5E9] h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor(s.avg)}`}
                            style={{ width: `${s.avg}%` }}
                          />
                        </div>
                      </div>
                    </td>
 
                    {/* Progress Penyelesaian */}
                    <td className="px-8 py-5">
                      <span className="font-bold text-[#2E7D32]/80">
                        {s.completionPercent}%
                      </span>
                    </td>
 
                    {/* Adaptive Level */}
                    <td className="px-8 py-5">
                      <span className={`text-xs font-black px-3 py-1 rounded-lg ${
                        s.adaptiveLevel === "ADVANCED"  ? "bg-[#E3F2FD] text-[#1976D2]" :
                        s.adaptiveLevel === "REMEDIAL"  ? "bg-[#FFEBEE] text-[#E53935]" :
                        "bg-[#E8F5E9] text-[#2E7D32]"
                      }`}>
                        {s.adaptiveLevel === "ADVANCED"  ? "Maju" :
                         s.adaptiveLevel === "REMEDIAL"  ? "Remedial" : "Standar"}
                      </span>
                    </td>
 
                    {/* Actions */}
                    <td className="px-8 py-5">
                      <div className="flex space-x-2">
                        <button className="p-3 bg-[#FFF8E1] text-[#FF8F00] hover:bg-[#FF8F00] hover:text-white rounded-[16px] transition-all shadow-sm" title="Kirim Pesan">
                          <MessageSquare size={16} />
                        </button>
                        <button className="p-3 bg-[#E0F2F1] text-[#00897B] hover:bg-[#00897B] hover:text-white rounded-[16px] transition-all shadow-sm" title="Lihat Detail">
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
        <p className="text-xs text-[#2E7D32]/50 font-medium text-right pr-4">
          Menampilkan {visible.length} dari {total} siswa
        </p>
      )}
    </div>
  );
}
