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

  const students = await db.student.findMany({
    where: {
      ...(classId && classId !== "all" ? { classId } : {}),
      ...(search ? { OR: [{ user: { name: { contains: search, mode: "insensitive" } } }, { nis: { contains: search, mode: "insensitive" } }] } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true } },
      class: { select: { id: true, name: true } },
      parent: { select: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return NextResponse.json({ success: true, data: students });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json();
  const { name, nis, className, parentName, parentEmail } = body;

  if (!name || !nis || !className) {
    return NextResponse.json({ error: "Nama, NIS, dan Kelas wajib diisi" }, { status: 400 });
  }

  const exist = await db.student.findUnique({ where: { nis } });
  if (exist) return NextResponse.json({ error: "NIS sudah terdaftar" }, { status: 409 });

  const defaultPass = await bcrypt.hash("123456", 10);
  const email = `${nis}@student.rsi.sch.id`;

  const user = await db.user.create({
    data: { email, passwordHash: defaultPass, role: "STUDENT", name },
  });

  const student = await db.student.create({
    data: { userId: user.id, nis, classId: className },
  });

  let parentUser = null;
  if (parentName) {
    const pEmail = parentEmail || `${nis}.ortu@rsi.sch.id`;
    parentUser = await db.user.create({
      data: { email: pEmail, passwordHash: defaultPass, role: "PARENT", name: parentName },
    });
    const parent = await db.parent.create({ data: { userId: parentUser.id } });
    await db.student.update({ where: { id: student.id }, data: { parentId: parent.id } });
  }

  return NextResponse.json({
    success: true,
    message: "Akun berhasil dibuat",
    email: parentUser?.email || email,
  });
}
