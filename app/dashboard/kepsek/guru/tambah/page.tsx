"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Mail, Lock, Hash, Phone, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function TambahGuruPage() {
  const router = useRouter();
  
  // State Kendali UI
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    nip: "",
    phone: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mendaftarkan guru.");
      }

      setSuccess("Akun guru dan profil pendidik berhasil dibuat!");
      
      // Berikan jeda 1.5 detik agar user bisa melihat pesan sukses sebelum dialihkan
      setTimeout(() => {
        router.push("/dashboard/kepsek/guru");
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi sistem.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      
      {/* HEADER NAVIGASI */}
      <div className="space-y-1">
        <Link 
          href="/dashboard/kepsek/guru" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition group w-fit"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Kembali ke Direktori Guru
        </Link>
        <h1 className="text-3xl font-black text-slate-800 mt-1">Registrasi Guru Baru</h1>
        <p className="text-sm font-medium text-slate-500">
          Sistem akan otomatis membuat akun login <strong className="text-indigo-600">User (Role: TEACHER)</strong> sekaligus lembar profil internal guru.
        </p>
      </div>

      {/* NOTIFIKASI ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* NOTIFIKASI SUKSES */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-600 flex items-center gap-3">
          <CheckCircle size={20} className="shrink-0" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      {/* FORMULIR INPUT UTAMA */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        
        {/* Nama Guru */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap Guru</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-300 transition">
            <User size={18} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              name="name"
              required
              placeholder="Contoh: Ahmad Fauzi, S.Pd."
              value={formData.name}
              onChange={handleChange}
              disabled={submitting}
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {/* NIP */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nomor Induk Pegawai (NIP)</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-300 transition">
            <Hash size={18} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              name="nip"
              required
              placeholder="Contoh: 198706102014021003"
              value={formData.nip}
              onChange={handleChange}
              disabled={submitting}
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {/* No HP Kontak */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">No. Handphone Kontak (Opsional)</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-300 transition">
            <Phone size={18} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              name="phone"
              placeholder="Contoh: 081234567890"
              value={formData.phone}
              onChange={handleChange}
              disabled={submitting}
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="border-t border-dashed pt-4 space-y-4">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Kredensial Akses Login</h3>
          
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Alamat Email Resmi</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-300 transition">
              <Mail size={18} className="text-slate-400 shrink-0" />
              <input 
                type="email" 
                name="email"
                required
                placeholder="ahmad.fauzi@sekolah.sch.id"
                value={formData.email}
                onChange={handleChange}
                disabled={submitting}
                className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password Pemula (Minimal 8 Karakter)</label>
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-300 transition">
              <Lock size={18} className="text-slate-400 shrink-0" />
              <input 
                type="password" 
                name="password"
                required
                placeholder="••••••••"
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                disabled={submitting}
                className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => router.push("/dashboard/kepsek/guru")}
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-sm text-slate-700 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-sm disabled:bg-indigo-400"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Mendaftarkan...
              </>
            ) : (
              "Simpan & Daftarkan"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}