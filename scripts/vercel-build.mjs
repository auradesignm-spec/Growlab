import { spawnSync } from "child_process";

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || "file:./prisma/dev.db",
};

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env, shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npx", ["prisma", "generate"]);
run("npx", ["prisma", "db", "push", "--accept-data-loss"]);
run("npx", ["tsx", "prisma/seed.ts"]);
run("npx", ["next", "build"]);
