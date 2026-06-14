import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const message = await db.message.findUnique({
    where: { id },
    include: {
      sender: { select: { id: true, name: true, email: true, role: true } },
      receiver: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  if (!message) return NextResponse.json({ error: "Pesan tidak ditemukan" }, { status: 404 });

  if (message.receiverId === session.userId && !message.isRead) {
    await db.message.update({ where: { id }, data: { isRead: true } });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: message.id,
      content: message.content,
      isRead: true,
      sentAt: message.sentAt?.toISOString(),
      sender: message.sender,
      receiver: message.receiver,
    },
  });
}
