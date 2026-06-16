"use client";

import React, { useEffect, useState, useRef } from "react";
import { User, Users, AlertCircle, CheckCircle2, Loader2, UserCircle, Camera } from "lucide-react";
import Image from "next/image";

export default function OrtuProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"parent" | "student">("parent");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile(data);
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-[#2E7D32] font-black animate-pulse">Memuat Profil...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-[#2E7D32]">Pengaturan Profil & Keamanan</h1>

      {/* ACCOUNT SWITCHER */}
      <div className="flex bg-white p-2 rounded-[24px] border border-[#E8F5E9] shadow-sm w-fit">
        <button
          onClick={() => setActiveTab("parent")}
          className={`flex items-center space-x-2 px-6 py-3 rounded-[18px] font-bold text-sm transition-all ${
            activeTab === "parent" ? "bg-[#4CAF50] text-white shadow-lg" : "text-[#2E7D32] hover:bg-[#E8F5E9]"
          }`}
        >
          <User size={16} /> <span>Profil Saya</span>
        </button>
        
        {profile?.students?.map((s: any) => (
          <button
            key={s.userId}
            onClick={() => { setActiveTab("student"); setSelectedStudent(s); }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-[18px] font-bold text-sm transition-all ${
              activeTab === "student" && selectedStudent?.userId === s.userId 
                ? "bg-[#4CAF50] text-white shadow-lg" 
                : "text-[#2E7D32] hover:bg-[#E8F5E9]"
            }`}
          >
            <Users size={16} /> <span>Anak: {s.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[24px] border border-[#E8F5E9] p-8 shadow-sm max-w-2xl">
        <AccountSettingsForm 
          userId={activeTab === "parent" ? profile?.userId : selectedStudent?.userId}
          name={activeTab === "parent" ? profile?.name : selectedStudent?.name}
          initialImage={activeTab === "parent" ? profile?.image : selectedStudent?.image}
          isParent={activeTab === "parent"}
        />
      </div>
    </div>
  );
}

function AccountSettingsForm({ userId, name, initialImage, isParent }: { userId: string, name: string, initialImage: string, isParent: boolean }) {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialImage || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error", text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMsg({ type: "error", text: "Konfirmasi password tidak cocok!" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("userId", userId);
    if (imageFile) formData.append("image", imageFile);
    if (form.oldPassword) formData.append("oldPassword", form.oldPassword);
    if (form.newPassword) formData.append("newPassword", form.newPassword);

    try {
      const res = await fetch("/api/profile/update", { method: "PUT", body: formData });
      const data = await res.json();
      setMsg(data.success ? { type: "success", text: "Berhasil diperbarui!" } : { type: "error", text: data.message });
    } catch {
      setMsg({ type: "error", text: "Gagal menyambung ke server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* PHOTO UPLOAD SECTION */}
      <div className="flex items-center space-x-6 pb-6 border-b border-[#E8F5E9]">
        <div className="relative w-20 h-20 group">
          <div className="w-20 h-20 bg-[#E8F5E9] rounded-full overflow-hidden border-2 border-[#E8F5E9] flex items-center justify-center">
            {preview ? <Image src={preview} alt="Profile" width={80} height={80} className="object-cover w-full h-full" /> : <UserCircle size={40} className="text-[#4CAF50]" />}
          </div>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-[#4CAF50] text-white rounded-full border-4 border-white shadow-md hover:bg-[#2E7D32]">
            <Camera size={14} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2E7D32]">{isParent ? "Profil Orang Tua" : "Profil Anak"}</h2>
          <p className="text-xs font-bold text-[#2E7D32]/50 uppercase">{name}</p>
        </div>
      </div>

      {msg && <div className={`p-4 rounded-[16px] text-sm font-bold ${msg.type === "success" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFEBEE] text-[#D32F2F]"}`}>{msg.text}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase text-[#2E7D32]/60 ml-1">Password Lama</label>
            <input type="password" value={form.oldPassword} onChange={(e) => setForm({...form, oldPassword: e.target.value})} className="w-full p-4 mt-1 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[16px] text-sm" />
        </div>
        <input type="password" placeholder="Password Baru" value={form.newPassword} onChange={(e) => setForm({...form, newPassword: e.target.value})} className="w-full p-4 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[16px] text-sm" />
        <input type="password" placeholder="Konfirmasi Baru" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} className="w-full p-4 bg-[#FFFBF0] border border-[#E8F5E9] rounded-[16px] text-sm" />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-[#4CAF50] text-white py-4 rounded-[16px] font-bold hover:bg-[#2E7D32] transition">
        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Simpan Semua Perubahan"}
      </button>
    </form>
  );
}