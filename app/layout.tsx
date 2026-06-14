import type { Metadata } from "next";
import { Nunito, Baloo_2 } from "next/font/google";
import "./globals.css";

const fontNunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

const fontBaloo = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-baloo",
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
    <html lang="id" className={`${fontNunito.variable} ${fontBaloo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
