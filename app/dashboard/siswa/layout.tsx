// app/dashboard/siswa/layout.tsx
// Server Component — ambil session dari cookie, query DB untuk data siswa
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { LayoutDashboard, BookOpen, History, Bell, Flame, LogOut } from "lucide-react";

export default async function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Cek sesi — middleware sudah guard, ini double-check di server
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/auth/login");
  }

  // 2. Ambil data siswa dari DB (streak, lives, poin, nama)
  const student = await db.student.findFirst({
    where: { user: { id: session.userId } },
    select: {
      id: true,
      currentStreak: true,
      livesRemaining: true,
      totalPoints: true,
      user: {
        select: { name: true, imageUrl: true },
      },
    },
  });

  if (!student) redirect("/auth/login");

  const firstName = student.user.name.split(" ")[0];
  const initials = student.user.name
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Format tanggal Indonesia
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-[#F0F2F8] font-sans">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-60 bg-white border-r border-slate-100 flex flex-col hidden md:flex shrink-0">
        {/* Logo */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100">
          <span className="text-lg font-black tracking-tighter text-indigo-700">
            L·PLATFORM
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-medium">
            SD RSI Learning
          </p>
        </div>

        {/* Profil mini */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-indigo-100 shrink-0">
              {student.user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={student.user.imageUrl}
                  alt={student.user.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {student.user.name}
              </p>
              <p className="text-[11px] text-slate-400">Siswa</p>
            </div>
          </div>

          {/* Streak & Lives badges */}
          <div className="flex gap-2 mt-3">
            <span className="flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
              <Flame size={12} className="fill-orange-400 text-orange-400" />
              {student.currentStreak}d streak
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
              {"❤️".repeat(Math.max(0, student.livesRemaining ?? 0))} {student.livesRemaining ?? 0}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <Link
            href="/dashboard/siswa"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-indigo-700 bg-indigo-50 font-semibold text-sm transition-all"
          >
            <LayoutDashboard size={18} />
            Beranda
          </Link>
          <Link
            href="/dashboard/siswa/mapel"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium text-sm transition-all"
          >
            <BookOpen size={18} />
            Materi Saya
          </Link>
          <Link
            href="/dashboard/siswa/quiz"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium text-sm transition-all"
          >
            <History size={18} />
            Riwayat Quiz
          </Link>
        </nav>

        {/* Footer sidebar: poin + logout */}
        <div className="px-4 pb-5 space-y-3">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-3">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
              Total Poin
            </p>
            <p className="text-2xl font-black text-indigo-700">
              {(student.totalPoints ?? 0).toLocaleString("id-ID")}
              <span className="text-sm font-medium text-indigo-400 ml-1">pts</span>
            </p>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-sm font-medium transition-all"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-800">Panel Siswa</h2>
            <p className="text-xs text-slate-400 capitalize">{today}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/siswa/notifications"
              className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"
              aria-label="Notifikasi"
            >
              <Bell size={18} />
            </Link>
            <div className="h-6 w-px bg-slate-100" />
            <span className="text-sm font-semibold text-slate-700 hidden sm:block">
              {firstName}
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-indigo-100">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
