import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const material = await db.material.findUnique({ where: { id }, select: { id: true, title: true } });
  if (!material) return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });

  const questions = await db.question.findMany({
    where: { materialId: id },
    orderBy: { orderIndex: "asc" },
  });

  const counts = { EASY: 0, MEDIUM: 0, HARD: 0 };
  questions.forEach((q) => { if (q.difficulty && counts.hasOwnProperty(q.difficulty)) counts[q.difficulty as keyof typeof counts]++; });

  return NextResponse.json({
    success: true,
    data: { materialTitle: material.title, questions, counts },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const material = await db.material.findUnique({ where: { id }, select: { id: true } });
  if (!material) return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });

  const { questionText, options, correctAnswer, difficulty } = await req.json();
  if (!questionText || !options || !correctAnswer) {
    return NextResponse.json({ error: "questionText, options, dan correctAnswer wajib diisi" }, { status: 400 });
  }

  const lastOrder = await db.question.findFirst({
    where: { materialId: id },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const question = await db.question.create({
    data: {
      materialId: id,
      questionText,
      options: Array.isArray(options) ? options : JSON.parse(options),
      correctAnswer,
      difficulty: difficulty || "MEDIUM",
      orderIndex: (lastOrder?.orderIndex ?? 0) + 1,
    },
  });

  return NextResponse.json({ success: true, data: { id: question.id } }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const material = await db.material.findUnique({ where: { id }, select: { id: true } });
  if (!material) return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const questionId = searchParams.get("questionId");
  if (!questionId) return NextResponse.json({ error: "questionId diperlukan" }, { status: 400 });

  await db.question.delete({ where: { id: questionId, materialId: id } });
  return NextResponse.json({ success: true, message: "Soal berhasil dihapus" });
}
