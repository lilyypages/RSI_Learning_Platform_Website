import type { Metadata } from "next";
// 1. Import Google Fonts bawaan Next.js
import { Nunito, Baloo_2 } from "next/font/google"; 
import "./globals.css";

// 2. Konfigurasi Font Nunito (Untuk teks biasa/body)
const fontNunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito", // Ini akan jadi variabel CSS
});

// 3. Konfigurasi Font Baloo 2 (Untuk judul/navbar yang bulat ceria)
const fontBaloo = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-baloo", // Ini akan jadi variabel CSS
});

export const metadata: Metadata = {
  title: "SIPANDA – Sistem Informasi Pembelajaran Adaptif",
  description: "Platform pembelajaran adaptif berbasis analitik data siswa untuk Sekolah Dasar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 4. Gabungkan variabel kedua font ke dalam tag <html>
    <html lang="id" className={`${fontNunito.variable} ${fontBaloo.variable}`}>
      <body>{children}</body>
    </html>
  );
}