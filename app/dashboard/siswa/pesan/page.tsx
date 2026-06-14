"use client";
import React, { useState, useEffect } from "react";
import { MessageSquare, Bell, Clock, Search, Send, Plus, Loader2 } from "lucide-react";

type Msg = {
  id: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  sender: { id: string; name: string; role: string };
};

type TeacherContact = {
  id: string;
  name: string;
  role: string;
  subject?: string;
};

export default function PesanSiswa() {
  const [messages, setMessages]       = useState<Msg[]>([]);
  const [teachers, setTeachers]       = useState<TeacherContact[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo]     = useState("");
  const [composeText, setComposeText] = useState("");
  const [replyTo, setReplyTo]         = useState<{ id: string; text: string } | null>(null);
  const [sending, setSending]         = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [msgRes, profileRes] = await Promise.all([
        fetch("/api/messages"),
        fetch("/api/profile"),
      ]);
      if (msgRes.ok) {
        const data = await msgRes.json();
        setMessages(Array.isArray(data) ? data : []);
      }
      if (profileRes.ok) {
        const pdata = await profileRes.json();
        if (pdata.teachers) setTeachers(pdata.teachers);
      }
    } catch {}
    finally { setLoading(false); }
  }

  async function sendMessage(receiverId: string, content: string) {
    if (!receiverId || !content.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, content }),
      });
      if (res.ok) {
        setComposeText("");
        setShowCompose(false);
        setReplyTo(null);
        loadAll();
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#2E7D32] tracking-tight">Pesan 💬</h1>
          <p className="text-[#2E7D32]/60 font-bold text-sm mt-1">Hubungi guru wali kelas atau guru mata pelajaran.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={18} className="absolute left-4 top-3.5 text-[#2E7D32]/40" />
            <input
              type="text"
              placeholder="Cari pesan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white rounded-[16px] border border-[#E8F5E9] shadow-sm text-sm outline-none text-[#2E7D32] placeholder-[#2E7D32]/40 focus:ring-2 focus:ring-[#4CAF50] w-full sm:w-56"
            />
          </div>
          <button
            onClick={() => { setShowCompose(true); setReplyTo(null); }}
            className="flex items-center gap-2 px-5 py-3 bg-[#4CAF50] hover:bg-[#2E7D32] text-white rounded-[16px] font-black text-sm shadow-lg shadow-[#4CAF50]/20 transition-all"
          >
            <Plus size={18} /><span className="hidden sm:inline">Pesan Guru</span>
          </button>
        </div>
      </div>

      {showCompose && (
        <div className="bg-white border border-[#E8F5E9] rounded-[24px] p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-[#2E7D32]">Kirim Pesan ke Guru</h3>
            <button onClick={() => setShowCompose(false)} className="text-[#2E7D32]/40 hover:text-[#E53935] font-black text-sm">Tutup</button>
          </div>
          <div className="space-y-4">
            <select
              value={composeTo}
              onChange={e => setComposeTo(e.target.value)}
              className="w-full p-4 bg-[#F4F9F4] rounded-[16px] text-sm outline-none focus:ring-2 focus:ring-[#4CAF50] border border-[#E8F5E9] text-[#2E7D32]"
            >
              <option value="">-- Pilih Guru --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}{t.subject ? ` (${t.subject})` : ` (${t.role})`}</option>
              ))}
            </select>
            <textarea
              className="w-full p-4 bg-[#F4F9F4] rounded-[16px] text-sm outline-none focus:ring-2 focus:ring-[#4CAF50] border border-[#E8F5E9] text-[#2E7D32]"
              placeholder="Tulis pesan Anda dengan sopan..."
              rows={4}
              maxLength={1000}
              value={composeText}
              onChange={e => setComposeText(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#2E7D32]/40">{composeText.length}/1000</span>
              <button
                onClick={() => sendMessage(composeTo, composeText)}
                disabled={sending || !composeTo || !composeText.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-[#4CAF50] hover:bg-[#2E7D32] text-white rounded-[16px] font-black text-sm shadow-lg shadow-[#4CAF50]/20 transition-all disabled:opacity-50"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span>{sending ? "Mengirim..." : "Kirim"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[#4CAF50] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-[#2E7D32]/40 font-bold text-sm">Memuat pesan...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-dashed border-[#4CAF50]/30 p-12 rounded-[24px] text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#FFFBF0] text-[#FF8F00] rounded-[16px] flex items-center justify-center mx-auto mb-4 border border-[#E8F5E9]">
            <Bell size={24} />
          </div>
          <h4 className="font-black text-[#2E7D32]">Belum ada pesan</h4>
          <p className="text-sm text-[#2E7D32]/60 mt-1">Pesan dari guru akan muncul di sini. Kamu juga bisa kirim pesan ke guru.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((p) => (
            <div key={p.id} className={`p-6 md:p-8 rounded-[24px] border transition-all ${!p.isRead ? "bg-white border-[#4CAF50]/20 shadow-lg shadow-[#4CAF50]/5" : "bg-white/50 border-[#E8F5E9]/60 opacity-80"}`}>
              <div className="flex items-start space-x-4 md:space-x-6">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[16px] flex items-center justify-center flex-shrink-0 border ${!p.isRead ? "bg-[#E8F5E9] text-[#2E7D32] border-[#4CAF50]/20" : "bg-[#FFFBF0] text-[#FF8F00]/50 border-transparent"}`}>
                  <MessageSquare size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className={`text-base md:text-xl font-black ${!p.isRead ? "text-[#2E7D32]" : "text-[#2E7D32]/70"}`}>{p.sender.name}</h4>
                      <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider mt-1 text-[#00897B] opacity-70">
                        <Clock size={12} />
                        <span>{new Date(p.sentAt).toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    {!p.isRead && (
                      <span className="shrink-0 bg-[#FF8F00] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full animate-pulse tracking-wider">Baru</span>
                    )}
                  </div>
                  <p className={`mt-4 leading-relaxed text-sm font-medium whitespace-pre-wrap ${!p.isRead ? "text-[#2E7D32]/90" : "text-[#2E7D32]/60"}`}>{p.content}</p>
                  <div className="mt-4">
                    <button
                      onClick={() => setReplyTo(replyTo?.id === p.sender.id ? null : { id: p.sender.id, text: "" })}
                      className="text-xs font-black text-[#00897B] hover:text-[#2E7D32] transition-colors flex items-center space-x-1"
                    >
                      <span>Balas</span><span>→</span>
                    </button>
                    {replyTo?.id === p.sender.id && (
                      <div className="mt-4 space-y-3">
                        <textarea
                          className="w-full p-4 bg-[#FFFBF0] rounded-[12px] text-sm outline-none focus:ring-2 focus:ring-[#4CAF50] border border-[#E8F5E9] text-[#2E7D32]"
                          placeholder="Tulis balasan..."
                          rows={2}
                          maxLength={1000}
                          value={replyTo.text}
                          onChange={e => setReplyTo({ ...replyTo, text: e.target.value })}
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setReplyTo(null)} className="px-4 py-2 text-xs font-black text-[#2E7D32]/60 hover:text-[#2E7D32]">Batal</button>
                          <button
                            onClick={() => sendMessage(p.sender.id, replyTo.text)}
                            disabled={sending || !replyTo.text.trim()}
                            className="flex items-center gap-2 px-5 py-2 bg-[#4CAF50] hover:bg-[#2E7D32] text-white rounded-[12px] font-black text-xs shadow-md shadow-[#4CAF50]/10 transition-all disabled:opacity-50"
                          >
                            {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            <span>Kirim</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
