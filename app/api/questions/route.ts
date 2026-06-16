// app/api/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Batas maksimal kapasitas kuis adaptif (sesuai spesifikasi frontend)
const CAPS = { EASY: 10, MEDIUM: 25, HARD: 15 } as const;

// 🟢 1. GET: Mengambil semua daftar soal berdasarkan materialId
// URL Target: /api/questions?materialId=xxxx
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const materialId = searchParams.get("materialId");

    if (!materialId) {
      return NextResponse.json({ success: false, message: "materialId wajib diisi" }, { status: 400 });
    }

    // Ambil soal dan urutkan berdasarkan indeks urutan
    const questions = await db.question.findMany({
      where: { materialId },
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("[QUESTIONS_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server saat memuat soal" }, { status: 500 });
  }
}

// 🔵 2. POST: Membuat/Menyimpan butir soal baru (Hanya untuk TEACHER)
// URL Target: /api/questions
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "TEACHER") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { materialId, questionText, options, correctAnswer, difficulty, orderIndex } = body;

    // Validasi kelengkapan data input kuis
    if (!materialId || !questionText || !options || !correctAnswer || !difficulty) {
      return NextResponse.json({ success: false, message: "Semua field wajib diisi" }, { status: 400 });
    }
    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json({ success: false, message: "Soal kuis wajib memiliki tepat 4 opsi pilihan" }, { status: 400 });
    }
    if (options.some((o: string) => !o?.trim())) {
      return NextResponse.json({ success: false, message: "Semua teks pilihan jawaban tidak boleh kosong" }, { status: 400 });
    }

    // Validasi kuota batas maksimal bank soal adaptif agar tidak meluap
    const cap = CAPS[difficulty as keyof typeof CAPS];
    if (cap !== undefined) {
      const count = await db.question.count({
        where: { materialId, difficulty },
      });
      if (count >= cap) {
        return NextResponse.json(
          { success: false, message: `Kapasitas tingkat ${difficulty} untuk bab ini sudah penuh (maks. ${cap} soal).` },
          { status: 400 }
        );
      }
    }

    // Daftarkan soal baru ke database prisma
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

    return NextResponse.json({ success: true, message: "Soal berhasil disimpan", question }, { status: 201 });
  } catch (error) {
    console.error("[QUESTIONS_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan soal ke database. Coba lagi." }, { status: 500 });
  }
}