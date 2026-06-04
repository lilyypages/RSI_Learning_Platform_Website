import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const teachers = await db.teacher.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true } },
      classSubjects: {
        include: {
          subject: { select: { name: true } },
          class: { select: { name: true } },
          studentProgress: { select: { completionPercent: true } },
          _count: { select: { materials: true } },
        },
      },
      homeroomClass: { select: { name: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  const data = teachers.map((t) => {
    const allProgress = t.classSubjects.flatMap((cs) => cs.studentProgress.map((sp) => sp.completionPercent ?? 0));
    const avgKetuntasan = allProgress.length > 0 ? Math.round(allProgress.reduce((a, b) => a + b, 0) / allProgress.length) : 0;
    const totalSiswa = t.classSubjects.reduce((sum, cs) => sum + cs.studentProgress.length, 0);
    const tertinggal = allProgress.filter((p) => p < 70).length;

    const uniqueSubjects = [...new Set(t.classSubjects.map((cs) => cs.subject.name))];
    let role: string;
    if (t.homeroomClass?.length) {
      role = `Wali ${t.homeroomClass.map(c => c.name).join(", ")}`;
    } else if (uniqueSubjects.length === 1) {
      role = `Guru ${uniqueSubjects[0]}`;
    } else if (uniqueSubjects.length > 1) {
      role = uniqueSubjects.join(", ");
    } else {
      role = "Belum ada penugasan";
    }

    return {
      id: t.id,
      userId: t.userId,
      name: t.user.name,
      email: t.user.email,
      nip: t.nip,
      subjects: uniqueSubjects,
      role,
      status: t.user.isActive ? "Aktif" : "Nonaktif",
      totalSiswa,
      ketuntasan: avgKetuntasan,
      tertinggal,
      lastUpdate: t.classSubjects[0]?.materials?.[0] ? `Materi ${t.classSubjects[0].subject.name}` : "-",
    };
  });

  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { name, email, nip, password } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: "Nama dan email wajib diisi" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password || "admin123", 10);

  const user = await db.user.create({
    data: { email, passwordHash, role: "TEACHER", name, createdBy: session!.userId },
  });

  await db.teacher.create({ data: { userId: user.id, nip: nip || null } });

  // Notifikasi untuk guru baru
  await db.notification.create({
    data: {
      userId: user.id,
      title: "Selamat Bergabung!",
      body: `Akun Anda telah dibuat oleh Kepala Sekolah. Email: ${email}. Silakan login dengan password default.`,
      notifType: "system",
    },
  });

  // Notifikasi untuk kepsek
  await db.notification.create({
    data: {
      userId: session!.userId,
      title: "Guru Baru Ditambahkan",
      body: `Berhasil menambahkan ${name} (${email}) sebagai tenaga pendidik.`,
      notifType: "info",
    },
  });

  return NextResponse.json({ success: true, data: { userId: user.id, name, email } }, { status: 201 });
}
