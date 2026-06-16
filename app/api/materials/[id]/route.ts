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

      if (videoIds.length > 0) {
        // Hapus log tontonan siswa terlebih dahulu (aman jika model dinamis)
        if ((tx as any).videoWatch) {
          await (tx as any).videoWatch.deleteMany({ where: { videoId: { in: videoIds } } });
        } else if ((tx as any).videoWatches) {
          await (tx as any).videoWatches.deleteMany({ where: { videoId: { in: videoIds } } });
        }
        
        // Hapus data video utama
        await tx.video.deleteMany({ where: { materialId: id } });
      }

      // 2. Ambil semua ID Soal (Menggunakan model tunggal 'question' 🌟 sesuai API-mu)
      const questions = await tx.question.findMany({
        where: { materialId: id },
        select: { id: true }
      });
      const questionIds = questions.map(q => q.id);

      if (questionIds.length > 0) {
        // Hapus rekam jejak jawaban kuis siswa jika tabel relasinya tersedia
        if ((tx as any).studentAnswer) {
          await (tx as any).studentAnswer.deleteMany({ where: { questionId: { in: questionIds } } });
        } else if ((tx as any).studentAnswers) {
          await (tx as any).studentAnswers.deleteMany({ where: { questionId: { in: questionIds } } });
        }

        // Hapus butir soal kuis di bawah naungan bab ini
        await tx.question.deleteMany({ where: { materialId: id } });
      }

      // 3. Langkah Terakhir: Hapus Bab Utama (Material)
      await tx.material.delete({
        where: { id: id },
      });
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