"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, TrendingUp, MessageCircle, Bell, Star, AlertCircle, Clock } from "lucide-react";

type StudentProgress = {
  classSubjectId?: string;
  subjectName: string;
  subjectCode: string;
  totalScore: number;
  completionPercent: number;
  adaptiveLevel: string;
  lastActivity: string | null;
};

type ChildInfo = {
  id: string;
  name: string;
  nis: string;
  birthdate: string | null;
  totalPoints: number;
  currentStreak: number;
  livesRemaining: number;
};

type Notification = {
  id: string;
  title: string;
  body: string;
  notifType: string;
  isRead: boolean;
  createdAt: string;
};

export default function OrtuDashboard() {
  const [child, setChild] = useState<ChildInfo | null>(null);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [progressRes, notifRes] = await Promise.all([
          fetch("/api/progress"),
          fetch("/api/notifications"),
        ]);

        if (progressRes.ok) {
          const data = await progressRes.json();
          setChild(data.child ?? null);
          setProgress(data.progress ?? []);
        } else {
          setError("Gagal memuat data anak.");
        }

        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications((data.notifications ?? []).slice(0, 5));
        }
      } catch {
        setError("Gagal terhubung ke server.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const avgScore =
    progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + (p.totalScore ?? 0), 0) / progress.length)
      : 0;

  const belowKKM = progress.filter((p) => (p.totalScore ?? 0) < 75);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-[#4CAF50] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 text-center px-4">
        <AlertCircle size={40} className="text-[#E53935]" />
        <p className="text-[#2E7D32] font-black">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Utama - Menggunakan Gradasi Hijau-Teal Khas Sekolah */}
      <div className="bg-gradient-to-br from-[#2E7D32] to-[#004D40] text-white rounded-[24px] p-8 shadow-[0_8px_32px_rgba(46,125,50,0.15)] relative overflow-hidden">
        <p className="text-[#A5D6A7] text-xs font-black uppercase tracking-widest mb-1">
          Pantauan Belajar Anak
        </p>
        <h1 className="text-3xl font-black mb-6">
          {child?.name ?? "Anak Anda"} 👨‍🎓
        </h1>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-4 text-center border border-white/5">
            <p className="text-3xl font-black text-[#FFFDE7]">{avgScore}</p>
            <p className="text-xs text-[#E8F5E9] font-bold mt-1">Rata-rata Nilai</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-4 text-center border border-white/5">
            <p className="text-3xl font-black text-[#FFFDE7]">{child?.currentStreak ?? 0}🔥</p>
            <p className="text-xs text-[#E8F5E9] font-bold mt-1">Streak Belajar</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-4 text-center border border-white/5">
            <p className="text-3xl font-black text-[#FFFDE7]">{child?.totalPoints ?? 0}</p>
            <p className="text-xs text-[#E8F5E9] font-bold mt-1">Total Poin</p>
          </div>
        </div>
      </div>

      {/* KKM Alert - Menggunakan aksen Oranye/Amber hangat */}
      {belowKKM.length > 0 && (
        <div className="bg-[#FFFBF0] border border-[#FFF8E1] rounded-[24px] p-5 flex items-start space-x-4 shadow-[0_8px_24px_rgba(255,143,0,0.05)]">
          <AlertCircle size={24} className="text-[#FF8F00] shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-[#FF8F00]">⚠️ Perlu Perhatian Khusus</p>
            <p className="text-[#2E7D32]/80 text-sm mt-1 font-medium leading-relaxed">
              <span className="font-bold text-[#2E7D32]">{child?.name ?? "Anak Anda"}</span> masih di bawah KKM (75) pada mata pelajaran:{" "}
              <span className="font-black text-[#E53935]">{belowKKM.map((p) => p.subjectName).join(", ")}</span>.
              Sistem menyarankan pendampingan atau evaluasi belajar tambahan bersama guru.
            </p>
          </div>
        </div>
      )}

      {/* Quick Nav - Menggunakan palet Teal, Hijau, dan Amber */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { href: "/dashboard/ortu/grafik", icon: TrendingUp, label: "Grafik Kemajuan", color: "bg-[#E0F2F1] text-[#00897B] hover:bg-[#B2DFDB]" }, // Teal
          { href: "/dashboard/ortu/pesan", icon: MessageCircle, label: "Pesan Guru", color: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]" },   // Green
          { href: "/dashboard/ortu", icon: Bell, label: "Notifikasi", color: "bg-[#FFFBF0] text-[#FF8F00] hover:bg-[#FFECB3]" },                   // Amber/Orange
        ].map((nav) => (
          <Link key={nav.href} href={nav.href}>
            <div className={`${nav.color} rounded-[24px] p-5 text-center transition-all cursor-pointer border border-transparent shadow-sm active:scale-95`}>
              <nav.icon size={26} className="mx-auto mb-2" />
              <p className="text-xs font-black tracking-wide">{nav.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Kemampuan Per Bidang */}
      <div>
        <h2 className="text-lg font-black text-[#2E7D32] mb-4">Kemampuan Per Bidang</h2>
        {progress.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#E8F5E9] p-8 text-center shadow-sm">
            <BookOpen size={32} className="mx-auto text-[#2E7D32]/30 mb-2" />
            <p className="text-[#2E7D32]/50 font-black text-sm">Belum ada data nilai kuis masuk.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {progress.map((p, i) => {
              const score = p.totalScore ?? 0;
              // Set warna bar sesuai standar ketuntasan
              const barColor =
                score >= 85 ? "bg-[#4CAF50]" : score >= 75 ? "bg-[#00897B]" : "bg-[#FF8F00]";
              return (
                <div key={i} className="bg-white rounded-[24px] border border-[#E8F5E9] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-black text-[#2E7D32]">{p.subjectName}</p>
                      <p className="text-xs text-[#2E7D32]/50 font-bold mt-0.5">
                        Tingkat: {p.adaptiveLevel === "HARD" ? "Sulit" : p.adaptiveLevel === "EASY" ? "Mudah" : "Sedang"}
                        {p.lastActivity && (
                          <span className="ml-3 inline-flex items-center text-[#00897B]">
                            <Clock size={12} className="mr-1" />
                            {new Date(p.lastActivity).toLocaleDateString("id-ID")}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className={`text-xl font-black ${score >= 75 ? "text-[#2E7D32]" : "text-[#FF8F00]"}`}>
                      {score}%
                    </span>
                  </div>
                  {/* Progress Bar Container */}
                  <div className="w-full bg-[#FFFBF0] border border-[#E8F5E9] h-4 rounded-full overflow-hidden p-[2px]">
                    <div
                      className={`${barColor} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 px-1">
                    <span className="text-[10px] font-bold text-[#2E7D32]/40">0</span>
                    <span className="text-[10px] font-black text-[#00897B] bg-[#E0F2F1] px-2 py-0.5 rounded-full">KKM: 75</span>
                    <span className="text-[10px] font-bold text-[#2E7D32]/40">100</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notifikasi Terbaru */}
      {notifications.length > 0 && (
        <div>
          <h2 className="text-lg font-black text-[#2E7D32] mb-4">Notifikasi Terbaru</h2>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-[24px] border p-5 shadow-sm transition-all ${
                  n.isRead 
                    ? "bg-white border-[#E8F5E9]" 
                    : "bg-[#FFFBF0] border-[#FFF8E1] shadow-[0_4px_16px_rgba(255,143,0,0.04)]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {!n.isRead && <span className="w-2.5 h-2.5 bg-[#FF8F00] rounded-full shrink-0" />}
                    <div>
                      <p className="font-black text-[#2E7D32] text-sm">{n.title}</p>
                      <p className="text-[#2E7D32]/70 font-medium text-xs mt-1 leading-relaxed">{n.body}</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-[#2E7D32]/40 shrink-0 ml-4 bg-[#E8F5E9] px-2 py-1 rounded-md">
                    {new Date(n.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Identitas NIS Anak */}
      {child && (
        <div className="bg-[#FFFBF0] border border-[#E8F5E9] rounded-[24px] p-5 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-[16px] bg-[#E8F5E9] flex items-center justify-center shrink-0">
            <Star size={20} className="text-[#2E7D32]" />
          </div>
          <div>
            <p className="font-black text-[#2E7D32]">{child.name}</p>
            <p className="text-xs text-[#2E7D32]/60 font-bold mt-0.5">Nomor Induk Siswa (NIS): {child.nis}</p>
          </div>
        </div>
      )}
    </div>
  );
}