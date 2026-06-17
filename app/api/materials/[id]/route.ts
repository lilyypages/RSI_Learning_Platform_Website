// app/api/materials/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/materials/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const material = await db.material.findUnique({
      where: { id },
      include: {
        videos:    true,
        questions: true,
        classSubject: {
          include: {
            subject: { select: { name: true, code: true } },
            class:   { select: { name: true } },
          },
        },
      },
    });

    if (!material) {
      return NextResponse.json({ success: false, message: "Materi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error("[MATERIAL_GET_ONE]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// PUT /api/materials/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, contentText, difficulty, isPublished } = body;

    const material = await db.material.update({
      where: { id },
      data: {
        ...(title        !== undefined && { title }),
        ...(contentText  !== undefined && { contentText }),
        ...(difficulty   !== undefined && { difficulty }),
        ...(isPublished  !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({ success: true, message: "Materi berhasil diperbarui", material });
  } catch (error) {
    console.error("[MATERIAL_PUT]", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui materi" }, { status: 500 });
  }
}

// DELETE /api/materials/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 🌟 Unwrapping params as Promise sesuai standar Next.js terbarumu
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await db.$transaction(async (tx) => {
      // 1. Ambil semua ID Video yang nempel di bab ini
      const videos = await tx.video.findMany({
        where: { materialId: id },
        select: { id: true }
      });
      const videoIds = videos.map(v => v.id);

      // Hapus log tontonan siswa
      await tx.videoWatch.deleteMany({ where: { video: { materialId: id } } }).catch(() => {});
      
      // Hapus video
      await tx.video.deleteMany({ where: { materialId: id } });

      // 2. Hapus sesi quiz & jawaban siswa (QuizSession → cascade QuizAnswer)
      await tx.quizSession.deleteMany({ where: { materialId: id } }).catch(() => {});

      // 3. Hapus jawaban kuis yang masih refer ke Question (kalau QuizAnswer belum ke-cascade)
      await tx.quizAnswer.deleteMany({ where: { question: { materialId: id } } }).catch(() => {});

      // 4. Hapus soal
      await tx.question.deleteMany({ where: { materialId: id } });

      // 5. Langkah Terakhir: Hapus Bab Utama (Material)
      await tx.material.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: "Bab beserta kuis dan video berhasil dihapus secara permanen!" });
  } catch (error) {
    console.error("[MATERIAL_DELETE_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus data bab dari server karena kendala relasi data." },
      { status: 500 }
    );
  }
}