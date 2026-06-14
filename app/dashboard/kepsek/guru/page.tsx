"use client";
import React, { useEffect, useState } from "react";
import { UserPlus, BarChart3, Users2, AlertCircle, ChevronRight, Loader2, X, School, BookOpen } from "lucide-react";

interface Guru {
  id: string;
  name: string;
  email: string;
  nip: string | null;
  role: string;
  subjects: string[];
  status: string;
  totalSiswa: number;
  ketuntasan: number;
  tertinggal: number;
  lastUpdate: string;
}

interface TeacherDetail {
  name: string;
  email: string;
  homeroom: string | null;
  subjects: {
    subject: string;
    code: string;
    className: string;
    avgCompletion: number;
    students: { name: string; completionPercent: number | null; totalScore: number | null; adaptiveLevel: string | null }[];
  }[];
}

export default function ManajemenGuruRinci() {
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<TeacherDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", nip: "" });
  const [addLoading, setAddLoading] = useState(false);

  const fetchGurus = () =>
    fetch("/api/teachers")
      .then((r) => r.json())
      .then((data) => { if (data.success) setGurus(data.data); });

  useEffect(() => { fetchGurus().then(() => setLoading(false)); }, []);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    const res = await fetch(`/api/teachers/${id}`);
    const data = await res.json();
    if (data.success && data.data?.teacher) {
      const t = data.data.teacher;
      setDetail({
        name: t.user?.name || "",
        email: t.user?.email || "",
        homeroom: t.homeroomClass?.[0]?.name || null,
        subjects: (t.classSubjects || []).map((cs: any) => ({
          subject: cs.subject?.name || "",
          code: cs.subject?.code || "",
          className: cs.class?.name || "",
          avgCompletion: cs.studentProgress?.length > 0
            ? Math.round(cs.studentProgress.reduce((s: number, sp: any) => s + (sp.completionPercent ?? 0), 0) / cs.studentProgress.length)
            : 0,
          students: (cs.studentProgress || []).map((sp: any) => ({
            name: sp.student?.user?.name || "",
            completionPercent: sp.completionPercent,
            totalScore: sp.totalScore,
            adaptiveLevel: sp.adaptiveLevel,
          })),
        })),
      });
    }
    setDetailLoading(false);
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-indigo-900 p-8 rounded-[40px] text-white shadow-2xl">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Evaluasi Kinerja Pengajar</h2>
          <p className="text-indigo-200 font-medium mt-1">Pantau efektivitas materi dan perkembangan siswa per kelas.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-white text-indigo-900 px-6 py-4 rounded-2xl font-black flex items-center space-x-2 hover:bg-indigo-50 transition-all shadow-lg">
          <UserPlus size={18} />
          <span>Tambah Tenaga Pendidik</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {gurus.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-bold bg-white rounded-[40px] border border-slate-100 shadow-sm">Belum ada data guru.</div>
        ) : gurus.map((g) => (
          <div key={g.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex items-center space-x-4 min-w-[250px]">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  {g.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-xl text-slate-800 leading-none">{g.name}</h4>
                  <p className="text-indigo-500 text-sm font-bold mt-2">{g.role}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${g.status === "Aktif" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                    {g.status}
                  </span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 py-4 lg:py-0 border-y lg:border-y-0 lg:border-x border-slate-50 px-0 lg:px-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Siswa</p>
                  <div className="flex items-center space-x-2">
                    <Users2 size={16} className="text-slate-400" />
                    <span className="font-black text-slate-700">{g.totalSiswa} Anak</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ketuntasan</p>
                  <div className="flex items-center space-x-2">
                    <BarChart3 size={16} className="text-emerald-500" />
                    <span className="font-black text-slate-700">{g.ketuntasan}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tertinggal</p>
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={16} className={g.tertinggal > 0 ? "text-rose-500" : "text-slate-300"} />
                    <span className={`font-black ${g.tertinggal > 0 ? "text-rose-600" : "text-slate-400"}`}>{g.tertinggal} Siswa</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mapel</p>
                  <div className="flex flex-wrap gap-1">
                    {g.subjects.map((s, i) => (
                      <span key={i} className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => openDetail(g.id)} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-6 py-3 rounded-2xl transition-all font-black text-xs flex items-center space-x-2 shrink-0">
                <span>Detail Kinerja</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail Kinerja */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-[40px] p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{detail.name}</h3>
                <p className="text-sm text-slate-500">{detail.email}</p>
                {detail.homeroom && <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">{detail.homeroom}</span>}
              </div>
              <button onClick={() => setDetail(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              {detail.subjects.map((subj, i) => (
                <div key={i} className="border border-slate-100 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">{subj.subject} <span className="text-xs text-slate-400 font-bold">({subj.code})</span></h4>
                        <p className="text-xs text-slate-500 font-bold">{subj.className}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-800">{subj.avgCompletion}%</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Rata-rata</p>
                    </div>
                  </div>

                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="py-2 pr-4">Siswa</th>
                        <th className="py-2 pr-4">Progress</th>
                        <th className="py-2 pr-4">Skor</th>
                        <th className="py-2">Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subj.students.map((st, j) => (
                        <tr key={j} className="border-b border-slate-50/50">
                          <td className="py-3 pr-4 font-bold text-slate-700 text-sm">{st.name}</td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${(st.completionPercent ?? 0) >= 70 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${st.completionPercent ?? 0}%` }} />
                              </div>
                              <span className="text-xs font-bold text-slate-600">{st.completionPercent ?? 0}%</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-sm font-bold text-slate-600">{st.totalScore ?? "-"}</td>
                          <td className="py-3">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${st.adaptiveLevel === 'ADVANCED' ? 'bg-emerald-100 text-emerald-700' : st.adaptiveLevel === 'REMEDIAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                              {st.adaptiveLevel ?? "STANDARD"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Loader2 className="animate-spin text-white" size={40} />
        </div>
      )}

      {/* Modal Tambah Guru */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">Tambah Tenaga Pendidik</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setAddLoading(true);
              const res = await fetch("/api/teachers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addForm),
              });
              const data = await res.json();
              setAddLoading(false);
              if (data.success) {
                setShowAdd(false);
                setAddForm({ name: "", email: "", nip: "" });
                fetchGurus();
              } else {
                alert(data.error || "Gagal menambahkan guru");
              }
            }} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nama Lengkap</label>
                <input required value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email</label>
                <input type="email" required value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">NIP (opsional)</label>
                <input value={addForm.nip} onChange={(e) => setAddForm({ ...addForm, nip: e.target.value })}
                  className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10" />
              </div>
              <p className="text-xs text-slate-400 font-bold">Password default: <span className="font-black text-slate-600">admin123</span></p>
              <button type="submit" disabled={addLoading}
                className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50">
                {addLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-dashed border-slate-200 flex flex-wrap gap-6 justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-xs font-bold text-slate-500">Ketuntasan Di Atas KKM</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
          <span className="text-xs font-bold text-slate-500">Butuh Intervensi Kepsek</span>
        </div>
      </div>
    </div>
  );
}
