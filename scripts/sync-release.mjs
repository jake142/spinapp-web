import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
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

function latestFromDir(dir, withSourcePath = false) {
  let latest = null;
  const files = readdirSync(dir).filter((f) => f.endsWith(".dmg"));
  for (const file of files) {
    const parsed = parseDmg(file);
    if (!parsed) continue;
    const entry = withSourcePath
      ? { ...parsed, sourcePath: join(dir, file) }
      : { ...parsed, sourcePath: join(dir, file) };
    if (!latest || compareVersions(parsed.version, latest.version) > 0) {
      latest = entry;
    }
  }
  return latest;
}

let latest = null;

try {
  latest = latestFromDir(releaseDir, true);
} catch {
  // spinapp/release missing — fall back to committed public/downloads
}

if (!latest) {
  try {
    latest = latestFromDir(downloadsDir, true);
  } catch {
    // downloads dir missing
  }
}

if (!latest && existsSync(outFile)) {
  try {
    const existing = JSON.parse(readFileSync(outFile, "utf8"));
    if (existing.filename && existsSync(join(downloadsDir, existing.filename))) {
      latest = {
        version: existing.version,
        arch: existing.arch,
        filename: existing.filename,
        sourcePath: join(downloadsDir, existing.filename),
      };
    }
  } catch {
    // keep going
  }
}

if (!latest) {
  console.error("No release DMG found in spinapp/release or public/downloads.");
  process.exit(1);
}

mkdirSync(downloadsDir, { recursive: true });

const dest = join(downloadsDir, latest.filename);
if (latest.sourcePath && latest.sourcePath !== dest) {
  copyFileSync(latest.sourcePath, dest);
  console.log(`Copied DMG → public/downloads/${latest.filename}`);
}

const data = {
  version: latest.version,
  arch: latest.arch,
  filename: latest.filename,
  dmgUrl: `/downloads/${latest.filename}`,
  downloadUrl: `/downloads/${latest.filename}`,
  githubUrl: "https://github.com/jake142",
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(data, null, 2) + "\n");
console.log(`Release synced: v${data.version} → ${data.downloadUrl}`);
