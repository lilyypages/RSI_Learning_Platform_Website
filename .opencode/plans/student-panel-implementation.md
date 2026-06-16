# Student Panel Implementation Plan

## Phase 1: Fix Quiz Routing

### Step 1: `app/dashboard/siswa/quiz/[materialId]/page.tsx`
Overwrite with full quiz engine from `quiz/page.tsx`:
- Fix `useParams<{ materialId: string }>()` 
- Add `normalizeOptions()` helper for array vs Record options
- Change indigo → green theme (`#4CAF50`, `#2E7D32`, `#E8F5E9`)
- Add `normalizeOptions(data.question.options)` on load
- Change spinner border from `indigo-600` to `#4CAF50`
- Change result card to green gradient `from-[#2E7D32] to-[#1B5E20]`
- Change "Kembali ke Materi" button bg to `#4CAF50` / `#2E7D32`
- Change progress bar to `bg-[#4CAF50]`
- Change selection highlight to `border-[#4CAF50]` / `bg-[#E8F5E9]` / `text-[#2E7D32]`
- Change submit button to `bg-[#2E7D32]` / `hover:bg-[#1B5E20]`
- Change error retry button to `bg-[#4CAF50]` / `hover:bg-[#2E7D32]`

### Step 2: `app/dashboard/siswa/quiz/page.tsx`
Rewrite as quiz history listing:
```tsx
"use client";
import { useEffect, useState } from "react";
import { Clock, Trophy, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function QuizHistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quiz/sessions")
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-3xl mx-auto py-20 text-center"><div className="animate-spin w-10 h-10 border-4 border-[#4CAF50] border-t-transparent rounded-full mx-auto mb-4" /><p className="text-slate-500">Memuat riwayat...</p></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-[#2E7D32]">Riwayat Quiz</h1>
      {sessions.length === 0 ? (
        <div className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 p-12 text-center">
          <Trophy size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Belum ada quiz yang dikerjakan.</p>
          <Link href="/dashboard/siswa/mapel" className="inline-block mt-4 px-6 py-3 bg-[#4CAF50] text-white rounded-2xl font-bold hover:bg-[#2E7D32] transition-all">Mulai Belajar</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s: any) => {
            const isPassed = s.resultLevel === "PASSED" || s.resultLevel === "EXCELLENT";
            return (
              <div key={s.id} className="bg-white rounded-[24px] border border-slate-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {isPassed ? <CheckCircle2 size={22} className="text-green-500 shrink-0" /> : <AlertCircle size={22} className="text-rose-500 shrink-0" />}
                  <div>
                    <p className="font-bold text-slate-800">{s.materialTitle}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Clock size={12} />{s.finishedAt ? new Date(s.finishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-800">{s.score}%</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.resultLevel === "EXCELLENT" ? "bg-purple-100 text-purple-700" : isPassed ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"}`}>{s.resultLevel ?? "-"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

## Phase 2: Connect Mapel Pages

### Step 3: `app/dashboard/siswa/mapel/page.tsx`
Server Component — query DB directly like dashboard home:
```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen, ArrowRight } from "lucide-react";

export default async function MapelPage() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") redirect("/auth/login");

  const student = await db.student.findFirst({
    where: { user: { id: session.userId } },
    select: {
      id: true,
      classId: true,
      progress: {
        select: {
          completionPercent: true,
          totalScore: true,
          adaptiveLevel: true,
          classSubject: {
            select: {
              id: true,
              subject: { select: { name: true, code: true } },
              materials: { where: { isPublished: true }, select: { id: true } },
            },
          },
        },
      },
    },
  });
  if (!student) redirect("/auth/login");

  // Ambil semua ClassSubject untuk kelas siswa
  const allSubjects = await db.classSubject.findMany({
    where: { classId: student.classId ?? undefined },
    select: {
      id: true,
      subject: { select: { name: true, code: true } },
      materials: { where: { isPublished: true }, select: { id: true } },
    },
  });

  const classSubjectIds = new Set(allSubjects.map(s => s.id));
  const progressMap = new Map(student.progress.map(p => [p.classSubject.id, p]));
  // Gabungkan: allSubjects sebagai master, timpa dengan progress jika ada
  const merged = allSubjects.map(cs => {
    const prog = progressMap.get(cs.id);
    return {
      id: cs.id,
      name: cs.subject.name,
      code: cs.subject.code,
      totalMateri: cs.materials.length,
      completionPercent: prog?.completionPercent ?? 0,
      totalScore: prog?.totalScore ?? 0,
      adaptiveLevel: prog?.adaptiveLevel ?? "STANDARD",
    };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-black text-[#2E7D32]">Materi Saya</h1>
      {merged.length === 0 ? (
        <div className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 p-12 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Belum ada mata pelajaran yang tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {merged.map((cs, idx) => {
            const colors = [
              { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", bar: "bg-[#4CAF50]", btn: "bg-[#4CAF50] hover:bg-[#2E7D32]" },
              { bg: "bg-orange-100", text: "text-orange-700", bar: "bg-orange-500", btn: "bg-orange-600 hover:bg-orange-700" },
              { bg: "bg-teal-100", text: "text-teal-700", bar: "bg-teal-500", btn: "bg-teal-700 hover:bg-teal-800" },
              { bg: "bg-rose-100", text: "text-rose-700", bar: "bg-rose-500", btn: "bg-rose-700 hover:bg-rose-800" },
            ];
            const c = colors[idx % colors.length];
            return (
              <div key={cs.id} className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 ${c.bg} ${c.text} text-[11px] font-black rounded-full uppercase`}>{cs.name}</span>
                  <span className="text-xs text-slate-400">{cs.totalMateri} materi</span>
                </div>
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Progres</span>
                    <span className={c.text}>{Math.round(cs.completionPercent)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`${c.bar} h-full rounded-full transition-all`} style={{ width: `${Math.max(cs.completionPercent, 2)}%` }} />
                  </div>
                </div>
                <Link href={`/dashboard/siswa/mapel/${cs.id}`}>
                  <button className={`w-full ${c.btn} text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 text-sm`}>
                    <span>Lihat Materi</span><ArrowRight size={17} />
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### Step 4: `app/dashboard/siswa/mapel/[mapelId]/page.tsx`
Server Component — daftar materi per mapel:
```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen, Video, FileText, Lock, ArrowLeft } from "lucide-react";

export default async function MapelDetailPage({ params }: { params: { mapelId: string } }) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") redirect("/auth/login");

  const classSubject = await db.classSubject.findUnique({
    where: { id: params.mapelId },
    include: {
      subject: true,
      class: true,
      materials: { where: { isPublished: true }, orderBy: { orderIndex: "asc" }, include: { _count: { select: { questions: true } } } },
    },
  });
  if (!classSubject) redirect("/dashboard/siswa/mapel");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard/siswa/mapel" className="inline-flex items-center gap-2 text-sm text-[#2E7D32]/60 hover:text-[#2E7D32] font-medium transition-all">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div className="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] rounded-[28px] p-7 text-white">
        <h1 className="text-2xl font-black">{classSubject.subject.name}</h1>
        <p className="text-[#A5D6A7] text-sm mt-1">Kelas {classSubject.class.name}</p>
      </div>

      {classSubject.materials.length === 0 ? (
        <div className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 p-12 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Belum ada materi untuk mapel ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Roadmap */}
          <div className="relative pl-8 space-y-0">
            {classSubject.materials.map((m, i) => {
              const isUnlocked = true; // For now all unlocked
              return (
                <div key={m.id} className="relative pb-6">
                  {/* Vertical line */}
                  {i < classSubject.materials.length - 1 && <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-[#E8F5E9]" />}
                  {/* Circle */}
                  <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 flex items-center justify-center ${isUnlocked ? "border-[#4CAF50] bg-white" : "border-slate-200 bg-white"}`}>
                    {isUnlocked ? <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" /> : <Lock size={10} className="text-slate-300" />}
                  </div>
                  {/* Card */}
                  <Link href={isUnlocked ? `/dashboard/siswa/belajar/${m.id}` : "#"} className={`block ml-4 p-5 rounded-[24px] border ${isUnlocked ? "bg-white border-slate-100 hover:shadow-md hover:border-[#4CAF50]/30" : "bg-slate-50 border-slate-100 opacity-60"} transition-all shadow-sm`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className={`font-bold ${isUnlocked ? "text-slate-800" : "text-slate-400"}`}>{m.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1"><FileText size={12} /> Materi</span>
                          <span className="flex items-center gap-1"><Video size={12} /> Video</span>
                          <span className="flex items-center gap-1"><BookOpen size={12} /> {m._count.questions} Soal</span>
                        </p>
                      </div>
                      {isUnlocked ? (
                        <span className="text-[#4CAF50] font-bold text-sm">Belajar →</span>
                      ) : (
                        <Lock size={16} className="text-slate-300" />
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Phase 3: Connect Belajar Page

### Step 5: `app/dashboard/siswa/belajar/[materiId]/page.tsx`
Client Component — fetch material API:
```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Play, FileText, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function BelajarPage() {
  const { materiId } = useParams<{ materiId: string }>();
  const router = useRouter();
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/materials/${materiId}`)
      .then(r => r.json())
      .then(d => setMaterial(d))
      .finally(() => setLoading(false));
  }, [materiId]);

  if (loading) return (
    <div className="max-w-3xl mx-auto py-20 text-center">
      <Loader2 size={24} className="animate-spin text-[#4CAF50] mx-auto" />
    </div>
  );
  if (!material) return (
    <div className="max-w-3xl mx-auto py-20 text-center">
      <p className="text-rose-500 font-black">Materi tidak ditemukan.</p>
      <Link href="/dashboard/siswa/mapel" className="inline-block mt-4 text-[#4CAF50] font-semibold hover:underline">Kembali ke Materi</Link>
    </div>
  );

  const questionCount = material.questions?.length ?? 0;
  const difficultyLabel: Record<string, string> = { EASY: "Mudah", MEDIUM: "Sedang", HARD: "Sulit" };
  const difficultyColor: Record<string, string> = { EASY: "bg-green-100 text-green-700", MEDIUM: "bg-amber-100 text-amber-700", HARD: "bg-rose-100 text-rose-700" };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href={`/dashboard/siswa/mapel/${material.classSubjectId ?? ""}`} className="inline-flex items-center gap-2 text-sm text-[#2E7D32]/60 hover:text-[#2E7D32] font-medium transition-all">
        <ChevronLeft size={16} /> Kembali
      </Link>

      {/* Header */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-3 py-1 text-[11px] font-black rounded-full uppercase ${difficultyColor[material.difficulty] ?? "bg-slate-100 text-slate-600"}`}>
            {difficultyLabel[material.difficulty] ?? material.difficulty}
          </span>
          <span className="text-xs text-slate-400">{questionCount} Soal</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800">{material.title}</h1>
      </div>

      {/* Content Text */}
      {material.contentText && (
        <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm">
          <h2 className="font-black text-slate-700 mb-3 flex items-center gap-2"><FileText size={18} /> Ringkasan Materi</h2>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{material.contentText}</p>
        </div>
      )}

      {/* Videos */}
      {material.videos && material.videos.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-black text-slate-700 flex items-center gap-2"><Play size={18} /> Video Pembelajaran</h2>
          {material.videos.map((v: any) => (
            <div key={v.id} className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-sm">
              <p className="font-bold text-slate-700 mb-2">{v.title}</p>
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900">
                <iframe src={v.embedUrl} className="w-full h-full" allowFullScreen title={v.title} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mulai Quiz */}
      {questionCount > 0 && (
        <button onClick={() => router.push(`/dashboard/siswa/quiz/${material.id}`)}
          className="w-full py-5 bg-[#4CAF50] text-white rounded-[28px] font-black text-lg shadow-xl hover:bg-[#2E7D32] transition-all flex items-center justify-center gap-2 active:scale-95">
          <span>Mulai Quiz</span><ArrowRight size={20} />
        </button>
      )}
    </div>
  );
}
```

## Phase 4: Cleanup

### Step 6: Remove `app/dashboard/siswa/belajar/page.tsx` (hardcoded preview)
Delete this file since `[materiId]` now handles all belajar pages dynamically.

### Step 7: Update `app/dashboard/siswa/materials/[id]/page.tsx` (optional)
This page already fetches from API, just verify it works (no change needed).

## Execution Order
1. Write `quiz/[materialId]/page.tsx` (full engine)
2. Write `quiz/page.tsx` (history listing)
3. Write `mapel/page.tsx` (DB query)
4. Write `mapel/[mapelId]/page.tsx` (DB query)
5. Write `belajar/[materiId]/page.tsx` (API fetch)
6. Delete `belajar/page.tsx`
7. Run `npx next build` to verify
