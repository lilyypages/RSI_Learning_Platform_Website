import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ csId: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { csId } = await params;

  const classSubject = await db.classSubject.findUnique({
    where: { id: csId },
    include: { subject: { select: { name: true, code: true } }, class: { select: { name: true } } },
  });
  if (!classSubject) return NextResponse.json({ error: "Mapel tidak ditemukan" }, { status: 404 });

  const materials = await db.material.findMany({
    where: { classSubjectId: csId },
    include: {
      videos: { select: { id: true, title: true, embedUrl: true } },
      _count: { select: { questions: true, quizSessions: true } },
    },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: {
      subjectName: classSubject.subject.name,
      subjectCode: classSubject.subject.code,
      className: classSubject.class.name,
      materials: materials.map((m) => ({
        id: m.id,
        title: m.title,
        contentText: m.contentText,
        difficulty: m.difficulty,
        isPublished: m.isPublished,
        orderIndex: m.orderIndex,
        videos: m.videos,
        totalQuestions: m._count.questions,
        totalSessions: m._count.quizSessions,
      })),
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ csId: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { csId } = await params;
  const { title, contentText, videoTitle, videoUrl } = await req.json();

  if (!title) return NextResponse.json({ error: "Judul materi wajib diisi" }, { status: 400 });

  const lastOrder = await db.material.findFirst({
    where: { classSubjectId: csId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const material = await db.material.create({
    data: {
      classSubjectId: csId,
      title,
      contentText: contentText || null,
      orderIndex: (lastOrder?.orderIndex ?? 0) + 1,
      isPublished: true,
    },
  });

  if (videoUrl) {
    await db.video.create({
      data: {
        materialId: material.id,
        title: videoTitle || "Video Pembelajaran",
        embedUrl: videoUrl,
        durationSeconds: 0,
      },
    });
  }

  return NextResponse.json({ success: true, data: { id: material.id, title: material.title } }, { status: 201 });
}
