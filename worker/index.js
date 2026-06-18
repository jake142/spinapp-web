export class DownloadCounter {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    let count = (await this.state.storage.get("count")) ?? 0;
    let updatedAt = (await this.state.storage.get("updatedAt")) ?? null;

    if (request.method === "POST") {
      count += 1;
      updatedAt = new Date().toISOString();
      await this.state.storage.put("count", count);
      await this.state.storage.put("updatedAt", updatedAt);
    }

    return Response.json(
      { count, updatedAt },
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

const DMG_PATTERN = /^SpinApp_\d+\.\d+\.\d+_(aarch64|x64)\.dmg$/;

function counterRequest(method) {
  return new Request("https://counter.internal/", { method });
}

async function handleCounterApi(request, env) {
  const url = new URL(request.url);

  if (request.method === "POST") {
    const file = url.searchParams.get("file");
    if (file && !DMG_PATTERN.test(file)) {
      return Response.json(
        { error: "Invalid download file" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  if (request.method === "GET" || request.method === "POST") {
    const id = env.COUNTER.idFromName("global");
    return env.COUNTER.get(id).fetch(counterRequest(request.method));
  }

  return new Response(null, { status: 405 });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/download-count" || pathname === "/api/track-download") {
      return handleCounterApi(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
