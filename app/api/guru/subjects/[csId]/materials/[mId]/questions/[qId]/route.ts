import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ csId: string; mId: string; qId: string }> }
) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER");

  if (!guard.ok) {
    return NextResponse.json(
      { error: guard.error },
      { status: guard.status }
    );
  }

  const { qId } = await params;

  const body = await req.json();

  const updated = await db.question.update({
    where: { id: qId },
    data: {
      questionText: body.questionText,
      options: body.options,
      correctAnswer: body.correctAnswer,
      difficulty: body.difficulty,
    },
  });

  return NextResponse.json({
    success: true,
    data: updated,
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ csId: string; mId: string; qId: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { qId } = await params;

  const question = await db.question.findUnique({ where: { id: qId } });
  if (!question) return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });

  await db.question.delete({ where: { id: qId } });

  return NextResponse.json({ success: true });
}
