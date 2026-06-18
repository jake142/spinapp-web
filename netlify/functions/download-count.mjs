import { getStore } from "@netlify/blobs";

const DMG_PATTERN = /^SpinApp_\d+\.\d+\.\d+_(aarch64|x64)\.dmg$/;

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

async function readCount(store) {
  const data = (await store.get("total", { type: "json" })) ?? { count: 0 };
  return {
    count: data.count ?? 0,
    updatedAt: data.updatedAt ?? null,
  };
}

async function incrementCount(store) {
  const data = (await store.get("total", { type: "json" })) ?? { count: 0 };
  const payload = {
    count: (data.count ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };

  await store.setJSON("total", payload);
  return payload;
}

export default async (req) => {
  const store = getStore("spinapp-downloads");
  const url = new URL(req.url);

  if (req.method === "POST") {
    const file = url.searchParams.get("file");
    if (file && !DMG_PATTERN.test(file)) {
      return new Response(JSON.stringify({ error: "Invalid download file" }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }

    const data = await incrementCount(store);
    return new Response(JSON.stringify(data), { headers: JSON_HEADERS });
  }

  if (req.method === "GET") {
    const data = await readCount(store);
    return new Response(JSON.stringify(data), { headers: JSON_HEADERS });
  }

  return new Response(null, { status: 405 });
};
