import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// 1. GET: Mengambil riwayat chat antara User yang login dengan User target (Siswa/Guru)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("targetUserId");

    if (!targetUserId) {
      return NextResponse.json({ success: false, message: "Parameter targetUserId wajib diisi" }, { status: 400 });
    }

    // Ambil semua pesan di mana (saya pengirim & dia penerima) ATAU (dia pengirim & saya penerima)
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: session.userId },
        ],
      },
      orderBy: {
        sentAt: "asc", // Urutkan dari pesan terlama ke terbaru
      },
    });

    // Opsional: Tandai pesan dari lawan bicara yang belum dibaca menjadi 'isRead = true'
    await db.message.updateMany({
      where: {
        senderId: targetUserId,
        receiverId: session.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("[CHAT_GET_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal memuat pesan" }, { status: 500 });
  }
}

// 2. POST: Mengirim pesan baru
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, content } = body;

    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ success: false, message: "Penerima dan isi pesan tidak boleh kosong" }, { status: 400 });
    }

    const newMessage = await db.message.create({
      data: {
        senderId: session.userId,
        receiverId: receiverId,
        content: content.trim(),
        isRead: false,
      },
    });

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("[CHAT_POST_ERROR]", error);
    return NextResponse.json({ success: false, message: "Gagal mengirim pesan" }, { status: 500 });
  }
}