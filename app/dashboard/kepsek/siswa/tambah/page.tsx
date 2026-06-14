"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Hash, 
  Calendar, 
  GraduationCap, 
  Users, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react";

type ClassOption = {
  id: string;
  name: string;
  gradeLevel: number;
};

export default function TambahSiswaPage() {
  const router = useRouter();
  
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    studentPassword: "",
    nis: "",
    birthdate: "",
    classId: "",
    parentName: "",
    parentEmail: "",
    parentPassword: "",
    parentPhone: "",
    parentAddress: ""
  });

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        if (data.success) {
          setClasses(data.data || []);
        } else {
          console.error("Gagal memuat daftar kelas");
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchClasses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat menyimpan data.");
      }

      setSuccessData(data.data);
    } catch (err: any) {
      setError(err.message || "Gagal menyambung ke server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8 animate-in fade-in duration-300">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Pendaftaran Berhasil!</h2>
          <p className="text-slate-500">
            Akun siswa dan orang tua telah sukses digabungkan dalam sistem.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-lg border-b pb-2">Informasi Akun</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Siswa</p>
              <p className="font-black text-slate-800">{successData.student?.user?.name}</p>
              <p className="text-sm text-slate-500">Email: {successData.student?.user?.email}</p>
              <p className="text-sm text-slate-500">NIS: {successData.student?.nis}</p>
              <p className="text-sm text-slate-500">Kelas: {successData.student?.class?.name || "-"}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-xs font-bold text-orange-600 uppercase mb-1">Orang Tua / Wali</p>
              <p className="font-black text-slate-800">{successData.parent?.name}</p>
              <p className="text-sm text-slate-500">Email: {successData.parent?.email}</p>
              <p className="text-sm text-slate-500">No. HP: {successData.parent?.phone}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-sm">
            📌 Kedua akun di atas diwajibkan untuk **mengganti password** saat pertama kali masuk ke sistem (*mustChangePassword* diaktifkan).
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setSuccessData(null);
              setFormData({
                studentName: "", studentEmail: "", studentPassword: "", nis: "", birthdate: "", classId: "",
                parentName: "", parentEmail: "", parentPassword: "", parentPhone: "", parentAddress: ""
              });
            }}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition text-center"
          >
            Tambah Siswa Lagi
          </button>
          <Link
            href="/dashboard/kepsek/siswa"
            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition text-center block"
          >
            Kembali ke Manajemen Siswa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <Link 
          href="/dashboard/kepsek/siswa" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition group w-fit"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Siswa
        </Link>
        <h1 className="text-3xl font-black text-slate-800 mt-1">Tambah Siswa Baru</h1>
        <p className="text-slate-500">Daftarkan akun siswa beserta akun wali murid secara terintegrasi.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 flex items-center gap-3 animate-shake">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 border-b pb-3 text-indigo-600">
              <User size={22} className="stroke-[2.5]" />
              <h2 className="font-black text-xl text-slate-800">Data Akademik Siswa</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nama Lengkap Siswa *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="studentName"
                    required
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">NIS *</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="nis"
                      required
                      value={formData.nis}
                      onChange={handleChange}
                      placeholder="Nomor Induk Siswa"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Tanggal Lahir</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Pilih Kelas</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    disabled={loadingClasses}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white appearance-none text-slate-700 disabled:bg-slate-50"
                  >
                    <option value="">-- Belum Ditentukan --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        Kelas {cls.name} (Tingkat {cls.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t pt-3 mt-2 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kredensial Login Siswa</p>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Email Siswa *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="studentEmail"
                      required
                      value={formData.studentEmail}
                      onChange={handleChange}
                      placeholder="budi@sekolah.sch.id"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Password Sementara Siswa *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="studentPassword"
                      required
                      value={formData.studentPassword}
                      onChange={handleChange}
                      placeholder="Kombinasi sandi aman siswa"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 border-b pb-3 text-orange-600">
              <Users size={22} className="stroke-[2.5]" />
              <h2 className="font-black text-xl text-slate-800">Data Wali / Orang Tua</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Nama Ayah / Ibu / Wali *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="parentName"
                    required
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="Contoh: Ayah/Ibu Budi"
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">No. Handphone Aktif</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="Contoh: 081234567xxx"
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Alamat Tempat Tinggal</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 text-slate-400" size={18} />
                  <textarea
                    name="parentAddress"
                    rows={2}
                    value={formData.parentAddress}
                    onChange={handleChange}
                    placeholder="Alamat domisili lengkap orang tua"
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm resize-none"
                  />
                </div>
              </div>

              <div className="border-t pt-3 mt-2 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kredensial Login Orang Tua</p>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Email Orang Tua *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="parentEmail"
                      required
                      value={formData.parentEmail}
                      onChange={handleChange}
                      placeholder="ayahbudi@mail.com"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Password Sementara Orang Tua *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      name="parentPassword"
                      required
                      value={formData.parentPassword}
                      onChange={handleChange}
                      placeholder="Kombinasi sandi aman orang tua"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => router.push("/dashboard/kepsek/siswa")}
            className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition disabled:opacity-50"
          >
            Batal
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-sm disabled:bg-indigo-400"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Menyimpan Data...
              </>
            ) : (
              "Simpan & Daftarkan Akun"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
