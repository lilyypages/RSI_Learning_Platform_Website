"use client";
import React, { useEffect, useRef, useState } from "react";
import { Bell, MessageSquare, CheckCheck, X } from "lucide-react";

type Notif = {
  id: string;
  title: string;
  body: string;
  notifType: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationDropdown() {
  const [open, setOpen]       = useState(false);
  const [notifs, setNotifs]   = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => setNotifs(d.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const unread = notifs.filter(n => !n.isRead).length;

  async function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs} jam lalu`;
    return `${Math.floor(hrs / 24)} hari lalu`;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors"
      >
        <Bell size={22} className="text-slate-400 hover:text-indigo-600 transition-colors" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-white rounded-full text-[9px] flex items-center justify-center text-white font-black">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden z-50">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h4 className="font-black text-slate-800 text-sm">Notifikasi</h4>
            <div className="flex items-center space-x-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-indigo-500 font-bold hover:text-indigo-700 flex items-center space-x-1"
                >
                  <CheckCheck size={13} />
                  <span>Tandai semua</span>
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-slate-500">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-slate-400 text-sm font-medium">Memuat...</div>
            ) : notifs.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm font-medium">
                <Bell size={28} className="mx-auto mb-2 opacity-30" />
                Tidak ada notifikasi
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  className={`flex items-start space-x-3 px-5 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-default ${!n.isRead ? "bg-indigo-50/40" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                    <MessageSquare size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${!n.isRead ? "font-black text-slate-800" : "font-bold text-slate-600"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium leading-snug line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-slate-300 mt-1 font-bold">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>

          {notifs.length > 0 && (
            <div className="px-5 py-3 text-center border-t border-slate-50">
              <button className="text-xs font-bold text-indigo-500 hover:text-indigo-700">
                Lihat semua notifikasi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
