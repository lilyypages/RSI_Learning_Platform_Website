// app/api/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
 
const CAPS = { EASY: 10, MEDIUM: 25, HARD: 15 } as const;
 
// GET /api/questions?materialId=xxx
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
 
    const { searchParams } = new URL(req.url);
    const materialId = searchParams.get("materialId");
 
    if (!materialId) {
      return NextResponse.json(
        { success: false, message: "materialId wajib diisi" },
        { status: 400 }
      );
    }
 
    const questions = await db.question.findMany({
      where: { materialId },
      orderBy: { orderIndex: "asc" },
    });
 
    return NextResponse.json(questions);
  } catch (error) {
    console.error("[QUESTIONS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
 
// POST /api/questions — create new question (TEACHER only)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
 
    const body = await req.json();
    const { materialId, questionText, options, correctAnswer, difficulty, orderIndex } = body;
 
    // Validate required fields
    if (!materialId || !questionText || !options || !correctAnswer || !difficulty) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }
    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json(
        { success: false, message: "Soal pilihan ganda wajib memiliki tepat 4 opsi jawaban" },
        { status: 400 }
      );
    }
    if (options.some((o: string) => !o?.trim())) {
      return NextResponse.json(
        { success: false, message: "Semua pilihan jawaban wajib diisi" },
        { status: 400 }
      );
    }
 
    // Check capacity for this difficulty level
    const cap = CAPS[difficulty as keyof typeof CAPS];
    if (cap !== undefined) {
      const count = await db.question.count({
        where: { materialId, difficulty },
      });
      if (count >= cap) {
        return NextResponse.json(
          {
            success: false,
            message: `Kapasitas soal ${difficulty} untuk bab ini sudah penuh (maks. ${cap} soal).`,
          },
          { status: 400 }
        );
      }
    }
 
    const question = await db.question.create({
      data: {
        materialId,
        questionText,
        options,
        correctAnswer,
        difficulty,
        orderIndex: orderIndex ?? 0,
      },
    });
 
    return NextResponse.json(
      { success: true, message: "Soal berhasil disimpan", question },
      { status: 201 }
    );
  } catch (error) {
    console.error("[QUESTIONS_POST]", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan soal. Coba lagi." },
      { status: 500 }
    );
  }
}
 
// DELETE /api/questions?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
 
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
 
    if (!id) {
      return NextResponse.json(
        { success: false, message: "id wajib diisi" },
        { status: 400 }
      );
    }
 
    await db.question.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Soal berhasil dihapus" });
  } catch (error) {
    console.error("[QUESTIONS_DELETE]", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus soal" },
      { status: 500 }
    );
  }
}
