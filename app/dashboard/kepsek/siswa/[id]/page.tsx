"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit, BarChart3, User, Mail, Calendar, 
  GraduationCap, Users, Phone, MapPin, Award, Zap, 
  Heart, BookOpen, CheckSquare, PlayCircle, Clock, Check, ShieldAlert
} from "lucide-react";

type PageParams = { id: string };

export default function DetailSiswaPage({ params }: { params: Promise<PageParams> }) {
  const { id } = use(params);
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudentDetail() {
      try {
        const res = await fetch(`/api/students/${id}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || "Gagal memuat detail data siswa.");
        }
        
        setStudent(data.data?.student);
        setStats(data.data?.stats);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan koneksi server.");
      } finally {
        setLoading(false);
      }
    }
    loadStudentDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Memproses profil lengkap siswa...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center max-w-xl mx-auto space-y-4 my-10">
        <ShieldAlert size={40} className="text-red-500 mx-auto" />
        <h3 className="font-black text-xl text-slate-800">Gagal Memuat Data</h3>
        <p className="text-sm text-red-600 font-medium">{error || "Siswa tidak dapat ditemukan."}</p>
        <Link href="/dashboard/kepsek/siswa" className="inline-block px-5 py-2.5 bg-white border rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
          Kembali ke Daftar Siswa
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Link 
            href="/dashboard/kepsek/siswa" 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition group"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            Kembali ke Manajemen Siswa
          </Link>
          <h1 className="text-3xl font-black text-slate-800 mt-1">Ikhtisar Profil Siswa</h1>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href={`/dashboard/kepsek/siswa/${id}/progress`}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-2xl shadow-sm transition"
          >
            <BarChart3 size={16} />
            Lihat Analitik Lengkap
          </Link>
          <Link
            href={`/dashboard/kepsek/siswa/${id}/edit`}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-sm transition"
          >
            <Edit size={16} />
            Edit Data
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        <div className="md:col-span-1 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                student.user?.isActive 
                  ? "bg-green-50 text-green-600 border border-green-200" 
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {student.user?.isActive ? "Akun Aktif" : "Nonaktif"}
              </span>
            </div>

            <div className="flex flex-col items-center text-center pt-4 pb-4 border-b border-dashed">
              <div className="w-20 h-20 bg-indigo-50 border-2 border-indigo-200 rounded-full flex items-center justify-center text-indigo-600 font-black text-2xl mb-3 overflow-hidden shadow-inner">
                {student.user?.imageUrl ? (
                  <img src={student.user.imageUrl} alt={student.user.name} className="w-full h-full object-cover" />
                ) : (
                  student.user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="font-black text-xl text-slate-800">{student.user?.name}</h2>
              <p className="text-sm font-bold text-slate-400 mt-0.5">NIS: {student.nis}</p>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-slate-400 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-slate-400 font-bold">Kelas / Tingkat</p>
                  <p className="font-bold text-slate-700">
                    {student.class ? `${student.class.name} (Tingkat ${student.class.gradeLevel})` : "Belum ditentukan"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-slate-400 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-slate-400 font-bold">Email Utama</p>
                  <p className="font-medium text-slate-700 break-all">{student.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="text-slate-400 shrink-0" size={18} />
                <div>
                  <p className="text-xs text-slate-400 font-bold">Tanggal Lahir</p>
                  <p className="font-semibold text-slate-700">
                    {student.birthdate ? new Date(student.birthdate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2 text-orange-600">
              <Users size={18} className="stroke-[2.5]" />
              Data Wali Orang Tua
            </h3>
            
            {student.parent ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400 font-bold">Nama Wali</p>
                  <p className="font-bold text-slate-800">{student.parent.user?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold">Email Hubungan</p>
                  <p className="font-medium text-slate-700 break-all">{student.parent.user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold">Nomor Telepon</p>
                  <p className="font-semibold text-slate-700">{student.parent.phone || "-"}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold">Alamat Rumah</p>
                    <p className="text-slate-600 text-xs leading-relaxed">{student.parent.address || "-"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Hubungan data orang tua belum terikat.</p>
            )}
          </div>

        </div>

        <div className="md:col-span-2 space-y-6">
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-600/80 uppercase tracking-wider">Total Skor</p>
                <p className="text-2xl font-black text-slate-800">{student.totalPoints}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-600/80 uppercase tracking-wider">Streak</p>
                <p className="text-2xl font-black text-slate-800">{student.currentStreak} Hari</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                <Heart size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-600/80 uppercase tracking-wider">Sisa Nyawa</p>
                <p className="text-2xl font-black text-slate-800">{student.livesRemaining} / 3</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm grid grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-indigo-600 mb-1">
                <BookOpen size={16} />
                <span className="text-xs font-black uppercase">Mata Pelajaran</span>
              </div>
              <p className="text-3xl font-black text-slate-800">{stats?.subjectCount || 0}</p>
              <p className="text-xs text-slate-400 font-medium">Terdaftar Aktif</p>
            </div>

            <div className="space-y-1 border-x px-4">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                <CheckSquare size={16} />
                <span className="text-xs font-black uppercase">Rerata Progress</span>
              </div>
              <p className="text-3xl font-black text-slate-800">{stats?.avgCompletion || 0}%</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats?.avgCompletion || 0}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1">
                <Award size={16} />
                <span className="text-xs font-black uppercase">Rata-Rata Skor</span>
              </div>
              <p className="text-3xl font-black text-slate-800">{stats?.avgScore || 0}</p>
              <p className="text-xs text-slate-400 font-medium">Skala Poin Maksimum</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 text-lg">Capaian Kelas per Mata Pelajaran</h3>
            
            {student.progress && student.progress.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold text-xs uppercase">
                      <th className="pb-3 font-black">Mata Pelajaran</th>
                      <th className="pb-3 font-black text-center">Progress</th>
                      <th className="pb-3 font-black text-center">Nilai Poin</th>
                      <th className="pb-3 font-black text-right">Tingkatan Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                    {student.progress.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5">
                          <p className="font-black text-slate-800">{p.classSubject?.subject?.name}</p>
                          <p className="text-xs text-slate-400 font-bold">{p.classSubject?.subject?.code}</p>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-black rounded-lg">
                            {p.completionPercent || 0}%
                          </span>
                        </td>
                        <td className="py-3.5 text-center font-black text-indigo-600">{p.totalScore || 0}</td>
                        <td className="py-3.5 text-right">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-lg tracking-wide ${
                            p.adaptiveLevel === "ADVANCED" ? "bg-purple-50 text-purple-600 border border-purple-100" :
                            p.adaptiveLevel === "STANDARD" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                            "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {p.adaptiveLevel || "BEGINNER"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic py-2">Belum ada rekam progress mata pelajaran akademik.</p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <CheckSquare size={18} className="text-indigo-600" />
                Aktivitas & Riwayat Kuis Terbaru
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                Total Tes Selesai: {stats?.totalQuiz || 0}
              </span>
            </div>

            {student.quizSessions && student.quizSessions.length > 0 ? (
              <div className="space-y-3">
                {student.quizSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50/10 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 font-bold border">
                        {session.score >= 75 ? (
                          <Check className="text-emerald-500 stroke-[3]" size={18} />
                        ) : (
                          <Clock className="text-amber-500" size={18} />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-800">
                          Kuis {session.classSubject?.subject?.name || "Mata Pelajaran"}
                        </p>
                        <p className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                          <span>Benar: <strong className="text-emerald-600">{session.correctCount}</strong></span>
                          <span>•</span>
                          <span>Salah: <strong className="text-rose-500">{session.wrongCount}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-base text-indigo-600">{session.score} Poin</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {session.startedAt ? new Date(session.startedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic py-2">Belum pernah mengambil pengerjaan kuis materi.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
