import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const student = await db.student.findUnique({
      where: { id },
      include: {
        progress: true,
        quizSessions: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const totalQuiz = student.quizSessions.length;

    const avgScore =
      totalQuiz > 0
        ? Math.round(
            student.quizSessions.reduce(
              (acc, q) => acc + (q.score ?? 0),
              0
            ) / totalQuiz
          )
        : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        studentName: student.user.name,
        totalQuiz,
        avgScore,
        totalPoints: student.totalPoints,
        currentStreak: student.currentStreak,
        progress: student.progress,
      },
    });
  } catch (error) {
    console.error("[ANALYTICS_STUDENT]", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
