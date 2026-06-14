"use client";
import React, { useEffect, useState } from "react";
import { Bell, Clock, Info, AlertCircle, CheckCircle } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  body: string;
  notifType: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotifikasiSiswa() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => {
        if (d.notifications) setNotifications(d.notifications);
        else if (Array.isArray(d)) setNotifications(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const typeIcon: Record<string, React.ReactNode> = {
    INFO: <Info size={20} className="text-[#00897B]" />,
    WARNING: <AlertCircle size={20} className="text-[#FF8F00]" />,
    SUCCESS: <CheckCircle size={20} className="text-[#4CAF50]" />,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-[#2E7D32]">Notifikasi</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[#4CAF50] border-t-transparent rounded-full mx-auto" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-[24px] border-2 border-dashed border-slate-200 p-12 text-center">
          <Bell size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Belum ada notifikasi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-[24px] border p-5 flex items-start gap-4 shadow-sm ${
                n.isRead ? "border-slate-100" : "border-[#4CAF50]/20 bg-[#FFFBF0]"
              }`}
            >
              <div className="shrink-0 mt-1">{typeIcon[n.notifType] || <Info size={20} className="text-slate-400" />}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className={`font-black text-sm ${n.isRead ? "text-slate-600" : "text-[#2E7D32]"}`}>{n.title}</p>
                  {!n.isRead && <span className="w-2 h-2 bg-[#FF8F00] rounded-full shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.body}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(n.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
