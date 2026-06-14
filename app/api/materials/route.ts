import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classSubjectId = searchParams.get("classSubjectId");

  const where: any = {};
  if (classSubjectId) where.classSubjectId = classSubjectId;
  if (session.role === "STUDENT") where.isPublished = true;

  const materials = await db.material.findMany({
    where,
    include: {
      classSubject: { select: { id: true, class: { select: { name: true } }, subject: { select: { name: true, code: true } } } },
      videos: { select: { id: true, title: true, embedUrl: true, durationSeconds: true } },
      _count: { select: { questions: true, quizSessions: true } },
    },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json(
    materials.map((m) => ({
      id: m.id,
      title: m.title,
      contentText: m.contentText,
      difficulty: m.difficulty,
      isPublished: m.isPublished,
      orderIndex: m.orderIndex,
      classSubjectId: m.classSubjectId,
      classSubject: m.classSubject,
      videos: m.videos,
      totalQuestions: m._count.questions,
      totalSessions: m._count.quizSessions,
    })),
  );
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "TEACHER", "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { classSubjectId, title, contentText, difficulty, videoTitle, videoUrl } = await req.json();
  if (!classSubjectId || !title) {
    return NextResponse.json({ error: "classSubjectId dan title wajib diisi" }, { status: 400 });
  }

  const lastOrder = await db.material.findFirst({
    where: { classSubjectId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const material = await db.material.create({
    data: {
      classSubjectId,
      title,
      contentText: contentText || null,
      difficulty: difficulty || "MEDIUM",
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
