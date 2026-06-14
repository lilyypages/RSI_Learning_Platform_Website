"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Hash, Phone, KeyRound, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function EditGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loadingFetch, setLoadingFetch] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nip: "",
    phone: "",
    isActive: true
  });
  
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    async function loadCurrentTeacher() {
      try {
        const res = await fetch(`/api/teachers/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal mengambil data lama guru.");
        
        const t = data.data?.teacher;
        if (!t) throw new Error("Data guru tidak ditemukan.");
        
        setFormData({
          name: t.user?.name || "",
          email: t.user?.email || "",
          nip: t.nip || "",
          phone: t.phone || "",
          isActive: t.user?.isActive ?? true
        });
      } catch (err: any) {
        setError(err.message || "Gagal memuat koneksi data.");
      } finally {
        setLoadingFetch(false);
      }
    }
    loadCurrentTeacher();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "isActive" ? value === "true" : value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload: any = { ...formData };
    if (newPassword.trim()) {
      payload.password = newPassword;
    }

    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal memperbarui profil.");

      setSuccess("Profil dan kredensial guru berhasil diubah!");
      setNewPassword("");
      
      setTimeout(() => {
        router.push(`/dashboard/kepsek/guru/${id}`);
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Gagal mengirim pembaruan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingFetch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-sm font-bold text-slate-500">Menyinkronkan lembar formulir data lama...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      
      <div className="space-y-1">
        <Link href={`/dashboard/kepsek/guru/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition group w-fit">
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Kembali ke Detail Guru
        </Link>
        <h1 className="text-3xl font-black text-slate-800 mt-1">Edit Informasi Guru</h1>
        <p className="text-sm font-medium text-slate-500">Perbarui profil biodata kepegawaian atau lakukan pemulihan kata sandi login di bawah.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-600 flex items-center gap-3">
          <CheckCircle size={20} className="shrink-0" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap Guru</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-300 transition">
              <User size={18} className="text-slate-400 shrink-0" />
              <input type="text" name="name" required value={formData.name} onChange={handleInputChange} disabled={submitting} className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">NIP</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-300 transition">
              <Hash size={18} className="text-slate-400 shrink-0" />
              <input type="text" name="nip" required value={formData.nip} onChange={handleInputChange} disabled={submitting} className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">No. HP Kontak</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-300 transition">
              <Phone size={18} className="text-slate-400 shrink-0" />
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} disabled={submitting} className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Alamat Email Login</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-300 transition">
              <Mail size={18} className="text-slate-400 shrink-0" />
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} disabled={submitting} className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Status Otorisasi Hak Akses</label>
            <select name="isActive" value={String(formData.isActive)} onChange={handleInputChange} disabled={submitting} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300 transition">
              <option value="true">Aktif (Diberikan Akses Masuk)</option>
              <option value="false">Nonaktif (Blokir Akses Masuk)</option>
            </select>
          </div>
        </div>

        <div className="border-t border-dashed pt-4 space-y-2">
          <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
            <KeyRound size={14} /> Opsi Reset Password internal
          </h3>
          <p className="text-xs font-medium text-slate-400">Kosongkan jika tidak ingin merubah sandi login guru saat ini.</p>
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-300 transition">
            <KeyRound size={18} className="text-slate-400 shrink-0" />
            <input 
              type="password" 
              placeholder="Masukkan password baru jika ingin mereset (min. 8 karakter)" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={submitting}
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" disabled={submitting} onClick={() => router.push(`/dashboard/kepsek/guru/${id}`)} className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-sm text-slate-700 transition">
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
