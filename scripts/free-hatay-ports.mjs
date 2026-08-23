import { execFileSync } from "node:child_process";

const ports = new Set((process.argv.slice(2).length ? process.argv.slice(2) : ["3600", "3601"]).map(String));
let text = "";
try {
  text = execFileSync("netstat.exe", ["-ano", "-p", "TCP"], {
    encoding: "utf8",
    timeout: 12000,
    windowsHide: true,
  });
} catch (error) {
  console.error("netstat okunamadı:", error.message);
  process.exit(1);
}

const pids = new Set();
for (const line of text.split(/\r?\n/)) {
  if (!line.includes("LISTENING")) continue;
  const parts = line.trim().split(/\s+/);
  const local = parts[1] || "";
  const pid = parts[parts.length - 1];
  const port = local.split(":").pop();
  if (ports.has(port) && pid && pid !== "0") pids.add(pid);
}

if (!pids.size) {
  console.log("3600/3601 boş.");
  process.exit(0);
}

for (const pid of pids) {
  const num = Number(pid);
  try {
    process.kill(num);
    console.log("kapatıldı", pid);
  } catch (error) {
    console.error("kapanmadı", pid, error.message);
  }
}
