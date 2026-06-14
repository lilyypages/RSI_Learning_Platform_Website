"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Zap, Heart, Check, X, Trophy, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Question = {
  id: string;
  questionText: string;
  options: Record<string, string>;
  difficulty: string;
  pointReward: number;
};

type QuizState = "loading" | "playing" | "feedback" | "finished" | "error";

type ReviewItem = {
  questionText: string;
  options: Record<string, string>;
  userAnswer: string;
  correctAnswer: string;
  correctValue: string;
  isCorrect: boolean;
};

type FinishData = {
  score: number;
  correctCount: number;
  wrongCount: number;
  totalAnswered: number;
  resultLevel: string;
  pointsEarned: number;
  review: ReviewItem[];
};

const LEVEL_LABEL: Record<string, string> = { EASY: "Mudah", MEDIUM: "Sedang", HARD: "Sulit" };
const LEVEL_COLOR: Record<string, string> = {
  EASY: "bg-green-100 text-green-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-rose-100 text-rose-700",
};

function normalizeOptions(options: unknown): Record<string, string> {
  if (!options) return { A: "", B: "", C: "", D: "" };
  if (Array.isArray(options)) {
    const labels = ["A", "B", "C", "D"];
    const result: Record<string, string> = {};
    options.forEach((val, i) => { if (i < 4) result[labels[i]] = String(val); });
    return result;
  }
  return options as Record<string, string>;
}

