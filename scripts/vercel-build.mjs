import { execSync } from "child_process";

try {
  execSync("npx prisma generate", { stdio: "inherit" });
  execSync("next build", { stdio: "inherit" });
} catch (error) {
  process.exit(1);
}
