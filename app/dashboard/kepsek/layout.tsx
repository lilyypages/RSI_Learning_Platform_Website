"use client";

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, GraduationCap, ShieldCheck, LogOut, UserCircle } from "lucide-react";

export default function KepsekLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => { if (data.success) setProfile(data); })
      .catch(() => {});
  }, []);

  const menuItems = [
    { name: "Overview Sekolah", icon: LayoutGrid, href: "/dashboard/kepsek" },
    { name: "Manajemen Guru", icon: Users, href: "/dashboard/kepsek/guru" },
    { name: "Data Seluruh Siswa", icon: GraduationCap, href: "/dashboard/kepsek/siswa" },
    { name: "Audit Keamanan", icon: ShieldCheck, href: "/dashboard/kepsek/audit" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#F4F9F4]">

      {/* SIDEBAR */}
      <aside
        className="bg-gradient-to-b from-[#2E7D32] to-[#004D40] text-[#E8F5E9] flex flex-col fixed top-0 bottom-0 left-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.08)] shrink-0"
        style={{ width: "288px" }}
      >
        <div className="p-8 text-white border-b border-[#E8F5E9]/10 shrink-0">
          <h1 className="font-black text-2xl tracking-tighter flex items-center gap-2">
            🍃 <span className="bg-gradient-to-r from-[#FFFDE7] to-[#A5D6A7] bg-clip-text text-transparent">SIPANDA</span>
          </h1>
          <p className="text-[10px] text-[#A5D6A7] font-black uppercase tracking-[0.2em] mt-2">Executive Admin Panel</p>
        </div>

        <nav className="flex-1 p-6 flex flex-col gap-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NextLink
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 p-4 rounded-[20px] transition-all font-black text-sm shrink-0 w-full ${
                  isActive
                    ? "text-white bg-[#4CAF50] shadow-lg shadow-[#4CAF50]/30"
                    : "text-[#E8F5E9]/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={20} className="shrink-0" />
                <span>{item.name}</span>
              </NextLink>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#E8F5E9]/10 shrink-0">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 text-[#A5D6A7] hover:text-[#E53935] hover:bg-white/5 p-3 rounded-[20px] transition-all font-black text-sm w-full text-left"
            >
              <LogOut size={18} className="shrink-0" />
              <span>Keluar Sistem</span>
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div
        className="flex-1 flex flex-col min-w-0 min-h-screen"
        style={{ marginLeft: "288px" }}
      >
        <header className="bg-white/80 backdrop-blur-md border-b border-[#E8F5E9] px-10 py-5 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <h2 className="text-xl font-black text-[#2E7D32] tracking-tight">Kepala Sekolah</h2>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-[#2E7D32]">{profile?.name ?? "Memuat..."}</p>
              <p className="text-[10px] text-[#00897B] bg-[#E0F2F1] px-2 py-0.5 rounded-full uppercase font-black mt-1 inline-block">
                Kepala Sekolah
              </p>
            </div>
            <div className="w-12 h-12 bg-[#FFFBF0] border-2 border-[#E8F5E9] rounded-[16px] shadow-sm flex items-center justify-center">
              <UserCircle size={28} className="text-[#2E7D32]" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 w-full max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
