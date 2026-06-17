import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/reports
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    let reports;

    if (session.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({ where: { userId: session.userId } });
      if (!teacher) return NextResponse.json([]);

      reports = await db.weeklyReport.findMany({
        where:   { teacherId: teacher.id },
        include: {
          student:      { include: { user: { select: { name: true } } } },
          classSubject: { include: { subject: { select: { name: true } } } },
        },
        orderBy: { generatedAt: "desc" },
      });
    } else if (session.role === "PARENT") {
      const parent = await db.parent.findUnique({
        where:   { userId: session.userId },
        include: { students: true },
      });
      if (!parent) return NextResponse.json([]);

      const studentIds = parent.students.map((s) => s.id);
      reports = await db.weeklyReport.findMany({
        where:   { studentId: { in: studentIds } },
        include: {
          // 🌟 Dashboard Ortu: Kita sertakan info nama anak & mata pelajaran agar transparan
          student:      { include: { user: { select: { name: true } } } },
          classSubject: { include: { subject: { select: { name: true } } } },
        },
        orderBy: { generatedAt: "desc" },
      });
    } else {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error("[REPORTS_GET]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// POST /api/reports = Mengirim laporan mingguan kustom per siswa
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const teacher = await db.teacher.findUnique({
      where: { userId: session.userId },
    });

    if (!teacher) {
      return NextResponse.json({ success: false, message: "Data guru tidak ditemukan" }, { status: 404 });
    }

    // 🌟 1. Ambil payload kustom yang dikirim dari form LaporanMingguan
    const body = await req.json();
    const { classSubjectId, catatanKelas, laporanSiswa } = body; 
    // laporanSiswa berbentuk: [{ studentId: "...", catatanIndividu: "..." }, ...]

    if (!laporanSiswa || !Array.isArray(laporanSiswa) || laporanSiswa.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data catatan siswa tidak valid atau kosong" },
        { status: 400 }
      );
    }

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Ambil hari Minggu pekan ini

    // 🌟 2. Jalankan transaksi bulk database berdasarkan input kustom dari komponen guru
    await db.$transaction(
      laporanSiswa.map((item) => {
        // Gabungkan catatan umum kelas dengan catatan privat anak agar ortu membaca keduanya
        const gabunganCatatan = item.catatanIndividu 
          ? `[Catatan Kelas]: ${catatanKelas || "-"}\n[Catatan Khusus]: ${item.catatanIndividu}`
          : `[Catatan Kelas]: ${catatanKelas || "-"}`;

        return db.weeklyReport.create({
          data: {
            studentId:      item.studentId,
            classSubjectId: classSubjectId,
            teacherId:      teacher.id,
            weekStart:      weekStart,
            avgScore:       0,
            completionRate: 0,
            recommendation: gabunganCatatan,
            kkm_achieved:   false,
          },
        });
      })
    );

    // 🔁 3. Sinkronisasi: Kirim pesan laporan ke inbox masing-masing orang tua
    for (const item of laporanSiswa) {
      try {
        const student = await db.student.findUnique({
          where: { id: item.studentId },
          include: {
            user:   { select: { name: true } },
            parent: { include: { user: { select: { id: true } } } },
          },
        });

        if (!student?.parent?.user?.id) continue;

        const parentUserId = student.parent.user.id;
        const studentName = student.user?.name ?? "siswa";
        const catatan = item.catatanIndividu
          ? `📋 [Laporan Mingguan untuk ${studentName}]\n\n${catatanKelas || "-"}\n\n📝 Catatan Khusus: ${item.catatanIndividu}`
          : `📋 [Laporan Mingguan untuk ${studentName}]\n\n${catatanKelas || "-"}`;

        await db.message.create({
          data: {
            senderId:   session.userId,
            receiverId: parentUserId,
            content:    catatan,
            isRead:     false,
          },
        });

        await db.notification.create({
          data: {
            userId:    parentUserId,
            title:     `📋 Laporan Mingguan: ${studentName}`,
            body:      (catatanKelas || "Laporan baru dari guru").slice(0, 100),
            notifType: "MESSAGE",
            isRead:    false,
          },
        });
      } catch (e) {
        console.error(`[REPORTS_PARENT_SYNC_ERROR] studentId=${item.studentId}`, e);
        // Tidak gagalkan response — laporan utama sudah tersimpan
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Laporan individu berhasil didistribusikan ke ${laporanSiswa.length} dashboard orang tua.`,
        count:   laporanSiswa.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REPORTS_POST]", error);
    return NextResponse.json({ success: false, message: "Gagal memproses laporan kustom" }, { status: 500 });
  }
}