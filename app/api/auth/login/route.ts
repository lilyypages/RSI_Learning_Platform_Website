// app/api/auth/login/route.ts
// =============================================================================
// POST /api/auth/login
// Flow: validasi input → cari user → verify password → sign JWT → set cookie
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken, setSessionCookie, type Role } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse & validasi body
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Input tidak valid",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // 2. Cari user by email
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        name: true,
        isActive: true,
        imageUrl: true,
      },
    });

    // Gunakan pesan generik — jangan bocorkan "email tidak ditemukan"
    if (!user) {
      await logLoginAttempt(null, email, false, req);
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 3. Cek akun aktif
    if (!user.isActive) {
      await logLoginAttempt(user.id, email, false, req);
      return NextResponse.json(
        { success: false, message: "Akun dinonaktifkan. Hubungi administrator." },
        { status: 403 }
      );
    }

    // 4. Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await logLoginAttempt(user.id, email, false, req);
      // Notifikasi ke Kepsek jika gagal login
      await notifyKepsekOnFailedLogin(user.id, user.name, email);
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 5. Simpan audit log login sukses
    await createAuditLog({
      userId: user.id,
      event: "LOGIN_SUCCESS",
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent: req.headers.get("user-agent") ?? "unknown",
    });

    // 5. Sign JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
    });

    // 6. Set cookie HttpOnly
    await setSessionCookie(token);

    // 7. Catat log login sukses
    await logLoginAttempt(user.id, email, true, req);

    // 8. Return data user (tanpa passwordHash)
    return NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        user: {
          id: user.id,
          email: user.email,
      role: user.role as Role,
          name: user.name,
          imageUrl: user.imageUrl,
        },
        // redirectTo: ditentukan di client berdasarkan role
        redirectTo: getDashboardByRole(user.role),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}

async function logLoginAttempt(
  userId: string | null,
  email: string,
  success: boolean,
  req: NextRequest,
) {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") ?? "";

    await db.auditLog.create({
      data: {
        userId,
        actionType: success ? "LOGIN_OK" : "LOGIN_FAIL",
        ipAddress: ip,
        userAgent,
        metadata: { email },
      },
    });
  } catch (err) {
    console.error("[LOGIN_AUDIT_ERROR]", err);
  }
}

async function notifyKepsekOnFailedLogin(
  userId: string,
  userName: string,
  email: string,
) {
  try {
    const ip = "..."  // already logged in audit — skip here

    // Ambil Kepsek
    const kepsek = await db.user.findFirst({
      where: { role: "PRINCIPAL" },
      select: { id: true },
    });
    if (!kepsek) return;

    await db.notification.create({
      data: {
        userId: kepsek.id,
        title: "Percobaan Login Gagal",
        body: `Guru "${userName}" (${email}) gagal login. Silakan cek keamanan akun.`,
        notifType: "LOGIN_ALERT",
      },
    });
  } catch (err) {
    console.error("[KEPSEK_NOTIFY_ERROR]", err);
  }
}

// ── Helper: route dashboard per role ─────────────────────────────────────────
function getDashboardByRole(role: string): string {
  const routes: Record<string, string> = {
    STUDENT:   "/dashboard/siswa",
    TEACHER:   "/dashboard/guru",
    PARENT:    "/dashboard/ortu",
    PRINCIPAL: "/dashboard/kepsek",
  };
  return routes[role] ?? "/dashboard";
}
