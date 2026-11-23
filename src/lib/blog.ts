import { getCollection, type CollectionEntry } from "astro:content";
import { LANGUAGES, localized } from "./i18n";

export interface Post {
  code: string;
  slug: string;
  path: string;
  entry: CollectionEntry<"blog">;
}

// Drafts are left out of the published site. `DRAFTS=1 npm run build` (or `npm run dev`) shows them.
const showDrafts = import.meta.env.DEV || process.env.DRAFTS === "1";

let cache: Post[] | undefined;

export async function posts(): Promise<Post[]> {
  if (cache) return cache;
  const entries = await getCollection("blog", ({ data }) => showDrafts || !data.draft);
  const known = new Set(LANGUAGES.map((l) => l.code));
  const list = entries.map((entry) => {
    const [code, slug] = entry.id.split("/");
    if (!known.has(code) || !slug) throw new Error(`Post ${entry.id} must live in src/content/blog/<language>/<slug>.md`);
    return { code, slug, path: localized(code, `blog/${slug}/`), entry };
  });
  const seen = new Set<string>();
  for (const post of list) {
    const id = `${post.code}/${post.entry.data.key}`;
    if (seen.has(id)) throw new Error(`Two posts in ${post.code} share the key ${post.entry.data.key}`);
    seen.add(id);
  }
  cache = list.sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());
  return cache;
}

export async function postsIn(code: string): Promise<Post[]> {
  return (await posts()).filter((p) => p.code === code);
}

// Languages that have at least one post: only they get a blog index, a feed and a footer link.
export async function blogLanguages(): Promise<string[]> {
  const codes = new Set((await posts()).map((p) => p.code));
  return LANGUAGES.map((l) => l.code).filter((c) => codes.has(c));
}

export async function translations(post: Post): Promise<Post[]> {
  return (await posts()).filter((p) => p.entry.data.key === post.entry.data.key);
}
