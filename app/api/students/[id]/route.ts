import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const student = await db.student.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true, imageUrl: true } },
      class: { select: { id: true, name: true, gradeLevel: true } },
      parent: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      progress: {
        include: {
          classSubject: {
            include: {
              subject: { select: { name: true, code: true } },
            },
          },
        },
      },
      quizSessions: {
        orderBy: { startedAt: "desc" },
        take: 10,
        include: {
          classSubject: {
            include: {
              subject: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });

  const progressArr = student.progress;
  const quizArr = student.quizSessions;
  const stats = {
    subjectCount: progressArr.length,
    avgCompletion: progressArr.length > 0
      ? Math.round(progressArr.reduce((s, p) => s + (p.completionPercent ?? 0), 0) / progressArr.length)
      : 0,
    avgScore: quizArr.length > 0
      ? Math.round(quizArr.reduce((s, q) => s + (q.score ?? 0), 0) / quizArr.length)
      : 0,
    totalQuiz: quizArr.length,
  };

  return NextResponse.json({ success: true, data: { student, stats } });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const student = await db.student.findUnique({ where: { id }, select: { userId: true } });
  if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });

  await db.student.delete({ where: { id } });
  await db.user.delete({ where: { id: student.userId } });

  return NextResponse.json({ success: true, message: "Siswa berhasil dihapus" });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const body = await req.json();

  const student = await db.student.findUnique({
    where: { id },
    include: {
      user: true,
      parent: { include: { user: true } },
    },
  });
  if (!student) return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });

  const {
    studentName, studentEmail, studentPassword,
    nis, birthdate, classId, isActive,
    parentName, parentEmail, parentPassword, parentPhone, parentAddress,
  } = body;

  const userData: Record<string, any> = {};
  if (studentName !== undefined) userData.name = studentName;
  if (studentEmail !== undefined) userData.email = studentEmail;
  if (isActive !== undefined) userData.isActive = isActive;
  if (studentPassword) userData.passwordHash = await bcrypt.hash(studentPassword, 12);
  if (Object.keys(userData).length > 0) {
    await db.user.update({ where: { id: student.userId }, data: userData });
  }

  const studentData: Record<string, any> = {};
  if (nis !== undefined) studentData.nis = nis;
  if (birthdate !== undefined) studentData.birthdate = birthdate ? new Date(birthdate) : null;
  if (classId !== undefined) studentData.classId = classId || null;
  if (Object.keys(studentData).length > 0) {
    await db.student.update({ where: { id }, data: studentData });
  }

  if (parentName) {
    if (student.parent) {
      const parentUserData: Record<string, any> = {};
      if (parentName !== undefined) parentUserData.name = parentName;
      if (parentEmail !== undefined) parentUserData.email = parentEmail;
      if (parentPassword) parentUserData.passwordHash = await bcrypt.hash(parentPassword, 12);
      if (Object.keys(parentUserData).length > 0) {
        await db.user.update({ where: { id: student.parent.userId }, data: parentUserData });
      }

      const parentData: Record<string, any> = {};
      if (parentPhone !== undefined) parentData.phone = parentPhone;
      if (parentAddress !== undefined) parentData.address = parentAddress;
      if (Object.keys(parentData).length > 0) {
        await db.parent.update({ where: { id: student.parent.id }, data: parentData });
      }
    } else {
      const parentUser = await db.user.create({
        data: {
          name: parentName || "",
          email: parentEmail || "",
          passwordHash: parentPassword ? await bcrypt.hash(parentPassword, 12) : "",
          role: "PARENT",
        },
      });

      const parent = await db.parent.create({
        data: {
          userId: parentUser.id,
          phone: parentPhone || null,
          address: parentAddress || null,
        },
      });

      await db.student.update({
        where: { id },
        data: { parentId: parent.id },
      });
    }
  }

  const updated = await db.student.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true, imageUrl: true } },
      class: { select: { id: true, name: true, gradeLevel: true } },
      parent: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: { student: updated } });
}
