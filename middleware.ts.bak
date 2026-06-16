// middleware.ts (root level)
// =============================================================================
// Auth Guard Middleware
// - Redirect unauthenticated user → /auth/login
// - Redirect authenticated user ke dashboard sesuai role
// - Proteksi route dashboard dari akses role yang salah
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import type { Role } from "@/lib/auth";

// ── Route Definitions ─────────────────────────────────────────────────────────

// Route yang boleh diakses tanpa login
const PUBLIC_ROUTES = ["/","/auth/login", "/auth/forgot-password"];

// Route API yang tidak perlu auth check
const PUBLIC_API_ROUTES = ["/","/api/auth/login"];

// Dashboard yang diizinkan per role
const ROLE_DASHBOARD_MAP: Record<Role, string> = {
  STUDENT:   "/dashboard/siswa",
  TEACHER:   "/dashboard/guru",
  PARENT:    "/dashboard/ortu",
  PRINCIPAL: "/dashboard/kepsek",
};

// Prefix dashboard → role yang boleh akses
const DASHBOARD_ROLE_GUARD: Record<string, Role[]> = {
  "/dashboard/siswa":  ["STUDENT"],
  "/dashboard/guru":   ["TEACHER"],
  "/dashboard/ortu":   ["PARENT"],
  "/dashboard/kepsek": ["PRINCIPAL"],
};

// ── Middleware ─────────────────────────────────────────────────────────────────

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // 1. Lewatkan aset statis & Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Lewatkan public API routes
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 3. Verifikasi sesi
  const session = await getSessionFromRequest(req);

  // 4. Jika user BELUM login
  if (!session) {
    // Izinkan akses ke public routes
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Redirect ke login + simpan URL tujuan
    const loginUrl = new URL("/auth/login", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 5. Jika user SUDAH login dan mencoba akses /auth/login
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    const dashboardUrl = ROLE_DASHBOARD_MAP[session.role];
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  // 6. Redirect "/" ke dashboard sesuai role
  if (pathname === "/") {
    const dashboardUrl = ROLE_DASHBOARD_MAP[session.role];
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  // 7. Cek akses role untuk dashboard pages
  for (const [prefix, allowedRoles] of Object.entries(DASHBOARD_ROLE_GUARD)) {
    if (pathname.startsWith(prefix)) {
      if (!allowedRoles.includes(session.role)) {
        // Redirect ke dashboard yang benar untuk role ini
        const correctDashboard = ROLE_DASHBOARD_MAP[session.role];
        return NextResponse.redirect(new URL(correctDashboard, req.url));
      }
      break;
    }
  }

  // 8. Inject session info ke header (bisa dibaca route handlers)
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id",   session.userId);
  requestHeaders.set("x-user-role", session.role);
  requestHeaders.set("x-user-name", session.name);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

// ── Matcher ───────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    /*
     * Match semua request kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
