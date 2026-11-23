// Every indexable page with its language alternates, as Google reads hreflang from a sitemap.
import type { APIRoute } from "astro";
import { LANGUAGES, SITE, language, localized } from "../lib/i18n";
import { blogLanguages, posts } from "../lib/blog";

interface Entry {
  code: string;
  path: string;
  modified?: Date;
}

export const GET: APIRoute = async () => {
  const groups: Entry[][] = [
    LANGUAGES.map((l) => ({ code: l.code, path: localized(l.code) })),
    LANGUAGES.map((l) => ({ code: l.code, path: localized(l.code, "privacy/") })),
  ];
  const blogs = await blogLanguages();
  if (blogs.length) groups.push(blogs.map((c) => ({ code: c, path: localized(c, "blog/") })));
  const byKey = new Map<string, Entry[]>();
  for (const p of await posts()) {
    const list = byKey.get(p.entry.data.key) ?? [];
    list.push({ code: p.code, path: p.path, modified: p.entry.data.updated ?? p.entry.data.date });
    byKey.set(p.entry.data.key, list);
  }
  groups.push(...byKey.values());

  const urls = groups.flatMap((group) => {
    const xDefault = group.find((e) => e.code === "en");
    const links = group
      .map((e) => `    <xhtml:link rel="alternate" hreflang="${language(e.code).hreflang}" href="${SITE}${e.path}"/>`)
      .concat(xDefault ? [`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${xDefault.path}"/>`] : [])
      .join("\n");
    return group.map(
      (e) => `  <url>
    <loc>${SITE}${e.path}</loc>
${e.modified ? `    <lastmod>${e.modified.toISOString().slice(0, 10)}</lastmod>\n` : ""}${links}
  </url>`,
    );
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
