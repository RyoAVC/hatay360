/**
 * Sıralı typecheck → test → build (Windows PowerShell'de && güvenilir değil).
 */
import { spawnSync } from "node:child_process";

const steps = ["typecheck", "test", "build"];

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

for (const step of steps) {
  console.log(`\n▶ npm run ${step}\n`);
  const result = spawnSync(npmCmd, ["run", step], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\n✓ check tamamlandı (typecheck + test + build)\n");
