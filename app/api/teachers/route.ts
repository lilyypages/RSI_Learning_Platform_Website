import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * -------------------------------------------------------------------
 * TAHAP 1 (DIREVISI): GET /api/teachers
 * Mengambil data komprehensif untuk Dashboard Kepsek & Guru
 * -------------------------------------------------------------------
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.role;

    // SCENARIO 1: JIKA YANG AKSES ADALAH GURU (TEACHER)
    if (userRole === "TEACHER") {
      const currentTeacher = await db.teacher.findUnique({
        where: { userId: session.userId },
        include: {
          user: { select: { id: true, name: true, email: true, isActive: true } },
          homeroomClass: { select: { id: true, name: true, gradeLevel: true } },
          classSubjects: {
            include: {
              subject: { select: { name: true } },
              class:   { select: { name: true } },
            },
          },
        },
      });

      if (!currentTeacher) {
        return NextResponse.json({ success: false, message: "Data guru tidak ditemukan" }, { status: 404 });
      }

      return NextResponse.json({ success: true, teacher: currentTeacher });
    }

    // SCENARIO 2: JIKA YANG AKSES ADALAH KEPSEK / PRINCIPAL
    if (userRole === "PRINCIPAL") {
      const teachers = await db.teacher.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, imageUrl: true, isActive: true } },
          homeroomClass: { select: { id: true, name: true, gradeLevel: true } },
          classSubjects: {
            select: { id: true } 
          }
        },
        orderBy: { user: { name: "asc" } },
      });

      // 🌟 REVISI POIN 1: Kirim data homeroom secara lengkap dan tipisasi ketat
      const formattedTeachers = teachers.map((t) => ({
        id: t.id,
        name: t.user?.name ?? "Tanpa Nama",
        email: t.user?.email ?? "-",
        imageUrl: t.user?.imageUrl ?? null,
        nip: t.nip ?? "-", 
        phone: t.phone ?? "-",
        isActive: t.user?.isActive ?? false,
        subjectCount: t.classSubjects.length,
        isHomeroomTeacher: !!t.homeroomClass,
        homeroomClass: t.homeroomClass, // Objek utuh (id, name, gradeLevel) untuk UI
      }));

      return NextResponse.json({ success: true, teachers: formattedTeachers });
    }

    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

  } catch (error) {
    console.error("[TEACHERS_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

/**
 * -------------------------------------------------------------------
 * TAHAP 2 (DIREVISI): POST /api/teachers
 * Pendaftaran ganda User & Teacher dengan audit trail 'createdBy'
 * -------------------------------------------------------------------
 */
export async function POST(req: NextRequest) {
  try {
    const sessionPayLoad = await getSessionFromRequest(req);
    const guard = requireRole(sessionPayLoad, "PRINCIPAL");
    if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const session = guard.session;
const body = await req.json();
    const { name, email, password, nip, phone } = body;

    // 1. Validasi Keberadaan Input Keamanan Dasar
    if (!name?.trim() || !email?.trim() || !password?.trim() || !nip?.trim()) {
      return NextResponse.json({ success: false, message: "Nama, Email, Password, dan NIP wajib diisi." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNip = nip.trim();

    // 🌟 REVISI POIN 4: Validasi Mutu Format Email Menggunakan Regex Standar RFC
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ success: false, message: "Format alamat email tidak valid (contoh: nama@sekolah.sch.id)." }, { status: 400 });
    }

    // 🌟 REVISI POIN 5: Validasi Kekuatan Batas Minimum Karakter Password
    if (password.length < 8) {
      return NextResponse.json({ success: false, message: "Keamanan internal terganggu: Password minimal harus 8 karakter." }, { status: 400 });
    }

    // 2. Cek Duplikasi secara Paralel menggunakan Prisma Indexing
    const [existingUser, existingTeacher] = await Promise.all([
      db.user.findUnique({ where: { email: cleanEmail } }),
      db.teacher.findUnique({ where: { nip: cleanNip } })
    ]);

    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email sudah terdaftar." }, { status: 400 });
    }
    if (existingTeacher) {
      return NextResponse.json({ success: false, message: "NIP sudah terdaftar pada sistem guru lain." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Eksekusi Transaksi Atomik Multi-Model
    const newTeacher = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          role: "TEACHER",
          isActive: true,
          createdBy: session.userId, 
        }
      });

      // 🌟 REVISI POIN 7: Menyertakan relasi User saat data sukses dibuat
      return await tx.teacher.create({
        data: {
          userId: user.id,
          nip: cleanNip,
          phone: phone?.trim() || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: "Data akun pendidik berhasil disimpan.",
      teacher: newTeacher // Mengirimkan objek lengkap kaya data untuk manipulasi state FE instant
    }, { status: 201 });

  } catch (error) {
    console.error("[TEACHERS_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server saat mendaftarkan guru" }, { status: 500 });
  }
}