import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const student = await db.student.findFirst({ where: { userId: session.userId } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const watches = await db.videoWatch.findMany({
      where: {
        studentId: student.id,
        isCompleted: true,
        video: { materialId: id },
      },
      select: { videoId: true },
    });

    const completedVideoIds = watches.map(w => w.videoId);

    return NextResponse.json({ completedVideoIds });
  } catch (error) {
    console.error("[MATERIAL_PROGRESS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
