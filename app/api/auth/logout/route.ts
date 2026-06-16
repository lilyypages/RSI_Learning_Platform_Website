// app/api/auth/logout/route.ts
// =============================================================================
// POST /api/auth/logout
// Hapus cookie sesi → redirect ke /auth/login
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  try {
    const response = NextResponse.redirect(new URL("/auth/login", _req.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  } catch (error) {
    console.error("[LOGOUT_ERROR]", error);
    const response = NextResponse.redirect(new URL("/auth/login", _req.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}
