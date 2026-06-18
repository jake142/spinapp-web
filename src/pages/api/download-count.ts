import type { APIRoute } from "astro";

export const prerender = false;

const DMG_PATTERN = /^SpinApp_\d+\.\d+\.\d+_(aarch64|x64)\.dmg$/;
const COUNT_KEY = "download:total";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

type CounterEnv = {
  DOWNLOADS?: KVNamespace;
  SESSION?: KVNamespace;
};

function counterStore(env: CounterEnv): KVNamespace | undefined {
  return env.DOWNLOADS ?? env.SESSION;
}

async function readCount(env: CounterEnv) {
  const store = counterStore(env);
  if (store) {
    const data = await store.get(COUNT_KEY, "json");
    if (data && typeof data.count === "number") {
      return { count: data.count, updatedAt: data.updatedAt ?? null };
    }
  }

  return { count: 0, updatedAt: null };
}

async function incrementCount(env: CounterEnv) {
  const current = await readCount(env);
  const payload = {
    count: current.count + 1,
    updatedAt: new Date().toISOString(),
  };

  const store = counterStore(env);
  if (store) {
    await store.put(COUNT_KEY, JSON.stringify(payload));
  }

  return payload;
}

function getEnv(locals: App.Locals): CounterEnv {
  return (locals.runtime?.env ?? {}) as CounterEnv;
}

export const GET: APIRoute = async ({ locals }) => {
  const data = await readCount(getEnv(locals));
  return new Response(JSON.stringify(data), { headers: JSON_HEADERS });
};

export const POST: APIRoute = async ({ locals, url }) => {
  const file = url.searchParams.get("file");
  if (file && !DMG_PATTERN.test(file)) {
    return new Response(JSON.stringify({ error: "Invalid download file" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const data = await incrementCount(getEnv(locals));
  return new Response(JSON.stringify(data), { headers: JSON_HEADERS });
};
