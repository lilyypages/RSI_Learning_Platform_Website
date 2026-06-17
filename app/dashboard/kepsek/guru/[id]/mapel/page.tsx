"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, CheckCircle2, BadgeAlert, Loader2, AlertCircle, ShieldAlert } from "lucide-react";

export default function KelolaMapelGuruPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [teacher, setTeacher] = useState<any>(null);
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
  const [availableAssignments, setAvailableAssignments] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [isHomeroom, setIsHomeroom] = useState(false);

  useEffect(() => {
    async function loadDataMapel() {
      try {
        const res = await fetch(`/api/teachers/${id}/subjects`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Gagal memuat struktur jadwal.");

        setTeacher(json.teacher);
        setAssignedSubjects(json.assignedSubjects);
        setAvailableAssignments(json.availableAssignments);
        setSelectedIds(json.assignedSubjects.map((sub: any) => sub.id));
        setSavedCount(json.assignedSubjects.length);
        setIsHomeroom(json.teacher.isHomeroom);
      } catch (err: any) {
        setError(err.message || "Gagal menyambung ke server.");
      } finally {
        setLoading(false);
      }
    }
    loadDataMapel();
  }, [id]);

  const handleToggleCheckbox = (subId: string) => {
    setSelectedIds(prev => 
      prev.includes(subId) ? prev.filter(item => item !== subId) : [...prev, subId]
    );
  };

  const handleSaveAssignments = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/teachers/${id}/subjects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classSubjectIds: selectedIds, isHomeroom: isHomeroom })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal memperbarui beban mengajar.");

      setSavedCount(json.totalAssigned);
      setSuccess(`${json.message} (${json.totalAssigned} plot aktif terpilih)`);
      
      setTimeout(() => {
        router.push(`/dashboard/kepsek/guru/${id}`);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan internal.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-sm font-bold text-slate-500">Membuka repositori jadwal mengajar sekolah...</p>
      </div>
    );
  }

  // Hitung statistik instan berbasis state pilihan saat ini (Poin 7)
  const currentUniqueSubjectsCount = new Set(
    availableAssignments.filter(a => selectedIds.includes(a.id)).map(a => a.subject?.id)
  ).size;

  const currentClassesCount = new Set(
    availableAssignments.filter(a => selectedIds.includes(a.id)).map(a => a.class?.id)
  ).size;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* HEADER BAR */}
      <div className="space-y-1">
        <Link href={`/dashboard/kepsek/guru/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition group w-fit">
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Kembali ke Detail Guru
        </Link>
        <h1 className="text-3xl font-black text-slate-800 mt-1">Manajemen Distribusi Mengajar</h1>
        <p className="text-sm font-medium text-slate-500">Konfigurasi beban mengajar guru melalui pengaturan tabel relasi jadwal sekolah.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-600 flex items-center gap-3">
          <CheckCircle2 size={20} className="shrink-0" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* SIDEBAR PROFIL & BADGE STATISTIK INSTAN */}
        <div className="space-y-4 self-start">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit mb-2 ${
                teacher?.isActive ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {teacher?.isActive ? "Akun Aktif" : "Akun Nonaktif"}
              </span>
              <h2 className="text-xl font-black text-slate-800 leading-tight">{teacher?.name}</h2>
              <p className="text-xs text-slate-400 font-bold mt-0.5">NIP: {teacher?.nip || "-"}</p>
              <p className="text-xs text-slate-400 font-medium">{teacher?.email}</p>
            </div>

            <div className="border-t pt-3 space-y-2 text-xs font-semibold text-slate-700">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400">Wali Kelas:</span>
                <span className={`text-xs font-black ${isHomeroom ? "text-indigo-600 font-black" : "text-slate-400"}`}>
                  {isHomeroom ? "✓Aktif sebagai Wali Kelas" : "✕ Bukan Wali"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsHomeroom(!isHomeroom)}
                className={`w-10 h-5 rounded-full transition-colors relative ${isHomeroom ? "bg-indigo-600" : "bg-slate-300"}`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isHomeroom ? "translate-x-5" : "translate-x-0"}`} />
              </button>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400">Mapel Unik Terpilih:</span>
                <span className="text-slate-800 font-black">{currentUniqueSubjectsCount} Mapel</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                <span className="text-slate-400">Kelas Diajar Terpilih:</span>
                <span className="text-slate-800 font-black">{currentClassesCount} Kelas</span>
              </div>
              <div className="flex justify-between items-center bg-indigo-50 text-indigo-900 p-2.5 rounded-xl border border-indigo-100">
                <span>Total Plot Disimpan:</span>
                <span className="font-black text-sm">{savedCount ?? 0} Assignment</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveAssignments}
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2 disabled:bg-indigo-400"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Simpan Perubahan Beban
          </button>
        </div>

        {/* UTILITY MULTI-SELECT ASSIGNMENT MANAGER */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-black text-slate-800 text-lg">Manajer Distribusi Mengajar</h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Beri tanda centang pada kombinasi mata pelajaran & rombel untuk dipasangkan ke guru ini.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 border-t pt-3">
            {availableAssignments.map((assignment) => {
              const isChecked = selectedIds.includes(assignment.id);
              const isOccupiedByOther = assignment.teacherId && assignment.teacherId !== id;

              return (
                <div 
                  key={assignment.id}
                  onClick={() => !isOccupiedByOther && handleToggleCheckbox(assignment.id)}
                  className={`p-3.5 border rounded-2xl flex items-start gap-3 transition select-none ${
                    isOccupiedByOther 
                      ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed" 
                      : isChecked
                        ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300 cursor-pointer"
                        : "bg-white border-slate-200 hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={!!isOccupiedByOther}
                      onChange={() => {}} 
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-black text-slate-800 text-sm truncate">{assignment.subject?.name}</h4>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 border text-slate-600 rounded-md uppercase shrink-0">
                        Kelas {assignment.class?.name}
                      </span>
                    </div>
                    
                    <p className="text-[11px] font-bold text-slate-400">Kode: {assignment.subject?.code || "-"}</p>

                    {isOccupiedByOther && (
                      <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-amber-600">
                        <ShieldAlert size={12} className="shrink-0" />
                        <span className="truncate">Diampu: {assignment.teacher?.user?.name}</span>
                      </div>
                    )}
                    {isChecked && !isOccupiedByOther && (
                      <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-indigo-600">
                        <CheckCircle2 size={12} className="shrink-0" />
                        <span>Plot Terpilih</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}