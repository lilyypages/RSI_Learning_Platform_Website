import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await db.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await db.notification.count({
    where: { userId: session.userId, isRead: false },
  });

  return NextResponse.json({
    success: true,
    data: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.notifType,
      isRead: n.isRead,
      createdAt: n.createdAt?.toISOString(),
    })),
    unreadCount,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, title, body, type } = await req.json();

  if (!userId || !title || !body) {
    return NextResponse.json({ error: "userId, title, dan body wajib diisi" }, { status: 400 });
  }

  const notif = await db.notification.create({
    data: {
      userId,
      title,
      body,
      notifType: type || "info",
    },
  });

  return NextResponse.json({ success: true, data: { id: notif.id } });
}
