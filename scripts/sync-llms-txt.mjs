import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = join(root, "public/llms.txt");
const sourceUrl =
  process.env.LLMS_TXT_URL ??
  "https://federation-mount-cookies-hearings.trycloudflare.com/presence/spinapp/llms.txt";

try {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  writeFileSync(outFile, await response.text());
  console.log(`Synced llms.txt → public/llms.txt (${sourceUrl})`);
} catch (error) {
  if (existsSync(outFile)) {
    console.warn(
      `Could not refresh llms.txt (${error instanceof Error ? error.message : error}); using committed copy.`,
    );
  } else {
    console.error(`Failed to fetch llms.txt from ${sourceUrl}:`, error);
    process.exit(1);
  }
}
