import { writeFileSync, readFileSync } from "fs";
import path from "path";

const root = process.cwd();
const source = readFileSync(path.join(root, "prisma", "schema.prisma"), "utf8");
const next = source
  .replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"')
  .replace(/url\s*=\s*"file:\.\/dev\.db"/, 'url = env("DATABASE_URL")');

writeFileSync(path.join(root, "prisma", "postgres", "schema.prisma"), next);
console.log("Wrote prisma/postgres/schema.prisma");
