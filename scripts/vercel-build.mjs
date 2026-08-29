import { spawnSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import path from "path";

const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const isPostgres = /^postgres(ql)?:\/\//i.test(databaseUrl);

const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  NODE_OPTIONS: `${process.env.NODE_OPTIONS || ""} --max-old-space-size=2048`.trim(),
};

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env, shell: true, cwd: process.cwd() });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (isPostgres) {
  const source = readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
  const postgresSchema = source
    .replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"')
    .replace(/url\s*=\s*"file:\.\/dev\.db"/, 'url = env("DATABASE_URL")');
  const schemaDir = path.join(process.cwd(), "prisma", "postgres");
  mkdirSync(schemaDir, { recursive: true });
  writeFileSync(path.join(schemaDir, "schema.prisma"), postgresSchema);

  run("npx", ["prisma", "generate", "--schema", "prisma/postgres/schema.prisma"]);
  run("npx", ["prisma", "migrate", "deploy", "--schema", "prisma/postgres/schema.prisma"]);
} else {
  run("npx", ["prisma", "generate"]);
  run("npx", ["prisma", "db", "push", "--accept-data-loss"]);
}

run("next", ["build"]);
