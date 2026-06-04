"use client";
import React, { useEffect, useState } from "react";
import { Search, Filter, MessageSquare, AlertCircle, CheckCircle2, Users, TrendingUp, Target, Loader2, ChevronDown, BookOpen, School } from "lucide-react";

interface StudentProgress {
  name: string;
  completionPercent: number | null;
  totalScore: number | null;
  adaptiveLevel: string | null;
}

interface SubjectData {
  subjectName: string;
  code: string;
  avgCompletion: number;
  studentsBehind: number;
  students: StudentProgress[];
}

interface ClassData {
  className: string;
  classId: string;
  isHomeroom: boolean;
  totalStudents: number;
  subjects: SubjectData[];
}

interface DashboardData {
  teacher: { name: string; email: string; homeroom: string | null };
  classes: ClassData[];
  stats: { totalStudents: number; avgCompletion: number; studentsBehind: number };
}

export default function GuruDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/guru/dashboard")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
  if (!data) return <div className="text-center py-20 text-slate-400 font-bold">Gagal memuat data.</div>;

  const { teacher, classes, stats } = data;
  const allStudents = classes.flatMap((c) => c.subjects.flatMap((s) => s.students));
  const filtered = search
    ? allStudents.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : allStudents;

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl"><Users size={24} /></div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Siswa</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalStudents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="bg-indigo-100 text-indigo-600 p-4 rounded-2xl"><TrendingUp size={24} /></div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Rata-rata Kelas</p>
            <p className="text-2xl font-black text-slate-800">{stats.avgCompletion}%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className={`p-4 rounded-2xl ${stats.studentsBehind > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Butuh Perhatian</p>
            <p className={`text-2xl font-black ${stats.studentsBehind > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{stats.studentsBehind} Siswa</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Monitoring Siswa</h1>
          <p className="text-slate-500 text-sm font-medium">Data real-time perkembangan kemampuan adaptif siswa.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full md:w-72 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Per Class Breakdown */}
      <div className="space-y-4">
        {classes.map((cls) => (
          <div key={cls.classId} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedClass(expandedClass === cls.classId ? null : cls.classId)}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <School size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-black text-lg text-slate-800">{cls.className}</h3>
                  <p className="text-xs text-slate-500 font-bold">{cls.isHomeroom ? "Wali Kelas" : "Guru Mapel"} &middot; {cls.totalStudents} siswa</p>
                </div>
              </div>
              <ChevronDown size={20} className={`text-slate-400 transition-transform ${expandedClass === cls.classId ? 'rotate-180' : ''}`} />
            </button>

            {expandedClass === cls.classId && (
              <div className="px-6 pb-6 space-y-4">
                {cls.subjects.map((subj) => (
                  <div key={subj.code} className="border border-slate-100 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSubject(expandedSubject === `${cls.classId}-${subj.code}` ? null : `${cls.classId}-${subj.code}`)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <BookOpen size={16} className="text-indigo-500" />
                        <span className="font-bold text-slate-700">{subj.subjectName}</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${subj.avgCompletion >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {subj.avgCompletion}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {subj.studentsBehind > 0 && (
                          <span className="text-xs font-bold text-rose-500">{subj.studentsBehind} tertinggal</span>
                        )}
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${expandedSubject === `${cls.classId}-${subj.code}` ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {expandedSubject === `${cls.classId}-${subj.code}` && (
                      <div className="border-t border-slate-50 overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                              <th className="px-6 py-4">Nama Siswa</th>
                              <th className="px-6 py-4">Progress</th>
                              <th className="px-6 py-4">Skor</th>
                              <th className="px-6 py-4">Level</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {subj.students.map((st, i) => (
                              <tr key={i} className="hover:bg-indigo-50/30 transition-all">
                                <td className="px-6 py-4 font-bold text-slate-700">{st.name}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${(st.completionPercent ?? 0) >= 70 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${st.completionPercent ?? 0}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">{st.completionPercent ?? 0}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-600">{st.totalScore ?? "-"}</td>
                                <td className="px-6 py-4">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    st.adaptiveLevel === 'ADVANCED' ? 'bg-emerald-100 text-emerald-700' :
                                    st.adaptiveLevel === 'REMEDIAL' ? 'bg-rose-100 text-rose-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {st.adaptiveLevel ?? "STANDARD"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* All Students Table (filtered) */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h3 className="font-black text-slate-700">Semua Siswa {search ? `(filter: "${search}")` : ""}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Skor</th>
                <th className="px-6 py-4">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold">Tidak ada siswa ditemukan.</td></tr>
              ) : filtered.map((st, i) => (
                <tr key={i} className="hover:bg-indigo-50/30 transition-all">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xs text-slate-500">
                      {st.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-700">{st.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${(st.completionPercent ?? 0) >= 70 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${st.completionPercent ?? 0}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{st.completionPercent ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{st.totalScore ?? "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      st.adaptiveLevel === 'ADVANCED' ? 'bg-emerald-100 text-emerald-700' :
                      st.adaptiveLevel === 'REMEDIAL' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{st.adaptiveLevel ?? "STANDARD"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
