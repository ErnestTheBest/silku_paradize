import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const reviews = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/reviews" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    brand: z.string(),
    type: z.string(),
    origin: z.string(),
    rating: z.number().min(1).max(5),
    date: z.coerce.date(),
    excerpt: z.string(),
    coverImage: z.string(),
    coverAlt: z.string(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    tastingNotes: z
      .object({
        smoke: z.number().min(1).max(5),
        salt: z.number().min(1).max(5),
        texture: z.number().min(1).max(5),
        acidity: z.number().min(1).max(5),
      })
      .optional(),
  }),
});

export const collections = { reviews };
