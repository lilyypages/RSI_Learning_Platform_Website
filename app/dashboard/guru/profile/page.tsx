// app/dashboard/guru/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { 
  User, 
  Briefcase, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  AlertCircle,
  Lock,
  Camera,
  CheckCircle2,
  Loader2
} from "lucide-react";

// Struktur data yang dikirim oleh API /api/profile Anda
interface TeachingSubject {
  subjectName: string;
  className: string;
  semester: number;
  academicYear: number;
}

interface TeacherProfile {
  success: boolean;
  name: string;
  role: string;
  nip: string;
  phone: string;
  imageUrl?: string;
  homeroomOf: string;
  teachingSubjects: TeachingSubject[];
}

export default function GuruProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"detail" | "settings">("detail");

  // Form State untuk Update Mandiri (Ganti Password & Foto)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  // Fungsi fetch data profil dari database (melalui API route)
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success) {
        // Data di bawah ini murni dari database lewat Prisma!
        setProfile(data);
        if (data.imageUrl) setPreviewUrl(data.imageUrl);
      } else {
        setError(data.message || "Gagal memuat profil");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle perubahan foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle submit update akun mandiri
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormMessage({ type: "error", text: "Password baru dan konfirmasi tidak cocok!" });
      setSubmitLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      if (selectedFile) formData.append("image", selectedFile);
      if (passwordForm.oldPassword) {
        formData.append("oldPassword", passwordForm.oldPassword);
        formData.append("newPassword", passwordForm.newPassword);
      }

      const res = await fetch("/api/profile/update", { 
        method: "PUT", 
        body: formData 
      });
      const data = await res.json();

      if (data.success) {
        setFormMessage({ type: "success", text: "Profil berhasil diperbarui!" });
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        fetchProfile(); // Segarkan data agar tersinkron ulang dengan DB
      } else {
        setFormMessage({ type: "error", text: data.message || "Gagal memperbarui profil." });
      }
    } catch (err) {
      setFormMessage({ type: "error", text: "Terjadi kesalahan server." });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-white rounded-[24px] border border-[#E8F5E9]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-60 bg-white rounded-[24px] border border-[#E8F5E9] lg:col-span-1" />
          <div className="h-60 bg-white rounded-[24px] border border-[#E8F5E9] lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-[#FFEBEE] text-[#D32F2F] p-6 rounded-[20px] border border-[#FFCDD2] flex items-center space-x-3 font-semibold">
        <AlertCircle size={20} />
        <span>{error || "Profil gagal dimuat."}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* BANNER UTAMA */}
      <div className="bg-white rounded-[24px] border border-[#E8F5E9] p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative w-24 h-24 bg-[#4CAF50] rounded-full overflow-hidden flex items-center justify-center text-white border-4 border-[#FFFBF0] shadow-md">
          {previewUrl ? (
            <img src={previewUrl} alt="Foto Profil" className="w-full h-full object-cover" />
          ) : (
            <User size={44} />
          )}
        </div>
        
        <div className="flex-1">
          {/* DIAMBIL DARI DB */}
          <h1 className="text-2xl font-black text-[#2E7D32]">{profile.name}</h1>
          <p className="text-xs font-black text-[#FF8F00] uppercase tracking-widest mt-1">
            {profile.role} PANEL
          </p>
          
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold rounded-full">
              <Briefcase size={14} />
              {/* DIAMBIL DARI DB */}
              <span>NIP: {profile.nip}</span>
            </span>
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${
              profile.homeroomOf !== "Bukan Wali Kelas" ? "bg-[#FFF8E1] text-[#FF8F00]" : "bg-gray-100 text-gray-500"
            }`}>
              <GraduationCap size={14} />
              {/* DIAMBIL DARI DB (Membaca nama Kelas Wali dari array hasil query kepsek) */}
              <span>{profile.homeroomOf}</span>
            </span>
          </div>
        </div>
      </div>

      {/* TABS NAVIGASI */}
      <div className="flex space-x-2 border-b border-[#E8F5E9] pb-px">
        <button
          onClick={() => setActiveTab("detail")}
          className={`pb-3 px-4 font-bold text-sm transition-all relative ${
            activeTab === "detail" ? "text-[#4CAF50]" : "text-[#2E7D32]/50 hover:text-[#2E7D32]"
          }`}
        >
          Detail Profil & Mengajar
          {activeTab === "detail" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#4CAF50] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 px-4 font-bold text-sm transition-all relative ${
            activeTab === "settings" ? "text-[#4CAF50]" : "text-[#2E7D32]/50 hover:text-[#2E7D32]"
          }`}
        >
          Pengaturan Foto & Keamanan
          {activeTab === "settings" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#4CAF50] rounded-t-full" />}
        </button>
      </div>

      {/* ISI TAB */}
      {activeTab === "detail" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informasi Pribadi */}
          <div className="bg-white rounded-[24px] border border-[#E8F5E9] p-6 shadow-sm space-y-5 h-fit">
            <h2 className="text-lg font-bold text-[#2E7D32] pb-2 border-b border-[#E8F5E9] flex items-center space-x-2">
              <User size={18} className="text-[#4CAF50]" />
              <span>Biodata Mandiri</span>
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#2E7D32]/60 font-bold">Nama Lengkap</p>
                {/* DIAMBIL DARI DB */}
                <p className="text-sm font-bold text-[#2E7D32]">{profile.name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#2E7D32]/60 font-bold">NIP</p>
                {/* DIAMBIL DARI DB */}
                <p className="text-sm font-semibold text-[#2E7D32]">{profile.nip}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#2E7D32]/60 font-bold">No. WhatsApp</p>
                {/* DIAMBIL DARI DB */}
                <p className="text-sm font-semibold text-[#2E7D32] flex items-center space-x-1 mt-0.5">
                  <Phone size={14} className="text-[#4CAF50]" />
                  <span>{profile.phone}</span>
                </p>
              </div>
              <div className="p-3 bg-[#FFFBF0] rounded-[16px] border border-[#FF8F00]/10">
                <p className="text-[10px] text-[#FF8F00] uppercase font-bold">Wewenang Data</p>
                <p className="text-[11px] text-[#2E7D32]/70 mt-0.5">Data penugasan dan biodata pokok di atas ditentukan sepenuhnya oleh Kepala Sekolah melalui SK resmi.</p>
              </div>
            </div>
          </div>

          {/* Daftar Kelas & Mata Pelajaran Diampu */}
          <div className="bg-white rounded-[24px] border border-[#E8F5E9] p-6 shadow-sm lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-[#2E7D32] pb-2 border-b border-[#E8F5E9] flex items-center space-x-2">
              <BookOpen size={18} className="text-[#4CAF50]" />
              <span>Mata Pelajaran Diampu (SK Kepala Sekolah)</span>
            </h2>
            
            {/* JIKA DI DATABASE KOSONG / KEPSEK BELUM INPUT */}
            {!profile.teachingSubjects || profile.teachingSubjects.length === 0 ? (
              <div className="text-center py-8 text-[#2E7D32]/50 italic text-sm">
                Belum ada penugasan mata pelajaran dari Kepala Sekolah di database.
              </div>
            ) : (
              /* LOOPING MURNI BERDASARKAN HASIL DATA PRISMA DARI DATABASE */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.teachingSubjects.map((subject, index) => (
                  <div key={index} className="p-4 rounded-[20px] bg-[#FFFBF0] border border-[#E8F5E9] flex flex-col justify-between">
                    <div>
                      <span className="inline-block text-[10px] font-extrabold uppercase bg-[#4CAF50] text-white px-2 py-0.5 rounded-md mb-2">
                        Kelas {subject.className}
                      </span>
                      <h3 className="text-base font-black text-[#2E7D32]">{subject.subjectName}</h3>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E8F5E9] flex justify-between items-center text-[11px] text-[#2E7D32]/70 font-semibold">
                      <span className="flex items-center space-x-1">
                        <Calendar size={12} className="text-[#FF8F00]" />
                        <span>TA: {subject.academicYear}</span>
                      </span>
                      <span>Semester {subject.semester}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB MANAJEMEN GANTI PASSWORD & FOTO PROFIL */
        <div className="bg-white rounded-[24px] border border-[#E8F5E9] p-6 md:p-8 shadow-sm max-w-2xl">
          <h2 className="text-lg font-bold text-[#2E7D32] mb-6 flex items-center space-x-2">
            <Lock size={18} className="text-[#4CAF50]" />
            <span>Kelola Akun Mandiri</span>
          </h2>

          {formMessage && (
            <div className={`p-4 rounded-[16px] mb-6 flex items-center space-x-2 text-sm font-bold ${
              formMessage.type === "success" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFEBEE] text-[#D32F2F]"
            }`}>
              {formMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{formMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateAccount} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-[#2E7D32] uppercase tracking-wider block">Ganti Foto Profil</label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-[#E8F5E9]">
                  {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-gray-400" />}
                </div>
                <label className="cursor-pointer bg-[#FFFBF0] hover:bg-[#E8F5E9] border border-[#4CAF50]/30 text-[#2E7D32] px-4 py-2 rounded-[12px] text-xs font-bold transition flex items-center space-x-2">
                  <Camera size={14} />
                  <span>Pilih Gambar</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="border-t border-[#E8F5E9] my-6 pt-4" />

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-[#2E7D32] uppercase tracking-wider block mb-1">Password Lama</label>
                <input 
                  type="password" 
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full p-3.5 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[16px] text-sm focus:outline-none focus:border-[#4CAF50] font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-[#2E7D32] uppercase tracking-wider block mb-1">Password Baru</label>
                  <input 
                    type="password" 
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    placeholder="Minimal 6 karakter" 
                    className="w-full p-3.5 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[16px] text-sm focus:outline-none focus:border-[#4CAF50] font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#2E7D32] uppercase tracking-wider block mb-1">Konfirmasi Password Baru</label>
                  <input 
                    type="password" 
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    placeholder="Ulangi password baru" 
                    className="w-full p-3.5 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[16px] text-sm focus:outline-none focus:border-[#4CAF50] font-semibold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full bg-[#4CAF50] text-white p-3.5 rounded-[16px] font-bold text-sm hover:bg-[#2E7D32] transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}