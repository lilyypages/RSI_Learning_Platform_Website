import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * -------------------------------------------------------------------
 * TAHAP 3: GET /api/students/[id] (VERSI PRODUKSI - OPTIMAL)
 * Mengambil profil lengkap via SELECT & Agregasi Statistik Lengkap
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

    // 1. Query Utama Siswa Menggunakan SELECT Ketat (Sesuai Ulasan Poin 1 & 2)
    const student = await db.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            isActive: true,
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true,
          }
        },
        parent: {
          select: {
            id: true,
            phone: true,
            address: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        progress: {
          orderBy: {
            lastActivity: "desc",
          },
          select: {
            id: true,
            completionPercent: true,
            totalScore: true,
            adaptiveLevel: true,
            lastActivity: true,
            classSubject: {
              select: {
                id: true,
                subject: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  }
                }
              }
            }
          }
        },
        quizSessions: {
          take: 5,
          orderBy: {
            startedAt: "desc",
          },
          select: {
            id: true,
            score: true,
            correctCount: true,
            wrongCount: true,
            resultLevel: true,
            startedAt: true,
            finishedAt: true,
            classSubject: {
              select: {
                subject: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ success: false, message: "Siswa tidak ditemukan" }, { status: 404 });
    }

    // 2. Penghitungan Statistik Tambahan Secara Paralel di Database (Sesuai Ulasan Poin 3)
    const [totalQuiz, completedVideos] = await Promise.all([
      db.quizSession.count({
        where: { studentId: id }
      }),
      db.videoWatch.count({
        where: {
          studentId: id,
          isCompleted: true
        }
      })
    ]);

    const progressCount = student.progress.length;
    
    const avgCompletion = progressCount > 0
      ? student.progress.reduce((sum, p) => sum + (p.completionPercent ?? 0), 0) / progressCount
      : 0;

    const avgScore = progressCount > 0
      ? student.progress.reduce((sum, p) => sum + (p.totalScore ?? 0), 0) / progressCount
      : 0;

    // 3. Kembalikan Response Bersih & Ringan
    return NextResponse.json({ 
      success: true, 
      student,
      stats: {
        progressCount, // Jumlah entitas progress data
        subjectCount: progressCount, // Total mata pelajaran yang dipelajari
        avgCompletion: Math.round(avgCompletion),
        avgScore: Math.round(avgScore),
        totalQuiz,
        completedVideos
      }
    });

  } catch (error) {
    console.error("[STUDENT_ID_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

/**
 * -------------------------------------------------------------------
 * TAHAP 4 (Awal): PATCH /api/students/[id]
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
    
    const {
      studentName,
      studentEmail,
      studentPassword,
      nis,
      birthdate,
      classId,
      parentName,
      parentEmail,
      parentPassword,
      parentPhone,
      parentAddress,
      isActive
    } = body;

    // 1. Cari data student asli beserta relasinya
    const student = await db.student.findUnique({
      where: { id },
      include: { parent: true }
    });
    if (!student) return NextResponse.json({ success: false, message: "Siswa tidak ditemukan" }, { status: 404 });

    // 2. Validasi Duplikasi Email/NIS jika ada perubahan
    if (studentEmail) {
      const existingEmail = await db.user.findFirst({
        where: { email: studentEmail.trim(), NOT: { id: student.userId } }
      });
      if (existingEmail) return NextResponse.json({ success: false, message: "Email siswa sudah digunakan akun lain." }, { status: 400 });
    }

    if (nis) {
      const existingNis = await db.student.findFirst({
        where: { nis: nis.trim(), NOT: { id: id } }
      });
      if (existingNis) return NextResponse.json({ success: false, message: "NIS sudah digunakan siswa lain." }, { status: 400 });
    }

    if (parentEmail && student.parent) {
      const existingParentEmail = await db.user.findFirst({
        where: { email: parentEmail.trim(), NOT: { id: student.parent.userId } }
      });
      if (existingParentEmail) return NextResponse.json({ success: false, message: "Email orang tua sudah digunakan akun lain." }, { status: 400 });
    }

    // 3. Eksekusi Update Multi-Model dalam Satu Transaksi (Atomic)
    await db.$transaction(async (tx) => {
      
      // A. Update Akun User Siswa
      const studentUserData: any = {};
      if (studentName) studentUserData.name = studentName.trim();
      if (studentEmail) studentUserData.email = studentEmail.trim();
      if (studentPassword && studentPassword.trim() !== "") {
        studentUserData.passwordHash = await bcrypt.hash(studentPassword, 10);
      }
      if (typeof isActive === "boolean") studentUserData.isActive = isActive;

      await tx.user.update({
        where: { id: student.userId },
        data: studentUserData
      });

      // B. Update Profil Student
      const parsedDate = birthdate ? new Date(birthdate) : null;
      await tx.student.update({
        where: { id },
        data: {
          nis: nis ? nis.trim() : undefined,
          classId: classId || null,
          birthdate: birthdate ? parsedDate : undefined,
        }
      });

      // C. Update Data Orang Tua (Jika terikat)
      if (student.parent) {
        // Update Akun User Orang Tua
        const parentUserData: any = {};
        if (parentName) parentUserData.name = parentName.trim();
        if (parentEmail) parentUserData.email = parentEmail.trim();
        if (parentPassword && parentPassword.trim() !== "") {
          parentUserData.passwordHash = await bcrypt.hash(parentPassword, 10);
        }
        if (typeof isActive === "boolean") parentUserData.isActive = isActive; // Samakan status aktif ortu-anak

        await tx.user.update({
          where: { id: student.parent.userId },
          data: parentUserData
        });

        // Update Profil Parent
        await tx.parent.update({
          where: { id: student.parentId },
          data: {
            phone: parentPhone ? parentPhone.trim() : undefined,
            address: parentAddress ? parentAddress.trim() : undefined,
          }
        });
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Seluruh rangkaian data siswa dan orang tua berhasil diperbarui." 
    });

  } catch (error) {
    console.error("[STUDENT_ID_PATCH_ERROR]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server saat memperbarui data." }, { status: 500 });
  }
}

/**
 * -------------------------------------------------------------------
 * DELETE /api/students/[id] (REVISI: SOFT DELETE AMAN)
 * Mengubah status isActive menjadi false untuk mengamankan data akademik
 * -------------------------------------------------------------------
 */
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    const guard = requireRole(session, "PRINCIPAL");
    if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;

    const student = await db.student.findUnique({ 
      where: { id }, 
      select: { userId: true } 
    });
    
    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    // 🌟 Mengubah sistem dari Hard Delete ke Soft Delete demi integritas data relasi kuis/video
    await db.user.update({
      where: { id: student.userId },
      data: { isActive: false }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Siswa berhasil dinonaktifkan (Soft Delete sukses)" 
    });
  } catch (error) {
    console.error("[STUDENT_ID_DELETE_ERROR]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}