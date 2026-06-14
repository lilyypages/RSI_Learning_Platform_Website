import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen, ArrowRight } from "lucide-react";

const COLORS = [
  { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", bar: "bg-[#4CAF50]", btn: "bg-[#4CAF50] hover:bg-[#2E7D32]" },
  { bg: "bg-orange-100", text: "text-orange-700", bar: "bg-orange-500", btn: "bg-orange-600 hover:bg-orange-700" },
  { bg: "bg-teal-100", text: "text-teal-700", bar: "bg-teal-500", btn: "bg-teal-700 hover:bg-teal-800" },
  { bg: "bg-rose-100", text: "text-rose-700", bar: "bg-rose-500", btn: "bg-rose-700 hover:bg-rose-800" },
];

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

  const allSubjects = await db.classSubject.findMany({
    where: { classId: student.classId ?? undefined },
    select: {
      id: true,
      subject: { select: { name: true, code: true } },
      materials: { where: { isPublished: true }, select: { id: true } },
    },
  });

  const progressList = (student as any).progress as Array<{
    completionPercent: number | null;
    totalScore: number | null;
    adaptiveLevel: string | null;
    classSubject: { id: string };
  }>;
  const merged = allSubjects.map(cs => {
    const prog = progressList.find(p => p.classSubject.id === cs.id);
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
            const c = COLORS[idx % COLORS.length];
            return (
              <div key={cs.id} className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 ${c.bg} ${c.text} text-[11px] font-black rounded-full uppercase`}>
                    {cs.name}
                  </span>
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
