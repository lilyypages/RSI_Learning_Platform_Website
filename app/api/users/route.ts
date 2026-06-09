// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/users
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PRINCIPAL") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const users = await db.user.findMany({
      where: { ...(role && { role }) },
      select: {
        id: true, name: true, email: true,
        role: true, isActive: true, createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// POST /api/users = create student + parent pair (PRINCIPAL only)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PRINCIPAL") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { namaSiswa, kelas, namaOrtu, emailOrtu, classId } = body;

    if (!namaSiswa || !kelas || !namaOrtu || !emailOrtu) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const defaultPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    // Generate username
    const baseStudentEmail = `${namaSiswa.toLowerCase().replace(/\s+/g, "")}.${kelas.toLowerCase()}@siswa.sch.id`;
    const baseParentEmail  = emailOrtu.toLowerCase();

    const result = await db.$transaction(async (tx) => {
      const principalUserId = session.userId;
      // Create parent user
      const parentUser = await tx.user.create({
        data: {
          email: baseParentEmail,
          passwordHash,
          role: "PARENT",
          name: namaOrtu,
          isActive: true,
          createdBy: principalUserId,
        },
      });

      const parent = await tx.parent.create({
        data: { userId: parentUser.id },
      });

      // Create student user
      const studentUser = await tx.user.create({
        data: {
          email: baseStudentEmail,
          passwordHash,
          role: "STUDENT",
          name: namaSiswa,
          isActive: true,
          createdBy: principalUserId,
        },
      });

      const nis = `${Date.now()}`.slice(-8);

      const student = await tx.student.create({
        data: {
          userId:   studentUser.id,
          parentId: parent.id,
          classId:  classId ?? null,
          nis,
        },
      });

      return { parentUser, studentUser, student, defaultPassword };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Akun berhasil dibuat",
        studentEmail:    result.studentUser.email,
        parentEmail:     result.parentUser.email,
        defaultPassword: result.defaultPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[USERS_POST]", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Email sudah digunakan" },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: "Gagal membuat akun" }, { status: 500 });
  }
}