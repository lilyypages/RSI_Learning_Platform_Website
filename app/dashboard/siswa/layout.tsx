// app/dashboard/siswa/layout.tsx
// Server Component — ambil session dari cookie, query DB untuk data siswa
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { LayoutDashboard, BookOpen, History, Bell, Flame, LogOut, MessageSquare } from "lucide-react";

export default async function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/auth/login");
  }

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

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-[#FFFBF0] font-sans">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-72 bg-white border-r border-[#E8F5E9] flex flex-col hidden md:flex fixed h-full shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
        {/* Logo */}
        <div className="px-6 pt-6 pb-5 border-b border-[#E8F5E9]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#4CAF50] rounded-[24px] flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#4CAF50]/20">
              S
            </div>
            <div>
              <span className="text-lg font-black tracking-tighter text-[#2E7D32]">
                SISWA
              </span>
              <p className="text-[10px] text-[#2E7D32]/50 uppercase tracking-widest font-medium">
                SD RSI Learning
              </p>
            </div>
          </div>
        </div>

        {/* Profil mini */}
        <div className="px-5 py-4 border-b border-[#E8F5E9]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] flex items-center justify-center text-white text-xs font-black shadow-md shadow-[#4CAF50]/20 shrink-0">
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
              <p className="text-sm font-bold text-[#2E7D32] truncate">
                {student.user.name}
              </p>
              <p className="text-[11px] text-[#2E7D32]/60">Siswa</p>
            </div>
          </div>

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
            className="flex items-center gap-3 px-3 py-2.5 rounded-[24px] text-white bg-[#4CAF50] font-semibold text-sm transition-all shadow-[0_4px_12px_rgba(76,175,80,0.2)]"
          >
            <LayoutDashboard size={18} />
            Beranda
          </Link>
          <Link
            href="/dashboard/siswa/mapel"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[24px] text-[#2E7D32]/70 hover:bg-[#E8F5E9] hover:text-[#2E7D32] font-medium text-sm transition-all"
          >
            <BookOpen size={18} />
            Materi Saya
          </Link>
          <Link
            href="/dashboard/siswa/quiz"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[24px] text-[#2E7D32]/70 hover:bg-[#E8F5E9] hover:text-[#2E7D32] font-medium text-sm transition-all"
          >
            <History size={18} />
            Riwayat Quiz
          </Link>
          <Link
            href="/dashboard/siswa/pesan"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[24px] text-[#2E7D32]/70 hover:bg-[#E8F5E9] hover:text-[#2E7D32] font-medium text-sm transition-all"
          >
            <MessageSquare size={18} />
            Pesan Guru
          </Link>
        </nav>

        {/* Footer sidebar: poin + logout */}
        <div className="px-4 pb-5 space-y-3">
          <div className="bg-gradient-to-br from-[#E8F5E9] to-[#FFFDE7] border border-[#4CAF50]/20 rounded-[24px] p-4">
            <p className="text-[10px] font-bold text-[#2E7D32]/60 uppercase tracking-wider mb-1">
              Total Poin
            </p>
            <p className="text-2xl font-black text-[#2E7D32]">
              {(student.totalPoints ?? 0).toLocaleString("id-ID")}
              <span className="text-sm font-medium text-[#4CAF50] ml-1">pts</span>
            </p>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-[24px] text-[#2E7D32]/50 hover:text-[#E53935] hover:bg-rose-50 text-sm font-medium transition-all"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-72">
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-[#E8F5E9] px-6 py-4 flex justify-between items-center shrink-0 sticky top-0 z-30">
          <div>
            <h2 className="text-base font-bold text-[#2E7D32]">Panel Siswa</h2>
            <p className="text-xs text-[#2E7D32]/50 capitalize">{today}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/siswa/notifications"
              className="p-2 text-[#2E7D32]/50 hover:text-[#4CAF50] rounded-lg hover:bg-[#E8F5E9] transition-all"
              aria-label="Notifikasi"
            >
              <Bell size={18} />
            </Link>
            <div className="h-6 w-px bg-[#E8F5E9]" />
            <span className="text-sm font-semibold text-[#2E7D32] hidden sm:block">
              {firstName}
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] flex items-center justify-center text-white text-xs font-black shadow-md shadow-[#4CAF50]/20">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8F5E9] flex md:hidden justify-around items-center py-3 px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <Link href="/dashboard/siswa" className="flex flex-col items-center gap-0.5 text-[#4CAF50]">
            <LayoutDashboard size={20} />
            <span className="text-[9px] font-bold">Beranda</span>
          </Link>
          <Link href="/dashboard/siswa/mapel" className="flex flex-col items-center gap-0.5 text-[#2E7D32]/60 hover:text-[#2E7D32]">
            <BookOpen size={20} />
            <span className="text-[9px] font-bold">Materi</span>
          </Link>
          <Link href="/dashboard/siswa/quiz" className="flex flex-col items-center gap-0.5 text-[#2E7D32]/60 hover:text-[#2E7D32]">
            <History size={20} />
            <span className="text-[9px] font-bold">Quiz</span>
          </Link>
          <Link href="/dashboard/siswa/pesan" className="flex flex-col items-center gap-0.5 text-[#2E7D32]/60 hover:text-[#2E7D32]">
            <MessageSquare size={20} />
            <span className="text-[9px] font-bold">Pesan</span>
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex flex-col items-center gap-0.5 text-[#2E7D32]/60 hover:text-[#E53935]">
              <LogOut size={20} />
              <span className="text-[9px] font-bold">Keluar</span>
            </button>
          </form>
        </nav>
      </div>
    </div>
  );
}
