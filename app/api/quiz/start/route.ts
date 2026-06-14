import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "STUDENT");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { materialId } = await req.json();
  if (!materialId) return NextResponse.json({ error: "materialId wajib diisi" }, { status: 400 });

  const material = await db.material.findUnique({
    where: { id: materialId },
    include: { classSubject: { select: { id: true } } },
  });
  if (!material) return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });

  const student = await db.student.findUnique({ where: { userId: session!.userId } });
  if (!student) return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });

  const existingSession = await db.quizSession.findFirst({
    where: { studentId: student.id, materialId, finishedAt: null },
  });
  if (existingSession) {
    return NextResponse.json({
      sessionId: existingSession.id,
      isResume: true,
    });
  }

  const quizSession = await db.quizSession.create({
    data: {
      studentId: student.id,
      classSubjectId: material.classSubjectId,
      materialId,
    },
  });

  let firstQuestion = await db.question.findFirst({
    where: { materialId, difficulty: "MEDIUM" },
    orderBy: { orderIndex: "asc" },
  });
  if (!firstQuestion) {
    firstQuestion = await db.question.findFirst({
      where: { materialId, difficulty: "EASY" },
      orderBy: { orderIndex: "asc" },
    });
  }
  if (!firstQuestion) {
    firstQuestion = await db.question.findFirst({
      where: { materialId, difficulty: "HARD" },
      orderBy: { orderIndex: "asc" },
    });
  }
  if (!firstQuestion) {
    return NextResponse.json({ error: "Belum ada soal untuk materi ini" }, { status: 404 });
  }

  return NextResponse.json({
    sessionId: quizSession.id,
    question: firstQuestion || null,
    currentLevel: "MEDIUM",
    lives: student.livesRemaining,
    streak: 0,
  });
}
