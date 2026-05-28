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
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { classSubjectId, title, contentText, orderIndex, difficulty, embedUrl, videoTitle } = body;

    // Validate required fields
    if (!classSubjectId || !title) {
      return NextResponse.json(
        { success: false, message: "classSubjectId dan title wajib diisi" },
        { status: 400 }
      );
    }

    // Validate YouTube URL if provided
    if (embedUrl) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(embedUrl)) {
        return NextResponse.json(
          { success: false, message: "Masukkan URL YouTube yang valid" },
          { status: 400 }
        );
      }
    }

    // Create material + optional video in one transaction
    const material = await db.$transaction(async (tx) => {
      const newMaterial = await tx.material.create({
        data: {
          classSubjectId,
          title,
          contentText:  contentText ?? null,
          orderIndex:   orderIndex  ?? 0,
          difficulty:   difficulty  ?? "MEDIUM",
          isPublished:  true,
        },
      });

      if (embedUrl && videoTitle) {
        await tx.video.create({
          data: {
            materialId:      newMaterial.id,
            title:           videoTitle,
            embedUrl,
            durationSeconds: 0,
            pointReward:     10,
          },
        });
      }

      return newMaterial;
    });

    return NextResponse.json(
      { success: true, message: "Materi berhasil disimpan", material },
      { status: 201 }
    );
  } catch (error) {
    console.error("[MATERIALS_POST]", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan materi. Coba lagi." },
      { status: 500 }
    );
  }
}