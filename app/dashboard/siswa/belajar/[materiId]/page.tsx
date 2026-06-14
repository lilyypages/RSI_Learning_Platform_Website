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
      <Link href="/dashboard/siswa/mapel" className="inline-block mt-4 text-[#4CAF50] font-semibold hover:underline">
        Kembali ke Materi
      </Link>
    </div>
  );

  const questionCount = material.questions?.length ?? 0;
  const difficultyLabel: Record<string, string> = { EASY: "Mudah", MEDIUM: "Sedang", HARD: "Sulit" };
  const difficultyColor: Record<string, string> = {
    EASY: "bg-green-100 text-green-700",
    MEDIUM: "bg-amber-100 text-amber-700",
    HARD: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/dashboard/siswa/mapel/${material.classSubjectId ?? ""}`}
        className="inline-flex items-center gap-2 text-sm text-[#2E7D32]/60 hover:text-[#2E7D32] font-medium transition-all"
      >
        <ChevronLeft size={16} /> Kembali
      </Link>

      <div className="bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-3 py-1 text-[11px] font-black rounded-full uppercase ${difficultyColor[material.difficulty] ?? "bg-slate-100 text-slate-600"}`}>
            {difficultyLabel[material.difficulty] ?? material.difficulty}
          </span>
          <span className="text-xs text-slate-400">{questionCount} Soal</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800">{material.title}</h1>
      </div>

      {material.contentText && (
        <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm">
          <h2 className="font-black text-slate-700 mb-3 flex items-center gap-2">
            <FileText size={18} /> Ringkasan Materi
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{material.contentText}</p>
        </div>
      )}

      {material.videos && material.videos.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-black text-slate-700 flex items-center gap-2">
            <Play size={18} /> Video Pembelajaran
          </h2>
          {material.videos.map((v: any) => (
            <div key={v.id} className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-sm">
              <p className="font-bold text-slate-700 mb-2">{v.title}</p>
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900">
                <iframe
                  src={v.embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={v.title}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {questionCount > 0 && (
        <button
          onClick={() => router.push(`/dashboard/siswa/quiz/${material.id}`)}
          className="w-full py-5 bg-[#4CAF50] text-white rounded-[28px] font-black text-lg shadow-xl hover:bg-[#2E7D32] transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <span>Mulai Quiz</span><ArrowRight size={20} />
        </button>
      )}
    </div>
  );
}
