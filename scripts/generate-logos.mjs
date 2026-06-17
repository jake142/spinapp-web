import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/logos");

const brands = {
  laravel: { slug: "laravel", color: "#FF2D20" },
  vue: { slug: "vuedotjs", color: "#4FC08D" },
  react: { slug: "react", color: "#61DAFB" },
  javascript: { slug: "javascript", color: "#F7DF1E" },
  postgresql: { slug: "postgresql", color: "#4169E1" },
  mysql: { slug: "mysql", color: "#4479A1" },
  mariadb: { slug: "mariadb", color: "#003545" },
  sqlite: { slug: "sqlite", color: "#003B57" },
  redis: { slug: "redis", color: "#FF4438" },
  valkey: { slug: "valkey", color: "#FF7061", custom: true },
  rabbitmq: { slug: "rabbitmq", color: "#FF6600" },
  docker: { slug: "docker", color: "#2496ED" },
  nginx: { slug: "nginx", color: "#009639" },
  caddy: { slug: "caddy", color: "#1D8342" },
  php: { slug: "php", color: "#777BB4" },
  node: { slug: "nodedotjs", color: "#5FA04E" },
  npm: { slug: "npm", color: "#CB3837" },
  cloudflare: { slug: "cloudflare", color: "#F38020" },
};

mkdirSync(outDir, { recursive: true });

for (const [name, { slug, color, custom }] of Object.entries(brands)) {
  if (custom) continue;
  const url = `https://cdn.jsdelivr.net/npm/simple-icons@11/icons/${slug}.svg`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`Skip ${name}: ${slug} not found`);
    continue;
  }
  let svg = await res.text();
  svg = svg.replace(/<path /g, `<path fill="${color}" `);
  writeFileSync(resolve(outDir, `${name}.svg`), svg);
  console.log(`✓ ${name}`);
}

// Valkey — custom mark
writeFileSync(
  resolve(outDir, "valkey.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" fill="#FF7061" fill-opacity="0.2" stroke="#FF7061" stroke-width="1.5" stroke-linejoin="round"/>
    <path fill="#FF7061" d="M12 8l-5 2.8v5.4L12 19l5-2.8v-5.4L12 8z"/>
    <circle cx="12" cy="12" r="1.8" fill="#fff"/>
  </svg>`,
);
console.log("✓ valkey");

// Colima — no simple-icon, keep custom purple mark
writeFileSync(
  resolve(outDir, "colima.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2.5" fill="#7C3AED" fill-opacity="0.15" stroke="#A78BFA" stroke-width="1.5"/>
    <path d="M8 20h8" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="12" cy="12" r="3.5" stroke="#C4B5FD" stroke-width="1.5"/>
    <path d="M12 8.5V6M12 15.5V18M8.5 12H6M15.5 12H18" stroke="#C4B5FD" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
);
console.log("✓ colima");

console.log("Done.");
