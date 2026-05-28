// app/api/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const includeProgress = searchParams.get("includeProgress") === "true";

    // TEACHER: only see students in their class
    // PRINCIPAL: see all students
    let students;

    if (session.role === "TEACHER") {
      // Find teacher record
      const teacher = await db.teacher.findUnique({
        where: { userId: session.userId },
        include: {
          homeroomClass: true,
        },
      });

      if (!teacher || teacher.homeroomClass.length === 0) {
        return NextResponse.json([]);
      }

      const classIds = teacher.homeroomClass.map((c) => c.id);

      students = await db.student.findMany({
        where: { classId: { in: classIds } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          class: { select: { id: true, name: true } },
          ...(includeProgress && {
            progress: {
              select: {
                totalScore: true,
                completionPercent: true,
                adaptiveLevel: true,
                lastActivity: true,
                classSubjectId: true,
              },
            },
          }),
        },
        orderBy: { user: { name: "asc" } },
      });
    } else if (session.role === "PRINCIPAL") {
      students = await db.student.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          class: { select: { id: true, name: true } },
          ...(includeProgress && {
            progress: {
              select: {
                totalScore: true,
                completionPercent: true,
                adaptiveLevel: true,
                lastActivity: true,
                classSubjectId: true,
              },
            },
          }),
        },
        orderBy: { user: { name: "asc" } },
      });
    } else {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(students);
  } catch (error) {
    console.error("[STUDENTS_GET]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}