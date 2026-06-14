"use client";
import { useEffect, useState } from "react";
import { Clock, Trophy, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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

  if (loading) return (
    <div className="max-w-3xl mx-auto py-20 text-center">
      <Loader2 size={24} className="animate-spin text-[#4CAF50] mx-auto" />
      <p className="text-slate-500 mt-3">Memuat riwayat...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-[#2E7D32]">Riwayat Quiz</h1>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 p-12 text-center">
          <Trophy size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Belum ada quiz yang dikerjakan.</p>
          <Link
            href="/dashboard/siswa/mapel"
            className="inline-block mt-4 px-6 py-3 bg-[#4CAF50] text-white rounded-2xl font-bold hover:bg-[#2E7D32] transition-all"
          >
            Mulai Belajar
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s: any) => {
            const isPassed = s.resultLevel === "PASSED" || s.resultLevel === "EXCELLENT";
            return (
              <div
                key={s.id}
                className="bg-white rounded-[24px] border border-slate-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {isPassed ? (
                    <CheckCircle2 size={22} className="text-green-500 shrink-0" />
                  ) : (
                    <AlertCircle size={22} className="text-rose-500 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold text-slate-800">{s.materialTitle}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={12} />
                      {s.finishedAt
                        ? new Date(s.finishedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-800">{s.score}%</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.resultLevel === "EXCELLENT"
                        ? "bg-purple-100 text-purple-700"
                        : isPassed
                        ? "bg-green-100 text-green-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {s.resultLevel ?? "-"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
