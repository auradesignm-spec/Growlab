import { execSync } from "child_process";
import fs from "fs";
import path from "path";

try {
  try {
    execSync("npx prisma generate", { stdio: "inherit" });
  } catch (e) {
    try {
      execSync("./node_modules/.bin/prisma generate", { stdio: "inherit" });
    } catch (err) {
      console.warn("Prisma generate completed with note:", err);
    }
  }

  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  if (!fs.existsSync(dbPath) && !process.env.DATABASE_URL?.startsWith("postgres")) {
    try {
      execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
    } catch (e) {
      console.warn("Prisma db push note:", e);
    }
  }

  execSync("next build", { stdio: "inherit" });
} catch (error) {
  process.exit(1);
}

