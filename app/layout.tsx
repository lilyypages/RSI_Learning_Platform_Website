import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}