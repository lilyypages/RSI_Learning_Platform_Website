"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
 
export default function LoginPage() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState("");
 
  const router       = useRouter();
  const searchParams = useSearchParams();
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
 
    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
 
      const data = await res.json();
 
      if (!res.ok || !data.success) {
        setError(data.message ?? "Login gagal. Periksa email dan password.");
        return;
      }
 
      // Redirect: gunakan callbackUrl jika ada, atau dashboard dari API
      const callbackUrl = searchParams.get("callbackUrl");
      router.push(callbackUrl ?? data.redirectTo ?? "/dashboard");
      router.refresh(); // supaya middleware baca cookie baru
 
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
 
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Selamat Datang</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Silakan masukkan email dan kata sandi Anda untuk mengakses platform pembelajaran.
          </p>
        </div>
 
        {/* Error banner */}
        {error && (
          <div className="mb-5 flex items-center space-x-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
 
        <form onSubmit={handleLogin} className="space-y-5">
 
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
 
          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Kata Sandi</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
 
          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Masuk ke Dashboard"}
          </button>
        </form>
 
        {/* Dev hint — remove in production */}
        <div className="mt-6 p-3 bg-slate-50 rounded-xl text-xs text-slate-400 text-center">
          Test: <span className="font-mono">guru@test.com</span> / <span className="font-mono">password123</span>
        </div>
 
        <div className="mt-4 text-center text-xs text-slate-400 leading-relaxed">
          Sistem Informasi Pembelajaran Adaptif <br />
          &copy; 2026 - Lingkungan Sekolah Dasar
        </div>
      </div>
    </div>
  );
}
