import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const profile: Record<string, unknown> = {
      name: session.name,
      role: session.role,
    };

    if (session.role === "PARENT") {
      const parent = await db.parent.findUnique({
        where: { userId: session.userId },
        include: {
          students: {
            include: {
              class: { select: { name: true } },
              user: { select: { name: true } },
            },
          },
        },
      });
      if (parent) {
        profile.students = parent.students.map((s) => ({
          name: s.user.name,
          className: s.class?.name ?? null,
          nis: s.nis,
        }));
      }
    }

    if (session.role === "STUDENT") {
      const student = await db.student.findFirst({
        where: { userId: session.userId },
        include: {
          class: {
            include: {
              homeroomTeacher: { include: { user: { select: { id: true, name: true } } } },
              classSubjects: {
                where: { teacherId: { not: null } },
                include: { subject: { select: { name: true } }, teacher: { include: { user: { select: { id: true, name: true } } } } },
              },
            },
          },
        },
      });

      if (student?.class) {
        const teachers: { id: string; name: string; role: string; subject?: string }[] = [];

        if (student.class.homeroomTeacher) {
          teachers.push({
            id: student.class.homeroomTeacher.user.id,
            name: student.class.homeroomTeacher.user.name,
            role: "Wali Kelas",
          });
        }

        for (const cs of student.class.classSubjects) {
          const teacher = cs.teacher;
          if (teacher) {
            const existing = teachers.find((t) => t.id === teacher.user.id);
            if (!existing) {
              teachers.push({
                id: teacher.user.id,
                name: teacher.user.name,
                role: "Guru Mapel",
                subject: cs.subject.name,
              });
            }
          }
        }

        profile.teachers = teachers;
      }
    }

    return NextResponse.json({ success: true, ...profile });
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
