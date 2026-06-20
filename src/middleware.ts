import { defineMiddleware } from "astro:middleware";
import {
  isAiAgent,
  isMorgonDiscoveryPath,
  redirectTarget,
  shouldRedirectToMorgon,
} from "./lib/ai-agents";

export const onRequest = defineMiddleware((context, next) => {
  const pathname = new URL(context.request.url).pathname;

  if (isMorgonDiscoveryPath(pathname)) {
    return context.redirect(redirectTarget(pathname), 307);
  }

  if (isAiAgent(context.request) && shouldRedirectToMorgon(pathname)) {
    return context.redirect(redirectTarget(pathname), 307);
  }

  return next();
});
