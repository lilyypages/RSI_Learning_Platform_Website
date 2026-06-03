"use client";
import React, { useEffect, useState, useCallback } from "react";
import { UserPlus, Search, Edit3, Trash2, Key, Link as LinkIcon, UserCheck, Loader2, X } from "lucide-react";

interface Student {
  id: string;
  nis: string;
  user: { id: string; name: string; email: string; isActive: boolean | null };
  class: { id: string; name: string } | null;
  parent: { user: { name: string; email: string } } | null;
}

interface ClassOption {
  id: string;
  name: string;
}

export default function AccountManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", nis: "", className: "", parentName: "", parentEmail: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterClass !== "all") params.set("classId", filterClass);
    if (search) params.set("search", search);
    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    if (data.success) setStudents(data.data);
    setLoading(false);
  }, [filterClass, search]);

  const fetchClasses = async () => {
    const res = await fetch("/api/classes");
    const data = await res.json();
    if (data.success) setClasses(data.data);
  };

  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { fetchStudents(); }, [filterClass]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus akun ${name} dan seluruh datanya?`)) return;
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) { fetchStudents(); alert("Akun berhasil dihapus"); }
    else alert(data.error || "Gagal menghapus");
  };

  const handleResetPassword = async (userId: string, name: string) => {
    if (!confirm(`Reset password untuk ${name} ke default (123456)?`)) return;
    const res = await fetch("/api/auth/reset-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) alert("Password berhasil direset ke 123456");
    else alert(data.error || "Gagal reset password");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/students", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.success) {
      setShowModal(false);
      setFormData({ name: "", nis: "", className: "", parentName: "", parentEmail: "" });
      fetchStudents();
      alert("Akun berhasil dibuat! Username: " + data.email);
    } else {
      alert(data.error || "Gagal membuat akun");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Registrasi Akun Siswa & Ortu</h2>
          <p className="text-slate-500 font-medium">Generate username dan password default untuk akses keluarga.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black flex items-center space-x-3 shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
          <UserPlus size={20} />
          <span>Tambah Pasangan Akun</span>
        </button>
      </div>

      {/* Modal Tambah Akun */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800">Tambah Akun Siswa</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required placeholder="Nama Siswa" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <input required placeholder="NIS" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.nis} onChange={(e) => setFormData({ ...formData, nis: e.target.value })} />
              <select required className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.className} onChange={(e) => setFormData({ ...formData, className: e.target.value })}>
                <option value="">Pilih Kelas</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input placeholder="Nama Orang Tua (opsional)" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} />
              <input type="email" placeholder="Email Orang Tua (opsional)" className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.parentEmail} onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })} />
              <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50">
                {submitting ? "Menyimpan..." : "Buat Akun"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <select className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="all">Semua Kelas</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-3 text-slate-400" size={18} />
            <input type="text" placeholder="Cari NISN atau Nama..." className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-8 py-5">Siswa (Username)</th>
                <th className="px-8 py-5">Pasangan Ortu (Username)</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-center">Opsi Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16 text-slate-400 font-bold">Belum ada data siswa.</td></tr>
              ) : students.map((acc) => (
                <tr key={acc.id} className="hover:bg-indigo-50/20 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black">{acc.class?.name?.replace(/\D/g, "") || "?"}</div>
                      <div>
                        <p className="font-black text-slate-800 leading-none">{acc.user.name}</p>
                        <p className="text-xs text-indigo-500 font-mono mt-1 font-bold">{acc.nis}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {acc.parent ? (
                      <div className="flex items-center space-x-2 text-slate-600">
                        <LinkIcon size={14} className="text-slate-300" />
                        <div>
                          <p className="font-bold text-slate-700 leading-none">{acc.parent.user.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold">{acc.parent.user.email}</p>
                        </div>
                      </div>
                    ) : <span className="text-xs text-slate-400 italic">Belum dipasangkan</span>}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${!acc.user.isActive ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {acc.user.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all" title="Edit Data" onClick={() => alert("Edit siswa: " + acc.user.name)}><Edit3 size={18} /></button>
                      <button className="p-3 bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-white rounded-xl shadow-sm transition-all" title="Reset Password" onClick={() => handleResetPassword(acc.user.id, acc.user.name)}><Key size={18} /></button>
                      <button className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm transition-all" title="Hapus Akun" onClick={() => handleDelete(acc.id, acc.user.name)}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 flex items-start space-x-4">
        <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg"><UserCheck size={20} /></div>
        <div>
          <h4 className="font-black text-indigo-900 leading-tight">Mekanisme Pendaftaran Akun</h4>
          <p className="text-sm text-indigo-700/70 mt-1">Akun Siswa dan Ortu didaftarkan secara berpasangan. Setelah didaftarkan, berikan username dan password default ke masing-masing keluarga.</p>
        </div>
      </div>
    </div>
  );
}
