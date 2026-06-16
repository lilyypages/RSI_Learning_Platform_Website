// app/api/auth/logout/route.ts
// =============================================================================
// POST /api/auth/logout
// Hapus cookie sesi → redirect ke /auth/login
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  try {
    const url = new URL("/auth/login", _req.url);
    const response = NextResponse.redirect(url, 303);
    response.cookies.delete(COOKIE_NAME);
    return response;
  } catch (error) {
    console.error("[LOGOUT_ERROR]", error);
    const url = new URL("/auth/login", _req.url);
    const response = NextResponse.redirect(url, 303);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}
