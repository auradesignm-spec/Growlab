import { copyFileSync, existsSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton — avoids exhausting SQLite connections from Next.js dev
 * server hot-reloads, which would otherwise create a new PrismaClient per
 * module reload.
 *
 * On Vercel the bundled SQLite file is read-only, so runtime copies it to /tmp.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function datasourceUrl(): string {
  const bundled = path.join(process.cwd(), "prisma", "dev.db");
  const vercelRuntime = Boolean(process.env.VERCEL) && process.env.NEXT_PHASE !== "phase-production-build";

  if (vercelRuntime) {
    const tmp = "/tmp/growlab.db";
    if (existsSync(bundled) && !existsSync(tmp)) {
      copyFileSync(bundled, tmp);
    }
    return `file:${tmp}`;
  }

  return process.env.DATABASE_URL || `file:${bundled}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: datasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
