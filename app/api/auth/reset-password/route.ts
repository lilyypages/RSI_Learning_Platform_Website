import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  const guard = requireRole(session, "PRINCIPAL");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId wajib" }, { status: 400 });

  const hash = await bcrypt.hash("123456", 10);
  await db.user.update({ where: { id: userId }, data: { passwordHash: hash } });

  return NextResponse.json({ success: true, message: "Password direset ke 123456" });
}
