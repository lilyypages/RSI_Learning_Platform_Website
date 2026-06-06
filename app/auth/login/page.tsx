"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

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
          background-color: #f1f5f9;
          font-family: var(--font-nunito), -apple-system, sans-serif;
          box-sizing: border-box;
          padding: 20px;
        }
        .login-card {
          background: #ffffff;
          width: 100%;
          max-width: 400px;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.05);
          padding: 40px 32px;
          box-sizing: border-box;
          border: 1px solid #e2e8f0;
        }
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .login-brand-icon {
          font-size: 32px;
          margin-bottom: 12px;
          display: inline-block;
        }
        .login-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }
        .login-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }
        .form-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
        }
        .form-label {
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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
          color: #94a3b8;
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        .input-field {
          width: 100%;
          padding: 12px 16px 12px 42px;
          background-color: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 14px;
          color: #334155;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .input-field:focus {
          background-color: #ffffff;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
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
          color: #64748b;
        }
        .btn-submit {
          width: 100%;
          height: 44px;
          background-color: #0f172a;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
        }
        .btn-submit:hover {
          background-color: #1e293b;
        }
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error-container {
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
          color: #991b1b;
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dev-hint {
          margin-top: 24px;
          padding: 12px;
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 10px;
          font-size: 11px;
          color: #64748b;
          text-align: center;
          line-height: 1.6;
        }
        .dev-token {
          font-family: monospace;
          background: #ffffff;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          color: #334155;
          font-weight: 600;
        }
        .login-footer {
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          margin-top: 24px;
          line-height: 1.5;
        }
      `}</style>

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <Link href="/" className="login-brand-icon">🐼</Link>
          <h1 className="login-title">Selamat Datang Kembali</h1>
          <p className="login-subtitle">Silakan masuk menggunakan akun akademik Anda.</p>
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