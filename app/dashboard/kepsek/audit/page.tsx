import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, UserPlus, Fingerprint, Activity } from "lucide-react";

export default async function SecurityAudit() {
  const session = await getSession();
  if (!session || session.role !== "PRINCIPAL") redirect("/auth/login");

  const [totalGuru, totalSiswa, totalOrtu, recentLogs] = await Promise.all([
    db.teacher.count(),
    db.student.count(),
    db.parent.count(),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center space-x-4 mb-10">
        <div className="w-16 h-16 bg-slate-900 text-emerald-400 rounded-3xl flex items-center justify-center shadow-2xl">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Security Center</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">SDN 01 SOLO • Integrity & Security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 mb-6 flex items-center space-x-2 text-lg">
              <Activity className="text-indigo-600" size={20} />
              <span>Aktivitas Registrasi Akun</span>
            </h3>
            <div className="space-y-6">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-slate-400 font-bold">Belum ada riwayat aktivitas.</p>
              ) : recentLogs.map((log, i) => (
                <div key={i} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center space-x-4">
                    <div className="text-xs font-black text-slate-300 font-mono">
                      {log.createdAt?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="h-10 w-1 bg-slate-100 group-hover:bg-indigo-500 transition-colors rounded-full"></div>
                    <div>
                      <p className="font-black text-slate-700 leading-none">{log.actionType}</p>
                      <p className="text-xs text-slate-400 mt-1 font-medium">{JSON.stringify(log.metadata ?? '')}</p>
                    </div>
                  </div>
                  <UserPlus size={16} className="text-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[40px] shadow-xl text-white">
            <h4 className="font-black text-emerald-400 uppercase tracking-widest text-[10px] mb-4">Statistik Keamanan</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-sm font-bold opacity-60">Total Guru</span>
                <span className="font-black">{totalGuru}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-sm font-bold opacity-60">Total Siswa</span>
                <span className="font-black">{totalSiswa}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold opacity-60">Total Ortu</span>
                <span className="font-black">{totalOrtu}</span>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center space-x-2 text-rose-400">
                <Fingerprint size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Enkripsi SHA-256 Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
