"use client";
import React, { useState, useEffect } from "react";
import { MessageSquare, Bell, Clock, Search, Send } from "lucide-react";

type Msg = {
  id: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  sender: { id: string; name: string; role: string };
};

export default function PesanGuru() {
  const [messages, setMessages]   = useState<Msg[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [reply, setReply]         = useState<{ toId: string; toName: string } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending]     = useState(false);

  useEffect(() => { loadMessages(); }, []);

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setLoading(false); }
  }

  async function handleReply() {
    if (!reply || !replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: reply.toId, content: replyText }),
      });
      if (res.ok) {
        setReplyText("");
        setReply(null);
        loadMessages();
      }
    } catch {}
    finally { setSending(false); }
  }

  const visible = messages.filter(m =>
    m.sender.name.toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Kolom Pencarian */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#2E7D32] tracking-tight">Kotak Pesan 💬</h1>
          <p className="text-[#2E7D32]/60 font-bold text-sm mt-1">Komunikasi dua arah langsung dengan wali kelas & guru mata pelajaran.</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-[#2E7D32]/40" />
          <input
            type="text"
            placeholder="Cari pesan atau nama guru..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-12 pr-6 py-3 bg-white rounded-[16px] border border-[#E8F5E9] shadow-sm text-sm outline-none text-[#2E7D32] placeholder-[#2E7D32]/40 focus:ring-2 focus:ring-[#4CAF50] w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 space-y-3">
          <div className="animate-spin w-8 h-8 border-4 border-[#4CAF50] border-t-transparent rounded-full mx-auto" />
          <p className="text-[#2E7D32]/40 font-bold text-sm">Memuat pesan terbaru...</p>
        </div>
      ) : visible.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-dashed border-[#4CAF50]/30 p-12 rounded-[24px] text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#FFFBF0] text-[#FF8F00] rounded-[16px] flex items-center justify-center mx-auto mb-4 border border-[#E8F5E9]">
            <Bell size={24} />
          </div>
          <h4 className="font-black text-[#2E7D32]">Belum ada pesan masuk</h4>
          <p className="text-sm text-[#2E7D32]/60 mt-1">Semua surat pemberitahuan atau pesan dari pihak guru akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((p) => (
            <div
              key={p.id}
              className={`p-6 md:p-8 rounded-[24px] border transition-all ${
                !p.isRead
                  ? "bg-white border-[#4CAF50]/20 shadow-lg shadow-[#4CAF50]/5"
                  : "bg-white/50 border-[#E8F5E9]/60 opacity-80"
              }`}
            >
              <div className="flex items-start space-x-4 md:space-x-6">
                {/* Status Icon Wrapper */}
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[16px] flex items-center justify-center flex-shrink-0 border ${
                  !p.isRead 
                    ? "bg-[#E8F5E9] text-[#2E7D32] border-[#4CAF50]/20" 
                    : "bg-[#FFFBF0] text-[#FF8F00]/50 border-transparent"
                }`}>
                  <MessageSquare size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className={`text-base md:text-xl font-black ${!p.isRead ? "text-[#2E7D32]" : "text-[#2E7D32]/70"}`}>
                        {p.sender.name}
                      </h4>
                      <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider mt-1 text-[#00897B] opacity-70">
                        <Clock size={12} />
                        <span>{new Date(p.sentAt).toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    {/* Badge Belum Dibaca */}
                    {!p.isRead && (
                      <span className="shrink-0 bg-[#FF8F00] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full animate-pulse tracking-wider">
                        Baru
                      </span>
                    )}
                  </div>

                  <p className={`mt-4 leading-relaxed text-sm font-medium whitespace-pre-wrap ${!p.isRead ? "text-[#2E7D32]/90" : "text-[#2E7D32]/60"}`}>
                    {p.content}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setReply({ toId: p.sender.id, toName: p.sender.name })}
                      className="text-xs font-black text-[#00897B] hover:text-[#2E7D32] transition-colors flex items-center space-x-1"
                    >
                      <span>Balas Pesan ini</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Input Balasan di Bawah Pesan Terkait */}
              {reply?.toId === p.sender.id && (
                <div className="mt-6 md:ml-20 bg-[#FFFBF0] border border-[#E8F5E9] p-4 rounded-[16px] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[#FF8F00]">Membalas kepada: {reply.toName}</span>
                  </div>
                  <textarea
                    className="w-full p-4 bg-white rounded-[12px] text-sm outline-none focus:ring-2 focus:ring-[#4CAF50] border border-[#E8F5E9] text-[#2E7D32]"
                    placeholder="Tulis pesan balasan Anda di sini dengan sopan..."
                    rows={3}
                    maxLength={1000}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[#2E7D32]/40">{replyText.length}/1000 karakter</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setReply(null); setReplyText(""); }}
                        className="px-4 py-2 text-xs font-black text-[#2E7D32]/60 hover:text-[#2E7D32]"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleReply}
                        disabled={sending || !replyText.trim()}
                        className="flex items-center space-x-2 px-5 py-2 bg-[#4CAF50] hover:bg-[#2E7D32] text-white rounded-[12px] font-black text-xs shadow-md shadow-[#4CAF50]/10 transition-all disabled:opacity-50"
                      >
                        <Send size={12} />
                        <span>{sending ? "Mengirim..." : "Kirim Balasan"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
