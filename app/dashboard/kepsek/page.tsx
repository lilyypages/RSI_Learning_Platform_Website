"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
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
        const res = await fetch("/api/progress?role=PRINCIPAL");
        if (res.ok) {
          const d = await res.json();
          if (d.totalStudents !== undefined) setData(d);
        }

        const studRes = await fetch("/api/students?includeProgress=true");
        if (studRes.ok) {
          const students: any[] = await studRes.json();

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

  // Penyesuaian stats warna agar konsisten dengan tema Green, Teal, Orange, Red
  const stats = [
    { label: "Total Siswa",      value: loading ? "..." : String(data.totalStudents),  icon: Users,        color: "text-[#2E7D32]",   bg: "bg-[#E8F5E9]"   }, // Green
    { label: "Rata-rata Nilai",  value: loading ? "..." : `${data.schoolAvgScore}%`,   icon: BookCheck,    color: "text-[#00897B]",   bg: "bg-[#E0F2F1]"   }, // Teal
    { label: "Guru Aktif",       value: loading ? "..." : String(data.totalTeachers),  icon: TrendingUp,   color: "text-[#1976D2]",   bg: "bg-[#E3F2FD]"   }, // Blue
    { label: "Siswa Tertinggal", value: loading ? "..." : "0",                         icon: AlertCircle,  color: "text-[#E53935]",   bg: "bg-[#FFEBEE]"   }, // Red
  ];

  // Penyesuaian warna progress bar kelas mengikuti tingkat capaian
  function barColor(pct: number) {
    if (pct >= 85) return "bg-[#4CAF50]";   // Green
    if (pct >= 75) return "bg-[#00897B]";   // Teal
    if (pct >= 60) return "bg-[#FF8F00]";   // Orange
    return "bg-[#E53935]";                 // Red
  }

  const displayClasses: ClassRank[] = classes.length > 0 ? classes : [
    { name: "Kelas 6-A", pct: 95 },
    { name: "Kelas 4-B", pct: 88 },
    { name: "Kelas 5-C", pct: 72 },
    { name: "Kelas 1-A", pct: 60 },
  ];

  return (
    <div className="space-y-10">
      {/* Header Utama */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#E8F5E9] pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#2E7D32] tracking-tight">Laporan Eksekutif Sekolah</h1>
          <p className="text-[#2E7D32]/60 font-medium mt-1">Ringkasan performa akademik tahun ajaran 2026/2027.</p>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-[#E8F5E9] text-[#2E7D32] rounded-full font-black text-xs tracking-wide self-start shadow-sm">
          🟢 SISTEM AKTIF
        </div>
      </header>

      {/* Stats Cards dengan radius 24px dan bayangan kustom */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all">
            <div className={`${s.bg} ${s.color} w-12 h-12 rounded-[16px] flex items-center justify-center mb-4`}>
              <s.icon size={22} />
            </div>
            <p className="text-xs font-black text-[#2E7D32]/40 uppercase tracking-widest">{s.label}</p>
            <p className="text-3xl font-black text-[#2E7D32] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Peringkat Kelas dengan radius 24px */}
      <div className="bg-white p-8 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-[#2E7D32]">Peringkat Ketuntasan Per Kelas</h3>
            <p className="text-xs text-[#2E7D32]/50 mt-0.5 font-medium">Berdasarkan akumulasi nilai pengerjaan modul siswa.</p>
          </div>
          {classes.length === 0 && !loading && (
            <span className="text-xs px-3 py-1 bg-[#FFFBF0] text-[#FF8F00] border border-[#FFF8E1] font-black rounded-full">Demo Data</span>
          )}
        </div>
        {loading ? (
          <p className="text-[#2E7D32]/50 text-sm font-medium">Memuat data kelas...</p>
        ) : (
          <div className="space-y-6">
            {displayClasses.map((item, i) => (
              <div key={i} className="flex items-center space-x-6">
                <span className="w-24 text-sm font-black text-[#2E7D32]/80 shrink-0">{item.name}</span>
                <div className="flex-1 bg-[#FFFBF0] border border-[#E8F5E9] h-5 rounded-full overflow-hidden p-[2px]">
                  <div
                    className={`${barColor(item.pct)} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="w-12 text-sm font-black text-[#2E7D32] text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Panels Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Card Kiri: Manajemen Pengguna (Aksen Gelap Hijau-Teal) */}
        <div className="bg-gradient-to-br from-[#2E7D32] to-[#004D40] rounded-[24px] p-8 text-white shadow-[0_8px_32px_rgba(46,125,50,0.15)] relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute right-0 bottom-0 opacity-10 text-9xl pointer-events-none transform translate-x-10 translate-y-10 select-none">
            🍃
          </div>
          <div className="z-10">
            <h3 className="font-black text-xl mb-3">Manajemen Pengguna</h3>
            <p className="text-[#E8F5E9]/90 text-sm mb-6 leading-relaxed max-w-md font-medium">
              Sebagai Kepala Sekolah, Anda memegang kendali penuh validasi berkas, penugasan kelas, serta hak akses login Guru dan Siswa.
            </p>
          </div>
          <div className="z-10 mt-auto">
            <Link href="/dashboard/kepsek/guru">
              <button className="bg-white text-[#004D40] px-6 py-3 rounded-[16px] font-black text-sm hover:bg-[#FFFDE7] transition-colors shadow-md inline-block">
                Kelola Akun Guru
              </button>
            </Link>
          </div>
        </div>

        {/* Card Kanan: Log Keamanan Sistem */}
        <div className="bg-white rounded-[24px] p-8 border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex flex-col justify-between min-h-[220px]">
          <div>
            <h3 className="font-black text-[#2E7D32] text-xl mb-3">Log Keamanan Sistem</h3>
            <p className="text-sm text-[#2E7D32]/60 leading-relaxed max-w-md font-medium">
              Pantau seluruh aktivitas mutasi data database, riwayat login, serta eksekusi sistem demi menjaga integritas data akademik SIPANDA.
            </p>
          </div>
          <div className="mt-auto">
            <Link href="/dashboard/kepsek/audit">
              <button className="px-5 py-3 bg-[#2E7D32] text-white rounded-[16px] text-sm font-black hover:bg-[#004D40] transition-colors flex items-center gap-2 inline-flex shadow-sm">
                Buka Audit Log <span className="text-[#FFFDE7]">→</span>
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}