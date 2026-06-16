import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get("materialId");
    const studentId = searchParams.get("studentId");

    const authHeader = request.headers.get("cookie") || "";
    const tokenMatch = authHeader.match(/token=([^;]+)/);
    let userId: string | null = null;
    let userRole: string | null = null;

    if (tokenMatch) {
      try {
        const payload = await verifyToken(tokenMatch[1]);
        if (payload) {
          userId = payload.userId;
          userRole = payload.role;
        }
      } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    let targetStudentId = studentId;

    if (userRole === "STUDENT" || userRole === "student") {
      const student = await db.student.findFirst({
        where: { user: { id: userId! } },
      });
      targetStudentId = student?.id ?? null;
    }

    const where: Record<string, unknown> = {};
    if (targetStudentId) where.studentId = targetStudentId;
    if (materialId) where.materialId = materialId;

    const sessions = await db.quizSession.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: 50,
      include: {
        material: {
          select: {
            title: true,
            classSubject: {
              select: {
                subject: { select: { name: true, code: true } },
              },
            },
          },
        },
      },
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      materialId: s.materialId,
      materialTitle: s.material?.title ?? "Unknown",
      subjectName: s.material?.classSubject?.subject?.name ?? null,
      subjectCode: s.material?.classSubject?.subject?.code ?? null,
      score: s.score ?? 0,
      correctCount: s.correctCount ?? 0,
      wrongCount: s.wrongCount ?? 0,
      resultLevel: s.resultLevel ?? "MEDIUM",
      streakCount: s.streakCount ?? 0,
      startedAt: s.startedAt,
      finishedAt: s.finishedAt,
    }));

    return NextResponse.json({ sessions: formatted });
  } catch (error) {
    console.error("[quiz/sessions]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
