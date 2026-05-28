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
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "TEACHER" && session.role !== "PRINCIPAL")) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await db.material.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Materi berhasil dihapus" });
  } catch (error) {
    console.error("[MATERIAL_DELETE]", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus materi" }, { status: 500 });
  }
}