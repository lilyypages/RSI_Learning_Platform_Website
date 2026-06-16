// app/api/quiz/finish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, message: "sessionId wajib diisi" }, { status: 400 });
    }

    const student = await db.student.findFirst({ where: { userId: session.userId } });
    if (!student) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const quizSession = await db.quizSession.findFirst({
      where: { id: sessionId, studentId: student.id, finishedAt: null },
    });
    if (!quizSession) {
      return NextResponse.json({ success: false, message: "Sesi tidak ditemukan" }, { status: 404 });
    }

    const totalAnswered = quizSession.correctCount + quizSession.wrongCount;
    const scorePct = totalAnswered > 0
      ? Math.round((quizSession.correctCount / totalAnswered) * 100)
      : 0;

    const resultLevel = scorePct >= 85 ? "EXCELLENT" : scorePct >= 75 ? "PASSED" : "FAILED";

    // Adaptive level per classSubject: simpan level berdasarkan performa
    const adaptiveLevel = scorePct >= 85 ? "ADVANCED" : scorePct >= 60 ? "STANDARD" : "REMEDIAL";

    await db.quizSession.update({
      where: { id: sessionId },
      data: { finishedAt: new Date(), score: scorePct, resultLevel },
    });

    // Update student progress
    const totalMaterials = await db.material.count({
      where: { classSubjectId: quizSession.classSubjectId, isPublished: true },
    });
    const completedSessions = await db.quizSession.count({
      where: { studentId: student.id, classSubjectId: quizSession.classSubjectId, finishedAt: { not: null } },
    });
    const completionPercent = totalMaterials > 0
      ? Math.min(Math.round((completedSessions / totalMaterials) * 100), 100)
      : 0;

    const existingProgress = await db.studentProgress.findFirst({
      where: { studentId: student.id, classSubjectId: quizSession.classSubjectId },
    });

    if (existingProgress) {
      await db.studentProgress.update({
        where: { id: existingProgress.id },
        data: { totalScore: Math.max(existingProgress.totalScore ?? 0, scorePct), completionPercent, adaptiveLevel, lastActivity: new Date() },
      });
    } else {
      await db.studentProgress.create({
        data: { studentId: student.id, classSubjectId: quizSession.classSubjectId, completionPercent, totalScore: scorePct, adaptiveLevel, lastActivity: new Date() },
      });
    }

    await db.student.update({
      where: { id: student.id },
      data: { totalPoints: { increment: scorePct }, currentStreak: { increment: resultLevel !== "FAILED" ? 1 : 0 } },
    });

    await db.pointLog.create({
      data: { studentId: student.id, pointsEarned: scorePct, sourceType: "QUIZ", sourceId: sessionId, description: `Quiz selesai - Skor ${scorePct}%` },
    });

    // Ambil jawaban + soal untuk review
    const answers = await db.quizAnswer.findMany({
      where: { sessionId },
      include: {
        question: { select: { id: true, questionText: true, options: true, correctAnswer: true, difficulty: true } },
      },
    });

    const review = answers.map((a) => {
      const opts = Array.isArray(a.question.options)
        ? Object.fromEntries((a.question.options as string[]).map((v, i) => [String.fromCharCode(65 + i), v]))
        : (a.question.options as Record<string, string>) ?? {};

      let correctKey = "";
      if (Array.isArray(a.question.options)) {
        const labels = ["A", "B", "C", "D"];
        const idx = (a.question.options as string[]).findIndex(
          (o) => String(o).trim() === String(a.question.correctAnswer).trim()
        );
        if (idx >= 0) correctKey = labels[idx];
      } else if (a.question.options && typeof a.question.options === "object") {
        const entry = Object.entries(opts).find(
          ([, v]) => String(v).trim() === String(a.question.correctAnswer).trim()
        );
        if (entry) correctKey = entry[0];
      }

      return {
        questionText: a.question.questionText,
        options: opts,
        userAnswer: a.answerGiven,
        correctAnswer: correctKey,
        correctValue: a.question.correctAnswer,
        isCorrect: a.isCorrect,
      };
    });

    return NextResponse.json({
      success: true,
      score: scorePct,
      correctCount: quizSession.correctCount,
      wrongCount: quizSession.wrongCount,
      totalAnswered,
      resultLevel,
      pointsEarned: scorePct,
      review,
    });
  } catch (error) {
    console.error("[QUIZ_FINISH]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}