// app/api/materials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
// GET /api/materials?classSubjectId=xxx
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const classSubjectId = searchParams.get("classSubjectId");
    const materials = await db.material.findMany({
      where: {
        ...(classSubjectId && { classSubjectId }),
        isPublished: session.role === "STUDENT" ? true : undefined,
      },
      include: {
        videos: { select: { id: true, title: true, embedUrl: true, durationSeconds: true } },
        questions: { select: { id: true, difficulty: true } },
        classSubject: {
          include: {
            subject: { select: { name: true, code: true } },
            class:   { select: { name: true } },
          },
        },
      },
      orderBy: { orderIndex: "asc" },
    });
    return NextResponse.json(materials);
  } catch (error) {
    console.error("[MATERIALS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
// POST /api/materials — create new material (TEACHER only)
// app/api/materials/route.ts

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    // 🌟 Ambil materialId dari body data yang dikirim frontend
    const { classSubjectId, materialId, title, contentText, orderIndex, difficulty, embedUrl, videoTitle } = body;
    
    if (!classSubjectId || !title) {
      return NextResponse.json(
        { success: false, message: "classSubjectId dan title wajib diisi" },
        { status: 400 }
      );
    }

    if (embedUrl) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(embedUrl)) {
        return NextResponse.json({ success: false, message: "Masukkan URL YouTube yang valid" }, { status: 400 });
      }
    }

    // Jalankan transaksi DB
    const material = await db.$transaction(async (tx) => {
      let currentMaterial;

      // 🌟 JIKA MATERIAL_ID ADA: Lakukan UPDATE konten bab yang sudah ada
      if (materialId) {
        currentMaterial = await tx.material.update({
          where: { id: materialId },
          data: {
            title,
            contentText: contentText ?? null,
            difficulty: difficulty ?? "MEDIUM",
          },
        });

        // Urus relasi video (Hapus dulu yang lama, lalu buat baru jika ada input video baru)
        if (embedUrl && videoTitle) {
          await tx.video.deleteMany({ where: { materialId } });
          await tx.video.create({
            data: {
              materialId,
              title: videoTitle,
              embedUrl,
              durationSeconds: 0,
              pointReward: 10,
            },
          });
        }
      } 
      // 🌟 JIKA MATERIAL_ID TIDAK ADA: Jalankan fungsi bawaanmu (Bikin Bab Baru Kosong)
      else {
        currentMaterial = await tx.material.create({
          data: {
            classSubjectId,
            title,
            contentText: contentText ?? null,
            orderIndex: orderIndex ?? 0,
            difficulty: difficulty ?? "MEDIUM",
            isPublished: true,
          },
        });

        if (embedUrl && videoTitle) {
          await tx.video.create({
            data: {
              materialId: currentMaterial.id,
              title: videoTitle,
              embedUrl,
              durationSeconds: 0,
              pointReward: 10,
            },
          });
        }
      }

      return currentMaterial;
    });

    return NextResponse.json(
      { success: true, message: "Materi berhasil disinkronisasi", material },
      { status: 200 }
    );

  } catch (error) {
    console.error("[MATERIALS_POST_UPDATE]", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan materi. Coba lagi." },
      { status: 500 }
    );
  }
}