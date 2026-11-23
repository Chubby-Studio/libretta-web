import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// A post is src/content/blog/<language>/<slug>.md. The file name is the URL slug, in the
// language of the post, and `key` ties together the translations of the same post.
const blog = defineCollection({
  loader: glob({ pattern: "*/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      key: z.string(),
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
