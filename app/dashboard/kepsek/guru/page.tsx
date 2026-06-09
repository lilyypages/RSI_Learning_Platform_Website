"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, UserPlus, Mail, BookOpen, GraduationCap, 
  Phone, Search, Loader2, AlertCircle, Users, CheckCircle, Award 
} from "lucide-react";

export default function ManajemenGuruPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeachers() {
      try {
        const res = await fetch("/api/teachers");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal memuat data guru.");
        setTeachers(data.teachers || []);
      } catch (err: any) {
        setError(err.message || "Gagal menyambung ke server.");
      } finally {
        setLoading(false);
      }
    }
    loadTeachers();
  }, []);

  // Filter pencarian berdasarkan Nama atau NIP
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.nip.includes(search)
  );

  // Perhitungan Ringkasan Statistik Agregat dari Array Guru
  const totalGuru = teachers.length;
  const guruAktif = teachers.filter(t => t.isActive).length;
  const totalWaliKelas = teachers.filter(t => t.isHomeroomTeacher).length;
  const totalBebanMapel = teachers.reduce((acc, t) => acc + (t.subjectCount || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-sm font-bold text-slate-500">Memuat barisan data guru...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* 1. HEADER UTAMA DAN TOMBOL REGISTRASI */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Direktori Guru</h1>
          <p className="text-sm font-medium text-slate-500">Melihat daftar pendidik, wali kelas, serta beban mengajar di sekolah.</p>
        </div>
        <Link
          href="/dashboard/kepsek/guru/tambah"
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-sm transition w-full sm:w-auto justify-center group"
        >
          <Plus size={18} className="stroke-[3] transform group-hover:rotate-90 transition-transform" />
          Tambah Guru Baru
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* 2. BARIS RINGKASAN STATISTIK DATA GURU (SUMMARY CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Total Guru</span>
            <p className="text-xl font-black text-slate-800">{totalGuru}</p>
          </div>
        </div>

        <div className="bg-white border p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Guru Aktif</span>
            <p className="text-xl font-black text-slate-800">{guruAktif}</p>
          </div>
        </div>

        <div className="bg-white border p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Wali Kelas</span>
            <p className="text-xl font-black text-slate-800">{totalWaliKelas}</p>
          </div>
        </div>

        <div className="bg-white border p-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div>
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Total Distribusi Mapel</span>
            <p className="text-xl font-black text-slate-800">{totalBebanMapel}</p>
          </div>
        </div>
      </div>

      {/* 3. BILAH PENCARIAN GURU */}
      <div className="bg-white border p-4 rounded-2xl shadow-sm flex items-center gap-3 max-w-md">
        <Search className="text-slate-400 shrink-0" size={20} />
        <input
          type="text"
          placeholder="Cari berdasarkan nama guru atau NIP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* 4. GRID DAFTAR KARTU GURU */}
      {filteredTeachers.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-indigo-200 hover:shadow-md transition-all">
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md tracking-wider uppercase ${
                  teacher.isActive ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
                }`}>
                  {teacher.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              <div className="space-y-4">
                {/* Info Profil Utama */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl overflow-hidden shadow-inner shrink-0">
                    {teacher.imageUrl ? (
                      <img src={teacher.imageUrl} alt={teacher.name} className="w-full h-full object-cover" />
                    ) : (
                      teacher.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-800 text-lg leading-tight truncate">{teacher.name}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">NIP: {teacher.nip}</p>
                  </div>
                </div>

                {/* Sekat Penugasan Terstruktur (Sinkron dengan payload API baru) */}
                <div className="py-3 border-y border-dashed border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-bold block uppercase tracking-tight">Wali Kelas</span>
                    <span className="font-black text-slate-700 flex items-center gap-1">
                      <GraduationCap size={14} className="text-indigo-500 shrink-0" />
                      <span className="truncate">
                        {teacher.isHomeroomTeacher && teacher.homeroomClass 
                          ? `Kelas ${teacher.homeroomClass.name}` 
                          : "Bukan Wali"}
                      </span>
                    </span>
                  </div>
                  <div className="space-y-0.5 border-l pl-3">
                    <span className="text-slate-400 font-bold block uppercase tracking-tight">Beban Ajar</span>
                    <span className="font-black text-slate-700 flex items-center gap-1">
                      <BookOpen size={14} className="text-emerald-500 shrink-0" />
                      <span>{teacher.subjectCount || 0} Mapel</span>
                    </span>
                  </div>
                </div>

                {/* Kontak Detail */}
                <div className="space-y-1.5 pt-1 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{teacher.phone || "-"}</span>
                  </div>
                </div>
              </div>

              {/* 5. BARIS TOMBOL AKSI MENUJU HALAMAN INNER */}
              <div className="grid grid-cols-3 gap-2 mt-6 border-t pt-4 border-slate-100">
                <Link href={`/dashboard/kepsek/guru/${teacher.id}`} className="text-center px-2 py-2.5 bg-slate-50 border hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition">
                  Detail
                </Link>
                <Link href={`/dashboard/kepsek/guru/${teacher.id}/edit`} className="text-center px-2 py-2.5 bg-slate-50 border hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition">
                  Edit
                </Link>
                <Link href={`/dashboard/kepsek/guru/${teacher.id}/mapel`} className="text-center px-2 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 text-xs font-bold rounded-xl transition">
                  Mapel
                </Link>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400 max-w-md mx-auto space-y-2">
          <UserPlus size={40} className="mx-auto text-slate-300 stroke-[1.5]" />
          <h4 className="font-bold text-slate-700">Guru Tidak Ditemukan</h4>
          <p className="text-xs">Belum ada guru terdaftar atau kata kunci pencarianmu salah.</p>
        </div>
      )}
    </div>
  );
}