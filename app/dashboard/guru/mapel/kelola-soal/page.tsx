"use client";
import React, { Suspense, useEffect, useState } from "react";
import { ChevronLeft, Plus, Brain, Trash2, Edit3, CheckCircle, HelpCircle, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  orderIndex: number;
}

function KelolaSoalForm() {
  const searchParams = useSearchParams();
  const csId = searchParams.get("csId");

  const [subjectName, setSubjectName] = useState("");
  const [className, setClassName] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [counts, setCounts] = useState({ EASY: 0, MEDIUM: 0, HARD: 0 });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ questionText: "", options: ["", "", "", ""], correctAnswer: "", difficulty: "MEDIUM" });
  const [addLoading, setAddLoading] = useState(false);

  const fetchQuestions = () => {
    if (!csId) { setLoading(false); return; }
    fetch(`/api/guru/subjects/${csId}/materials`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const mat = res.data.materials[0];
          if (mat) {
            setMaterialTitle(mat.title);
            setSubjectName(res.data.subjectName);
            setClassName(res.data.className);
            return fetch(`/api/guru/subjects/${csId}/materials/${mat.id}/questions`);
          }
        }
        setLoading(false);
      })
      .then((r) => r?.json())
      .then((res) => {
        if (res?.success) {
          setQuestions(res.data.questions);
          setCounts(res.data.counts);
          setSubjectName(res.data.subjectName);
          setClassName(res.data.className);
          setMaterialTitle(res.data.materialTitle);
        }
        setLoading(false);
      });
  };

  useEffect(() => { fetchQuestions(); }, [csId]);

  const handleAdd = async () => {
    if (!addForm.questionText.trim() || !addForm.correctAnswer.trim()) return alert("Pertanyaan dan jawaban wajib diisi");
    setAddLoading(true);
    const matRes = await fetch(`/api/guru/subjects/${csId}/materials`);
    const matData = await matRes.json();
    const matId = matData.success && matData.data.materials[0]?.id;
    if (!matId) { alert("Belum ada materi. Buat materi dulu."); setAddLoading(false); return; }

    const res = await fetch(`/api/guru/subjects/${csId}/materials/${matId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    const data = await res.json();
    setAddLoading(false);
    if (data.success) {
      setShowAdd(false);
      setAddForm({ questionText: "", options: ["", "", "", ""], correctAnswer: "", difficulty: "MEDIUM" });
      fetchQuestions();
    } else {
      alert(data.error || "Gagal menambah soal");
    }
  };

  const handleDelete = async (qId: string) => {
    if (!confirm("Hapus soal ini?")) return;
    const matRes = await fetch(`/api/guru/subjects/${csId}/materials`);
    const matData = await matRes.json();
    const matId = matData.success && matData.data.materials[0]?.id;
    if (!matId) return;

    const res = await fetch(`/api/guru/subjects/${csId}/materials/${matId}/questions/${qId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchQuestions();
  };

  if (!csId) return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="text-center py-20 text-slate-400 font-bold">Tidak ada kelas yang dipilih.</div>
      <Link href="/dashboard/guru/mapel" className="block text-center text-indigo-600 font-bold">Kembali ke Daftar Mapel</Link>
    </div>
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  const total = counts.EASY + counts.MEDIUM + counts.HARD;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <Link href="/dashboard/guru/mapel" className="flex items-center text-slate-500 font-bold text-sm hover:text-blue-600 w-fit">
        <ChevronLeft size={18} /> Kembali
      </Link>

      <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Bank Soal Adaptif</h1>
          <p className="text-slate-500 text-sm font-medium">{subjectName} &middot; {className} &middot; {materialTitle}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center space-x-2 shadow-lg shadow-indigo-100 hover:scale-105 transition-all">
          <Plus size={18} />
          <span>Buat Soal Baru</span>
        </button>
      </div>

      {total > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-[32px] text-white flex items-center justify-between shadow-xl shadow-indigo-100">
          <div className="space-y-1">
            <h4 className="text-lg font-black flex items-center space-x-2">
              <Brain size={24} />
              <span>Mode Adaptif Aktif</span>
            </h4>
            <p className="text-indigo-100 text-sm opacity-80 max-w-md">Sistem akan otomatis menyesuaikan soal berdasarkan kemampuan siswa.</p>
          </div>
          <div className="hidden md:flex space-x-4">
            <div className="text-center">
              <p className="text-2xl font-black">{counts.EASY}</p>
              <p className="text-[10px] uppercase font-bold opacity-60">Mudah</p>
            </div>
            <div className="text-center border-x border-white/20 px-4">
              <p className="text-2xl font-black">{counts.MEDIUM}</p>
              <p className="text-[10px] uppercase font-bold opacity-60">Sedang</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">{counts.HARD}</p>
              <p className="text-[10px] uppercase font-bold opacity-60">Sulit</p>
            </div>
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] border border-slate-100 shadow-sm text-center">
          <HelpCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400 font-bold">Belum ada soal untuk materi ini.</p>
          <button onClick={() => setShowAdd(true)} className="mt-4 text-indigo-600 font-black text-sm hover:underline">Buat Soal Pertama</button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((soal) => (
            <div key={soal.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:border-indigo-300 transition-all group relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                soal.difficulty === 'EASY' ? 'bg-green-500' :
                soal.difficulty === 'HARD' ? 'bg-rose-500' : 'bg-amber-500'
              }`}></div>

              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      soal.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                      soal.difficulty === 'HARD' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {soal.difficulty === 'EASY' ? 'Mudah' : soal.difficulty === 'HARD' ? 'Sulit' : 'Sedang'}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 leading-tight">
                    <span className="text-slate-300 mr-2">Q:</span>
                    {soal.questionText}
                  </h4>
                  {soal.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {soal.options.map((opt, i) => (
                        <span key={i} className={`text-xs font-bold px-3 py-1 rounded-lg ${
                          opt === soal.correctAnswer ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400'
                        }`}>{opt}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-green-600 font-bold bg-green-50 w-fit px-3 py-1 rounded-lg mt-2">
                    <CheckCircle size={14} />
                    <span>Jawaban: {soal.correctAnswer}</span>
                  </div>
                </div>

                <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 justify-end">
                  <button onClick={() => handleDelete(soal.id)} className="p-4 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Soal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">Buat Soal Baru</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Pertanyaan</label>
                <textarea required value={addForm.questionText} onChange={(e) => setAddForm({ ...addForm, questionText: e.target.value })}
                  className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10" rows={3} />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Opsi Jawaban (pisahkan koma)</label>
                <input value={addForm.options.join(", ")} onChange={(e) => setAddForm({ ...addForm, options: e.target.value.split(",").map(s => s.trim()) })}
                  className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Jawaban Benar</label>
                <input required value={addForm.correctAnswer} onChange={(e) => setAddForm({ ...addForm, correctAnswer: e.target.value })}
                  className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Level Kesulitan</label>
                <select value={addForm.difficulty} onChange={(e) => setAddForm({ ...addForm, difficulty: e.target.value })}
                  className="w-full mt-1 p-4 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10">
                  <option value="EASY">Mudah</option>
                  <option value="MEDIUM">Sedang</option>
                  <option value="HARD">Sulit</option>
                </select>
              </div>
              <button type="submit" disabled={addLoading}
                className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50">
                {addLoading ? "Menyimpan..." : "Simpan Soal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KelolaSoalSederhana() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>}>
      <KelolaSoalForm />
    </Suspense>
  );
}
