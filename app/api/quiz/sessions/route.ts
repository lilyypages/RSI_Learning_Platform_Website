import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const materialId = searchParams.get("materialId");

  const where: any = {};

  if (session.role === "STUDENT") {
    const student = await db.student.findUnique({ where: { userId: session.userId } });
    if (!student) return NextResponse.json({ error: "Data siswa tidak ditemukan" }, { status: 404 });
    where.studentId = student.id;
  } else if (session.role === "PARENT") {
    const parent = await db.parent.findUnique({
      where: { userId: session.userId },
      include: { students: { select: { id: true } } },
    });
    if (!parent) return NextResponse.json({ error: "Data orang tua tidak ditemukan" }, { status: 404 });
    where.studentId = { in: parent.students.map((s) => s.id) };
  } else if (session.role === "TEACHER") {
    const teacher = await db.teacher.findUnique({
      where: { userId: session.userId },
      include: { homeroomClass: { select: { id: true } } },
    });
    if (teacher) {
      const classIds = teacher.homeroomClass.map((c) => c.id);
      const students = await db.student.findMany({ where: { classId: { in: classIds } }, select: { id: true } });
      where.studentId = { in: students.map((s) => s.id) };
    }
  }

  if (materialId) where.materialId = materialId;

  const sessions = await db.quizSession.findMany({
    where,
    include: {
      material: { select: { title: true } },
      student: { include: { user: { select: { name: true } } } },
    },
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    data: sessions.map((s) => ({
      id: s.id,
      materialTitle: s.material.title,
      studentName: s.student?.user?.name,
      score: s.score,
      correctCount: s.correctCount,
      wrongCount: s.wrongCount,
      resultLevel: s.resultLevel,
      startedAt: s.startedAt?.toISOString(),
      finishedAt: s.finishedAt?.toISOString(),
    })),
  });
}
