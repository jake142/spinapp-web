import { defineMiddleware } from 'astro:middleware';
import { proxyAigent, shouldProxyToAigent } from './lib/aigent';

const AIGENT_PUBLISH_ORIGINS = new Set([
  'https://aigent.host',
  'http://aigent.local',
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const host = url.hostname;
  const origin = context.request.headers.get('Origin');

  if (context.request.method === 'OPTIONS' && origin && AIGENT_PUBLISH_ORIGINS.has(origin)) {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (
    shouldProxyToAigent(
      url.pathname,
      host,
      context.request.headers.get('User-Agent'),
      context.request.headers.get('Signature-Agent'),
    )
  ) {
    return proxyAigent(context.request);
  }

  const response = await next();

  if (origin && AIGENT_PUBLISH_ORIGINS.has(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }

  return response;
});
