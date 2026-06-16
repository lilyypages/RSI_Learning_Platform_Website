// app/api/quiz/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { materialId } = await req.json();

    if (!materialId) {
      return NextResponse.json(
        {
          success: false,
          message: "materialId wajib diisi",
        },
        { status: 400 }
      );
    }

    const student = await db.student.findFirst({
      where: {
        userId: session.userId,
      },
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const material = await db.material.findUnique({
      where: {
        id: materialId,
      },
      include: {
        classSubject: true,
      },
    });

    if (!material) {
      return NextResponse.json(
        {
          success: false,
          message: "Materi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // wajib menyelesaikan semua video sebelum quiz

    const totalVideos = await db.video.count({
      where: {
        materialId,
      },
    });

    if (totalVideos > 0) {
      const completedVideos = await db.videoWatch.count({
        where: {
          studentId: student.id,
          isCompleted: true,
          video: {
            materialId,
          },
        },
      });

      if (completedVideos < totalVideos) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selesaikan seluruh video pembelajaran terlebih dahulu sebelum mengerjakan quiz.",
          },
          { status: 403 }
        );
      }
    }

    // Adaptive level berdasarkan progres per kelas (classSubject)
    const existingProgress = await db.studentProgress.findFirst({
      where: { studentId: student.id, classSubjectId: material.classSubjectId },
    });

    const startLevel = existingProgress?.adaptiveLevel === "ADVANCED" ? "HARD"
      : existingProgress?.adaptiveLevel === "REMEDIAL" ? "EASY"
      : "MEDIUM";

    let question = await db.question.findFirst({
      where: {
        materialId,
        difficulty: startLevel,
      },
      select: {
        id: true,
        questionText: true,
        options: true,
        difficulty: true,
        pointReward: true,
      },
    });

    if (!question) {
      question = await db.question.findFirst({
        where: {
          materialId,
        },
        select: {
          id: true,
          questionText: true,
          options: true,
          difficulty: true,
          pointReward: true,
        },
      });
    }

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada soal tersedia",
        },
        { status: 404 }
      );
    }

    // buat quiz session

    const quizSession = await db.quizSession.create({
      data: {
        studentId: student.id,
        classSubjectId: material.classSubjectId,
        materialId,
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        livesUsed: 0,
        streakCount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: quizSession.id,
      question,
      currentLevel: startLevel,
      lives: student.livesRemaining ?? 3,
      streak: 0,
    });
  } catch (error) {
    console.error("[QUIZ_START]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}