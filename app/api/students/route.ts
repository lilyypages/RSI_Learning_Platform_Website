import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const search = searchParams.get("search");
  const includeProgress = searchParams.get("includeProgress") === "true";

  const students = await db.student.findMany({
    where: {
      ...(classId && classId !== "all" ? { classId } : {}),
      ...(search ? { OR: [{ user: { name: { contains: search, mode: "insensitive" } } }, { nis: { contains: search, mode: "insensitive" } }] } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true } },
      class: { select: { id: true, name: true } },
      parent: { select: { user: { select: { name: true, email: true } } } },
      ...(includeProgress ? { progress: { include: { classSubject: { select: { subject: { select: { name: true } } } } } } } : {}),
    },
    orderBy: { user: { name: "asc" } },
  });

  if (includeProgress) {
    return NextResponse.json(students);
  }
  return NextResponse.json({ success: true, data: students });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json();
  const name = body.studentName || body.name;
  const studentEmail = body.studentEmail;
  const studentPassword = body.studentPassword;
  const nis = body.nis;
  const birthdate = body.birthdate;
  const classId = body.classId || body.className;
  const parentName = body.parentName;
  const parentEmail = body.parentEmail;
  const parentPassword = body.parentPassword;
  const parentPhone = body.parentPhone;
  const parentAddress = body.parentAddress;

  if (!name || !nis || !classId) {
    return NextResponse.json({ error: "Nama, NIS, dan Kelas wajib diisi" }, { status: 400 });
  }

  const exist = await db.student.findUnique({ where: { nis } });
  if (exist) return NextResponse.json({ error: "NIS sudah terdaftar" }, { status: 409 });

  const pass = await bcrypt.hash(studentPassword || "12345678", 10);
  const email = studentEmail || `${nis}@student.rsi.sch.id`;

  const user = await db.user.create({
    data: { email, passwordHash: pass, role: "STUDENT", name },
  });

  const student = await db.student.create({
    data: {
      userId: user.id,
      nis,
      classId,
      birthdate: birthdate ? new Date(birthdate) : null,
    },
  });

  let parentResult = null;
  if (parentName) {
    const pEmail = parentEmail || `${nis}.ortu@rsi.sch.id`;
    const pPass = await bcrypt.hash(parentPassword || "12345678", 10);
    const parentUser = await db.user.create({
      data: { email: pEmail, passwordHash: pPass, role: "PARENT", name: parentName },
    });
    const parent = await db.parent.create({
      data: { userId: parentUser.id, phone: parentPhone || null, address: parentAddress || null },
    });
    await db.student.update({ where: { id: student.id }, data: { parentId: parent.id } });
    parentResult = { name: parentName, email: pEmail, phone: parentPhone || null };
  }

  const classObj = await db.class.findUnique({ where: { id: classId }, select: { name: true } });

  return NextResponse.json({
    success: true,
    message: "Akun berhasil dibuat",
    data: {
      student: { user: { name, email }, nis, class: classObj ? { name: classObj.name } : null },
      parent: parentResult,
    },
  });
}
