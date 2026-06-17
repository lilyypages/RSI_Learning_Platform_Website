"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, Bell, UserCircle, LogOut } from "lucide-react";

export default function OrtuLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ name: string; role: string; students?: { name: string; className: string | null; nis: string }[] } | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => { if (data.success) setProfile(data); })
      .catch(() => {});
  }, []);

  const menu = [
    { name: "Ringkasan Anak", icon: LayoutDashboard, href: "/dashboard/ortu" },
    { name: "Grafik Kemajuan", icon: LineChart, href: "/dashboard/ortu/grafik" },
    { name: "Pesan Guru", icon: Bell, href: "/dashboard/ortu/pesan" },
    { name: "Profil & Akun", icon: UserCircle, href: "/dashboard/ortu/profile" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F4F9F4] text-[#2E7D32]">
      {/* SIDEBAR */}
      <aside className="w-72 bg-gradient-to-b from-[#2E7D32] to-[#004D40] text-[#E8F5E9] hidden md:flex flex-col fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.08)]">
        <div className="p-8 border-b border-[#E8F5E9]/10">
          <div className="font-black text-2xl text-white flex items-center space-x-3 tracking-tighter">
            <div className="w-10 h-10 bg-[#4CAF50] rounded-[16px] flex items-center justify-center text-white text-xl shadow-lg shadow-[#4CAF50]/30">🍃</div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-[#FFFDE7] to-[#A5D6A7] bg-clip-text text-transparent font-black leading-none">ParentHub</span>
              <span className="text-[9px] text-[#A5D6A7] font-bold tracking-[0.15em] uppercase mt-1">SDN 01 SOLO</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menu.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 p-4 rounded-[20px] transition-all font-black text-sm w-full ${
                  isActive ? "text-white bg-[#4CAF50] shadow-lg shadow-[#4CAF50]/30" : "text-[#E8F5E9]/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={20} className="shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#E8F5E9]/10">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center space-x-3 text-[#A5D6A7] hover:text-[#E53935] hover:bg-white/5 p-3 rounded-[20px] transition-all font-black text-sm w-full text-left"
            >
              <LogOut size={20} className="shrink-0" />
              <span>Keluar Sistem</span>
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-72 min-h-screen flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-[#E8F5E9] px-10 py-5 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-black text-[#2E7D32] tracking-tight">Parent Dashboard</h2>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-[#2E7D32]">{profile?.name ?? "Memuat..."}</p>
              <p className="text-[10px] text-[#00897B] bg-[#E0F2F1] px-2 py-0.5 rounded-full uppercase font-black mt-1 inline-block">
                Wali Murid
              </p>
            </div>
            <div className="w-12 h-12 bg-[#FFFBF0] border-2 border-[#E8F5E9] rounded-[16px] shadow-sm flex items-center justify-center">
              <UserCircle size={28} className="text-[#2E7D32]" />
            </div>
          </div>
        </header>

        <div className="p-10 max-w-6xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
