// app/api/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs"; // 🌟 DIPERBAIKI: Menambahkan import bcrypt

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const includeProgress = searchParams.get("includeProgress") === "true";

    let whereClause: any = {};

    // 1. Filter berdasarkan Role
    if (session.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({
        where: { userId: session.userId },
        include: {
          homeroomClass: { select: { id: true } },
          classSubjects: { select: { classId: true } },
        },
      });

      if (!teacher) {
        return NextResponse.json({ success: true, students: [] });
      }

      const homeroomClassIds = teacher.homeroomClass.map((c) => c.id);
      const subjectClassIds = teacher.classSubjects.map((cs) => cs.classId);
      const allClassIds = Array.from(new Set([...homeroomClassIds, ...subjectClassIds]));

      if (allClassIds.length === 0) {
        return NextResponse.json({ success: true, students: [] });
      }

      whereClause = { classId: { in: allClassIds } };

    } else if (session.role === "PARENT") {
      const parent = await db.parent.findUnique({
        where: { userId: session.userId },
        select: { id: true }
      });
      
      if (!parent) return NextResponse.json({ success: true, students: [] });
      whereClause = { parentId: parent.id };

    } else if (session.role === "STUDENT") {
      whereClause = { userId: session.userId };

    } else if (session.role === "PRINCIPAL" || session.role === "ADMIN" || session.role === "SUPERADMIN") {
      whereClause = {}; 
    } else {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // 2. Query ke Database (Satu struktur menggunakan SELECT)
    const students = await db.student.findMany({
      where: whereClause,
      select: {
        id: true,
        nis: true,
        totalPoints: true,
        currentStreak: true,
        livesRemaining: true,
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true,
            imageUrl: true, 
            isActive: true 
          } 
        },
        class: { 
          select: { 
            id: true, 
            name: true,
            gradeLevel: true 
          } 
        },
        ...(includeProgress && {
          progress: {
            select: {
              totalScore: true,
              completionPercent: true,
              adaptiveLevel: true,
              lastActivity: true,
              classSubjectId: true,
            },
          },
        }),
      },
      orderBy: { 
        user: { 
          name: "asc" 
        } 
      },
    });

    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error("[STUDENTS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    // 1. Proteksi Autentikasi & Otorisasi
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["PRINCIPAL", "ADMIN", "SUPERADMIN"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // 2. Ambil Payload dari Frontend
    const body = await req.json();
    const { 
      studentName,
      studentEmail,
      studentPassword,
      nis,
      birthdate,
      classId,
      imageUrl,

      parentName,
      parentEmail,
      parentPassword,
      parentPhone,
      parentAddress
    } = body;

    // 3. Validasi Input Wajib & Cegah Spasi Kosong (.trim())
    if (
      !studentName?.trim() ||
      !studentEmail?.trim() ||
      !studentPassword?.trim() ||
      !nis?.trim() ||
      !parentName?.trim() ||
      !parentEmail?.trim() ||
      !parentPassword?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Semua field utama siswa dan orang tua wajib diisi (tidak boleh spasi saja)." },
        { status: 400 }
      );
    }

    // 4. Validasi Email Sama antara Siswa & Orang Tua
    if (studentEmail.trim().toLowerCase() === parentEmail.trim().toLowerCase()) {
      return NextResponse.json(
        { success: false, message: "Email siswa dan orang tua tidak boleh sama." },
        { status: 400 }
      );
    }

    // 5. Validasi Format Email Dasar
    if (!studentEmail.includes("@") || !parentEmail.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Format email siswa atau orang tua tidak valid." },
        { status: 400 }
      );
    }

    // 6. Validasi Format Tanggal Lahir
    const parsedDate = birthdate ? new Date(birthdate) : null;
    if (birthdate && (!parsedDate || isNaN(parsedDate.getTime()))) {
      return NextResponse.json(
        { success: false, message: "Format tanggal lahir tidak valid." },
        { status: 400 }
      );
    }

    // 7. Validasi Keberadaan Kelas
    if (classId) {
      const kelas = await db.class.findUnique({ where: { id: classId } });
      if (!kelas) {
        return NextResponse.json({ success: false, message: "Kelas tidak ditemukan." }, { status: 404 });
      }
    }

    // 8. Cek Duplikasi Data Unik di Database
    const existingStudentEmail = await db.user.findUnique({ where: { email: studentEmail.trim() } });
    if (existingStudentEmail) {
      return NextResponse.json({ success: false, message: "Email siswa sudah terdaftar." }, { status: 400 });
    }

    const existingParentEmail = await db.user.findUnique({ where: { email: parentEmail.trim() } });
    if (existingParentEmail) {
      return NextResponse.json({ success: false, message: "Email orang tua sudah terdaftar." }, { status: 400 });
    }

    const existingNis = await db.student.findUnique({ where: { nis: nis.trim() } });
    if (existingNis) {
      return NextResponse.json({ success: false, message: "NIS sudah digunakan siswa lain." }, { status: 400 });
    }

    // 9. Hashing Password
    const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);
    const hashedParentPassword = await bcrypt.hash(parentPassword, 10);

    // 10. Eksekusi Database Transaction (All-or-Nothing)
    const result = await db.$transaction(async (tx) => {
      
      // Langkah A: Buat User Orang Tua (dengan flag mustChangePassword)
      const parentUser = await tx.user.create({
        data: {
          email: parentEmail.trim(),
          passwordHash: hashedParentPassword,
          name: parentName.trim(),
          role: "PARENT",
          isActive: true,
          createdBy: session.userId,
        },
      });

      // Langkah B: Buat Profil Parent
      const parentProfile = await tx.parent.create({
        data: {
          userId: parentUser.id,
          phone: parentPhone?.trim() || null,
          address: parentAddress?.trim() || null,
        },
      });

      // Langkah C: Buat User Siswa (dengan flag mustChangePassword)
      const studentUser = await tx.user.create({
        data: {
          email: studentEmail.trim(),
          passwordHash: hashedStudentPassword,
          name: studentName.trim(),
          role: "STUDENT",
          imageUrl: imageUrl || null,
          isActive: true,
          createdBy: session.userId,
        },
      });

      // Langkah D: Buat Profil Student terikat ke Parent baru
      const studentProfile = await tx.student.create({
        data: {
          userId: studentUser.id,
          nis: nis.trim(),
          classId: classId || null,
          parentId: parentProfile.id,
          birthdate: parsedDate,
          totalPoints: 0,
          currentStreak: 0,
          livesRemaining: 3,
        },
        select: {
          id: true,
          nis: true,
          totalPoints: true,
          currentStreak: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          class: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Langkah E: Tambahkan Audit Log ke dalam antrean transaksi
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "CREATE_STUDENT_WITH_PARENT", // Lebih spesifik karena membuat sepasang akun
          tableName: "students",
          recordId: studentProfile.id,
          // jika skema auditLog kamu mendukung field metadata/details berbentuk json, bisa ditambahkan di sini
        }
      });

      // Return lengkap agar frontend bisa langsung render rangkuman data tanpa fetch ulang
      return { 
        student: studentProfile, 
        parent: {
          id: parentProfile.id,
          name: parentName.trim(),
          email: parentEmail.trim(),
          phone: parentPhone?.trim() || "-"
        } 
      };
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Akun siswa dan orang tua berhasil dibuat bersamaan.", 
        data: result 
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("[STUDENTS_AND_PARENTS_POST]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mendaftarkan data." },
      { status: 500 }
    );
  }
}