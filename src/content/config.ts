import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const scoredCriterion = z.object({
  score: z.number().min(1).max(5),
  note: z.string(),
});

const reviews = defineCollection({
  loader: glob({ pattern: "**/[a-z0-9-]*.md", base: "./src/content/reviews" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    brand: z.string(),
    type: z.string(),
    origin: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    coverImage: z.string(),
    coverAlt: z.string(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    evaluationCriteria: z.object({
      taste: scoredCriterion,
      salt: scoredCriterion,
      texture: scoredCriterion,
      oil: scoredCriterion,
      priceQuality: scoredCriterion,
      verdict: z.string(),
    }),
  }),
});

export const collections = { reviews };
