import type { APIRoute } from "astro";
import { proxyMorgon } from "../lib/morgon-proxy";

export const prerender = false;

export const GET: APIRoute = async ({ request }) =>
  proxyMorgon("/llms.txt", request, {
    contentType: "text/markdown; charset=utf-8",
  });
