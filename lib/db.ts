import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton — avoids exhausting SQLite connections from Next.js dev
 * server hot-reloads, which would otherwise create a new PrismaClient per
 * module reload.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
