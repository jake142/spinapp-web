import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DMG_PATTERN = /^SpinApp_\d+\.\d+\.\d+_(aarch64|x64)\.dmg$/;
const DATA_DIR = resolve("public/api");
const COUNT_FILE = resolve(DATA_DIR, "download-count.json");

function readCount() {
  try {
    if (!existsSync(COUNT_FILE)) return { count: 0, updatedAt: null };
    const data = JSON.parse(readFileSync(COUNT_FILE, "utf8"));
    return {
      count: typeof data.count === "number" ? data.count : 0,
      updatedAt: data.updatedAt ?? null,
    };
  } catch {
    return { count: 0, updatedAt: null };
  }
}

function writeCount(count) {
  mkdirSync(DATA_DIR, { recursive: true });
  const payload = { count, updatedAt: new Date().toISOString() };
  writeFileSync(COUNT_FILE, JSON.stringify(payload, null, 2) + "\n");
  return payload;
}

export function devDownloadTracker() {
  return {
    name: "spinapp-dev-download-tracker",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");

        if (url.pathname === "/api/download-count" && req.method === "GET") {
          const data = readCount();
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(data));
          return;
        }

        if (
          (url.pathname === "/api/track-download" && req.method === "POST") ||
          (url.pathname === "/download" && req.method === "GET")
        ) {
          const file = url.searchParams.get("file");
          if (!file || !DMG_PATTERN.test(file)) {
            res.statusCode = 400;
            res.end("Invalid download file");
            return;
          }

          const data = writeCount(readCount().count + 1);
          console.log(`[downloads] tracked → ${data.count} (${file})`);

          if (url.pathname === "/api/track-download") {
            res.statusCode = 204;
            res.end();
            return;
          }

          res.statusCode = 302;
          res.setHeader("Location", `/downloads/${file}`);
          res.end();
          return;
        }

        next();
      });
    },
  };
}
