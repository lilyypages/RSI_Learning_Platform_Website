import { notFound } from "next/navigation";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen, FileText, Video, ArrowLeft, Lock } from "lucide-react";

export default async function MapelDetailPage(props: { params: Promise<{ mapelId: string }> }) {
  const { mapelId } = await props.params;

  const session = await getSession();
  if (!session || session.role !== "STUDENT") redirect("/auth/login");

  const classSubject = await db.classSubject.findUnique({
    where: { id: mapelId },
    include: {
      subject: true,
      class: true,
      materials: {
        where: { isPublished: true },
        orderBy: { orderIndex: "asc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });
  if (!classSubject) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard/siswa/mapel"
        className="inline-flex items-center gap-2 text-sm text-[#2E7D32]/60 hover:text-[#2E7D32] font-medium transition-all"
      >
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
        <div className="space-y-0 relative pl-8">
          {classSubject.materials.map((m, i) => {
            const isUnlocked = true;
            return (
              <div key={m.id} className="relative pb-6">
                {i < classSubject.materials.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-[#E8F5E9]" />
                )}
                <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 flex items-center justify-center ${isUnlocked ? "border-[#4CAF50] bg-white" : "border-slate-200 bg-white"}`}>
                  {isUnlocked ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />
                  ) : (
                    <Lock size={10} className="text-slate-300" />
                  )}
                </div>
                <Link
                  href={isUnlocked ? `/dashboard/siswa/belajar/${m.id}` : "#"}
                  className={`block ml-4 p-5 rounded-[24px] border ${isUnlocked ? "bg-white border-slate-100 hover:shadow-md hover:border-[#4CAF50]/30" : "bg-slate-50 border-slate-100 opacity-60"} transition-all shadow-sm`}
                >
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
                      <span className="text-[#4CAF50] font-bold text-sm whitespace-nowrap">Belajar →</span>
                    ) : (
                      <Lock size={16} className="text-slate-300 shrink-0" />
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
