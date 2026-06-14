"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BookOpen, FileBarChart, LogOut, LayoutDashboard } from "lucide-react";
import NotificationDropdown from "@/components/shared/NotificationDropdown";

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProfile(data);
      })
      .catch(() => {});
  }, []);

  const menuItems = [
    { name: "Monitoring Siswa", icon: Users,         href: "/dashboard/guru" },
    { name: "Kelola Mapel",     icon: BookOpen,      href: "/dashboard/guru/mapel" },
    { name: "Laporan Mingguan", icon: FileBarChart,  href: "/dashboard/guru/laporan" },
  ];

  const pageLabel = pathname.split("/").pop()?.replace("-", " ") ?? "dashboard";

  return (
    <div className="flex min-h-screen bg-[#FFFBF0]">

      <aside className="w-72 bg-white text-[#2E7D32] hidden md:flex flex-col fixed h-full shadow-[0_8px_32px_rgba(0,0,0,0.10)] border-r border-[#E8F5E9]">
        <div className="p-8">
          <div className="font-black text-2xl flex items-center space-x-3 tracking-tighter text-[#2E7D32]">
            <div className="w-10 h-10 bg-[#4CAF50] rounded-[24px] flex items-center justify-center text-white font-black">
              G
            </div>
            <span>GURU PANEL</span>
          </div>
          <div className="bg-[#E8F5E9] p-3 rounded-[24px] mt-6 border border-[#4CAF50]/20">
            <p className="text-[10px] text-[#2E7D32]/60 uppercase tracking-[0.2em] font-black">Kelas Anda</p>
            <p className="text-sm font-bold text-[#2E7D32]">Wali Kelas 4-B</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 p-4 rounded-[24px] transition-all duration-300 group ${
                  isActive
                    ? "text-white bg-[#4CAF50] shadow-[0_8px_32px_rgba(76,175,80,0.2)]"
                    : "text-[#2E7D32]/70 hover:bg-[#E8F5E9] hover:text-[#2E7D32]"
                }`}
              >
                <item.icon
                  size={22}
                  className={isActive ? "text-white" : "text-[#4CAF50] group-hover:text-[#2E7D32]"}
                />
                <span className="font-bold tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#E8F5E9]">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/auth/login";
            }}
            className="w-full flex items-center space-x-3 text-[#E53935] hover:text-white p-4 rounded-[24px] transition-all hover:bg-[#E53935]"
          >
            <LogOut size={20} />
            <span className="font-bold">Keluar Sistem</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-[#E8F5E9] px-8 py-5 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center space-x-2 text-[#2E7D32]/50">
            <LayoutDashboard size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Dashboard &bull; {pageLabel}
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <NotificationDropdown />
            <div className="h-8 w-px bg-[#E8F5E9]" />
            <div className="text-right">
              <p className="text-sm font-black text-[#2E7D32] leading-none">{profile ? profile.name : "Memuat..."}</p>
              <p className="text-[10px] font-bold text-[#FF8F00] uppercase mt-1">{profile ? profile.role : ""}</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
