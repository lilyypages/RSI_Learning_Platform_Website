import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "STUDENT");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "sessionId wajib diisi" }, { status: 400 });

  const student = await db.student.findUnique({ where: { userId: session!.userId } });
  if (!student) return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });

  const quizSession = await db.quizSession.findFirst({
    where: { id: sessionId, studentId: student.id },
    include: { answers: { include: { question: { select: { questionText: true, options: true, correctAnswer: true } } } } },
  });
  if (!quizSession) return NextResponse.json({ error: "Sesi kuis tidak ditemukan" }, { status: 404 });

  const totalAnswered = quizSession.answers.length;
  const correctCount = quizSession.answers.filter((a) => a.isCorrect).length;
  const wrongCount = totalAnswered - correctCount;
  const score = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  let resultLevel = "FAILED";
  if (score >= 90) resultLevel = "EXCELLENT";
  else if (score >= 65) resultLevel = "PASSED";

  const pointsEarned = correctCount * 10;

  const updated = await db.quizSession.update({
    where: { id: sessionId },
    data: {
      finishedAt: new Date(),
      score,
      correctCount,
      wrongCount,
      resultLevel,
    },
  });

  await db.student.update({
    where: { id: student.id },
    data: {
      totalPoints: { increment: pointsEarned },
      currentStreak: { increment: score >= 65 ? 1 : 0 },
    },
  });

  const existingProgress = await db.studentProgress.findFirst({
    where: { studentId: student.id, classSubjectId: quizSession.classSubjectId },
  });

  if (existingProgress) {
    const newCompletion = Math.min((existingProgress.completionPercent ?? 0) + 10, 100);
    const newScore = Math.max(existingProgress.totalScore ?? 0, score);
    await db.studentProgress.update({
      where: { id: existingProgress.id },
      data: { completionPercent: newCompletion, totalScore: newScore, lastActivity: new Date() },
    });
  } else {
    await db.studentProgress.create({
      data: {
        studentId: student.id,
        classSubjectId: quizSession.classSubjectId,
        completionPercent: 10,
        totalScore: score,
        lastActivity: new Date(),
      },
    });
  }

  await db.pointLog.create({
    data: {
      studentId: student.id,
      pointsEarned,
      sourceType: "QUIZ",
      sourceId: sessionId,
      description: `Kuis ${quizSession.classSubjectId} selesai dengan skor ${score}`,
    },
  });

  const review = quizSession.answers.map((a) => {
    const opts = a.question.options as Record<string, string> | null;
    return {
      questionText: a.question.questionText,
      options: opts ?? {},
      userAnswer: a.answerGiven,
      correctAnswer: a.question.correctAnswer,
      correctValue: opts?.[a.question.correctAnswer] ?? "",
      isCorrect: a.isCorrect,
    };
  });

  return NextResponse.json({
    score,
    correctCount,
    wrongCount,
    totalAnswered,
    resultLevel,
    pointsEarned,
    review,
  });
}
