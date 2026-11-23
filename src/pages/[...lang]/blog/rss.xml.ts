import type { APIRoute, GetStaticPaths } from "astro";
import { SITE, language, localized, routeParam, codeFromParam, texts } from "../../../lib/i18n";
import { blogLanguages, postsIn } from "../../../lib/blog";

export const getStaticPaths = (async () =>
  (await blogLanguages()).map((code) => ({ params: { lang: routeParam(code) } }))) satisfies GetStaticPaths;

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async ({ params }) => {
  const code = codeFromParam(params.lang);
  const t = texts(code);
  const items = (await postsIn(code))
    .map(
      (p) => `    <item>
      <title>${escape(p.entry.data.title)}</title>
      <link>${SITE}${p.path}</link>
      <guid>${SITE}${p.path}</guid>
      <description>${escape(p.entry.data.description)}</description>
      <pubDate>${p.entry.data.date.toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(`${t.blog} · Libretta`)}</title>
    <link>${SITE}${localized(code, "blog/")}</link>
    <description>${escape(t.blog_description)}</description>
    <language>${language(code).hreflang}</language>
    <atom:link href="${SITE}${localized(code, "blog/rss.xml")}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
