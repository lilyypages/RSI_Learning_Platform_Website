"use client";
import React, { useEffect, useState } from "react";
import { ShieldCheck, RefreshCw, Activity, Search } from "lucide-react";

type AuditLog = {
  id: string;
  userId: string | null;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  detail: any;
  createdAt: string;
};

const ACTION_COLOR: Record<string, string> = {
  LOGIN_OK:        "bg-emerald-100 text-emerald-700",
  LOGIN_FAIL:      "bg-rose-100 text-rose-700",
  LOGOUT:          "bg-slate-100 text-slate-600",
  REGISTER:        "bg-blue-100 text-blue-700",
  PASSWORD_CHANGE: "bg-amber-100 text-amber-700",
  UPLOAD_SUCCESS:  "bg-indigo-100 text-indigo-700",
  REPORT_SENT:     "bg-purple-100 text-purple-700",
};

export default function SecurityAudit() {
  const [logs, setLogs]       = useState<AuditLog[]>([]);
  const [counts, setCounts]   = useState({ teachers: 0, students: 0, parents: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState<AuditLog | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [auditRes, usersRes] = await Promise.all([
        fetch("/api/audit-log"),
        fetch("/api/users"),
      ]);
      if (auditRes.ok) {
        const data = await auditRes.json();
        setLogs(data.logs ?? []);
      }
      if (usersRes.ok) {
        const users: any[] = await usersRes.json();
        setCounts({
          teachers: users.filter(u => u.role === "TEACHER").length,
          students: users.filter(u => u.role === "STUDENT").length,
          parents:  users.filter(u => u.role === "PARENT").length,
        });
      }
    } catch {}
    finally { setLoading(false); }
  }

  const visible = logs.filter(l =>
    !search ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    (l.ipAddress ?? "").includes(search) ||
    (l.userId ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-slate-900 text-emerald-400 rounded-3xl flex items-center justify-center shadow-2xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Security Center</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Integrity & Security</p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log table */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-800 flex items-center space-x-2 text-lg">
              <Activity className="text-indigo-600" size={20} />
              <span>Aktivitas Sistem</span>
            </h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari event / IP..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 w-44"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-slate-400 font-medium text-center py-8">Memuat log...</p>
          ) : visible.length === 0 ? (
            <p className="text-slate-400 font-medium text-center py-8">Belum ada aktivitas tercatat.</p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {visible.map(log => (
                <div
                  key={log.id}
                  onClick={() => setSelected(log)}
                  className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 rounded-2xl p-3 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-xs font-black text-slate-300 font-mono w-16 shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="h-10 w-1 bg-slate-100 group-hover:bg-indigo-500 transition-colors rounded-full shrink-0" />
                    <div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${ACTION_COLOR[log.action] ?? "bg-slate-100 text-slate-600"}`}>
                        {log.action}
                      </span>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        IP: {log.ipAddress ?? "—"} · {new Date(log.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Detail →</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats panel */}
        <div className="bg-slate-900 p-8 rounded-[40px] shadow-xl text-white flex flex-col justify-between">
          <div>
            <h4 className="font-black text-emerald-400 uppercase tracking-widest text-[10px] mb-4">Statistik Keamanan</h4>
            <div className="space-y-4">
              {[
                { label: "Total Guru",  val: counts.teachers },
                { label: "Total Siswa", val: counts.students },
                { label: "Total Ortu",  val: counts.parents  },
                { label: "Total Log",   val: logs.length     },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-sm font-bold opacity-60">{row.label}</span>
                  <span className="font-black">{loading ? "..." : row.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">bcrypt cost 12 Aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-800">Detail Log</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 font-bold text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["ID",         selected.id],
                ["Action",     selected.action],
                ["User ID",    selected.userId ?? "—"],
                ["IP",         selected.ipAddress ?? "—"],
                ["Waktu",      new Date(selected.createdAt).toLocaleString("id-ID")],
                ["User Agent", selected.userAgent ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <span className="w-24 font-bold text-slate-400 shrink-0">{k}</span>
                  <span className="text-slate-700 font-medium break-all">{v}</span>
                </div>
              ))}
              {selected.detail && (
                <div>
                  <p className="font-bold text-slate-400 mb-1">Payload</p>
                  <pre className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 overflow-auto max-h-40">
                    {JSON.stringify(selected.detail, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}