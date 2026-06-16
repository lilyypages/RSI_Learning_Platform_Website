"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, ArrowLeft, MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";

type DBMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
};

export default function ChatGuruPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Ambil targetUserId dari URL query (?targetUserId=xxx)
  const targetUserId = searchParams.get("targetUserId");

  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingChat, setLoadingChat] = useState(true);
  const [activeStudentName, setActiveStudentName] = useState("Siswa");
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 1. Ambil data nama siswa & info user login saat ini
  useEffect(() => {
    if (!targetUserId) return;

    async function fetchTargetInfo() {
      try {
        // Ambil data siswa untuk ditaruh di Header Chat
        const res = await fetch("/api/students");
        const json = res.ok ? await res.json() : null;
        if (json?.success && Array.isArray(json.students)) {
          const found = json.students.find((s: any) => s.user?.id === targetUserId);
          if (found) {
            setActiveStudentName(found.user.name);
          }
        }
      } catch (e) {
        console.error("Gagal memuat info siswa", e);
      }
    }

    fetchTargetInfo();
  }, [targetUserId]);

  // 2. Ambil riwayat chat & jalankan interval polling (real-time palsu tanpa WebSocket)
  useEffect(() => {
    if (!targetUserId) return;

    async function loadChat() {
      try {
        const res = await fetch(`/api/chat?targetUserId=${targetUserId}`);
        const json = await res.json();
        if (json.success) {
          setMessages(json.messages);
        }
      } catch (err) {
        console.error("Gagal memuat riwayat pesan:", err);
      } finally {
        setLoadingChat(false);
      }
    }

    loadChat();

    // Jalankan sinkronisasi pesan masuk otomatis setiap 4 detik
    const interval = setInterval(loadChat, 4000);
    return () => clearInterval(interval);
  }, [targetUserId]);

  // 3. Auto Scroll ke pesan paling bawah setiap ada pesan baru
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Aksi Pengiriman Pesan
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !targetUserId) return;

    const textToSend = inputText.trim();
    setInputText(""); // Kosongkan input form langsung demi UX cepat

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: targetUserId,
          content: textToSend
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Tambahkan langsung ke dalam state array chat lokal
        setMessages((prev) => [...prev, json.message]);
      }
    } catch (err) {
      console.error("Pesan gagal dikirim ke database:", err);
    }
  }

  if (!targetUserId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 bg-white rounded-3xl border border-[#E8F5E9] space-y-4">
        <MessageSquare size={48} className="text-[#2E7D32]/30 animate-bounce" />
        <p className="text-[#2E7D32] font-black">Silakan pilih siswa terlebih dahulu dari menu monitoring untuk memulai chat.</p>
        <Link href="/dashboard/guru/monitoring" className="px-5 py-2.5 bg-[#2E7D32] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#1B5E20]">
          Kembali ke Monitoring
        </Link>
      </div>
    );
  }

  // DI SINI YANG DIUBAH: Cukup membungkus return utamanya dengan Suspense tanpa menyentuh variabel di atas!
  return (
    <Suspense fallback={<div className="text-center p-6 text-xs text-[#2E7D32]/40 font-bold">Memuat lembar obrolan rahasia...</div>}>
      <div className="flex flex-col h-[82vh] bg-white rounded-[32px] border border-[#E8F5E9] shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        
        {/* HEADER CHAT */}
        <div className="bg-[#E8F5E9]/60 px-6 py-4 border-b border-[#E8F5E9] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/guru/monitoring" className="p-2 hover:bg-[#E8F5E9] rounded-xl text-[#2E7D32] transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h2 className="font-black text-[#2E7D32] text-base">{activeStudentName}</h2>
              <span className="text-[10px] bg-[#4CAF50] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Siswa</span>
            </div>
          </div>
          <div className="flex items-center text-xs text-[#2E7D32]/50 font-bold space-x-1.5">
            <ShieldCheck size={14} className="text-[#4CAF50]" />
            <span>Terenkripsi Database</span>
          </div>
        </div>

        {/* RUANG PESAN (CHAT BUBBLES) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FFFDF9]/40 asset-scroll-clean">
          {loadingChat ? (
            <div className="text-center text-xs text-[#2E7D32]/40 font-bold pt-12">Membuka lembar obrolan rahasia...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 space-y-2">
              <p className="text-sm font-black text-[#2E7D32]/40">Belum ada obrolan dimulai</p>
              <p className="text-xs text-[#2E7D32]/30 max-w-xs mx-auto">Ketik salam pembuka di bawah untuk mendiskusikan perkembangan capaian tingkat adaptif belajar siswa.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isFromTarget = msg.senderId === targetUserId;

              return (
                <div key={msg.id} className={`flex ${isFromTarget ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[70%] rounded-[20px] px-5 py-3.5 shadow-sm text-sm font-medium leading-relaxed ${
                    isFromTarget 
                      ? "bg-white border border-[#E8F5E9] text-[#2E7D32] rounded-tl-sm" 
                      : "bg-[#2E7D32] text-white rounded-tr-sm"
                  }`}>
                    <p>{msg.content}</p>
                    <span className={`block text-[9px] mt-1 text-right font-bold ${
                      isFromTarget ? "text-[#2E7D32]/40" : "text-white/60"
                    }`}>
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* INPUT FORM PENGIRIMAN */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-[#E8F5E9] flex items-center space-x-3 flex-shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Tulis pesan bimbingan untuk ${activeStudentName}...`}
            className="flex-1 bg-[#E8F5E9]/30 border border-[#E8F5E9] rounded-2xl px-5 py-3.5 text-sm text-[#2E7D32] placeholder-[#2E7D32]/40 focus:outline-none focus:ring-4 focus:ring-[#4CAF50]/10 font-medium transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] disabled:bg-[#E8F5E9] disabled:text-[#2E7D32]/30 text-white rounded-2xl shadow-md transition-all flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>

      </div>
    </Suspense>
  );
}