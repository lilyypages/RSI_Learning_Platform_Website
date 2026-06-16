"use client";

import React from "react";
import NextLink from "next/link"; 
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, GraduationCap, ShieldCheck, LogOut } from "lucide-react";

export default function KepsekLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Overview Sekolah", icon: LayoutGrid, href: "/dashboard/kepsek" },
    { name: "Manajemen Guru", icon: Users, href: "/dashboard/kepsek/guru" },
    { name: "Data Seluruh Siswa", icon: GraduationCap, href: "/dashboard/kepsek/siswa" },
    { name: "Audit Keamanan", icon: ShieldCheck, href: "/dashboard/kepsek/audit" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-[#F4F9F4]">
      
      {/* 1. SIDEBAR FIXED - Diubah ke gradasi hijau-teal khas eksekutif */}
      <aside 
        className="bg-gradient-to-b from-[#2E7D32] to-[#004D40] text-[#E8F5E9] flex flex-col fixed top-0 bottom-0 left-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.1)] shrink-0"
        style={{ width: "288px" }}
      >
        {/* Header Sidebar */}
        <div className="p-8 text-white border-b border-[#E8F5E9]/10 shrink-0">
          <h1 className="font-black text-2xl tracking-tighter flex items-center gap-2">
            🍃 <span className="bg-gradient-to-r from-[#FFFDE7] to-[#A5D6A7] bg-clip-text text-transparent">SIPANDA</span>
          </h1>
          <p className="text-[10px] text-[#A5D6A7] font-black uppercase tracking-[0.2em] mt-2">Executive Admin Panel</p>
        </div>
        
        {/* Menu Navigasi - Menggunakan rounded-[24px] untuk item aktif */}
        <nav className="flex-1 p-6 flex flex-col gap-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NextLink 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 p-4 rounded-[24px] transition-all font-black text-sm shrink-0 w-full ${
                  isActive 
                    ? "text-white bg-[#4CAF50] shadow-[0_8px_20px_rgba(76,175,80,0.3)]" 
                    : "text-[#E8F5E9]/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={20} className="shrink-0" />
                <span>{item.name}</span>
              </NextLink>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-8 border-t border-[#E8F5E9]/10 shrink-0">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/auth/login";
            }}
            className="flex items-center gap-3 text-[#A5D6A7] hover:text-[#E53935] transition-colors text-sm font-black group w-full text-left"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform shrink-0" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div 
        className="flex-1 flex flex-col min-w-0 min-h-screen" 
        style={{ marginLeft: "288px" }}
      >
        <main className="flex-1 p-6 md:p-10 w-full max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}