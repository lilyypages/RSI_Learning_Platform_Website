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
        id: true, 
        name: true, 
        email: true,
        role: true, 
        isActive: true, 
        createdAt: true,
        imageUrl: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// POST /api/users = Create Student+Parent OR Teacher (PRINCIPAL only)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PRINCIPAL") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { type, name, email, namaSiswa, kelas, namaOrtu, emailOrtu, classId } = body;

    // Generate password acak 8 karakter
    const defaultPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    // ==========================================
    // SCENARIO A: MEMBUAT AKUN GURU (TEACHER)
    // ==========================================
    if (type === "TEACHER") {
      if (!name || !email) {
        return NextResponse.json({ success: false, message: "Nama dan Email guru wajib diisi" }, { status: 400 });
      }

      const result = await db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: email.toLowerCase().trim(),
            passwordHash,
            role: "TEACHER",
            name: name.trim(),
            isActive: true,
            createdBy: session.userId, // Mencatat siapa pembuatnya (Principal)
          },
        });

        // Membuat record pendamping di tabel Teacher
        await tx.teacher.create({
          data: { userId: user.id },
        });

        return { user, defaultPassword };
      });

      return NextResponse.json({
        success: true,
        message: "Akun Guru berhasil dibuat",
        email: result.user.email,
        defaultPassword: result.defaultPassword,
      }, { status: 201 });
    }

    // ==========================================
    // SCENARIO B: MEMBUAT AKUN SISWA + ORTU
    // ==========================================
    if (!namaSiswa || !kelas || !namaOrtu || !emailOrtu) {
      return NextResponse.json({ success: false, message: "Field siswa dan orang tua wajib diisi" }, { status: 400 });
    }

    // Sanitize string untuk email generator siswa
    const cleanStudentName = namaSiswa.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
    const cleanClassName = kelas.toLowerCase().replace(/\s+/g, "");
    const baseStudentEmail = `${cleanStudentName}.${cleanClassName}@siswa.sch.id`;
    const baseParentEmail = emailOrtu.toLowerCase().trim();

    const result = await db.$transaction(async (tx) => {
      // 1. Buat User Orang Tua
      const parentUser = await tx.user.create({
        data: {
          email: baseParentEmail,
          passwordHash,
          role: "PARENT",
          name: namaOrtu.trim(),
          isActive: true,
          createdBy: session.userId,
        },
      });

      // 2. Buat Record Profile Orang Tua
      const parent = await tx.parent.create({
        data: { userId: parentUser.id },
      });

      // 3. Buat User Siswa
      const studentUser = await tx.user.create({
        data: {
          email: baseStudentEmail,
          passwordHash,
          role: "STUDENT",
          name: namaSiswa.trim(),
          isActive: true,
          createdBy: session.userId,
        },
      });

      // 4. Generate NIS unik berbasis timestamp pendek + random digit
      const nis = `${Date.now()}`.slice(-6) + Math.floor(10 + Math.random() * 90);

      // 5. Buat Record Profile Siswa
      await tx.student.create({
        data: {
          userId: studentUser.id,
          parentId: parent.id,
          classId: classId || null,
          nis,
          totalPoints: 0,
          currentStreak: 0,
          livesRemaining: 3,
        },
      });

      return { parentUser, studentUser, defaultPassword };
    });

    return NextResponse.json({
      success: true,
      message: "Akun Siswa & Orang Tua berhasil dibuat",
      studentEmail: result.studentUser.email,
      parentEmail: result.parentUser.email,
      defaultPassword: result.defaultPassword,
    }, { status: 201 });

  } catch (error: any) {
    console.error("[USERS_POST]", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ success: false, message: "Email atau NIS sudah terdaftar di sistem" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Gagal membuat akun karena kesalahan server" }, { status: 500 });
  }
}