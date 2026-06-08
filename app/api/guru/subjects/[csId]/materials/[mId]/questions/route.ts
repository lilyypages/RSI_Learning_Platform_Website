import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ csId: string; mId: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { csId, mId } = await params;

  const material = await db.material.findFirst({
    where: { id: mId, classSubjectId: csId },
    include: { classSubject: { include: { subject: true, class: true } } },
  });
  if (!material) return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });

  const questions = await db.question.findMany({
    where: { materialId: mId },
    orderBy: { orderIndex: "asc" },
  });

  const counts = { EASY: 0, MEDIUM: 0, HARD: 0 };
  questions.forEach((q: { difficulty?: string | null }) => { const d = q.difficulty || "MEDIUM"; counts[d as keyof typeof counts]++; });

  return NextResponse.json({
    success: true,
    data: {
      subjectName: material.classSubject.subject.name,
      className: material.classSubject.class.name,
      materialTitle: material.title,
      questions: questions.map((q: any) => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        orderIndex: q.orderIndex,
      })),
      counts,
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ csId: string; mId: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { csId, mId } = await params;
  const { questionText, options, correctAnswer, difficulty } = await req.json();

  if (!questionText || !correctAnswer) {
    return NextResponse.json({ error: "Pertanyaan dan jawaban wajib diisi" }, { status: 400 });
  }

  const lastOrder = await db.question.findFirst({
    where: { materialId: mId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const question = await db.question.create({
    data: {
      materialId: mId,
      questionText,
      options: options || ["A", "B", "C", "D"],
      correctAnswer,
      difficulty: difficulty || "MEDIUM",
      orderIndex: (lastOrder?.orderIndex ?? 0) + 1,
    },
  });

  return NextResponse.json({ success: true, data: { id: question.id } }, { status: 201 });
}
