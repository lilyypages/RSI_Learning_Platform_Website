import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const teachers = await db.teacher.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true } },
      classSubjects: {
        include: {
          subject: { select: { name: true } },
          class: { select: { name: true } },
          studentProgress: { select: { completionPercent: true } },
          _count: { select: { materials: true } },
        },
      },
      homeroomClass: { select: { name: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  const data = teachers.map((t) => {
    const allProgress = t.classSubjects.flatMap((cs) => cs.studentProgress.map((sp) => sp.completionPercent ?? 0));
    const avgKetuntasan = allProgress.length > 0 ? Math.round(allProgress.reduce((a, b) => a + b, 0) / allProgress.length) : 0;
    const totalSiswa = t.classSubjects.reduce((sum, cs) => sum + cs.studentProgress.length, 0);
    const tertinggal = allProgress.filter((p) => p < 70).length;

    return {
      id: t.id,
      userId: t.userId,
      name: t.user.name,
      email: t.user.email,
      nip: t.nip,
      role: t.homeroomClass?.[0] ? `Wali ${t.homeroomClass[0].name}` : "Guru Mapel",
      status: t.user.isActive ? "Aktif" : "Nonaktif",
      totalSiswa,
      ketuntasan: avgKetuntasan,
      tertinggal,
      lastUpdate: t.classSubjects[0]?.materials?.[0] ? `Materi ${t.classSubjects[0].subject.name}` : "-",
    };
  });

  return NextResponse.json({ success: true, data });
}
