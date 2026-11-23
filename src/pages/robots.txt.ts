import type { APIRoute } from "astro";
import { SITE } from "../lib/i18n";

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
