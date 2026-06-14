"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit3, GraduationCap, BookOpen, 
  Users, Phone, Mail, CheckCircle, Loader2, AlertCircle, Settings 
} from "lucide-react";

export default function DetailGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getTeacherDetail() {
      try {
        const res = await fetch(`/api/teachers/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Gagal memuat profil guru.");
        setData(json);
      } catch (err: any) {
        setError(err.message || "Koneksi ke database terputus.");
      } finally {
        setLoading(false);
      }
    }
    getTeacherDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-sm font-bold text-slate-500">Membuka lembar portofolio mengajar...</p>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center max-w-xl mx-auto space-y-3 my-10">
        <AlertCircle size={36} className="text-red-500 mx-auto" />
        <h3 className="font-black text-lg text-slate-800">Gagal Memuat Profil</h3>
        <p className="text-sm text-red-600 font-semibold">{error}</p>
        <Link href="/dashboard/kepsek/guru" className="inline-block px-4 py-2 bg-white border rounded-xl text-xs font-bold text-slate-700">
          Kembali ke Direktori
        </Link>
      </div>
    );
  }

  const { teacher, stats } = data.data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Link href="/dashboard/kepsek/guru" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition group w-fit">
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            Kembali ke Direktori Guru
          </Link>
          <h1 className="text-3xl font-black text-slate-800 mt-1">Profil Detail Pendidik</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href={`/dashboard/kepsek/guru/${id}/edit`} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white border text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition shadow-sm">
            <Edit3 size={14} /> Edit Data
          </Link>
          <Link href={`/dashboard/kepsek/guru/${id}/mapel`} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm">
            <Settings size={14} /> Kelola Mapel
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 self-start">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-24 h-24 bg-indigo-50 border rounded-3xl flex items-center justify-center font-black text-indigo-600 text-3xl overflow-hidden shadow-inner">
              {teacher.user?.imageUrl ? (
                <img src={teacher.user.imageUrl} alt={teacher.user.name} className="w-full h-full object-cover" />
              ) : (
                teacher.user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-xl leading-snug">{teacher.user?.name}</h2>
              <p className="text-xs font-bold text-slate-400 mt-0.5">NIP: {teacher.nip || "-"}</p>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
              teacher.user?.isActive ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
            }`}>
              {teacher.user?.isActive ? "Status: Aktif" : "Status: Nonaktif"}
            </span>
          </div>

          <div className="border-t pt-4 space-y-3 text-xs font-medium text-slate-600">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-tight block">Alamat Email</span>
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span className="truncate font-semibold">{teacher.user?.email}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-tight block">No. HP Kontak</span>
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span className="font-semibold">{teacher.phone || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border p-4 rounded-2xl shadow-sm text-center space-y-0.5">
              <BookOpen size={18} className="text-indigo-500 mx-auto mb-1" />
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Mata Pelajaran</span>
              <p className="text-2xl font-black text-slate-800">{stats?.totalSubjects}</p>
            </div>
            <div className="bg-white border p-4 rounded-2xl shadow-sm text-center space-y-0.5">
              <GraduationCap size={18} className="text-emerald-500 mx-auto mb-1" />
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Kelas Diampu</span>
              <p className="text-2xl font-black text-slate-800">{stats?.totalClasses}</p>
            </div>
            <div className="bg-white border p-4 rounded-2xl shadow-sm text-center space-y-0.5">
              <Users size={18} className="text-orange-500 mx-auto mb-1" />
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Total Siswa</span>
              <p className="text-2xl font-black text-slate-800">{stats?.totalStudents}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jabatan Struktur Wali Kelas</h3>
            {teacher.homeroomClass?.length > 0 ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl font-black text-sm">
                <CheckCircle size={14} /> Wali Kelas {teacher.homeroomClass[0].name}
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-500 italic">Belum ditugaskan menjadi wali kelas mana pun.</p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b bg-white">
              <h3 className="font-black text-slate-800 text-base">Mata Pelajaran yang Diampu</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Daftar distribusi beban mengajar guru di tiap rombongan belajar.</p>
            </div>
            
            {teacher.classSubjects?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b">
                      <th className="py-3 px-5">Kode</th>
                      <th className="py-3 px-5">Mata Pelajaran</th>
                      <th className="py-3 px-5 text-right">Kelas Ajar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm font-semibold text-slate-700">
                    {teacher.classSubjects.map((cs: any) => (
                      <tr key={cs.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-5 text-xs font-bold text-slate-400 uppercase">{cs.subject?.code || "-"}</td>
                        <td className="py-3.5 px-5 font-black text-slate-800">{cs.subject?.name}</td>
                        <td className="py-3.5 px-5 text-right">
                          <span className="inline-block text-xs font-black px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                            Kelas {cs.class?.name}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                Guru ini belum diatur ke jadwal kelas atau mata pelajaran apa pun.
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
