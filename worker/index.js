const DMG_PATTERN = /^SpinApp_\d+\.\d+\.\d+_(aarch64|x64)\.dmg$/;

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

async function readStaticCount(env) {
  const response = await env.ASSETS.fetch(
    new Request("https://assets.local/api/download-count.json"),
  );
  if (!response.ok) {
    return { count: 0, updatedAt: null };
  }

  const data = await response.json();
  return {
    count: typeof data.count === "number" ? data.count : 0,
    updatedAt: data.updatedAt ?? null,
  };
}

async function readCount(env) {
  if (env.DOWNLOADS) {
    const data = await env.DOWNLOADS.get("total", "json");
    if (data && typeof data.count === "number") {
      return { count: data.count, updatedAt: data.updatedAt ?? null };
    }
  }

  return readStaticCount(env);
}

async function incrementCount(env) {
  const current = await readCount(env);
  const payload = {
    count: current.count + 1,
    updatedAt: new Date().toISOString(),
  };

  if (env.DOWNLOADS) {
    await env.DOWNLOADS.put("total", JSON.stringify(payload));
  }

  return payload;
}

async function handleCounterApi(request, env) {
  const url = new URL(request.url);

  if (request.method === "POST") {
    const file = url.searchParams.get("file");
    if (file && !DMG_PATTERN.test(file)) {
      return Response.json(
        { error: "Invalid download file" },
        { status: 400, headers: JSON_HEADERS },
      );
    }

    const data = await incrementCount(env);
    return Response.json(data, { headers: JSON_HEADERS });
  }

  if (request.method === "GET") {
    const data = await readCount(env);
    return Response.json(data, { headers: JSON_HEADERS });
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
