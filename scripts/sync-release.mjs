import { copyFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const releaseDir = resolve(__dirname, "../../spinapp/release");
const downloadsDir = resolve(__dirname, "../public/downloads");
const outFile = resolve(__dirname, "../src/data/release.json");

function parseDmg(filename) {
  const match = filename.match(/^SpinApp_(\d+\.\d+\.\d+)_(aarch64|x64)\.dmg$/);
  if (!match) return null;
  return { version: match[1], arch: match[2], filename };
}

function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

let latest = null;

try {
  const files = readdirSync(releaseDir).filter((f) => f.endsWith(".dmg"));
  for (const file of files) {
    const parsed = parseDmg(file);
    if (!parsed) continue;
    if (!latest || compareVersions(parsed.version, latest.version) > 0) {
      latest = { ...parsed, sourcePath: join(releaseDir, file) };
    }
  }
} catch {
  // release folder missing — keep existing public/downloads file
}

if (!latest) {
  latest = {
    version: "0.1.2",
    arch: "aarch64",
    filename: "SpinApp_0.1.2_aarch64.dmg",
  };
}

mkdirSync(downloadsDir, { recursive: true });

if (latest.sourcePath) {
  const dest = join(downloadsDir, latest.filename);
  copyFileSync(latest.sourcePath, dest);
  console.log(`Copied DMG → public/downloads/${latest.filename}`);
}

const data = {
  version: latest.version,
  arch: latest.arch,
  filename: latest.filename,
  downloadUrl: `/downloads/${latest.filename}`,
  githubUrl: "https://github.com/jake142/spinapp-web",
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(data, null, 2) + "\n");
console.log(`Release synced: v${data.version} → ${data.downloadUrl}`);
