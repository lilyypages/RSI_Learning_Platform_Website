"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Play, FileText, ArrowRight, Loader2, CheckCircle2, Lock, Film } from "lucide-react";
import Link from "next/link";
import YouTube from "react-youtube";

type Video = {
  id: string;
  title: string;
  embedUrl: string;
  pointReward: number;
};

type Material = {
  id: string;
  title: string;
  contentText: string | null;
  difficulty: string;
  videos: Video[];
  questions: any[];
  classSubjectId: string;
  classSubject: {
    subject: { name: string; code: string };
    class: { name: string };
  };
};

type Step = "video" | "materi" | "quiz";

export default function BelajarPage() {
  const { materiId } = useParams<{ materiId: string }>();
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedVideoIds, setCompletedVideoIds] = useState<string[]>([]);
  const [materiRead, setMateriRead] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/materials/${materiId}`);
        const data = await res.json();
        setMaterial(data);

        const progRes = await fetch(`/api/materials/${materiId}/progress`);
        if (progRes.ok) {
          const prog = await progRes.json();
          if (prog.completedVideoIds) setCompletedVideoIds(prog.completedVideoIds);
          if (prog.materiRead) setMateriRead(true);
        }
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, [materiId]);

  const allVideosDone = material
    ? material.videos.length > 0 && material.videos.every(v => completedVideoIds.includes(v.id))
    : false;

  const currentStep: Step = !allVideosDone && material && material.videos.length > 0
    ? "video"
    : !materiRead
    ? "materi"
    : "quiz";

  const handleVideoEnd = useCallback(async (videoId: string, title: string) => {
    if (completedVideoIds.includes(videoId)) return;
    try {
      const res = await fetch(`/api/videos/${videoId}/complete`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setCompletedVideoIds(prev => [...prev, videoId]);
      }
    } catch {}
  }, [completedVideoIds]);

  const handleTandaiBaca = () => {
    setMateriRead(true);
    fetch(`/api/materials/${materiId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materiRead: true }),
    });
  };

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
          <span className="text-xs text-slate-400">{material.classSubject.subject.name} • Kelas {material.classSubject.class.name}</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800">{material.title}</h1>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-3 bg-white rounded-[24px] border border-slate-100 p-4 shadow-sm">
        {[
          { key: "video", label: "Video", icon: Film },
          { key: "materi", label: "Materi", icon: FileText },
          { key: "quiz", label: "Quiz", icon: ArrowRight },
        ].map((step, i) => {
          const isActive = currentStep === step.key;
          const isDone = step.key === "video" ? allVideosDone : step.key === "materi" ? materiRead : false;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex-1 flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-[16px] text-xs font-black transition-all ${
                isActive
                  ? "bg-[#4CAF50] text-white shadow-lg shadow-[#4CAF50]/20"
                  : isDone
                  ? "bg-[#E8F5E9] text-[#2E7D32]"
                  : "bg-slate-100 text-slate-400"
              }`}>
                {isDone ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                <span>{step.label}</span>
              </div>
              {i < 2 && <div className="flex-1 h-0.5 bg-slate-100 last:hidden"><div className={`h-full ${isDone ? "bg-[#4CAF50]" : ""}`} style={{ width: isDone ? "100%" : "0%" }} /></div>}
            </div>
          );
        })}
      </div>

      {/* Step 1: Video */}
      {material.videos.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-black text-slate-700 flex items-center gap-2">
            <Film size={18} /> Video Pembelajaran
            {allVideosDone && <span className="text-xs bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full font-bold">Selesai</span>}
          </h2>
          {material.videos.map((v: any) => {
            const isCompleted = completedVideoIds.includes(v.id);
            const videoId = v.embedUrl
              .replace("https://www.youtube.com/embed/", "")
              .replace("https://www.youtube.com/watch?v=", "")
              .split("?")[0]
              .split("&")[0];
            const isActive = activeVideo === v.id;

            return (
              <div key={v.id} className={`bg-white rounded-[24px] border p-4 shadow-sm transition-all ${isCompleted ? "border-[#4CAF50]/30" : "border-slate-100"}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-slate-700">{v.title}</p>
                  {isCompleted && <span className="text-xs text-[#2E7D32] font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Selesai</span>}
                </div>

                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 relative group">
                  {isActive ? (
                    <YouTube
                      videoId={videoId}
                      opts={{
                        width: "100%",
                        height: "100%",
                        playerVars: { autoplay: 1, rel: 0 },
                      }}
                      className="w-full h-full"
                      onEnd={() => handleVideoEnd(v.id, v.title)}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center cursor-pointer" onClick={() => setActiveVideo(v.id)}>
                      <div className="w-16 h-16 rounded-full bg-[#4CAF50]/90 flex items-center justify-center transition-transform group-hover:scale-110 shadow-xl">
                        <Play size={28} className="text-white ml-1" fill="white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 2: Materi */}
      <div className={`bg-white rounded-[24px] border p-6 shadow-sm transition-all ${currentStep === "video" ? "opacity-50 pointer-events-none" : "border-slate-100"}`}>
        <h2 className="font-black text-slate-700 mb-3 flex items-center gap-2">
          {currentStep === "video" ? <Lock size={18} /> : <FileText size={18} />}
          Ringkasan Materi
          {materiRead && <span className="text-xs bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full font-bold">Sudah dibaca</span>}
        </h2>
        {currentStep === "video" ? (
          <p className="text-slate-400 text-sm font-medium">Selesaikan semua video terlebih dahulu untuk membuka materi.</p>
        ) : (
          <>
            <div ref={contentRef} className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
              {material.contentText || "Tidak ada ringkasan materi untuk bab ini."}
            </div>
            {!materiRead && (
              <button onClick={handleTandaiBaca} className="mt-4 px-6 py-3 bg-[#2E7D32] text-white rounded-[16px] font-black text-sm hover:bg-[#1B5E20] transition-all">
                Tandai Sudah Dibaca
              </button>
            )}
          </>
        )}
      </div>

      {/* Step 3: Quiz */}
      <div className={`${currentStep === "quiz" ? "" : "opacity-50 pointer-events-none"}`}>
        {questionCount > 0 ? (
          <button
            onClick={() => router.push(`/dashboard/siswa/quiz/${material.id}`)}
            disabled={currentStep !== "quiz"}
            className="w-full py-5 bg-[#4CAF50] text-white rounded-[28px] font-black text-lg shadow-xl hover:bg-[#2E7D32] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {currentStep === "video" ? "Selesaikan Video Dulu" : currentStep === "materi" ? "Baca Materi Dulu" : "Mulai Quiz"}
            <ArrowRight size={20} />
          </button>
        ) : (
          <p className="text-center text-slate-400 font-medium py-4">Belum ada soal untuk bab ini.</p>
        )}
      </div>
    </div>
  );
}
