import type { APIRoute } from "astro";
import {
  fetchMorgonText,
  llmsHtmlDocument,
  wantsHtmlDocument,
} from "../lib/morgon-proxy";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const { status, body } = await fetchMorgonText("/llms.txt", request);

  if (status !== 200) {
    return new Response(body, { status });
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache, must-revalidate",
  };

  if (wantsHtmlDocument(request)) {
    return new Response(llmsHtmlDocument(body), {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "text/html; charset=utf-8",
        Vary: "User-Agent, Accept",
      },
    });
  }

  return new Response(body, {
    status: 200,
    headers: {
      ...headers,
      "Content-Type": "text/plain; charset=utf-8",
      Vary: "User-Agent, Accept",
    },
  });
};
