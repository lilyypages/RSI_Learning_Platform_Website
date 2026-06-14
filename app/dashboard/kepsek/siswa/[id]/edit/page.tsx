"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Lock, Hash, Calendar, GraduationCap, Users, Phone, MapPin, Loader2, AlertCircle } from "lucide-react";

type ClassOption = { id: string; name: string; gradeLevel: number };

export default function EditSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    studentName: "", studentEmail: "", studentPassword: "", nis: "", birthdate: "", classId: "",
    parentName: "", parentEmail: "", parentPassword: "", parentPhone: "", parentAddress: "", isActive: true
  });

  useEffect(() => {
    async function initData() {
      try {
        const [resClasses, resStudent] = await Promise.all([
          fetch("/api/classes"),
          fetch(`/api/students/${id}`)
        ]);

        const dataClasses = await resClasses.json();
        const dataStudent = await resStudent.json();

        if (resClasses.ok) setClasses(dataClasses.data || []);
        
        if (resStudent.ok && dataStudent.data?.student) {
          const s = dataStudent.data.student;
          setFormData({
            studentName: s.user?.name || "",
            studentEmail: s.user?.email || "",
            studentPassword: "",
            nis: s.nis || "",
            birthdate: s.birthdate ? s.birthdate.split("T")[0] : "",
            classId: s.classId || "",
            parentName: s.parent?.user?.name || "",
            parentEmail: s.parent?.user?.email || "",
            parentPassword: "",
            parentPhone: s.parent?.phone || "",
            parentAddress: s.parent?.address || "",
            isActive: s.user?.isActive ?? true
          });
        } else {
          setError("Gagal memuat profil data siswa.");
        }
      } catch (err) {
        setError("Gagal menyambung ke server database.");
      } finally {
        setLoadingData(false);
      }
    }
    initData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal memperbarui data.");
      
      router.push(`/dashboard/kepsek/siswa/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-sm font-bold text-slate-500">Mempersiapkan data formulir...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="space-y-1">
        <Link href={`/dashboard/kepsek/siswa/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition group w-fit">
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Batal & Kembali ke Profil
        </Link>
        <h1 className="text-3xl font-black text-slate-800 mt-1">Ubah Data Siswa & Wali</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="font-black text-xl text-slate-800 border-b pb-2 text-indigo-600">Data Siswa</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nama Lengkap Siswa</label>
                <input type="text" name="studentName" required value={formData.studentName} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">NIS</label>
                  <input type="text" name="nis" required value={formData.nis} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Tanggal Lahir</label>
                  <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Kelas</label>
                <select name="classId" value={formData.classId} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white focus:ring-2 focus:ring-indigo-300 outline-none">
                  <option value="">-- Belum Ditentukan --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>Kelas {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Status Akun</label>
                <select name="isActive" value={formData.isActive ? "true" : "false"} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === "true" }))} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-white focus:ring-2 focus:ring-indigo-300 outline-none">
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif (Suspend)</option>
                </select>
              </div>
              <div className="border-t pt-3 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Email Siswa</label>
                  <input type="email" name="studentEmail" required value={formData.studentEmail} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Password Baru Siswa (Kosongkan jika tidak diganti)</label>
                  <input type="password" name="studentPassword" value={formData.studentPassword} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="font-black text-xl text-slate-800 border-b pb-2 text-orange-600">Data Orang Tua / Wali</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nama Orang Tua</label>
                <input type="text" name="parentName" required value={formData.parentName} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">No. HP Wali</label>
                <input type="text" name="parentPhone" value={formData.parentPhone} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Alamat Domisili</label>
                <textarea name="parentAddress" rows={2} value={formData.parentAddress} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none" />
              </div>
              <div className="border-t pt-3 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Email Orang Tua</label>
                  <input type="email" name="parentEmail" required value={formData.parentEmail} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Password Baru Orang Tua (Kosongkan jika tidak diganti)</label>
                  <input type="password" name="parentPassword" value={formData.parentPassword} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3">
          <button type="button" disabled={submitting} onClick={() => router.push(`/dashboard/kepsek/siswa/${id}`)} className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-sm transition">
            Batal
          </button>
          <button type="submit" disabled={submitting} className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-sm disabled:bg-indigo-400">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
