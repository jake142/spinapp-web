import { defineMiddleware } from "astro:middleware";
import { isAiAgent, morgonPresenceUrl, shouldRedirectToMorgon } from "./lib/ai-agents";

export const onRequest = defineMiddleware((context, next) => {
  if (isAiAgent(context.request) && shouldRedirectToMorgon(new URL(context.request.url).pathname)) {
    return context.redirect(morgonPresenceUrl(), 307);
  }

  return next();
});
