// app/api/teachers/[id]/subjects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

/**
 * -------------------------------------------------------------------
 * GET /api/teachers/[id]/subjects (REVISI OPTIMAL)
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
        user: { select: { name: true, email: true, isActive: true } },
        homeroomClass: { select: { id: true, name: true } } // Mengambil array kelas
      }
    });

    if (!teacher) {
      return NextResponse.json({ success: false, message: "Data guru tidak ditemukan" }, { status: 404 });
    }

    // Ambil beban mengajar saat ini
    const assignedSubjects = await db.classSubject.findMany({
      where: { teacherId: id },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true } }
      },
      orderBy: { class: { name: "asc" } }
    });

    // 🌟 REVISI POIN 3: Optimasi select payload agar query availableAssignments jauh lebih ringan
    const availableAssignments = await db.classSubject.findMany({
      include: {
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true } },
        teacher: {
          select: {
            id: true,
            user: { select: { name: true } }
          }
        }
      },
      orderBy: [
        { class: { name: "asc" } },
        { subject: { name: "asc" } }
      ]
    });

    // 🌟 REVISI POIN 1: Handler Fleksibel Multi-Kondisi (Aman untuk Array maupun Objek Tunggal)
    const isArrayHomeroom = Array.isArray(teacher.homeroomClass);
    const hasHomeroom = isArrayHomeroom ? teacher.homeroomClass.length > 0 : !!teacher.homeroomClass;
    const homeroomName = isArrayHomeroom 
      ? (teacher.homeroomClass[0]?.name || null) 
      : ((teacher.homeroomClass as any)?.name || null);

    return NextResponse.json({
      success: true,
      teacher: {
        id: teacher.id,
        name: teacher.user.name,
        email: teacher.user.email,
        isActive: teacher.user.isActive,
        nip: teacher.nip,
        isHomeroom: hasHomeroom,
        homeroomClassName: homeroomName
      },
      assignedSubjects,
      availableAssignments
    });

  } catch (error) {
    console.error("[TEACHER_SUBJECTS_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data beban ajar" }, { status: 500 });
  }
}

/**
 * -------------------------------------------------------------------
 * PUT /api/teachers/[id]/subjects (REVISI INFORMATIF)
 * -------------------------------------------------------------------
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    const guard = requireRole(session, "PRINCIPAL");
    if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;
    const body = await req.json();
    const { classSubjectIds, isHomeroom } = body;

    if (!Array.isArray(classSubjectIds)) {
      return NextResponse.json({ success: false, message: "Format data harus berbentuk array" }, { status: 400 });
    }

    const teacherExists = await db.teacher.findUnique({ where: { id } });
    if (!teacherExists) {
      return NextResponse.json({ success: false, message: "Target guru tidak ditemukan" }, { status: 404 });
    }

    if (classSubjectIds.length > 0) {
      const verifiedSubjects = await db.classSubject.findMany({
        where: { id: { in: classSubjectIds } }
      });

      if (verifiedSubjects.length !== classSubjectIds.length) {
        return NextResponse.json({ success: false, message: "Terdapat ID jadwal yang tidak valid" }, { status: 400 });
      }

      // Validasi pendudukan jadwal (Mencegah rebutan guru)
      const occupiedAssignments = await db.classSubject.findMany({
        where: {
          id: { in: classSubjectIds },
          teacherId: { not: null },
          NOT: { teacherId: id }
        },
        include: {
          subject: { select: { name: true } },
          class: { select: { name: true } },
          teacher: { include: { user: { select: { name: true } } } }
        }
      });

      if (occupiedAssignments.length > 0) {
        const conflictDetails = occupiedAssignments
          .map(o => `[${o.subject.name} - ${o.class.name}] oleh ${o.teacher?.user.name}`)
          .join(", ");
        return NextResponse.json({ 
          success: false, 
          message: `Gagal menyimpan! Beberapa jadwal telah diampu guru lain: ${conflictDetails}` 
        }, { status: 400 });
      }
    }

    // Transaksi Atomik Aman
    await db.$transaction(async (tx) => {
      await tx.classSubject.updateMany({
        where: { teacherId: id },
        data: { isHomeroom: !!isHomeroom, teacherId: null }
      });

      if (classSubjectIds.length > 0) {
        await tx.classSubject.updateMany({
          where: { id: { in: classSubjectIds } },
          data: { isHomeroom: !!isHomeroom, teacherId: id }
        });
      }
    });

    // 🌟 REVISI POIN 6: Response yang jauh lebih informatif bagi state frontend
    return NextResponse.json({
      success: true,
      message: "Beban mengajar berhasil diperbarui.",
      totalAssigned: classSubjectIds.length
    });

  } catch (error) {
    console.error("[TEACHER_SUBJECTS_PUT_ERROR]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}