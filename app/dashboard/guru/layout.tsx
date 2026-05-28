"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BookOpen, FileBarChart, LogOut, Bell, LayoutDashboard } from "lucide-react";

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Monitoring Siswa", icon: Users,         href: "/dashboard/guru" },
    { name: "Kelola Mapel",     icon: BookOpen,      href: "/dashboard/guru/mapel" },
    { name: "Laporan Mingguan", icon: FileBarChart,  href: "/dashboard/guru/laporan" },
  ];

  const pageLabel = pathname.split("/").pop()?.replace("-", " ") ?? "dashboard";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">

      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-slate-300 hidden md:flex flex-col fixed h-full shadow-2xl">
        <div className="p-8 text-white">
          <div className="font-black text-2xl flex items-center space-x-3 tracking-tighter">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-lg">
              G
            </div>
            <span>GURU PANEL</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl mt-6 border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Kelas Anda</p>
            <p className="text-sm font-bold text-indigo-400">Wali Kelas 4-B</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 p-4 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? "text-white bg-indigo-600 shadow-xl shadow-indigo-600/20"
                    : "text-slate-500 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon
                  size={22}
                  className={isActive ? "text-white" : "group-hover:text-indigo-400"}
                />
                <span className="font-bold tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <Link
            href="/auth/login"
            className="w-full flex items-center space-x-3 text-slate-500 hover:text-rose-400 p-4 rounded-2xl transition-all hover:bg-rose-500/5"
          >
            <LogOut size={20} />
            <span className="font-bold">Keluar Sistem</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center space-x-2 text-slate-400">
            <LayoutDashboard size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Dashboard &bull; {pageLabel}
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Bell size={22} className="text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full text-[8px] flex items-center justify-center text-white font-bold">
                2
              </span>
            </div>
            <div className="h-8 w-px bg-slate-100" />
            <div className="text-right">
              <p className="text-sm font-black text-slate-800 leading-none">Ibu Guru Pertiwi</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">Admin Guru</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}