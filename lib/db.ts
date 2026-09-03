import { copyFileSync, existsSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton — avoids exhausting connections from Next.js hot reload.
 *
 * Postgres (Neon) is used when DATABASE_URL is a postgres URL.
 * SQLite /tmp copy is only for leftover Vercel sqlite deploys — not durable.
 *
 * Client construction is lazy so `next build` can collect page data without
 * requiring a generated engine at import time.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function isPostgresUrl(url: string | undefined): boolean {
  return Boolean(url && /^postgres(ql)?:\/\//i.test(url));
}

function resolveSqliteFile(raw: string): string {
  const bundled = path.join(process.cwd(), "prisma", "dev.db");
  const trimmed = raw.replace(/^file:/, "").trim();
  // Schema-relative "./dev.db" must not open a second empty DB at the repo root.
  if (!trimmed || trimmed === "./dev.db" || trimmed === "dev.db") return bundled;
  return path.isAbsolute(trimmed) ? trimmed : path.resolve(process.cwd(), trimmed);
}

function datasourceUrl(): string {
  const fromEnv = process.env.DATABASE_URL || "";
  if (isPostgresUrl(fromEnv)) return fromEnv;

  const bundled = path.join(process.cwd(), "prisma", "dev.db");
  const vercelSqlite =
    Boolean(process.env.VERCEL) && process.env.NEXT_PHASE !== "phase-production-build";

  if (vercelSqlite) {
    const tmp = "/tmp/growlab.db";
    if (existsSync(bundled) && !existsSync(tmp)) {
      copyFileSync(bundled, tmp);
    }
    return `file:${tmp}`;
  }

  if (fromEnv.startsWith("file:")) return `file:${resolveSqliteFile(fromEnv)}`;
  return fromEnv || `file:${bundled}`;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasourceUrl: datasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
