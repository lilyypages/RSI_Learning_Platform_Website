// lib/db.ts
// =============================================================================
// Prisma Client Singleton
// Mencegah multiple instance di Next.js dev mode (hot reload)
// =============================================================================

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// 1. Konfigurasi Connection Pool untuk PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME ?? "rsi_test_platform",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
});

const adapter = new PrismaPg(pool);

// Gunakan tipe data 'any' pada objek global agar tidak mengunci tipe instansiasi
const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// 2. Fungsi Instansiasi dengan Fitur Logging Dev Mode
function createPrismaClient() {
  // Kita paksa bypass pengecekan tipe data constructor PrismaClient menggunakan 'as any'
  // Ini trik paling ampuh untuk meredam Type Mismatch akibat hot-reload Next.js v4
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  } as any);
}

// 3. Singleton Pattern Enforcement
export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;