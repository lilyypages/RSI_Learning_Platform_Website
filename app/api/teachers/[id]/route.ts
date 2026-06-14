import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const teacher = await db.teacher.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true, imageUrl: true } },
      homeroomClass: { select: { id: true, name: true } },
      classSubjects: {
        include: {
          subject: { select: { id: true, name: true, code: true } },
          class: { select: { id: true, name: true } },
          studentProgress: {
            include: { student: { include: { user: { select: { name: true } } } } },
          },
        },
      },
    },
  });

  if (!teacher) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

  const allProgress = teacher.classSubjects.flatMap((cs) => cs.studentProgress.map((sp) => sp.completionPercent ?? 0));
  const totalStudents = teacher.classSubjects.reduce((sum, cs) => sum + cs.studentProgress.length, 0);
  const uniqueSubjectIds = new Set(teacher.classSubjects.map((cs) => cs.subject.id));

  const stats = {
    totalSubjects: uniqueSubjectIds.size,
    totalClasses: teacher.classSubjects.length,
    totalStudents,
  };

  return NextResponse.json({
    success: true,
    data: { teacher, stats },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const teacher = await db.teacher.findUnique({
    where: { id },
    include: { user: { select: { id: true } } },
  });
  if (!teacher) return NextResponse.json({ error: "Guru tidak ditemukan" }, { status: 404 });

  const { name, email, nip, phone, isActive, password } = await req.json();

  const userUpdate: any = {};
  if (name !== undefined) userUpdate.name = name;
  if (email !== undefined) userUpdate.email = email;
  if (isActive !== undefined) userUpdate.isActive = isActive;
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    userUpdate.passwordHash = hash;
  }
  if (Object.keys(userUpdate).length > 0) {
    await db.user.update({ where: { id: teacher.userId }, data: userUpdate });
  }

  const teacherUpdate: any = {};
  if (nip !== undefined) teacherUpdate.nip = nip;
  if (phone !== undefined) teacherUpdate.phone = phone;
  if (Object.keys(teacherUpdate).length > 0) {
    await db.teacher.update({ where: { id }, data: teacherUpdate });
  }

  return NextResponse.json({ success: true, message: "Data guru berhasil diperbarui" });
}
