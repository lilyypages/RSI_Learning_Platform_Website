import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const teacher = await db.teacher.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      homeroomClass: { select: { name: true } },
      classSubjects: {
        include: {
          subject: { select: { name: true, code: true } },
          class: { select: { name: true } },
          studentProgress: {
            include: { student: { include: { user: { select: { name: true } } } } },
          },
        },
      },
    },
  });

  if (!teacher) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

  const detail = {
    name: teacher.user.name,
    email: teacher.user.email,
    homeroom: teacher.homeroomClass?.map(c => c.name).join(", ") ?? null,
    subjects: teacher.classSubjects.map((cs) => ({
      subject: cs.subject.name,
      code: cs.subject.code,
      className: cs.class.name,
      students: cs.studentProgress.map((sp) => ({
        name: sp.student.user.name,
        completionPercent: sp.completionPercent,
        totalScore: sp.totalScore,
        adaptiveLevel: sp.adaptiveLevel,
      })),
      avgCompletion: cs.studentProgress.length > 0
        ? Math.round(cs.studentProgress.reduce((s, sp) => s + (sp.completionPercent ?? 0), 0) / cs.studentProgress.length)
        : 0,
    })),
  };

  return NextResponse.json({ success: true, data: detail });
}
