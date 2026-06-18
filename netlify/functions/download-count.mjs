import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("spinapp-downloads");
  const data = (await store.get("total", { type: "json" })) ?? { count: 0 };

  return new Response(
    JSON.stringify({
      count: data.count ?? 0,
      updatedAt: data.updatedAt ?? null,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    },
  );
};
