import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = join(root, "public/llms.txt");
const sourceUrl =
  process.env.LLMS_TXT_URL ??
  "https://federation-mount-cookies-hearings.trycloudflare.com/presence/spinapp/llms.txt";

const response = await fetch(sourceUrl);
if (!response.ok) {
  console.error(`Failed to fetch llms.txt (${response.status}) from ${sourceUrl}`);
  process.exit(1);
}

writeFileSync(outFile, await response.text());
console.log(`Synced llms.txt → public/llms.txt (${sourceUrl})`);
