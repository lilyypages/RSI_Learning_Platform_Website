import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "STUDENT");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { sessionId, questionId, answerGiven } = await req.json();
  if (!sessionId || !questionId || answerGiven === undefined) {
    return NextResponse.json({ error: "sessionId, questionId, dan answerGiven wajib diisi" }, { status: 400 });
  }

  const student = await db.student.findUnique({ where: { userId: session!.userId } });
  if (!student) return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });

  const quizSession = await db.quizSession.findFirst({
    where: { id: sessionId, studentId: student.id, finishedAt: null },
  });
  if (!quizSession) return NextResponse.json({ error: "Sesi kuis tidak ditemukan atau sudah selesai" }, { status: 404 });

  const question = await db.question.findUnique({ where: { id: questionId } });
  if (!question) return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });

  const isCorrect = answerGiven.toString().trim().toUpperCase() === question.correctAnswer.toString().trim().toUpperCase();

  await db.quizAnswer.create({
    data: {
      sessionId,
      questionId,
      answerGiven: answerGiven.toString(),
      isCorrect,
    },
  });

  const newCorrectCount = (quizSession.correctCount ?? 0) + (isCorrect ? 1 : 0);
  const newWrongCount = (quizSession.wrongCount ?? 0) + (isCorrect ? 0 : 1);
  const newStreak = isCorrect ? (quizSession.streakCount ?? 0) + 1 : 0;

  const currentLevel = getLevelFromStreak(newStreak);
  const nextQuestion = await db.question.findFirst({
    where: { materialId: quizSession.materialId, difficulty: currentLevel, id: { not: questionId } },
    orderBy: { orderIndex: "asc" },
  });

  const isFinished = !nextQuestion || newWrongCount >= 3;
  const livesRemaining = Math.max(3 - newWrongCount, 0);

  await db.quizSession.update({
    where: { id: sessionId },
    data: {
      correctCount: newCorrectCount,
      wrongCount: newWrongCount,
      streakCount: newStreak,
      livesUsed: newWrongCount,
      ...(isFinished ? { finishedAt: new Date() } : {}),
    },
  });

  if (isFinished) {
    await db.student.update({
      where: { id: student.id },
      data: { livesRemaining },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      isCorrect,
      correctAnswer: question.correctAnswer,
      streak: newStreak,
      currentLevel,
      livesRemaining,
      finished: isFinished,
      nextQuestion: isFinished ? null : nextQuestion,
    },
  });
}

function getLevelFromStreak(streak: number): string {
  if (streak >= 5) return "HARD";
  if (streak >= 3) return "MEDIUM";
  return "EASY";
}
