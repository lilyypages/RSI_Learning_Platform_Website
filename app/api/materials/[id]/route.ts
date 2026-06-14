import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const material = await db.material.findUnique({
    where: { id },
    include: {
      classSubject: { select: { id: true, class: { select: { name: true } }, subject: { select: { name: true, code: true } } } },
      videos: { select: { id: true, title: true, embedUrl: true, durationSeconds: true } },
      _count: { select: { questions: true } },
    },
  });

  if (!material) return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });

  return NextResponse.json({
    success: true,
    data: {
      id: material.id,
      title: material.title,
      contentText: material.contentText,
      difficulty: material.difficulty,
      isPublished: material.isPublished,
      orderIndex: material.orderIndex,
      classSubject: material.classSubject,
      videos: material.videos,
      totalQuestions: material._count.questions,
    },
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER", "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const existing = await db.material.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });

  const { title, contentText, difficulty, isPublished } = await req.json();

  const updated = await db.material.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(contentText !== undefined && { contentText }),
      ...(difficulty !== undefined && { difficulty }),
      ...(isPublished !== undefined && { isPublished }),
    },
  });

  return NextResponse.json({ success: true, data: { id: updated.id, title: updated.title } });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER", "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const existing = await db.material.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Materi tidak ditemukan" }, { status: 404 });

  await db.material.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "Materi berhasil dihapus" });
}