export default function QuizPage() {
  const { materialId } = useParams<{ materialId: string }>();

  const [quizState, setQuizState]         = useState<QuizState>("loading");
  const [sessionId, setSessionId]         = useState<string>("");
  const [question, setQuestion]           = useState<Question | null>(null);
  const [currentLevel, setCurrentLevel]   = useState("MEDIUM");
  const [lives, setLives]                 = useState(3);
  const [streak, setStreak]               = useState(0);
  const [questionNum, setQuestionNum]     = useState(1);
  const [selected, setSelected]           = useState<string | null>(null);
  const [isCorrect, setIsCorrect]         = useState<boolean | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [finish, setFinish]               = useState<FinishData | null>(null);
  const [submitting, setSubmitting]       = useState(false);

  const startQuiz = useCallback(async () => {
    setQuizState("loading");
    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId }),
      });
      const data = await res.json();
      if (!res.ok || !data.sessionId) { setQuizState("error"); return; }
      setSessionId(data.sessionId);
      setQuestion({ ...data.question, options: normalizeOptions(data.question.options) });
      setCurrentLevel(data.currentLevel);
      setLives(data.lives ?? 3);
      setStreak(data.streak ?? 0);
      setQuestionNum(1);
      setSelected(null);
      setIsCorrect(null);
      setQuizState("playing");
    } catch { setQuizState("error"); }
  }, [materialId]);

  useEffect(() => { startQuiz(); }, [startQuiz]);

  async function finishQuiz() {
    try {
      const res = await fetch("/api/quiz/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      setFinish(data);
      setQuizState("finished");
    } catch { setQuizState("error"); }
  }

  async function submitAnswer() {
    if (!selected || !question || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, questionId: question.id, answerGiven: selected }),
      });
      const data = await res.json();
      setIsCorrect(data.isCorrect);
      setCorrectAnswer(data.correctAnswer);
      setStreak(data.streak ?? 0);
      setCurrentLevel(data.currentLevel ?? currentLevel);

      if (!data.isCorrect) {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) { await finishQuiz(); return; }
      }

      setQuizState("feedback");

      if (data.done) {
        setTimeout(() => finishQuiz(), 1500);
      } else {
        setTimeout(() => {
          setQuestion({ ...data.nextQuestion, options: normalizeOptions(data.nextQuestion.options) });
          setQuestionNum(q => q + 1);
          setSelected(null);
          setIsCorrect(null);
          setQuizState("playing");
        }, 1500);
      }
    } catch {}
    finally { setSubmitting(false); }
  }

  if (quizState === "loading") return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <div className="animate-spin w-10 h-10 border-4 border-[#4CAF50] border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-slate-500 font-medium">Memuat soal...</p>
    </div>
  );

  if (quizState === "error") return (
    <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
      <p className="text-rose-500 font-black text-lg">Gagal memuat quiz.</p>
      <p className="text-slate-400 text-sm">Pastikan materi ini memiliki soal tersedia.</p>
      <button onClick={startQuiz} className="flex items-center space-x-2 mx-auto px-6 py-3 bg-[#4CAF50] text-white rounded-2xl font-bold hover:bg-[#2E7D32] transition-all">
        <RefreshCw size={16} /><span>Coba Lagi</span>
      </button>
    </div>
  );

  if (quizState === "finished" && finish) {
    const isPassed = finish.resultLevel !== "FAILED";
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-8 text-center">
        <div className={`p-10 rounded-[40px] ${isPassed ? "bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]" : "bg-slate-800"} text-white shadow-2xl`}>
          <Trophy size={56} className="mx-auto mb-4 text-yellow-300" />
          <h1 className="text-4xl font-black mb-2">
            {finish.resultLevel === "EXCELLENT" ? "Luar Biasa! 🎉" : isPassed ? "Berhasil! 👍" : "Semangat! 💪"}
          </h1>
          <div className="mt-8 text-6xl font-black">{finish.score}%</div>
          <p className="text-white/60 mt-1">Skor Akhir</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Benar",      val: finish.correctCount,  color: "text-green-600" },
            { label: "Salah",      val: finish.wrongCount,    color: "text-rose-600"  },
            { label: "Poin Dapat", val: finish.pointsEarned,  color: "text-[#2E7D32]" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm">
              <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        {finish.review && finish.review.length > 0 && (
          <div className="bg-white rounded-[24px] border border-slate-100 p-6 md:p-8 shadow-sm text-left">
            <h3 className="font-black text-slate-800 text-lg mb-5">📋 Review Jawaban</h3>
            <div className="space-y-4">
              {finish.review.map((r, i) => {
                const optionKeys = Object.keys(r.options).sort();
                return (
                  <div key={i} className={`p-5 rounded-[20px] border-2 ${r.isCorrect ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <p className="font-bold text-slate-800 text-sm leading-relaxed flex-1">
                        <span className="font-black text-slate-400 mr-2">{i + 1}.</span>
                        {r.questionText}
                      </p>
                      {r.isCorrect ? (
                        <span className="shrink-0 ml-3 bg-green-100 text-green-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center"><Check size={12} className="mr-1" />Benar</span>
                      ) : (
                        <span className="shrink-0 ml-3 bg-slate-200 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center"><X size={12} className="mr-1" />Salah</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {optionKeys.map((key) => {
                        const isUser = key === r.userAnswer;
                        const isCorrectKey = key === r.correctAnswer;
                        let optStyle = "border-slate-100 bg-white text-slate-500";
                        if (isCorrectKey) optStyle = "border-green-400 bg-green-50 text-green-700";
                        else if (isUser && !r.isCorrect) optStyle = "border-red-300 bg-red-50 text-red-600";
                        return (
                          <div key={key} className={`p-3 rounded-[12px] text-xs font-bold border-2 ${optStyle} flex items-center justify-between`}>
                            <span><span className="font-black mr-2 opacity-50">{key}.</span>{r.options[key]}</span>
                            {isUser && <span className="text-[9px] font-black uppercase ml-2">{isCorrectKey ? "✓" : "←"}</span>}
                            {isCorrectKey && !isUser && <Check size={14} className="text-green-500 ml-2" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={startQuiz} className="flex items-center justify-center space-x-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-50 transition-all">
            <RefreshCw size={18} /><span>Ulangi Quiz</span>
          </button>
          <Link href={`/dashboard/siswa/mapel`}>
            <button className="flex items-center justify-center space-x-2 px-8 py-4 bg-[#4CAF50] text-white rounded-2xl font-black hover:bg-[#2E7D32] transition-all">
              <span>Kembali ke Materi</span><ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!question) return null;
  const options = normalizeOptions(question.options);
  const optionKeys = Object.keys(options).sort();

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6 px-2">
      <div className="flex justify-between items-center bg-white px-6 py-4 rounded-[28px] shadow-sm border border-slate-100">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-xl ${LEVEL_COLOR[currentLevel] ?? "bg-slate-100 text-slate-600"}`}>
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="font-black text-slate-700 tracking-tighter">
            LEVEL: {LEVEL_LABEL[currentLevel] ?? currentLevel}
          </span>
          {streak >= 2 && (
            <span className="text-xs font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
              🔥 {streak}x Streak!
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1.5">
          {[1, 2, 3].map(h => (
            <Heart key={h} size={22} className={h <= lives ? "text-red-500" : "text-slate-200"} fill="currentColor" />
          ))}
        </div>
      </div>

      <div className="space-y-6 text-center">
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div className="bg-[#4CAF50] h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((questionNum / 10) * 100, 100)}%` }} />
        </div>
        <p className="text-xs text-slate-400 font-bold">Soal {questionNum}</p>
        <h2 className="text-2xl font-black text-slate-800 leading-tight px-2">{question.questionText}</h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {optionKeys.map(key => {
          const isSelected  = selected === key;
          const showResult  = quizState === "feedback";
          const isRight     = key === correctAnswer;
          let style = "border-white bg-white text-slate-600 hover:border-slate-100 shadow-sm";
          if (showResult) {
            if (isRight)         style = "border-green-500 bg-green-50 text-green-700";
            else if (isSelected) style = "border-slate-300 bg-slate-100 text-slate-500";
            else                 style = "border-white bg-white text-slate-400 opacity-60";
          } else if (isSelected) { style = "border-yellow-500 bg-yellow-50 text-yellow-700"; }

          return (
            <button key={key} onClick={() => quizState === "playing" && setSelected(key)} disabled={quizState === "feedback"}
              className={`p-5 rounded-[24px] text-left font-bold text-base transition-all flex justify-between items-center border-4 ${style}`}>
              <span><span className="font-black mr-3 opacity-50">{key}.</span>{options[key]}</span>
              <div className={`w-7 h-7 rounded-full border-[3px] flex items-center justify-center shrink-0 ${
                showResult && isRight ? "border-green-500" :
                showResult && isSelected && !isRight ? "border-slate-300" :
                isSelected ? "border-yellow-500" : "border-slate-200"
              }`}>
                {(showResult && isRight) && <div className="w-4 h-4 rounded-full bg-green-500" />}
                {(showResult && isSelected && !isRight) && <X size={14} strokeWidth={3} className="text-slate-400" />}
                {(!showResult && isSelected) && <div className="w-4 h-4 rounded-full bg-yellow-500" />}
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={submitAnswer} disabled={selected === null || quizState === "feedback" || submitting}
        className="w-full py-5 bg-[#2E7D32] text-white rounded-[28px] font-black text-xl shadow-xl hover:bg-[#1B5E20] disabled:opacity-30 active:scale-95 transition-all">
        {submitting ? "Memeriksa..." : quizState === "feedback" ? (isCorrect ? "✅ Benar!" : "❌ Salah!") : "Periksa Jawaban"}
      </button>
    </div>
  );
}
