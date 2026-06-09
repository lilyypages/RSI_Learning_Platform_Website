// app/api/teachers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * -------------------------------------------------------------------
 * TAHAP 3 (FINAL): GET /api/teachers/[id]
 * Mengambil Profil Detail & Agregasi Statistik Presisi (Defensive)
 * -------------------------------------------------------------------
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    const guard = requireRole(session, "PRINCIPAL");
    if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;

    const teacher = await db.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, imageUrl: true, isActive: true }
        },
        homeroomClass: {
          select: { id: true, name: true, gradeLevel: true }
        },
        classSubjects: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
            class: { select: { id: true, name: true, gradeLevel: true } }
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({ success: false, message: "Guru tidak ditemukan" }, { status: 404 });
    }

    // 🌟 REVISI 1: Proteksi Aliansi ID Kelas menggunakan Filter Boolean (Anti Data Rusak)
    const activeClassIds = Array.from(
      new Set(
        teacher.classSubjects
          .map((cs) => cs.class?.id)
          .filter(Boolean)
      )
    );

    // 🌟 REVISI 2: Kalkulasi Jumlah Mata Pelajaran UNIK murni
    const uniqueSubjectIds = new Set(
      teacher.classSubjects
        .map((cs) => cs.subject?.id)
        .filter(Boolean)
    );

    // Hitung akumulasi siswa total dari lingkup kelas yang diampu
    const totalStudentsBimbingan = activeClassIds.length > 0
      ? await db.student.count({
          where: { classId: { in: activeClassIds } }
        })
      : 0;

    // 🌟 REVISI 5: Deteksi status Wali Kelas (karena homeroomClass berupa array relation)
    const isHomeroomTeacher = teacher.homeroomClass.length > 0;

    return NextResponse.json({
      success: true,
      teacher,
      stats: {
        totalSubjects: uniqueSubjectIds.size, // Jumlah mapel unik
        totalAssignments: teacher.classSubjects.length, // Total jam/kelas ajar
        totalClasses: activeClassIds.length,
        totalStudents: totalStudentsBimbingan,
        isHomeroomTeacher
      }
    });

  } catch (error) {
    console.error("[TEACHER_ID_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

/**
 * -------------------------------------------------------------------
 * TAHAP 4 (FINAL): PATCH /api/teachers/[id]
 * Pembaruan Data + Reset Password dengan Proteksi Payload Type Jamming
 * -------------------------------------------------------------------
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    const guard = requireRole(session, "PRINCIPAL");
    if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;
    const body = await req.json();
    const { name, email, password, nip, phone, isActive } = body;

    const currentTeacher = await db.teacher.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!currentTeacher) {
      return NextResponse.json({ success: false, message: "Guru tidak ditemukan" }, { status: 404 });
    }

    const updateUserData: any = {};
    const updateTeacherData: any = {};

    // Saring parameter input dengan proteksi tipe data
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ success: false, message: "Nama tidak boleh kosong" }, { status: 400 });
      }
      updateUserData.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return NextResponse.json({ success: false, message: "Email tidak boleh kosong" }, { status: 400 });
      }
      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return NextResponse.json({ success: false, message: "Format email tidak valid" }, { status: 400 });
      }
      
      const duplicateEmail = await db.user.findUnique({ where: { email: cleanEmail } });
      if (duplicateEmail && duplicateEmail.id !== currentTeacher.userId) {
        return NextResponse.json({ success: false, message: "Email sudah digunakan oleh akun lain" }, { status: 400 });
      }
      updateUserData.email = cleanEmail;
    }

    // 🌟 REVISI 4: Proteksi Password terhadap nilai non-string (null/undefined/number)
    if (typeof password === "string" && password.trim()) {
      if (password.length < 8) {
        return NextResponse.json({ success: false, message: "Password baru minimal harus 8 karakter" }, { status: 400 });
      }
      updateUserData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    if (nip !== undefined) {
      if (typeof nip !== "string" || !nip.trim()) {
        return NextResponse.json({ success: false, message: "NIP tidak boleh kosong" }, { status: 400 });
      }
      const cleanNip = nip.trim();
      const duplicateNip = await db.teacher.findUnique({ where: { nip: cleanNip } });
      if (duplicateNip && duplicateNip.id !== id) {
        return NextResponse.json({ success: false, message: "NIP sudah digunakan oleh guru lain" }, { status: 400 });
      }
      updateTeacherData.nip = cleanNip;
    }

    // 🌟 REVISI 3: Proteksi Phone dari Null-pointer Error saat .trim()
    if (phone !== undefined) {
      updateTeacherData.phone = typeof phone === "string" ? phone.trim() || null : null;
    }

    if (isActive !== undefined) {
      updateUserData.isActive = Boolean(isActive);
    }

    // 🌟 REVISI 5: Validasi Penolakan Request Tanpa Perubahan Data (0 Keys)
    if (Object.keys(updateUserData).length === 0 && Object.keys(updateTeacherData).length === 0) {
      return NextResponse.json({ success: false, message: "Tidak ada data perubahan yang dikirim." }, { status: 400 });
    }

    // Eksekusi mutasi data sekuensial aman
    await db.$transaction(async (tx) => {
      if (Object.keys(updateUserData).length > 0) {
        await tx.user.update({ where: { id: currentTeacher.userId }, data: updateUserData });
      }
      if (Object.keys(updateTeacherData).length > 0) {
        await tx.teacher.update({ where: { id }, data: updateTeacherData });
      }
    });

    return NextResponse.json({ success: true, message: "Data profil & kredensial guru berhasil diperbarui." });

  } catch (error) {
    console.error("[TEACHER_ID_PATCH_ERROR]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}