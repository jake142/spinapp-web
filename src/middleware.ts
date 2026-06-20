import { defineMiddleware } from "astro:middleware";
import { proxyAigent, shouldProxyToAigent } from "./lib/aigent";

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const host = url.hostname;

  if (shouldProxyToAigent(url.pathname, host)) {
    return proxyAigent(context.request);
  }

  return next();
});
