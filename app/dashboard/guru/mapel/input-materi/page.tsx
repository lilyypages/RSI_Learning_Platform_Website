"use client";
import React, { Suspense, useState, useEffect } from "react";
import { ChevronLeft, Save, Video, FileText, Plus, Trash2, Globe, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function InputMateriForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const csId = searchParams.get("csId");

  const [subjectName, setSubjectName] = useState("Memuat...");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [poinMateri, setPoinMateri] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!csId) { setLoading(false); return; }
    fetch(`/api/guru/subjects`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const found = res.data.find((i: { id: string }) => i.id === csId);
          if (found) setSubjectName(`${found.subjectName} — ${found.className}`);
        }
        setLoading(false);
      });
  }, [csId]);

  if (!csId) return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="text-center py-20 text-slate-400 font-bold">Tidak ada kelas yang dipilih.</div>
      <Link href="/dashboard/guru/mapel" className="block text-center text-indigo-600 font-bold">Kembali ke Daftar Mapel</Link>
    </div>
  );

  const handleSave = async () => {
    if (!title.trim()) return alert("Judul materi wajib diisi");
    setSaving(true);
    const contentText = poinMateri.filter((p) => p.trim()).join("\n");
    const res = await fetch(`/api/guru/subjects/${csId}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), contentText: contentText || null, videoTitle: videoTitle || null, videoUrl: videoUrl.trim() || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      router.push(`/dashboard/guru/mapel/kelola-soal?csId=${csId}`);
    } else {
      alert(data.error || "Gagal menyimpan materi");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Link href="/dashboard/guru/mapel" className="flex items-center text-slate-500 font-bold text-sm hover:text-blue-600 w-fit">
        <ChevronLeft size={18} /> Kembali ke Daftar Mapel
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Input Materi Baru</h1>
          <p className="text-slate-500 text-sm font-medium">Mata Pelajaran: <span className="text-indigo-600 font-bold">{subjectName}</span></p>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black flex items-center space-x-2 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          <span>{saving ? "Menyimpan..." : "Simpan ke Siswa"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <label className="block text-sm font-black text-slate-400 uppercase tracking-widest">Judul Bab / Materi</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Bagaimana Tumbuhan Makan (Fotosintesis)"
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-lg text-slate-700"
          />
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-rose-500 font-black uppercase tracking-widest text-xs">
            <Video size={18} />
            <span>Link Video Penjelasan (opsional)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Judul video"
              className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-rose-500 font-medium"
            />
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="md:col-span-2 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-rose-500 font-medium"
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-600 font-black uppercase tracking-widest text-xs">
              <FileText size={18} />
              <span>Poin-Poin Penting (Buku Digital)</span>
            </div>
          </div>

          <div className="space-y-4">
            {poinMateri.map((poin, index) => (
              <div key={index} className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={poin}
                  onChange={(e) => {
                    const next = [...poinMateri];
                    next[index] = e.target.value;
                    setPoinMateri(next);
                  }}
                  placeholder="Tulis poin penting..."
                  className="flex-1 p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-500 font-medium text-slate-700"
                />
                <button onClick={() => setPoinMateri(poinMateri.filter((_, i) => i !== index))} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            <button
              onClick={() => setPoinMateri([...poinMateri, ""])}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center space-x-2"
            >
              <Plus size={18} />
              <span>Tambah Baris Materi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InputMateriSederhana() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>}>
      <InputMateriForm />
    </Suspense>
  );
}
