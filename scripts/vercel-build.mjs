import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();

function bin(name) {
  const local = path.join(root, "node_modules", ".bin", name);
  return fs.existsSync(local) ? local : name;
}

function run(command) {
  execSync(command, {
    stdio: "inherit",
    cwd: root,
    env: {
      ...process.env,
      PATH: `${path.join(root, "node_modules", ".bin")}${path.delimiter}${process.env.PATH || ""}`,
    },
  });
}

try {
  run(`${bin("prisma")} generate`);
} catch (error) {
  console.warn("prisma generate warning:", error instanceof Error ? error.message : error);
}

const isPostgres = /^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL || "");
const isVercel = Boolean(process.env.VERCEL);
const dbPath = path.join(root, "prisma", "dev.db");

// Never push/migrate during a Vercel build — production uses Neon at runtime.
if (!isVercel && !isPostgres && !fs.existsSync(dbPath)) {
  try {
    run(`${bin("prisma")} db push --skip-generate`);
  } catch (error) {
    console.warn("prisma db push note:", error instanceof Error ? error.message : error);
  }
}

run(`${bin("next")} build`);
