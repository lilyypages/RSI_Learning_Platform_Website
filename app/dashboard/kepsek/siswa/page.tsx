"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  UserPlus,
  RefreshCw,
  Users,
  Award,
  Flame,
} from "lucide-react";

type Student = {
  id: string;
  nis: string;
  birthdate: string | null;
  totalPoints: number;
  currentStreak: number;
  livesRemaining: number;

  user: {
    id: string;
    name: string;
    email: string;
    imageUrl: string | null;
    isActive: boolean;
  };

  class?: {
    id: string;
    name: string;
    gradeLevel: number;
  } | null;
};

export default function KepsekSiswaPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/students");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memuat data");
      }

      setStudents(data.students ?? []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data siswa.");
    } finally {
      setLoading(false);
    }
  }

  const classes = [
    ...new Set(
      students
        .map((s) => s.class?.name)
        .filter(Boolean)
    ),
  ].sort();

  const filtered = students.filter((student) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      student.user.name.toLowerCase().includes(keyword) ||
      student.nis.toLowerCase().includes(keyword);

    const matchClass = filterClass
      ? student.class?.name === filterClass
      : true;

    return matchSearch && matchClass;
  });

  const avgPoints =
    students.length > 0
      ? Math.round(
          students.reduce(
            (acc, cur) => acc + (cur.totalPoints || 0),
            0
          ) / students.length
        )
      : 0;

  const avgStreak =
    students.length > 0
      ? Math.round(
          students.reduce(
            (acc, cur) => acc + (cur.currentStreak || 0),
            0
          ) / students.length
        )
      : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">
            Manajemen Siswa
          </h1>

          <p className="text-slate-500 mt-1">
            Kelola data siswa, kelas, dan aktivitas pembelajaran.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadStudents}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <Link
            href="/dashboard/kepsek/siswa/tambah"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
          >
            <UserPlus size={18} />
            Tambah Siswa
          </Link>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <Users className="text-indigo-600" />
            <div>
              <p className="text-sm text-slate-500">
                Total Siswa
              </p>
              <h3 className="text-3xl font-black">
                {students.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <Award className="text-green-600" />
            <div>
              <p className="text-sm text-slate-500">
                Rata-rata Poin
              </p>
              <h3 className="text-3xl font-black">
                {avgPoints}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <Flame className="text-orange-600" />
            <div>
              <p className="text-sm text-slate-500">
                Rata-rata Streak
              </p>
              <h3 className="text-3xl font-black">
                {avgStreak}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama siswa atau NIS..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-2xl"
          >
            <option value="">Semua Kelas</option>

            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-slate-500 mt-3">
          Menampilkan {filtered.length} siswa
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Data */}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((student) => {
            const initials = student.user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("");

            return (
              <div
                key={student.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-indigo-300 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700">
                    {initials}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-black text-slate-800">
                      {student.user.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      NIS : {student.nis}
                    </p>

                    <p className="text-sm text-slate-500">
                      {student.user.email}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kelas</span>
                    <span className="font-semibold">
                      {student.class?.name ?? "-"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Poin</span>
                    <span className="font-semibold">
                      {student.totalPoints ?? 0}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Streak</span>
                    <span className="font-semibold">
                      🔥 {student.currentStreak ?? 0}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        student.user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {student.user.isActive
                        ? "Aktif"
                        : "Nonaktif"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/kepsek/siswa/${student.id}`}
                    className="flex-1 text-center px-3 py-2 bg-slate-100 rounded-xl text-sm font-semibold"
                  >
                    Detail
                  </Link>

                  <Link
                    href={`/dashboard/kepsek/siswa/${student.id}/edit`}
                    className="flex-1 text-center px-3 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold"
                  >
                    Edit
                  </Link>

                  <Link
                    href={`/dashboard/kepsek/siswa/${student.id}/progress`}
                    className="flex-1 text-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold"
                  >
                    Progress
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          Tidak ada siswa yang ditemukan.
        </div>
      )}

      {/* Info */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-5">
        <h3 className="font-bold text-indigo-800">
          Informasi Pendaftaran
        </h3>

        <p className="text-sm text-indigo-600 mt-2">
          Setiap siswa memiliki akun siswa dan akun orang tua.
          Setelah akun dibuat, berikan email dan password
          default kepada wali murid untuk login pertama.
        </p>
      </div>
    </div>
  );
}