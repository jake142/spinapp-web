import { defineMiddleware } from "astro:middleware";
import { isAiAgent, isKnowledgePath, isMarketingPage } from "./lib/ai-agents";

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);

  if (isKnowledgePath(url.pathname)) {
    return next();
  }

  if (isAiAgent(context.request) && isMarketingPage(url.pathname)) {
    return context.redirect("/llms.txt", 307);
  }

  return next();
});
