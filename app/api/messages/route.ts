import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest, requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await db.message.findMany({
    where: {
      OR: [{ receiverId: session.userId }, { senderId: session.userId }],
    },
    include: {
      sender: { select: { id: true, name: true, email: true, role: true } },
      receiver: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    success: true,
    data: messages.map((m) => ({
      id: m.id,
      content: m.content,
      isRead: m.isRead,
      sentAt: m.sentAt?.toISOString(),
      sender: m.sender,
      receiver: m.receiver,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId, content } = await req.json();
  if (!receiverId || !content) {
    return NextResponse.json({ error: "receiverId dan content wajib diisi" }, { status: 400 });
  }

  if (content.length > 1000) {
    return NextResponse.json({ error: "Pesan maksimal 1000 karakter" }, { status: 400 });
  }

  const receiver = await db.user.findUnique({ where: { id: receiverId } });
  if (!receiver) return NextResponse.json({ error: "Penerima tidak ditemukan" }, { status: 404 });

  const message = await db.message.create({
    data: {
      senderId: session.userId,
      receiverId,
      content,
    },
  });

  await db.notification.create({
    data: {
      userId: receiverId,
      title: "Pesan Baru",
      body: `Pesan dari ${session.name}: ${content.substring(0, 100)}`,
      notifType: "message",
    },
  });

  return NextResponse.json({ success: true, data: { id: message.id } }, { status: 201 });
}
