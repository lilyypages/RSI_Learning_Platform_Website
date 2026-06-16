// app/dashboard/guru/layout.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  BookOpen,
  FileBarChart,
  LogOut,
  LayoutDashboard,
  User,
  Loader2,
} from "lucide-react";

import NotificationDropdown from "@/components/shared/NotificationDropdown";

// Interface untuk menampung data dari database via API /api/profile
interface TeacherProfileState {
  name: string;
  homeroomOf: string;
  imageUrl?: string;
}

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // State untuk menyimpan data profile asli dari database
  const [profile, setProfile] = useState<TeacherProfileState>({
    name: "Memuat nama...",
    homeroomOf: "Memuat kelas...",
  });

  // Fetch data profil saat layout dimuat
  useEffect(() => {
    async function getProfileData() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.success) {
          setProfile({
            name: data.name,
            homeroomOf: data.homeroomOf, // Menghasilkan "Wali Kelas X" atau "Bukan Wali Kelas"
            imageUrl: data.imageUrl,
          });
        }
      } catch (err) {
        console.error("Gagal memuat profil di layout:", err);
        setProfile({
          name: "Guru Pengajar",
          homeroomOf: "Gagal memuat kelas",
        });
      }
    }
    getProfileData();
  }, []);

  const menuItems = [
    {
      name: "Monitoring Siswa",
      icon: Users,
      href: "/dashboard/guru/monitoring",
    },
    {
      name: "Kelola Mapel",
      icon: BookOpen,
      href: "/dashboard/guru/mapel",
    },
    {
      name: "Laporan Mingguan",
      icon: FileBarChart,
      href: "/dashboard/guru/laporan",
    },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  const pageLabel =
    pathname.split("/").pop()?.replace("-", " ") ?? "dashboard";

  return (
    <div className="flex min-h-screen bg-[#FFFBF0]">

      {/* SIDEBAR */}
      <aside className="w-72 bg-white text-[#2E7D32] hidden md:flex flex-col fixed h-full shadow border-r border-[#E8F5E9]">

        {/* HEADER SIDEBAR */}
        <div className="p-8">
          <div className="font-black text-2xl flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#4CAF50] rounded-[16px] flex items-center justify-center text-white font-black">
              G
            </div>
            <span>GURU PANEL</span>
          </div>

          {/* SINKRONISASI KELAS WALI */}
          <div className="bg-[#E8F5E9] p-3 rounded-[20px] mt-6 w-full max-w-[220px]">
            <p className="text-[10px] uppercase tracking-widest text-[#2E7D32]/60 font-bold">
              Status Tugas
            </p>
            {/* Ditambahkan 'truncate' agar jika teks kepanjangan tidak merusak lebar sidebar */}
            <p className="text-sm font-bold text-[#2E7D32] truncate" title={profile.homeroomOf}>
              {profile.homeroomOf}
            </p>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 p-4 rounded-[20px] transition ${
                isActive(item.href)
                  ? "bg-[#4CAF50] text-white"
                  : "hover:bg-[#E8F5E9] text-[#2E7D32]/70"
              }`}
            >
              <item.icon size={20} />
              <span className="font-semibold">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* PROFILE + LOGOUT (BOTTOM SECTION) */}
        <div className="p-4 mt-auto border-t border-[#E8F5E9] space-y-3">

          {/* SINKRONISASI NAMA SISI KIRI BAWAH */}
          <Link
            href="/dashboard/guru/profile"
            className="flex items-center space-x-3 p-3 rounded-[16px] hover:bg-[#E8F5E9] w-full min-w-0" // Ditambahkan min-w-0 agar flex child bisa truncate
          >
            <div className="w-9 h-9 bg-[#4CAF50] rounded-full flex-shrink-0 flex items-center justify-center text-white overflow-hidden border border-[#E8F5E9]">
              {profile.imageUrl ? (
                <img src={profile.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={16} />
              )}
            </div>

            {/* Pembungkus teks harus diberi min-w-0 agar fungsi truncate di dalamnya bekerja */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#2E7D32] truncate" title={profile.name}>
                {profile.name}
              </p>
              <p className="text-[10px] text-[#2E7D32]/60 font-medium">
                Kelola Profile
              </p>
            </div>
          </Link>

          {/* LOGOUT */}
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/auth/login";
            }}
            className="w-full flex items-center justify-center space-x-2 text-[#E53935] hover:bg-[#E53935] hover:text-white p-3 rounded-[16px] transition-all"
          >
            <LogOut size={18} />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
{/* MAIN CONTENT */}
      {/* 🌟 PERBAIKAN: Ditambahkan 'max-w-full' dan 'min-w-0' agar layout utama mengunci viewport */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen max-w-full min-w-0 overflow-x-hidden">

        {/* HEADER ATAS */}
        <header className="bg-white/80 backdrop-blur-md border-b border-[#E8F5E9] px-8 py-5 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center space-x-2 text-[#2E7D32]/60">
            <LayoutDashboard size={16} />
            <span className="text-xs uppercase tracking-widest font-bold">
              Dashboard • {pageLabel}
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <NotificationDropdown />
            <div className="h-6 w-px bg-[#E8F5E9]" />

            {/* SINKRONISASI NAMA HEADER KANAN ATAS */}
            <div className="text-right">
              <p className="text-sm font-bold text-[#2E7D32]">
                {profile.name}
              </p>
              <p className="text-[10px] text-[#FF8F00] uppercase font-bold tracking-wider">
                Guru
              </p>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        {/* 🌟 PERBAIKAN: Ditambahkan 'min-w-0' dan 'overflow-hidden' agar element anak (seperti tabel) tahu batas tepi layar */}
        <div className="p-8 max-w-7xl mx-auto w-full min-w-0 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}