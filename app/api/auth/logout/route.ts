// app/api/auth/logout/route.ts
// =============================================================================
// POST /api/auth/logout
// Hapus cookie sesi → redirect ke /auth/login
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  try {
    await clearSessionCookie();
    return NextResponse.redirect(new URL("/auth/login", _req.url));
  } catch (error) {
    console.error("[LOGOUT_ERROR]", error);
    return NextResponse.redirect(new URL("/auth/login", _req.url));
  }
}
