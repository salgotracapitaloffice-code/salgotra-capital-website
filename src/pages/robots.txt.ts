import type { APIRoute } from 'astro';
import { SITE } from '../site.config.mjs';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /contact/sent/\n\nSitemap: ${new URL('/sitemap-index.xml', SITE.domain).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
