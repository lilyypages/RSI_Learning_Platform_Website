"use client";
import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function LoginForm() {
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
        setError(data.message ?? "Login gagal. Periksa kembali email dan kata sandi Anda.");
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl");
      router.push(callbackUrl ?? data.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Gagal menyambungkan ke server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

return (
    <div className="login-viewport">
      {/* Inject CSS langsung untuk menjamin keindahan layout bebas dari error Tailwind */}
      <style>{`
        .login-viewport {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          /* Menggunakan background cream pastel bawaan SIPANDA */
          background: linear-gradient(135deg, #E8F5E9 0%, #FFFDE7 50%, #E3F2FD 100%);
          font-family: var(--font-nunito), -apple-system, sans-serif;
          box-sizing: border-box;
          padding: 20px;
        }
        .login-card {
          background: #ffffff;
          width: 100%;
          max-width: 420px;
          /* Menggunakan radius card membulat besar khas anak-anak */
          border-radius: 24px;
          /* Border bawah tebal 3D berwarna kuning cerah */
          border: 3px solid #FFD600;
          box-shadow: 0 12px 32px rgba(0,0,0,0.06);
          padding: 40px 32px;
          box-sizing: border-box;
          position: relative;
        }
        .login-header {
          text-align: center;
          margin-bottom: 28px;
        }
        .login-brand-icon {
          font-size: 2.2rem;
          margin-bottom: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: #E8F5E9; /* hijau muda */
          border-radius: 50%;
          text-decoration: none;
          box-shadow: inset 0 -3px 0 rgba(0,0,0,0.1);
        }
        .login-title {
          font-family: 'Baloo 2', cursive;
          font-size: 26px;
          font-weight: 800;
          color: #2E7D32; /* Hijau tua */
          margin: 4px 0 6px 0;
          letter-spacing: -0.3px;
        }
        .login-subtitle {
          font-size: 14px;
          font-weight: 600;
          color: #666;
          margin: 0;
          line-height: 1.5;
        }
        .form-group {
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
        }
        .form-label {
          font-size: 13px;
          font-weight: 800;
          color: #2E7D32; /* Label Hijau Tua */
          margin-bottom: 6px;
          letter-spacing: 0.3px;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }
        .input-icon-left {
          position: absolute;
          left: 14px;
          color: #4CAF50; /* Icon hijau */
          display: flex;
          align-items: center;
          pointer-events: none;
          font-size: 16px;
        }
        .input-field {
          width: 100%;
          padding: 12px 16px 12px 42px;
          background-color: #FFFBF0; /* warna background form cream hangat */
          border: 2.5px solid #cbd5e1;
          border-radius: 14px;
          font-size: 15px;
          color: #334155;
          font-weight: 600;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .input-field:focus {
          background-color: #ffffff;
          border-color: #4CAF50; /* Fokus berubah jadi hijau */
          box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.15);
        }
        .input-toggle-right {
          position: absolute;
          right: 14px;
          color: #94a3b8;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
        }
        .input-toggle-right:hover {
          color: #2E7D32;
        }
        .btn-submit {
          width: 100%;
          height: 48px;
          background-color: #4CAF50; /* Tombol Utama Hijau */
          color: #ffffff;
          border: none;
          border-radius: 20px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          /* Efek tombol 3D empuk khas anak-anak */
          box-shadow: 0 5px 0 #2E7D32, 0 6px 16px rgba(76,175,80,0.3);
          transition: transform 0.1s, box-shadow 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 26px;
        }
        .btn-submit:hover {
          background-color: #43A047;
          transform: translateY(-2px);
          box-shadow: 0 7px 0 #2E7D32, 0 8px 20px rgba(76,175,80,0.35);
        }
        .btn-submit:active {
          transform: translateY(4px);
          box-shadow: 0 1px 0 #2E7D32;
        }
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
        .error-container {
          background-color: #F3E5F5; /* Menggunakan warna ungu muda bawaan modal token */
          border: 2px solid #7B1FA2;
          color: #7B1FA2;
          padding: 12px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dev-hint {
          margin-top: 24px;
          padding: 12px;
          background-color: #FFFDE7; /* Kuning terang pastel */
          border: 2.5px dashed #FFD600; /* Garis putus-putus kuning */
          border-radius: 14px;
          font-size: 12px;
          color: #FF8F00; /* Teks Oranye */
          text-align: center;
          line-height: 1.6;
          font-weight: 700;
        }
        .dev-token {
          font-family: monospace;
          background: #ffffff;
          padding: 2px 6px;
          border-radius: 6px;
          border: 1px solid #FFD600;
          color: #2E7D32;
          font-weight: 800;
        }
        .login-footer {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          margin-top: 24px;
          line-height: 1.5;
        }
        .login-footer a {
          color: #1976D2; /* Link biru */
          text-decoration: none;
          font-weight: 700;
        }
        .login-footer a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <Link href="/" className="login-brand-icon">🐼</Link>
          <h1 className="login-title">Masuk ke SIPANDA</h1>
          <p className="login-subtitle">Yuk, masukkan akunmu untuk mulai petualangan belajar! 🚀</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-container">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Alamat Email</label>
            <div className="input-wrapper">
              <div className="input-icon-left"><Mail size={16} /></div>
              <input
                type="email"
                required
                className="input-field"
                placeholder="nama@sekolah.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <div className="input-wrapper">
              <div className="input-icon-left"><Lock size={16} /></div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="input-toggle-right"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button type="submit" disabled={isLoading} className="btn-submit">
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Masuk ke Platform"}
          </button>
        </form>

        {/* Dev Hint */}
        <div className="dev-hint">
          💡 Mode Demo: <br />
          Email: <span className="dev-token">guru@test.com</span> | Sandi: <span className="dev-token">password123</span>
        </div>

        {/* Footer */}
        <div className="login-footer">
          Sistem Informasi Pembelajaran Adaptif <br />
          &copy; 2026 - SIPANDA Team
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0A0E27]"><Loader2 size={24} className="animate-spin text-white" /></div>}>
      <LoginForm />
    </Suspense>
  );
}