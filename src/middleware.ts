import { defineMiddleware } from "astro:middleware";
import { proxyLlmsTxt } from "./lib/aigent";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname;

  if (pathname === "/llms.txt") {
    return proxyLlmsTxt(context.request);
  }

  return next();
});
