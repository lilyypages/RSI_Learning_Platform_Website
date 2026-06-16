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

    const profile: Record<string, unknown> = {
      name: session.name,
      role: session.role,
    };

    // --- HANDLE ROLE PARENT ---
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
        const teachers: { id: string; name: string; role: string; subject?: string }[] = [];

        if (student.class.homeroomTeacher) {
          teachers.push({
            id: student.class.homeroomTeacher.user.id,
            name: student.class.homeroomTeacher.user.name,
            role: "Wali Kelas",
          });
        }

        for (const cs of student.class.classSubjects) {
          if (cs.teacher) {
            const existing = teachers.find((t) => t.id === cs.teacher.user.id);
            if (!existing) {
              teachers.push({
                id: cs.teacher.user.id,
                name: cs.teacher.user.name,
                role: "Guru Mapel",
                subject: cs.subject.name,
              });
            }
          }
        }
        profile.teachers = teachers;
      }
    }

// --- HANDLE ROLE TEACHER (DIPERBAIKI SINKRONISASI KE FRONTEND) ---
    if (session.role === "TEACHER") {
      const teacher = await db.teacher.findUnique({
        where: { userId: session.userId },
        include: {
          homeroomClass: {
            select: { name: true },
          },
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
        
        if (teacher.homeroomClass && teacher.homeroomClass.length > 0) {
          profile.homeroomOf = `Wali Kelas ${teacher.homeroomClass.map((c) => c.name).join(", ")}`;
        } else {
          profile.homeroomOf = "Bukan Wali Kelas";
        }

        // 🌟 DI SINI KUNCI PERBAIKANNYA 🌟
        // Kita buat dua format agar Layout, Halaman Monitoring, dan Halaman Mapel semuanya aman:
        
        // 1. Format untuk halaman KelolaMapel frontend (Menyesuaikan bentuk struktur data komponen)
        profile.classSubjects = teacher.classSubjects.map((cs) => ({
          id: cs.id,
          subject: {
            name: cs.subject.name
          },
          class: {
            name: cs.class.name
          }
        }));

        // 2. Format cadangan untuk data profile personal (tetap dipertahankan)
        profile.teachingSubjects = teacher.classSubjects.map((cs) => ({
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