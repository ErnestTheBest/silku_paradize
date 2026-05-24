# Silku Paradize

Live site: https://ernestthebest.github.io/silku_paradize/

Astro site for a small Latvian herring review archive. The site keeps tasting notes, ratings, and short writeups for herring products so the same jar does not have to be rediscovered from memory every month.

## Local Development

Run the site with Docker Compose from the repository root:

```sh
docker compose up --build web
```

The local site is served at:

```text
http://localhost:4321/
```

The Compose service sets `ASTRO_BASE=/` and mounts the repository into `/app`, so source changes should live reload in the browser.

## Project Structure

```text
src/pages/              Astro routes
src/components/         Reusable UI components
src/layouts/            Page layout wrappers
src/content/reviews/    Markdown review entries
src/styles/global.css   Global styling
```

## Adding A Review

Add a Markdown file under `src/content/reviews/`. Each review uses frontmatter validated by `src/content/config.ts`, including fields such as:

```yaml
title: "Review title"
slug: "review-slug"
brand: "Brand"
type: "Product type"
origin: "Country or region"
date: 2026-05-13
excerpt: "Short summary"
coverImage: "https://..."
coverAlt: "Image description"
tags:
  - smoked
pros:
  - Good texture
cons:
  - Too salty
evaluationCriteria:
  taste:
    score: 4
    note: "Fresh, balanced, easy to keep eating"
  salt:
    score: 3
    note: "A little salty, but not harsh"
  texture:
    score: 5
    note: "Firm and tender"
  oil:
    score: 4
    note: "Clean marinade that does not cover the fish"
  priceQuality:
    score: 4
    note: "Worth buying again at this price"
  verdict: "Would buy again"
```

The visible review rating is calculated from the average of the five numeric
`evaluationCriteria.*.score` values, rounded to one decimal place.

## Useful Commands

The project has npm scripts for Astro, but local development should use Docker Compose.

```sh
npm run build
npm run preview
npm run astro
```

For local development, prefer:

```sh
docker compose up --build web
```
