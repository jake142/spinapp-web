import { getStore } from "@netlify/blobs";

const DMG_PATTERN = /^SpinApp_\d+\.\d+\.\d+_(aarch64|x64)\.dmg$/;

async function incrementCount(store) {
  const data = (await store.get("total", { type: "json" })) ?? { count: 0 };
  const count = (data.count ?? 0) + 1;

  await store.setJSON("total", {
    count,
    updatedAt: new Date().toISOString(),
  });

  return count;
}

export default async (req) => {
  const url = new URL(req.url);
  const file = url.searchParams.get("file");

  if (!file || !DMG_PATTERN.test(file)) {
    return new Response("Invalid download file", { status: 400 });
  }

  const store = getStore("spinapp-downloads");
  await incrementCount(store);

  if (req.method === "POST") {
    return new Response(null, { status: 204 });
  }

  return Response.redirect(new URL(`/downloads/${file}`, url.origin), 302);
};
