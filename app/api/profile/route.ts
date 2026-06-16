// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Ambil data dasar user (termasuk imageUrl)
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { name: true, role: true, imageUrl: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }

    const profile: Record<string, unknown> = {
      id: session.userId,
      userId: session.userId,
      name: user.name,
      role: user.role,
      imageUrl: user.imageUrl,
    };

    // --- HANDLE ROLE PARENT ---
    if (session.role === "PARENT") {
      const parent = await db.parent.findUnique({
        where: { userId: session.userId },
        include: {
          students: {
            include: {
              user: { select: { id: true, name: true, imageUrl: true } },
              class: { select: { name: true } },
            },
          },
        },
      });

      if (parent) {
        profile.phone = parent.phone;
        profile.students = parent.students.map((s) => ({
          userId: s.user.id, // ID untuk keperluan update password anak
          name: s.user.name,
          imageUrl: s.user.imageUrl,
          className: s.class?.name ?? null,
          nis: s.nis,
        }));
      }
    }

    // --- HANDLE ROLE STUDENT ---
    if (session.role === "STUDENT") {
      const student = await db.student.findFirst({
        where: { userId: session.userId },
        include: {
          class: {
            include: {
              homeroomTeacher: { 
                include: { user: { select: { id: true, name: true } } } 
              },
              classSubjects: {
                where: { teacherId: { not: null } },
                include: { 
                  subject: { select: { name: true } }, 
                  teacher: { include: { user: { select: { id: true, name: true } } } } 
                },
              },
            },
          },
        },
      });

      if (student?.class) {
        profile.teachers = student.class.classSubjects.map(cs => ({
          id: cs.teacher?.user.id,
          name: cs.teacher?.user.name,
          role: cs.teacherId === student.class?.homeroomTeacherId ? "Wali Kelas" : "Guru Mapel",
          subject: cs.subject.name
        }));
      }
    }

    // --- HANDLE ROLE TEACHER ---
    if (session.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({
        where: { userId: session.userId },
        include: {
          homeroomClass: { select: { name: true } },
          classSubjects: {
            include: {
              class: { select: { name: true } },
              subject: { select: { name: true } },
            },
          },
        },
      });

      if (teacher) {
        profile.nip = teacher.nip ?? "-";
        profile.phone = teacher.phone ?? "-";
        profile.homeroomOf = teacher.homeroomClass.length > 0 
          ? `Wali Kelas ${teacher.homeroomClass.map((c) => c.name).join(", ")}` 
          : "Bukan Wali Kelas";
        
        profile.classSubjects = teacher.classSubjects.map((cs) => ({
          id: cs.id,
          subjectName: cs.subject.name,
          className: cs.class.name,
          semester: cs.semester,
          academicYear: cs.academicYear,
        }));
      }
    }

    return NextResponse.json({ success: true, ...profile });
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}