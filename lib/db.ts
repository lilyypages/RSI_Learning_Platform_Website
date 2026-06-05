// lib/db.ts
// =============================================================================
// Prisma Client Singleton
// Mencegah multiple instance di Next.js dev mode (hot reload)
// Referensi: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
// =============================================================================

<<<<<<< HEAD
=======
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
>>>>>>> ian
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME ?? "rsi_test_platform",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
});
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

<<<<<<< HEAD
function createPrismaClient() {
  const adapter = new PrismaPg({ 
    connectionString: process.env.DATABASE_URL! 
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();
=======
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });
>>>>>>> ian

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export default db;