import type { APIRoute } from "astro";
import { proxyMorgon } from "../../lib/morgon-proxy";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const slug = params.slug;

  if (!slug || !slug.endsWith(".md")) {
    return new Response("Not found", { status: 404 });
  }

  return proxyMorgon(`/t/${slug}`, request, {
    contentType: "text/markdown; charset=utf-8",
  });
};
