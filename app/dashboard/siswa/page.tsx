// app/dashboard/siswa/page.tsx
// Server Component — fetch progress, mapel, quiz session terbaru dari DB
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  BookOpen,
  Trophy,
  Star,
  ArrowRight,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLevelColor(level: string) {
  switch (level) {
    case "ADVANCED":
      return { badge: "bg-purple-100 text-purple-700", bar: "bg-purple-500", label: "Advanced" };
    case "REMEDIAL":
      return { badge: "bg-rose-100 text-rose-700", bar: "bg-rose-500", label: "Remedial" };
    default:
      return { badge: "bg-blue-100 text-blue-700", bar: "bg-blue-500", label: "Standard" };
  }
}

function getSubjectColor(index: number) {
  const palettes = [
    { accent: "border-b-[#4CAF50]", badgeBg: "bg-[#E8F5E9]", badgeText: "text-[#2E7D32]", bar: "bg-[#4CAF50]", btn: "bg-[#4CAF50] hover:bg-[#2E7D32]" },
    { accent: "border-b-orange-500", badgeBg: "bg-orange-100", badgeText: "text-orange-700", bar: "bg-orange-500", btn: "bg-orange-600 hover:bg-orange-700" },
    { accent: "border-b-teal-500",   badgeBg: "bg-teal-100",   badgeText: "text-teal-700",   bar: "bg-teal-500",   btn: "bg-teal-700 hover:bg-teal-800" },
    { accent: "border-b-rose-500",   badgeBg: "bg-rose-100",   badgeText: "text-rose-700",   bar: "bg-rose-500",   btn: "bg-rose-700 hover:bg-rose-800" },
  ];
  return palettes[index % palettes.length];
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function SiswaDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") redirect("/auth/login");

  // ── Query utama ────────────────────────────────────────────────────────────
  const student = await db.student.findFirst({
    where: { user: { id: session.userId } },
    select: {
      id: true,
      classId: true,
      totalPoints: true,
      currentStreak: true,
      livesRemaining: true,
      class: { select: { name: true } },
      user: { select: { name: true } },

      // Progress per mapel
      progress: {
        orderBy: { lastActivity: "desc" },
        take: 4,
        select: {
          completionPercent: true,
          totalScore: true,
          adaptiveLevel: true,
          lastActivity: true,
          classSubject: {
            select: {
              id: true,
              subject: { select: { name: true, code: true } },
              materials: {
                where: { isPublished: true },
                select: { id: true },
              },
            },
          },
        },
      },

      // Quiz sessions terbaru
      quizSessions: {
        orderBy: { startedAt: "desc" },
        take: 3,
        where: { finishedAt: { not: null } },
        select: {
          id: true,
          score: true,
          resultLevel: true,
          finishedAt: true,
          material: { select: { title: true } },
        },
      },
    },
  });

  if (!student) redirect("/auth/login");

  // ── Hitung stats ───────────────────────────────────────────────────────────
  const materiSelesai = student.progress.reduce((sum: number, p) => {
    const total = p.classSubject.materials.length;
    const done = Math.round(((p.completionPercent ?? 0) / 100) * total);
    return sum + done;
  }, 0);

  // Rank: berapa siswa dengan total_points lebih tinggi + 1
  const rank = await db.student.count({
    where: { 
      classId: student.classId,
      totalPoints: { gt: student.totalPoints ?? 0 } },
  });

  const rankDisplay = (student.totalPoints ?? 0) > 0 ? `#${rank + 1}` : "0";

  const firstName = student.user.name.split(" ")[0];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-7 max-w-5xl mx-auto">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] rounded-[28px] p-7 text-white shadow-xl shadow-[#2E7D32]/20">
        <div className="relative z-10">
          {(student.currentStreak ?? 0) > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-orange-400 fill-orange-400" />
              <span className="text-xs font-bold text-[#A5D6A7] uppercase tracking-widest">
                {student.currentStreak ?? 0} Hari Berturut-turut!
              </span>
            </div>
          )}
          <h1 className="text-2xl font-black mb-1.5">
            Semangat Belajar, {firstName}! 👋
          </h1>
          {student.class?.name && (
            <p className="text-sm font-bold text-[#A5D6A7] mb-1">
              🏫 Kelas {student.class.name}
            </p>
          )}
          <p className="text-[#A5D6A7] text-sm max-w-md leading-relaxed">
            {(student.currentStreak ?? 0) >= 3
              ? `Streak ${student.currentStreak ?? 0} hari! Terus pertahankan ya.`
              : "Yuk mulai belajar hari ini dan bangun streak kamu!"}
          </p>
        </div>
        {/* Lives indicator di kanan */}
        <div className="absolute top-6 right-7 flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-xl transition-all ${
                i < (student.livesRemaining ?? 0) ? "opacity-100" : "opacity-20"
              }`}
            >
              ❤️
            </span>
          ))}
        </div>
        {/* Dekorasi */}
        <div className="absolute top-[-30%] right-[-8%] w-56 h-56 bg-white opacity-[0.07] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-40%] right-[15%] w-40 h-40 bg-white opacity-[0.05] rounded-full pointer-events-none" />
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Materi Selesai",
            value: materiSelesai.toString(),
            icon: BookOpen,
            colorIcon: "text-blue-600",
            colorBg: "bg-blue-50",
          },
          {
            label: "Poin Belajar",
            value: (student.totalPoints ?? 0).toLocaleString("id-ID"),
            icon: Star,
            colorIcon: "text-yellow-600",
            colorBg: "bg-yellow-50",
          },
          {
            label: "Peringkat",
            value: rankDisplay,
            icon: Trophy,
            colorIcon: "text-purple-600",
            colorBg: "bg-purple-50",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`${stat.colorBg} ${stat.colorIcon} p-3 rounded-xl`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Progress Mapel ────────────────────────────────────────────────── */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-slate-800">
            Petualangan Belajar 🗺️
          </h3>
          <Link
            href="/dashboard/siswa/mapel"
            className="text-xs text-[#4CAF50] font-semibold hover:underline flex items-center gap-1"
          >
            Lihat semua <ArrowRight size={13} />
          </Link>
        </div>

        {student.progress.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center text-slate-400">
            <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
            <p className="font-medium">Belum ada materi yang ditugaskan.</p>
            <p className="text-sm mt-1">Hubungi guru kelas kamu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {student.progress.map((p, idx) => {
              const palette = getSubjectColor(idx);
              const level = getLevelColor(p.adaptiveLevel ?? "STANDARD");
              const pct = Math.round(p.completionPercent ?? 0);
              const isNew = pct === 0;
              const subjectName = p.classSubject.subject.name;
              const classSubjectId = p.classSubject.id;

              // Estimasi waktu: kasar 15 menit per 10% sisa
              const minsLeft = Math.max(5, Math.round(((100 - pct) / 10) * 15));

              return (
                <div
                  key={classSubjectId}
                  className={`bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm group ${
                    isNew ? `border-b-4 ${palette.accent}` : ""
                  }`}
                >
                  <div className="p-6">
                    {/* Top row */}
                    <div className="flex justify-between items-start mb-5">
                      <span
                        className={`px-3 py-1 ${palette.badgeBg} ${palette.badgeText} text-[11px] font-black rounded-full uppercase tracking-tight`}
                      >
                        {subjectName}
                      </span>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 ${level.badge} text-[10px] font-bold rounded-full`}
                        >
                          {level.label}
                        </span>
                        <span className="flex items-center text-slate-400 text-[11px] font-medium">
                          <Clock size={12} className="mr-1" />
                          {minsLeft} mnt
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h4 className="text-xl font-black text-slate-800 mb-1.5">
                      {subjectName}
                    </h4>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                      {isNew
                        ? `Kamu baru mulai! Pelajari ${subjectName} untuk membuka pencapaian baru.`
                        : pct >= 80
                        ? `Hampir selesai! Tinggal sedikit lagi untuk ${subjectName}.`
                        : `Lanjutkan belajar ${subjectName} — kamu sudah ${pct}% selesai.`}
                    </p>

                    {/* Progress bar */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Progres</span>
                        <span className={palette.badgeText}>{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`${palette.bar} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`/dashboard/siswa/mapel/${classSubjectId}`}
                    >
                      <button
                        className={`w-full ${
                          isNew
                            ? `${palette.btn} text-white shadow-lg`
                            : "bg-slate-100 group-hover:bg-slate-800 group-hover:text-white text-slate-600"
                        } font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm`}
                      >
                        {isNew ? "Mulai Sekarang" : "Lanjutkan"}
                        <ArrowRight size={17} />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Quiz Terbaru + Banner Help ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Quiz terbaru */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-black text-slate-800">Quiz Terbaru</h4>
            <Link
              href="/dashboard/siswa/quiz"
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {student.quizSessions.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              Belum ada quiz yang diselesaikan.
            </p>
          ) : (
            <div className="space-y-3">
              {student.quizSessions.map((qs) => {
                const isPassed =
                  qs.resultLevel === "PASSED" || qs.resultLevel === "EXCELLENT";
                return (
                  <div
                    key={qs.id}
                    className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {isPassed ? (
                        <CheckCircle2
                          size={18}
                          className="text-green-500 shrink-0"
                        />
                      ) : (
                        <AlertCircle
                          size={18}
                          className="text-rose-500 shrink-0"
                        />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 line-clamp-1">
                          {qs.material.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {qs.finishedAt
                            ? new Date(qs.finishedAt).toLocaleDateString(
                                "id-ID",
                                { day: "numeric", month: "short" }
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-800">
                        {qs.score} pts
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          qs.resultLevel === "EXCELLENT"
                            ? "bg-purple-100 text-purple-700"
                            : isPassed
                            ? "bg-green-100 text-green-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {qs.resultLevel ?? "-"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help banner */}
        <div className="lg:col-span-2 bg-white border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-black text-slate-800 mb-1">
              Tips Belajar 📚
            </h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Jangan ragu tanya Guru di kelas kalau ada materi yang bingung ya,{" "}
              {firstName}! Orang tua kamu juga bisa memantau perkembangan belajar lewat dashboard mereka.
            </p>
          </div>
          <Link href="/dashboard/siswa/mapel" className="mt-4 block">
            <button className="w-full bg-white border-2 border-slate-800 text-slate-800 py-2.5 rounded-xl font-black text-sm hover:bg-slate-800 hover:text-white transition-all">
              Lanjut Belajar
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
