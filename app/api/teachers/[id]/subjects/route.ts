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
      user: { select: { id: true, name: true, email: true, isActive: true } },
      homeroomClass: { select: { id: true, name: true } },
      classSubjects: {
        include: {
          subject: { select: { id: true, name: true, code: true } },
          class: { select: { id: true, name: true, gradeLevel: true } },
          teacher: { include: { user: { select: { name: true } } } },
        },
      },
    },
  });

  if (!teacher) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

  const availableSubjects = await db.classSubject.findMany({
    where: { teacherId: null },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      class: { select: { id: true, name: true, gradeLevel: true } },
      teacher: { include: { user: { select: { name: true } } } },
    },
  });

  const mapSubject = (cs: any) => ({
    id: cs.id,
    subject: cs.subject,
    class: cs.class,
    semester: cs.semester,
    academicYear: cs.academicYear,
    teacher: cs.teacher,
    teacherId: cs.teacherId,
  });

  return NextResponse.json({
    success: true,
    data: {
      teacher: {
        id: teacher.id,
        name: teacher.user.name,
        email: teacher.user.email,
        nip: teacher.nip,
        isActive: teacher.user.isActive,
        isHomeroom: teacher.homeroomClass?.length > 0,
        homeroomClassName: teacher.homeroomClass?.[0]?.name || null,
      },
      assignedSubjects: teacher.classSubjects.map(mapSubject),
      availableAssignments: availableSubjects.map(mapSubject),
    },
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const teacher = await db.teacher.findUnique({ where: { id } });
  if (!teacher) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

  const { classSubjectIds } = await req.json();
  if (!Array.isArray(classSubjectIds)) {
    return NextResponse.json({ error: "classSubjectIds harus berupa array" }, { status: 400 });
  }

  for (const csId of classSubjectIds) {
    const existing = await db.classSubject.findUnique({ where: { id: csId } });
    if (!existing) return NextResponse.json({ error: `Mapel ${csId} tidak ditemukan` }, { status: 404 });
    if (existing.teacherId && existing.teacherId !== id) {
      const otherTeacher = await db.teacher.findUnique({ where: { id: existing.teacherId }, include: { user: { select: { name: true } } } });
      return NextResponse.json({
        error: `Mapel sudah dipegang oleh ${otherTeacher?.user?.name || "guru lain"}. Lepaskan dulu sebelum menetapkan ulang.`,
      }, { status: 409 });
    }
  }

  await db.classSubject.updateMany({
    where: { teacherId: id, id: { notIn: classSubjectIds } },
    data: { teacherId: null },
  });

  for (const csId of classSubjectIds) {
    await db.classSubject.update({
      where: { id: csId },
      data: { teacherId: id },
    });
  }

  return NextResponse.json({
    success: true,
    message: "Penugasan mapel berhasil diperbarui",
    totalAssigned: classSubjectIds.length,
  });
}
