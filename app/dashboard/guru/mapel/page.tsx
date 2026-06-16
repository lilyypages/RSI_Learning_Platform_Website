"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Book, ChevronRight, GraduationCap } from "lucide-react";

type ClassSubject = {
  id: string;
  subject: { name: string };
  class: { name: string };
};

const COLORS = [
  { light: "bg-[#E8F5E9]", text: "text-[#2E7D32]" }, // Green
  { light: "bg-[#FFF8E1]", text: "text-[#FF8F00]" }, // Orange
  { light: "bg-[#E0F2F1]", text: "text-[#00897B]" }, // Teal
  { light: "bg-[#E3F2FD]", text: "text-[#1976D2]" }, // Blue
  { light: "bg-[#F3E5F5]", text: "text-[#7B1FA2]" }, // Purple
  { light: "bg-[#FFFDE7]", text: "text-[#FFD600]" }, // Yellow
];

export default function KelolaMapel() {
  const [mapels, setMapels] = useState<ClassSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Menembak API profile milik user yang sedang aktif login
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: any) => {
        if (data.success && Array.isArray(data.classSubjects)) {
          setMapels(data.classSubjects);
        }
      })
      .catch((err) => console.error("Gagal memuat mapel:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#2E7D32] tracking-tight">Kurikulum Kelas 📚</h1>
          <p className="text-[#2E7D32]/70 font-medium">Kelola materi dan kuis adaptif untuk setiap mata pelajaran.</p>
        </div>
        
        <button className="bg-[#4CAF50] text-white px-6 py-4 rounded-[24px] flex items-center space-x-3 font-black shadow-[0_8px_32px_rgba(76,175,80,0.2)] hover:bg-[#2E7D32] transition-all">
          <Plus size={20} strokeWidth={3} />
          <span>Mapel Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-[#2E7D32]/50 font-bold">
          Memuat mata pelajaran Anda dari database...
        </div>
      ) : mapels.length === 0 ? (
        <div className="bg-white p-12 rounded-[24px] border border-dashed border-[#2E7D32]/30 text-center max-w-xl mx-auto space-y-3">
          <div className="w-16 h-16 bg-[#FFF8E1] text-[#FF8F00] rounded-full flex items-center justify-center mx-auto text-2xl">
            ⚠️
          </div>
          <h3 className="text-xl font-black text-[#2E7D32]">Belum Ada Mapel Diampu</h3>
          <p className="text-sm text-[#2E7D32]/60 font-medium">
            Anda belum dikaitkan dengan mata pelajaran atau kelas apa pun di database. Hubungi Admin/Kepala Sekolah untuk memetakan kelas mengajar Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mapels.map((item, i) => {
            const c = COLORS[i % COLORS.length];
            return (
              <div 
                key={item.id} 
                className="bg-white p-8 rounded-[24px] border border-[#E8F5E9] shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 ${c.light} ${c.text} rounded-[24px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <Book size={32} />
                </div>
                
                <h3 className="font-black text-2xl text-[#2E7D32] mb-1 truncate" title={item.subject.name}>
                  {item.subject.name}
                </h3>
                
                <div className="flex items-center space-x-2 text-[#2E7D32]/50 text-sm font-bold mb-8">
                  <GraduationCap size={16} />
                  <span>Kelas {item.class.name}</span>
                </div>
                
                {/* 🌟 SATU GERBANG UTAMA: Langsung mengarah ke Kelola Materi */}
                <div className="flex flex-col pt-2">
                  <Link href={`/dashboard/guru/mapel/kelola-materi?classSubjectId=${item.id}`}>
                    <button className="w-full py-4 bg-[#4CAF50] text-white text-sm font-black rounded-[24px] hover:bg-[#2E7D32] transition-all flex items-center justify-center space-x-2 shadow-md">
                      <span>Kelola Materi & Kuis</span>
                      <ChevronRight size={16} strokeWidth={3} />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}