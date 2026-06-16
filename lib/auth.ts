// lib/auth.ts
// =============================================================================
// JWT Auth Utilities
// - signToken: buat JWT saat login berhasil
// - verifyToken: decode & validasi JWT dari cookie
// - getSession: helper shortcut untuk route handlers
// - setSessionCookie / clearSessionCookie: manage cookie
// =============================================================================

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
export type Role = "STUDENT" | "TEACHER" | "PARENT" | "PRINCIPAL";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-dev-secret-CHANGE-IN-PRODUCTION"
);
export const COOKIE_NAME = process.env.COOKIE_NAME ?? "rsi_session";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

// Helper: convert "7d", "1h", "30m" → seconds
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(d|h|m|s)$/);
  if (!match) return 60 * 60 * 24 * 7; // default 7 days
  const value = parseInt(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  return value * multipliers[unit];
}

// ── Sign Token ────────────────────────────────────────────────────────────────

export async function signToken(payload: SessionPayload): Promise<string> {
  const expiresInSeconds = parseDuration(JWT_EXPIRES_IN);

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(JWT_SECRET);
}

// ── Verify Token ──────────────────────────────────────────────────────────────

export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ── Get Session (dari cookies — untuk Route Handlers & Server Components) ─────

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ── Get Session dari Request (untuk middleware) ───────────────────────────────

export async function getSessionFromRequest(
  req: NextRequest
): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ── Set Session Cookie ────────────────────────────────────────────────────────

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const maxAge = parseDuration(JWT_EXPIRES_IN);

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,              // Tidak bisa diakses JS di browser
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}

// ── Clear Session Cookie ──────────────────────────────────────────────────────

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ── Role Guards (untuk Route Handlers) ───────────────────────────────────────

export function requireRole(
  session: SessionPayload | null,
  ...allowedRoles: Role[]
): { ok: true; session: SessionPayload } | { ok: false; error: string; status: number } {
  if (!session) {
    return { ok: false, error: "Unauthorized: tidak ada sesi aktif", status: 401 };
  }
  if (!allowedRoles.includes(session.role)) {
    return {
      ok: false,
      error: `Forbidden: akses hanya untuk ${allowedRoles.join(", ")}`,
      status: 403,
    };
  }
  return { ok: true, session };
}
