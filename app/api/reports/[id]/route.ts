import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const report = await db.weeklyReport.findUnique({
    where: { id },
    include: {
      student: { include: { user: { select: { name: true } }, class: { select: { name: true } } } },
      classSubject: { include: { subject: { select: { name: true } } } },
      teacher: { include: { user: { select: { name: true } } } },
    },
  });

  if (!report) return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });

  return NextResponse.json({
    success: true,
    data: {
      id: report.id,
      studentName: report.student?.user?.name,
      className: report.student?.class?.name,
      subjectName: report.classSubject?.subject?.name,
      teacherName: report.teacher?.user?.name,
      weekStart: report.weekStart?.toISOString(),
      avgScore: report.avgScore,
      completionRate: report.completionRate,
      recommendation: report.recommendation,
      kkmAchieved: report.kkm_achieved,
    },
  });
}
